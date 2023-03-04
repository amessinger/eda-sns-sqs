# Event Driven Architecture demo using AWS SNS & SQS 

This repository demonstrates an application consuming an SQS queue subscribed to an SNS topic.

## Startup the AWS services

```sh
docker compose up localstack -d
```

## Setup the SNS Topic 

```sh
export SNS_TOPIC_ARN=$(docker compose run --rm aws sns create-topic --name surveys | jq -r .TopicArn)
```

## Startup the app

```sh
docker compose up app -d
```

## Get the logs

```sh
docker compose logs --follow
```

## Publish an event

```sh
docker compose run aws sns publish \
  --topic-arn $SNS_TOPIC_ARN \
  --message bonjour
```
