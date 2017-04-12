#! /usr/bin/env node
'use strict'

const minimist = require('minimist')
const Writable = require('readable-stream').Writable
const elasticsearch = require('elasticsearch')
const AwsElasticsearch = require('aws-es')
const Parse = require('fast-json-parse')
const split = require('split2')
const pump = require('pump')
const fs = require('fs')
const path = require('path')

function pinoElasticSearch (opts) {
  const splitter = split(function (line) {
    var parsed = new Parse(line)
    if (parsed.err) {
      this.emit('unknown', line, parsed.err)
      return
    }

    var value = parsed.value
    value.time = (new Date(value.time)).toISOString()

    return value
  })
  let client;
  if (!opts['aws-endpoint']) {
    client = new elasticsearch.Client({
      host: opts.host + ':' + opts.port,
      log: {
        level: opts['trace-level'] || 'error'
      }
    })
  }
  else {
    client = new AwsElasticsearch({
      accessKeyId: opts['aws-access-key'],
      secretAccessKey: opts['aws-secret-key'],
      service: 'es',
      region: opts['aws-region'],
      host: opts['aws-endpoint']
    });
  }

  const index = opts.index || 'pino'
  const type = opts.type || 'log'

  const writable = new Writable({
    objectMode: true,
    highWaterMark: opts['bulk-size'] || 500,
    writev: function (chunks, cb) {
      const docs = new Array(chunks.length * 2)
      for (var i = 0; i < docs.length; i++) {
        if (i % 2 === 0) {
          // add the header
          docs[i] = { index: { _index: index, _type: type } }
        } else {
          // add the chunk
          docs[i] = chunks[Math.floor(i / 2)].chunk
        }
      }
      client.bulk({
        body: docs
      }, function (err, result) {
        if (!err) {
          const items = result.items
          for (var i = 0; i < items.length; i++) {
            // depending on the Elasticsearch version, the bulk response might
            // contain fields 'create' or 'index' (> ES 5.x)
            const create = items[i].index || items[i].create
            splitter.emit('insert', create, chunks[i].chunk)
          }
        } else {
          splitter.emit('insertError', err)
        }
        // skip error and continue
        cb()
      })
    },
    write: function (body, enc, cb) {
      const obj = {index, type, body}
      client.index(obj, function (err, data) {
        if (!err) {
          splitter.emit('insert', data, body)
        } else {
          splitter.emit('insertError', err)
        }

        // skip error and continue
        cb()
      })
    }
  })

  pump(splitter, writable)

  return splitter
}

module.exports = pinoElasticSearch

function start (opts) {
  if (opts.help) {
    console.log(fs.readFileSync(path.join(__dirname, './usage.txt'), 'utf8'))
    return
  }

  if (opts.version) {
    console.log('pino-elasticsearch', require('./package.json').version)
    return
  }

  pump(process.stdin, pinoElasticSearch(opts))
}

if (require.main === module) {
  start(minimist(process.argv.slice(2), {
    alias: {
      version: 'v',
      help: 'h',
      host: 'H',
      port: 'p',
      index: 'i',
      'bulk-size': 'b',
      'trace-level': 'l'
    },
    default: {
      host: 'localhost',
      port: 9200
    }
  }))
}
