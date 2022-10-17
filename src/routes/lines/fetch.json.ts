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
    if (!req.session.sUser || !req.session.sUser.uid) {
        console.log("Fetch attempt when not logged in");
        res.end(JSON.stringify({success:false, data:data, error:"Not logged in"}));
    }

    data = { ...data, user:req.session.sUser, iteration: 0};
    try {
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
	} catch(error) {
		console.log("fetch error", error);
		res.end(JSON.stringify({success:false, data:data, error:error}));
	}
}
