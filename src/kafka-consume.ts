import { Kafka, EachMessagePayload } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'scryline',
    brokers: ['localhost:9092']
});

const topic = 'create-scrylines';
const consumer = kafka.consumer({ groupId: 'consumer-group' });

const consume = async () => {
	// first, we wait for the client to connect and subscribe to the given topic
	await consumer.connect()
	await consumer.subscribe({ topic })
	await consumer.run({
        eachMessage: async (messagePayload: EachMessagePayload) => {
          const { topic, partition, message } = messagePayload
          const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
          console.log(`- ${prefix} ${message.key}#${message.value}`)
        }
	});
}

consume();
