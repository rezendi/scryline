const { Kafka } = require('kafkajs');
const kafka = new Kafka({
    clientId: 'scryline',
    brokers: ['localhost:9092']
});
const topic = 'create-scrylines';

export async function post(req, res, next) {
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
    let data = req.body;
    console.log("fetching for", data);
    const producer = kafka.producer();
    await producer.connect();
    await producer.send({
        topic: topic,
        messages: [
            { value: JSON.stringify(data) },
        ],
    });    
    res.end(JSON.stringify({success:true}));
}
