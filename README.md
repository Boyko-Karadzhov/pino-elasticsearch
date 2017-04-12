# pino-elasticsearch&nbsp;&nbsp;[![Build Status](https://travis-ci.org/pinojs/pino-elasticsearch.svg)](https://travis-ci.org/pinojs/pino-elasticsearch)&nbsp;[![Coverage Status](https://coveralls.io/repos/github/pinojs/pino-elasticsearch/badge.svg?branch=master)](https://coveralls.io/github/pinojs/pino-elasticsearch?branch=master)

Load [pino](https://github.com/pinojs/pino) logs into
[Elasticsearch](https://www.elastic.co/products/elasticsearch).

## Install

```
npm install pino-elasticsearch -g
```

## Usage

```
  pino-elasticsearch

  To send pino logs to elasticsearch:

     cat log | pino-elasticsearch --host 192.168.1.42

  To send pino logs to AWS ES:

     cat log | pino-elasticsearch --aws-endpoint search-pino-xxxxx1412fasfxxx.us-east-1.es.amazonaws.com --aws-access-key fafasf --aws-secret-key asdad --aws-region us-east-1

  Flags
  -h  | --help              Display Help
  -v  | --version           display Version
  -H  | --host              the IP address of elasticsearch; default: 127.0.0.1
  -p  | --port              the port of elasticsearch; default: 9200
  -i  | --index             the name of the index to use; default: pino
  -t  | --type              the name of the type to use; default: log
  -b  | --size              the number of documents for each bulk insert
  -l  | --trace-level       trace level for the elasticsearch client, default 'error' (info, debug, trace).

  --aws-endpoint            AWS ES domain Endpoint
  --aws-access-key          AWS ES IAM user access key
  --aws-secret-key          AWS ES IAM user secret key
  --aws-region              AWS ES region
```

You can then use [Kibana](https://www.elastic.co/products/kibana) to
browse and visualize your logs.

## Setup and Testing

Setting up pino-elasticsearch is easy, and you can use the bundled
`docker-compose.yml` file to bring up both
[Elasticsearch](https://www.elastic.co/products/elasticsearch) and
[Kibana](https://www.elastic.co/products/kibana).

You will need [docker](https://www.docker.com/) and
[docker-compose](https://docs.docker.com/compose/), then in this project
folder, launch `docker-compose up`.

You can test it by launching `node example | pino-elasticsearch`, in
this project folder. You will need to have `pino-elasticsearch`
installed globally.

## Acknowledgements

This project was kindly sponsored by [nearForm](http://nearform.com).

## License

Licensed under [MIT](./LICENSE).
