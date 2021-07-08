// Treating these like singletons, in a given framework I would use their methodology for singletons or similar

import { BasicGeometry } from '../interfaces/basic-geometry';
import { haversineDistanceKm } from './haversine-distance';

// You would want to store these in a DB of course or I guess maybe redis
const subscriptions: Map<string, CallbackAndPredicates> = new Map();


// Interfaces

export interface HasPropertiesAndGeometry {
  properties: { [key: string]: any},
  geometry: BasicGeometry,
}

export type SubscriptionPredicate = SubscriptionPredicateProperty | SubscriptionPredicateDwithin

type DWithin = 'dwithin'

export interface SubscriptionPredicateProperty {
  type: Exclude<string, DWithin>,
  minimum?: any,
  maximum?: any,
  equal?: any,
}

// I think the first thing you would want in a service like this was a geometry query
export interface SubscriptionPredicateDwithin {
  type: DWithin,
  lat: number,
  lon: number,
  distance: number, // km
}

export interface CallbackAndPredicates {
  callback: (payload: HasPropertiesAndGeometry) => void,
  predicates: SubscriptionPredicate[],
}




// Helpers

// In a DB situation you would of course sanitize your inputs
// This has the interesting effect of if your type is wrong or missing, all payloads fail from what I can tell
// So its kind of on the user to make sure they are correct, which is kind of nice in this instance
const meetsPredicate = (payload: HasPropertiesAndGeometry, predicate: SubscriptionPredicate): boolean => {
  if (predicate.type === 'dwithin') {
    const {lat, lon, distance} = predicate as SubscriptionPredicateDwithin; // This is maybe not well supported in typescript yet: https://github.com/Microsoft/TypeScript/pull/29317
    if (lat && lon && distance && payload.geometry.coordinates.length >= 2) {
      const [payloadLon, payloadLat] = payload.geometry.coordinates;

      const calculatedDistance = haversineDistanceKm(lat, lon, payloadLat, payloadLon);
      
      return calculatedDistance <= distance;
    } else {
      return false;
    }
  } else {
    // I am assuming some comparators from the simple example, and assuming the default is AND
    const {type, minimum, maximum, equal} = predicate as SubscriptionPredicateProperty;
    var meets = true
    if (minimum) {
      meets = meets && payload.properties[type] >= minimum;
    }
    if (maximum) {
      meets = meets && payload.properties[type] <= maximum;
    }
    if (equal) {
      meets = meets && payload.properties[type] == equal;
    }
    return meets;
  }
}

const meetsPredicates = (payload: HasPropertiesAndGeometry, predicates: SubscriptionPredicate[]): boolean => {
  return predicates.reduce<boolean>((agg, predicate) => {
    return agg && meetsPredicate(payload, predicate);
  }, true)
}




// API

export const subscribe = (id: string, callback: (payload: HasPropertiesAndGeometry) => void, predicates: SubscriptionPredicate[]): void => {
  subscriptions.set(id, {
    callback,
    predicates,
  });
}

export const unsubscribe = (id: string): void => {
  subscriptions.delete(id);
}

export const notify = (payloads: HasPropertiesAndGeometry[]): void => {
  subscriptions.forEach(({callback, predicates}) => {
    payloads.filter(payload => meetsPredicates(payload, predicates)).forEach(payload => callback(payload))
  })
}

export const clearSubscriptions = (): void => {
  subscriptions.clear();
}