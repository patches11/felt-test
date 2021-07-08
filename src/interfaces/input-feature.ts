import { BasicGeometry } from './basic-geometry'

export interface InputFeature {
  id: string,
  type: string,
  properties: { [key: string]: any},
  geometry: BasicGeometry,
}
