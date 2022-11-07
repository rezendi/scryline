import { Kafka, EachMessagePayload } from 'kafkajs';
import { addYears, addMonths, addWeeks, addDays, formatWithOptions, isAfter } from 'date-fns/fp'
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

const constructQuery = async (values) => {
  // get from and to for API query. from: now - duration + (iteration) intervals, to: from + interval
  let addFun = values.duration.indexOf("year") > 0 ? addYears : addMonths;
  let since = parseInt(values.duration.split(" ")[0]);
  let now = new Date();
  let start = addFun(0-since)(now); // 0- because we gotta subtract
  let intervalFun = values.interval.indexOf("day") > 0 ? addDays : values.interval.indexOf("week") > 0 ? addWeeks : addMonths;
  let from_date = intervalFun(values.iteration)(start);
  let to_date = intervalFun(1)(start);
  let toString = formatWithOptions({}, 'yyyy-MM-dd')
  let from = toString(from_date);
  let to = toString(to_date);
  
  // OK, now go query
  let api_query = `apiKey=${process.env.NEWS_API_KEY}&q=${values.search}&from=${from}&to=${to}`;
  console.log("api_query", api_query);

  // this is a bit crude, as error handling goes, but makes things more granularly testable
  if (isAfter(now, from_date)) {
    console.log("Cannot get news from the future", from);
    return '';
  }
  return api_query
}

const getLine = async(values) => {
  let slug = values.existing ? values.existing.slug : util.slugize(values.title);
  let line = await DB.getLineByUIDAndSlug(values.user.uid, slug);
  if (values.iteration > 0) {
    console.log("Found existing line", line);
  }

  if (!line) {
    line = {
      email: values.user.email,
      title: values.title,
      userid: values.user.uid,
      byline: values.user.username,
      path: util.getPathFor(values.user, ""),
      editable:false,
      entries: []
    };
  }
  return line;
}

const runQuery = async(values, query, line) => {
  let news_api_url = 'https://newsapi.org/v2/everything?' + query;
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

  // OK, fire off the next iteration
  values.iteration = values.iteration + 1;
  values.existing = { slug: values.existing ? values.existing.slug : util.slugize(values.title) };
  console.log("outgoing values", values);

  const producer = kafka.producer();
  await producer.connect();
  setTimeout(async () => {
    await producer.send({
        topic: topic,
        messages: [
            { value: JSON.stringify(values) },
        ],
    });    
  }, 10000);
}

const fetchTimeline = async (valueString) => {
  // title, search, duration, interval, user (email, uid, username), existing (slug), iteration
  let values = JSON.parse(valueString);
  console.log("values", values);
  let query = await constructQuery(values)
  if (query.length > 0) { // if we have a valid API query
    let line = await getLine(values);
    runQuery(values, query, line);
  }
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
