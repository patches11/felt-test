import { clearSubscriptions, notify, subscribe } from './subscription-manager';

describe('SubscriptionManager Filter', () => {

  beforeEach(clearSubscriptions)

  it('notify subscription', async () => {
    const eventsA = [{id: 'A', other: 1, properties: {}, geometry: {type: "a", coordinates: []}}];

    var lastPayload = undefined;

    subscribe('abc', (payload) => lastPayload = payload, []);

    notify(eventsA);

    expect(lastPayload).toEqual(eventsA[0]);
  })

  it('obeys predicates and filters', async () => {
    const eventsA = [{id: 'A', other: 1, properties: {test: 2}, geometry: {type: "a", coordinates: []}}];

    var lastPayload = undefined;

    subscribe('abc', (payload) => lastPayload = payload, [{type: "test", minimum: 3}]);

    notify(eventsA);

    expect(lastPayload).toEqual(undefined);
  })


  it('obeys predicates and doesnt filter', async () => {
    const eventsA = [{id: 'A', other: 1, properties: {test: 2}, geometry: {type: "a", coordinates: []}}];

    var lastPayload = undefined;

    subscribe('abc', (payload) => lastPayload = payload, [{type: "test", minimum: 1}]);

    notify(eventsA);

    expect(lastPayload).toEqual(eventsA[0]);
  })

  it('obeys predicates both', async () => {
    const eventsA = [{id: 'A', other: 1, properties: {test: 4}, geometry: {type: "a", coordinates: []}}];

    var lastPayload = undefined;

    subscribe('abc', (payload) => lastPayload = payload, [{type: "test", minimum: 1, maximum: 3}]);

    notify(eventsA);

    expect(lastPayload).toEqual(undefined);
  })


  it('obeys predicates equals', async () => {
    const eventsA = [{id: 'A', other: 1, properties: {test: 4}, geometry: {type: "a", coordinates: []}}, {id: 'B', other: 2, properties: {test: 3}, geometry: {type: "a", coordinates: []}}];

    var lastPayload = undefined;

    subscribe('abc', (payload) => lastPayload = payload, [{type: "test", equal: 3}]);

    notify(eventsA);

    expect(lastPayload).toEqual(eventsA[1]);
  })


  it('obeys multiple predicates', async () => {
    const eventsA = [{id: 'A', other: 1, properties: {test: 4, other: 3}, geometry: {type: "a", coordinates: []}}, {id: 'B', other: 2, properties: {test: 3, other: 1}, geometry: {type: "a", coordinates: []}}];

    var lastPayload = undefined;

    subscribe('abc', (payload) => lastPayload = payload, [{type: "test", equal: 4}, {type: "other", equal: 1}]);

    notify(eventsA);

    expect(lastPayload).toEqual(undefined);
  })


  it('obeys dwithin and filters', async () => {
    const eventsA = [
      {id: 'A', other: 1, properties: {}, geometry: {type: "a", coordinates: [-122.7655029,38.7885017,2.48]}},
      {id: 'B', other: 2, properties: {}, geometry: {type: "a", coordinates: [-100.7655029,30.7885017,2.48]}},
    ];
    const meLat = 40.74309875726971
    const meLon = -111.88383260539904

    var lastPayload = undefined;
    var callCount = 0

    subscribe('abc', (payload) => {
      callCount = callCount + 1;
      lastPayload = payload;
    }, [{type: "dwithin", lat: meLat, lon: meLon, distance: 1000}]);

    notify(eventsA);

    expect(callCount).toEqual(1);
    expect(lastPayload).toEqual(eventsA[0]);
  })


  it('obeys dwithin with large distance and doesnt filters', async () => {
    const eventsA = [
      {id: 'A', other: 1, properties: {}, geometry: {type: "a", coordinates: [-122.7655029,38.7885017,2.48]}},
      {id: 'B', other: 2, properties: {}, geometry: {type: "a", coordinates: [-100.7655029,30.7885017,2.48]}},
    ];
    const meLat = 40.74309875726971
    const meLon = -111.88383260539904

    var lastPayload = undefined;
    var callCount = 0

    subscribe('abc', (payload) => {
      callCount = callCount + 1;
      lastPayload = payload;
    }, [{type: "dwithin", lat: meLat, lon: meLon, distance: 100000}]);

    notify(eventsA);

    expect(callCount).toEqual(2);
    expect(lastPayload).toEqual(eventsA[1]);
  })
})