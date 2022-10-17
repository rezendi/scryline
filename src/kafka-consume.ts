import { Kafka, EachMessagePayload } from 'kafkajs';
import Entry from './components/Entry';
import Repo from './components/Repo';
import DB from './components/DB';
import util from "./components/util";

require('dotenv').config();
const fetch = require('node-fetch');

const kafka = new Kafka({
    clientId: 'scryline',
    brokers: ['localhost:9092']
});

const topic = 'create-scrylines';
const consumer = kafka.consumer({ groupId: 'consumer-group' });

const fetchTimeline = async (valueString) => {
  // subject, search, duration, interval user (email, uid, username), existing (slug), iteration
  let values = JSON.parse(valueString);
  console.log("values", values);
  let slug = values.existing ? values.existing.slug : util.slugize(values.subject);
  let line = await DB.getLineByUIDAndSlug(values.user.uid, slug);
  if (!line) {
    line = {
      email: values.user.email,
      title: values.subject,
      userid: values.user.uid,
      byline: values.user.username,
      path: util.getPathFor(values.user, ""),
      editable:false,
      entries: []
    };
  }

  let news_api_url = `https://newsapi.org/v2/everything?q=${values.search}&apiKey=${process.env.NEWS_API_KEY}`
  let response = await fetch(news_api_url);
  let json = await response.json();
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
    line.entries.push(entry);
  });

  let repo = await Repo.saveLine(line, line.path);
  let dbVals = await DB.saveLine(line.title, values.user.uid, repo.json.content.sha, repo.metadata);
  console.log("saved kafka line", values.iteration);
  // fire off another iteration
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
          fetchTimeline(`${message.value}`);
        }
	});
}

consume();
