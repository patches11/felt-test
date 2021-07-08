import { filterEvents, clearFilter } from './uniqueness-filter';

describe('Uniqueness Filter', () => {

  beforeEach(clearFilter)

  it('filter duplicate events', async () => {
    const eventsA = [{id: 'A', other: 1}];

    expect(filterEvents(eventsA)).toEqual([{id: 'A', other: 1}])
    expect(filterEvents(eventsA)).toEqual([])
  })


  it('allow non duplicate events', async () => {
    const eventsA = [{id: 'A', other: 1}];
    const eventsB = [{id: 'A', other: 1}, {id: 'B', other: 1}];

    expect(filterEvents(eventsA)).toEqual([{id: 'A', other: 1}])
    expect(filterEvents(eventsB)).toEqual([{id: 'B', other: 1}])
  })
})