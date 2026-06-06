import { useCallback, useRef, useEffect } from "react"
import { usePanoStore } from "@/store/panoStore"
import type { FaceId, LodLevel } from "@/types/pano"

const FACE_NEIGHBORS: Record<FaceId, FaceId[]> = {
  pz: ["px", "nx", "py", "ny"],
  nz: ["px", "nx", "py", "ny"],
  px: ["pz", "nz", "py", "ny"],
  nx: ["pz", "nz", "py", "ny"],
  py: ["pz", "nz", "px", "nx"],
  ny: ["pz", "nz", "px", "nx"],
}

function cameraDirectionToFace(azimuth: number, polar: number): FaceId {
  const absPolar = Math.abs(polar)
  if (absPolar > Math.PI / 3) {
    return polar > 0 ? "ny" : "py"
  }
  const norm = ((azimuth % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  if (norm < Math.PI / 4 || norm >= (7 * Math.PI) / 4) return "pz"
  if (norm < (3 * Math.PI) / 4) return "px"
  if (norm < (5 * Math.PI) / 4) return "nz"
  return "nx"
}

export function useLOD() {
  const setFaceTargetLod = usePanoStore((s) => s.setFaceTargetLod)
  const faceStates = usePanoStore((s) => s.faceStates)
  const currentFaceRef = useRef<FaceId>("pz")
  const upgradeTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const updateLOD = useCallback(
    (azimuth: number, polar: number) => {
      const primaryFace = cameraDirectionToFace(azimuth, polar)
      currentFaceRef.current = primaryFace

      const neighbors = FACE_NEIGHBORS[primaryFace]
      const visibleFaces = [primaryFace, ...neighbors.slice(0, 2)]
      const allFaces: FaceId[] = ["px", "nx", "py", "ny", "pz", "nz"]
      const hiddenFaces = allFaces.filter((f) => !visibleFaces.includes(f))

      for (const face of visibleFaces) {
        if (!faceStates[face].loading && faceStates[face].currentLod < 1) {
          setFaceTargetLod(face, 1)
        }
      }

      for (const face of hiddenFaces) {
        if (faceStates[face].currentLod > 0) {
          setFaceTargetLod(face, 0)
        }
      }

      for (const [key, timer] of upgradeTimersRef.current.entries()) {
        clearTimeout(timer)
        upgradeTimersRef.current.delete(key)
      }

      for (const face of visibleFaces) {
        const timer = setTimeout(() => {
          if (faceStates[face].currentLod < 2) {
            setFaceTargetLod(face, 2)
          }
        }, 3000)
        upgradeTimersRef.current.set(face, timer)
      }
    },
    [faceStates, setFaceTargetLod]
  )

  const getInitialFaces = useCallback((): FaceId[] => {
    return ["pz", "px", "nx"]
  }, [])

  const getInitialLod = useCallback((): LodLevel => {
    return 0
  }, [])

  useEffect(() => {
    return () => {
      for (const timer of upgradeTimersRef.current.values()) {
        clearTimeout(timer)
      }
    }
  }, [])

  return { updateLOD, getInitialFaces, getInitialLod, FACE_NEIGHBORS }
}
