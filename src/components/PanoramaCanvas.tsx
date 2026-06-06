import { useRef, useEffect, useMemo, useCallback } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { usePanoStore } from "@/store/panoStore"
import { useLOD } from "@/hooks/useLOD"
import { loadCubeFaceTexture, generateDemoCubeFace } from "@/lib/cubeTextureGenerator"
import type { FaceId, LodLevel } from "@/types/pano"
import HotspotSprite from "./HotspotSprite"

const FACE_INDEX: FaceId[] = ["px", "nx", "py", "ny", "pz", "nz"]

function PanoCube() {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialsRef = useRef<THREE.MeshBasicMaterial[]>([])
  const loadedFacesRef = useRef<Set<string>>(new Set())
  const { updateLOD, getInitialFaces, getInitialLod } = useLOD()
  const sceneId = usePanoStore((s) => s.sceneId)
  const faceStates = usePanoStore((s) => s.faceStates)
  const setFaceLodLoaded = usePanoStore((s) => s.setFaceLodLoaded)
  const setFaceTargetLod = usePanoStore((s) => s.setFaceTargetLod)
  const setLoadingProgress = usePanoStore((s) => s.setLoadingProgress)
  const setSceneLoaded = usePanoStore((s) => s.setSceneLoaded)
  const meta = usePanoStore((s) => s.meta)

  const geometry = useMemo(() => {
    return new THREE.BoxGeometry(1000, 1000, 1000)
  }, [])

  const materials = useMemo(() => {
    return FACE_INDEX.map((face) => {
      const mat = new THREE.MeshBasicMaterial({ side: THREE.BackSide })
      materialsRef.current.push(mat)
      return mat
    })
  }, [])

  const loadFace = useCallback(
    async (face: FaceId, lod: LodLevel) => {
      const key = `${face}_${lod}`
      if (loadedFacesRef.current.has(key)) return

      try {
        const texture = await loadCubeFaceTexture(sceneId, face, lod)
        const idx = FACE_INDEX.indexOf(face)
        if (idx >= 0 && materialsRef.current[idx]) {
          const oldTexture = materialsRef.current[idx].map
          materialsRef.current[idx].map = texture
          materialsRef.current[idx].needsUpdate = true
          if (oldTexture) oldTexture.dispose()
          loadedFacesRef.current.add(key)
          setFaceLodLoaded(face, lod)
        }
      } catch {
        const demoTexture = generateDemoCubeFace(face, lod)
        const idx = FACE_INDEX.indexOf(face)
        if (idx >= 0 && materialsRef.current[idx]) {
          const oldTexture = materialsRef.current[idx].map
          materialsRef.current[idx].map = demoTexture
          materialsRef.current[idx].needsUpdate = true
          if (oldTexture) oldTexture.dispose()
          loadedFacesRef.current.add(key)
          setFaceLodLoaded(face, lod)
        }
      }
    },
    [sceneId, setFaceLodLoaded]
  )

  useEffect(() => {
    const initialFaces = getInitialFaces()
    const initialLod = getInitialLod()
    let loaded = 0
    const total = initialFaces.length

    initialFaces.forEach((face) => {
      loadFace(face, initialLod).then(() => {
        loaded++
        setLoadingProgress(Math.round((loaded / total) * 100))
        if (loaded >= total) {
          setSceneLoaded(true)
        }
      })
    })
  }, [getInitialFaces, getInitialLod, loadFace, setLoadingProgress, setSceneLoaded])

  useEffect(() => {
    const interval = setInterval(() => {
      for (const face of FACE_INDEX) {
        const state = faceStates[face]
        if (state.loading && state.targetLod > state.currentLod) {
          loadFace(face, state.targetLod)
        }
        if (state.targetLod < state.currentLod && state.currentLod > 0) {
          const key = `${face}_${state.currentLod}`
          loadedFacesRef.current.delete(key)
          loadFace(face, state.targetLod)
        }
      }
    }, 500)
    return () => clearInterval(interval)
  }, [faceStates, loadFace])

  return (
    <mesh ref={meshRef} geometry={geometry} material={materials} />
  )
}

function CameraTracker() {
  const { camera } = useThree()
  const { updateLOD } = useLOD()
  const lastUpdateRef = useRef(0)

  useFrame(() => {
    const now = Date.now()
    if (now - lastUpdateRef.current < 500) return
    lastUpdateRef.current = now

    const dir = new THREE.Vector3()
    camera.getWorldDirection(dir)
    const azimuth = Math.atan2(dir.x, dir.z)
    const polar = Math.asin(dir.y)
    updateLOD(azimuth, polar)
  })

  return null
}

function SceneLighting() {
  return <ambientLight intensity={1} />
}

export default function PanoramaCanvas() {
  const meta = usePanoStore((s) => s.meta)

  return (
    <Canvas
      camera={{ fov: 75, near: 0.1, far: 2000, position: [0, 0, 0.01] }}
      gl={{
        antialias: true,
        toneMapping: THREE.NoToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{ width: "100%", height: "100%" }}
    >
      <SceneLighting />
      <PanoCube />
      <CameraTracker />
      {meta?.hotspots.map((hotspot) => (
        <HotspotSprite key={hotspot.id} hotspot={hotspot} />
      ))}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        zoomSpeed={0.8}
        rotateSpeed={-0.3}
        minDistance={0.01}
        maxDistance={0.01}
        dampingFactor={0.1}
        enableDamping={true}
      />
    </Canvas>
  )
}
