export type FaceId = "px" | "nx" | "py" | "ny" | "pz" | "nz"

export type LodLevel = 0 | 1 | 2

export type HotspotType =
  | "restroom"
  | "firstaid"
  | "parking"
  | "playground"
  | "campsite"
  | "food"

export interface HotspotData {
  id: string
  position: [number, number, number]
  type: HotspotType
  name: string
  walkMinutes: number
  description: string
}

export interface SceneMeta {
  sceneId: string
  name: string
  hotspots: HotspotData[]
  maxLod: LodLevel
  faces: FaceId[]
}

export interface FaceLodState {
  currentLod: LodLevel
  targetLod: LodLevel
  loaded: boolean
  loading: boolean
}

export const FACE_LABELS: Record<FaceId, string> = {
  px: "右",
  nx: "左",
  py: "顶",
  ny: "底",
  pz: "前",
  nz: "后",
}

export const LOD_SIZES: Record<LodLevel, number> = {
  0: 512,
  1: 1024,
  2: 2048,
}

export const HOTSPOT_COLORS: Record<HotspotType, string> = {
  restroom: "#1E88E5",
  firstaid: "#E53935",
  parking: "#FB8C00",
  playground: "#7CB342",
  campsite: "#8D6E63",
  food: "#F4511E",
}

export const HOTSPOT_ICONS: Record<HotspotType, string> = {
  restroom: "🚻",
  firstaid: "🏥",
  parking: "🅿️",
  playground: "🎠",
  campsite: "⛺",
  food: "🍽️",
}
