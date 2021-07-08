import { InputFeature } from './input-feature';

export interface EndpointResult {
  type: string,
  metadata: { [key: string]: any},
  features: InputFeature[],
}