// Treating these like singletons, in a given framework I would use their methodology for singletons or similar

// I would use something like an LRU cache, redis, Postgres with an index etc.
const seenIds: Set<string> = new Set();

export const filterEvents = <T extends {id: string}>(events: T[]): T[] => {
  return events.filter((event) => {
    const notSeen = !seenIds.has(event.id);
    seenIds.add(event.id);
    return notSeen;
  })
}

export const clearFilter = (): void => {
  seenIds.clear();
}