import axios from 'axios';
import express from 'express';
import { idGenerator } from './helpers/id-generator';
import { debug, error, log } from './helpers/logger';
import { notify, subscribe, unsubscribe } from './helpers/subscription-manager';
import { filterEvents } from './helpers/uniqueness-filter';
import { EndpointResult } from './interfaces/endpoint-result';
import { SubScriptionRequest } from './interfaces/subscription-request';

// Config

const PORT = 8080;

const INTERVAL = 60000
//const INTERVAL = 10000;
const URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_hour.geojson';
//const URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson';




// Subscription

// In a language with a stream processing library like Akka Streams I would use that to handle timeouts, failures, tranformation pipelines etc.
// Here I'm just letting 2 run at "once" (NodeJS singlethreadedness excluded) if one happens to take to long, I think thats fine
setInterval(() => {
  debug("Sending Axios Request");
  axios.get<EndpointResult>(URL)
    .then(response => filterEvents(response.data.features)) // So I would think here we would filter unique events per subscription, so when you subscribed you would be notified of current events, however the spec seems to say the opposite so I stuck with that for now
    .then(filteredEvents => notify(filteredEvents)); // Since the output from the endpoint matched the shape in the spec doc I just pump it through
}, INTERVAL)




// WebApp

const app = express();
app.use(express.json())

app.post( "/subscribe", ( req, res ) => {
  const {endpoint, filters} = req.body as SubScriptionRequest;

  // Todo - validate endpoint URL

  if (endpoint) {
    const id = idGenerator();

    subscribe(id, async (payload) => {
      try {
        await axios.post(endpoint, payload);
      } catch (e) {
        // Maybe some unsubcribe logic here on X failures
        error(`Callback failure for subscription ${id} endpoint ${endpoint}`);
        error(e);
      }
    }, filters || []);

    res.type('application/json').send(JSON.stringify({
      id,
      start: new Date().getTime(),
      details: {
        endpoint,
        filters: filters || [],
      }
    }));
  } else {
    res.status(400).send("Bad Request");
  }
});

// You don't want people in prod unsubscribing others, so probably want some more validation than a short ID string here
app.post( "/unsubscribe", ( req, res ) => {
  const {id} = req.body as {id?: string};

  if (id) {
    unsubscribe(id);
    res.send("Ok");
  } else {
    res.status(400).send("Bad Request");
  }
});

app.post( "/loopback", ( req, res ) => {
  log(`Loopback: ${JSON.stringify(req.body)}`);
  res.send( "Ok" );
});

app.listen( PORT, () => {
    log( `server started at http://localhost:${ PORT }` );
} );