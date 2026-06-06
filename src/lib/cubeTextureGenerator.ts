import * as THREE from "three"
import type { FaceId, LodLevel } from "@/types/pano"

const FACE_COLORS: Record<FaceId, string> = {
  px: "#4a7c59",
  nx: "#3d6b4e",
  py: "#87CEEB",
  ny: "#5a8f4a",
  pz: "#6b9e5a",
  nz: "#4a7043",
}

const FACE_LABELS_CN: Record<FaceId, string> = {
  px: "东 · 右",
  nx: "西 · 左",
  py: "天 · 顶",
  ny: "地 · 底",
  pz: "南 · 前",
  nz: "北 · 后",
}

export function generateDemoCubeFace(
  face: FaceId,
  _lod: LodLevel,
  size = 512
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!

  const grad = ctx.createLinearGradient(0, 0, size, size)
  grad.addColorStop(0, FACE_COLORS[face])
  grad.addColorStop(1, adjustBrightness(FACE_COLORS[face], -30))
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)

  ctx.fillStyle = "rgba(255,255,255,0.08)"
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = 20 + Math.random() * 60
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  if (face === "ny") {
    drawGroundDetails(ctx, size)
  } else if (face === "py") {
    drawSkyDetails(ctx, size)
  } else {
    drawLandscapeDetails(ctx, size, face)
  }

  ctx.fillStyle = "rgba(0,0,0,0.4)"
  ctx.font = `bold ${size / 12}px sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(FACE_LABELS_CN[face], size / 2, size / 2)

  ctx.fillStyle = "rgba(0,0,0,0.2)"
  ctx.font = `${size / 20}px sans-serif`
  ctx.fillText(`${face.toUpperCase()} · LOD${_lod}`, size / 2, size / 2 + size / 10)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  return texture
}

function drawGroundDetails(ctx: CanvasRenderingContext2D, size: number) {
  ctx.strokeStyle = "rgba(255,255,255,0.1)"
  ctx.lineWidth = 1
  for (let i = 0; i < size; i += size / 16) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, size)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(size, i)
    ctx.stroke()
  }

  const spots = [
    { x: 0.3, y: 0.4, color: "#1E88E5" },
    { x: 0.7, y: 0.6, color: "#1E88E5" },
    { x: 0.5, y: 0.7, color: "#E53935" },
    { x: 0.8, y: 0.3, color: "#FB8C00" },
    { x: 0.2, y: 0.8, color: "#7CB342" },
  ]
  for (const s of spots) {
    ctx.fillStyle = s.color + "66"
    ctx.beginPath()
    ctx.arc(s.x * size, s.y * size, size / 20, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = s.color
    ctx.lineWidth = 2
    ctx.stroke()
  }
}

function drawSkyDetails(ctx: CanvasRenderingContext2D, size: number) {
  ctx.fillStyle = "rgba(255,255,255,0.15)"
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const w = 40 + Math.random() * 120
    const h = 20 + Math.random() * 40
    ctx.beginPath()
    ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawLandscapeDetails(
  ctx: CanvasRenderingContext2D,
  size: number,
  _face: FaceId
) {
  ctx.fillStyle = "rgba(34,80,34,0.3)"
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * size
    const baseY = size * 0.6 + Math.random() * size * 0.3
    const treeW = 10 + Math.random() * 20
    const treeH = 30 + Math.random() * 60
    ctx.beginPath()
    ctx.moveTo(x, baseY)
    ctx.lineTo(x - treeW, baseY + treeH)
    ctx.lineTo(x + treeW, baseY + treeH)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = "rgba(101,67,33,0.3)"
    ctx.fillRect(x - 3, baseY + treeH - 5, 6, 15)
    ctx.fillStyle = "rgba(34,80,34,0.3)"
  }
}

function adjustBrightness(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16)
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount))
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount))
  return `rgb(${r},${g},${b})`
}

export function loadCubeFaceTexture(
  sceneId: string,
  face: FaceId,
  lod: LodLevel
): Promise<THREE.Texture> {
  const url = `/pano/${sceneId}/${face}_${lod}.jpg`
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader()
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        resolve(texture)
      },
      undefined,
      () => {
        const demoTexture = generateDemoCubeFace(face, lod)
        resolve(demoTexture)
      }
    )
  })
}
