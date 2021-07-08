// Treating these like singletons, in a given framework I would use their methodology for singletons or similar

var lastId = 0;

// Replace this with something better ha
export const idGenerator = (): string => {
  lastId = lastId + 1;
  return lastId.toString();
}
