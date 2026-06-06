import { create } from "zustand"
import type { FaceId, LodLevel, FaceLodState, HotspotData, SceneMeta } from "@/types/pano"

interface PanoState {
  sceneId: string
  sceneName: string
  sceneLoaded: boolean
  loadingProgress: number
  faceStates: Record<FaceId, FaceLodState>
  activeHotspot: HotspotData | null
  hotspotCardVisible: boolean
  gyroSupported: boolean | null
  gyroEnabled: boolean
  meta: SceneMeta | null

  setSceneLoaded: (loaded: boolean) => void
  setLoadingProgress: (progress: number) => void
  setFaceState: (face: FaceId, state: Partial<FaceLodState>) => void
  setActiveHotspot: (hotspot: HotspotData | null) => void
  setHotspotCardVisible: (visible: boolean) => void
  setGyroSupported: (supported: boolean | null) => void
  setGyroEnabled: (enabled: boolean) => void
  setMeta: (meta: SceneMeta) => void
  initFaceStates: () => void
  setFaceTargetLod: (face: FaceId, lod: LodLevel) => void
  setFaceLodLoaded: (face: FaceId, lod: LodLevel) => void
}

const defaultFaceState: FaceLodState = {
  currentLod: 0,
  targetLod: 0,
  loaded: false,
  loading: false,
}

export const usePanoStore = create<PanoState>((set) => ({
  sceneId: "camp",
  sceneName: "郊野亲子营地",
  sceneLoaded: false,
  loadingProgress: 0,
  faceStates: {
    px: { ...defaultFaceState },
    nx: { ...defaultFaceState },
    py: { ...defaultFaceState },
    ny: { ...defaultFaceState },
    pz: { ...defaultFaceState },
    nz: { ...defaultFaceState },
  },
  activeHotspot: null,
  hotspotCardVisible: false,
  gyroSupported: null,
  gyroEnabled: false,
  meta: null,

  setSceneLoaded: (loaded) => set({ sceneLoaded: loaded }),
  setLoadingProgress: (progress) => set({ loadingProgress: progress }),
  setFaceState: (face, state) =>
    set((s) => ({
      faceStates: { ...s.faceStates, [face]: { ...s.faceStates[face], ...state } },
    })),
  setActiveHotspot: (hotspot) => set({ activeHotspot: hotspot }),
  setHotspotCardVisible: (visible) => set({ hotspotCardVisible: visible }),
  setGyroSupported: (supported) => set({ gyroSupported: supported }),
  setGyroEnabled: (enabled) => set({ gyroEnabled: enabled }),
  setMeta: (meta) => set({ meta }),
  initFaceStates: () =>
    set({
      faceStates: {
        px: { ...defaultFaceState },
        nx: { ...defaultFaceState },
        py: { ...defaultFaceState },
        ny: { ...defaultFaceState },
        pz: { ...defaultFaceState },
        nz: { ...defaultFaceState },
      },
    }),
  setFaceTargetLod: (face, lod) =>
    set((s) => ({
      faceStates: {
        ...s.faceStates,
        [face]: { ...s.faceStates[face], targetLod: lod, loading: true },
      },
    })),
  setFaceLodLoaded: (face, lod) =>
    set((s) => ({
      faceStates: {
        ...s.faceStates,
        [face]: { ...s.faceStates[face], currentLod: lod, loaded: true, loading: false },
      },
    })),
}))
