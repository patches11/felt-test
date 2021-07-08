
const toRad = (x: number): number => {
  return x * Math.PI / 180;
}

const R = 6371; // km 

// https://stackoverflow.com/questions/14560999/using-the-haversine-formula-in-javascript
// Potential loss of precision due to floats etc, but the estimate here probably negates that anyway
export const haversineDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const x1 = lat2 - lat1;
  const dLat = toRad(x1);

  const x2 = lon2 - lon1;
  const dLon = toRad(x2);

  const a = Math.sin(dLat / 2) * Math.sin(dLat/2) + 
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c
}