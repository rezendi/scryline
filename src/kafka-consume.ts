import { Kafka, EachMessagePayload } from 'kafkajs';
import Entry from './components/Entry';
import Repo from './components/Repo';
import DB from './components/DB';

require('dotenv').config();
const fetch = require('node-fetch');

const kafka = new Kafka({
    clientId: 'scryline',
    brokers: ['localhost:9092']
});

const topic = 'create-scrylines';
const consumer = kafka.consumer({ groupId: 'consumer-group' });

const fetchTimeline = async (values) => {
  // subject, search, duration, interval
  // DB create timeline with subject if none currently exists
  // call out to Bing News API to get some news, skip duration/interval for now
  // plug all that news into the new timeline
  let news_api_url = `https://newsapi.org/v2/everything?q=${values.search}&apiKey=${process.env.NEWS_API_KEY}`
  let response = await fetch(news_api_url);
  let json = await response.json();
  let entries = [];
  json.articles.map((a, idx) => {
    let entry = new Entry({
        id: idx,
        source: a.source.name,
        title: a.title,
        summary: a.description,
        url: a.url,
        image: a.urlToImage,
        when: a.pubishedAt
    });
    entries.push(entry);
  });
  let line = {
    email: "test@example.com",
    title: "Kafka test",
    path: "kafka/test",
    userid: "kafka",
    byline: "Franz Joseph Kafka",
    editable:false,
    entries: entries
  };
  let path = "kafka/test";
  let repo = await Repo.saveLine(line, path);
  let dbVals = await DB.saveLine(line.title, "kafka", repo.json.content.sha, repo.metadata);
  console.log("dbpath", dbVals.path);
}

const consume = async () => {
	// first, we wait for the client to connect and subscribe to the given topic
	await consumer.connect()
	await consumer.subscribe({ topic })
	await consumer.run({
        eachMessage: async (messagePayload: EachMessagePayload) => {
          const { topic, partition, message } = messagePayload
          const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
          console.log(`- ${prefix} ${message.key}#${message.value}`)
          fetchTimeline(message.value);
        }
	});
}

consume();
