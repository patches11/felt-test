import { SubscriptionPredicate } from '../helpers/subscription-manager';

export interface SubScriptionRequest {
  endpoint?: string,
  filters?: SubscriptionPredicate[],
}