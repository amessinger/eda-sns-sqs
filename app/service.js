import {
  CreateQueueCommand,
  GetQueueAttributesCommand,
  GetQueueUrlCommand,
  QueueDoesNotExist,
  ReceiveMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import { SNSClient, SubscribeCommand } from "@aws-sdk/client-sns";

const awsConfig = {
  region: "us-east-1",
  endpoint: "http://localstack:4566",
  credentials: {
    accessKeyId: "access-key-id",
    secretAccessKey: "secret-access-key",
  },
};

const sqsClient = new SQSClient(awsConfig);
const snsClient = new SNSClient(awsConfig);

const queueParams = { QueueName: "app" };
const notificationParams = {
  TopicArn: process.env.SNS_TOPIC_ARN,
};

async function getQueueUrl() {
  try {
    const response = await sqsClient.send(new GetQueueUrlCommand(queueParams));
    return response.QueueUrl;
  } catch (err) {
    if (err instanceof QueueDoesNotExist) {
      return undefined;
    } else {
      throw err;
    }
  }
}

async function getQueueArn(url) {
  const attributeName = "QueueArn";
  const response = await sqsClient.send(
    new GetQueueAttributesCommand({
      AttributeNames: [attributeName],
      QueueUrl: url,
    })
  );
  return response.Attributes[attributeName];
}

async function createQueue() {
  const response = await sqsClient.send(new CreateQueueCommand(queueParams));
  return response.QueueUrl;
}

async function readQueueMessage(url) {
  return await sqsClient.send(new ReceiveMessageCommand({ QueueUrl: url }));
}

async function pollQueue(url, onReceive) {
  const response = await readQueueMessage(url);
  if (onReceive) {
    onReceive(response);
  }
  setTimeout(() => pollQueue(url, onReceive), 1000);
}

async function subscribeQueue(arn) {
  const response = await snsClient.send(
    new SubscribeCommand({
      ...notificationParams,
      Protocol: "sqs",
      Endpoint: arn,
    })
  );
  return response;
}

const run = async () => {
  let queueUrl = await getQueueUrl();
  if (!queueUrl) {
    console.log("Queue does not exist, creating it");
    queueUrl = await createQueue();
    console.log("Queue created");
  } else {
    console.log("Queue already exists");
  }

  const queueArn = await getQueueArn(queueUrl);

  await subscribeQueue(queueArn);

  pollQueue(queueUrl, (response) => console.log(response));
};

run();
