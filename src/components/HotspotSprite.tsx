import { useRef, useState, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { usePanoStore } from "@/store/panoStore"
import { HOTSPOT_COLORS, HOTSPOT_ICONS } from "@/types/pano"
import type { HotspotData } from "@/types/pano"

interface HotspotSpriteProps {
  hotspot: HotspotData
}

export default function HotspotSprite({ hotspot }: HotspotSpriteProps) {
  const spriteRef = useRef<THREE.Sprite>(null)
  const [hovered, setHovered] = useState(false)
  const setActiveHotspot = usePanoStore((s) => s.setActiveHotspot)
  const setHotspotCardVisible = usePanoStore((s) => s.setHotspotCardVisible)
  const hotspotCardVisible = usePanoStore((s) => s.hotspotCardVisible)
  const activeHotspot = usePanoStore((s) => s.activeHotspot)
  const { camera } = useThree()

  const isActive = activeHotspot?.id === hotspot.id

  const spriteMaterial = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext("2d")!
    const color = HOTSPOT_COLORS[hotspot.type]
    const icon = HOTSPOT_ICONS[hotspot.type]

    ctx.clearRect(0, 0, 128, 128)

    ctx.fillStyle = color + "33"
    ctx.beginPath()
    ctx.arc(64, 64, 50, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(64, 64, 40, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = "#fff"
    ctx.font = "36px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(icon, 64, 64)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      sizeAttenuation: true,
    })
  }, [hotspot.type])

  const labelMaterial = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext("2d")!
    const color = HOTSPOT_COLORS[hotspot.type]

    ctx.clearRect(0, 0, 256, 64)

    ctx.fillStyle = color + "DD"
    const radius = 12
    ctx.beginPath()
    ctx.moveTo(radius, 0)
    ctx.lineTo(256 - radius, 0)
    ctx.quadraticCurveTo(256, 0, 256, radius)
    ctx.lineTo(256, 64 - radius)
    ctx.quadraticCurveTo(256, 64, 256 - radius, 64)
    ctx.lineTo(radius, 64)
    ctx.quadraticCurveTo(0, 64, 0, 64 - radius)
    ctx.lineTo(0, radius)
    ctx.quadraticCurveTo(0, 0, radius, 0)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = "#fff"
    ctx.font = "bold 24px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(hotspot.name, 128, 32)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      sizeAttenuation: true,
    })
  }, [hotspot.name, hotspot.type])

  useFrame(() => {
    if (!spriteRef.current) return
    spriteRef.current.lookAt(camera.position)

    const scale = hovered ? 1.3 : 1.0
    spriteRef.current.scale.lerp(
      new THREE.Vector3(scale, scale, scale),
      0.1
    )
  })

  const handleClick = (e: THREE.Event) => {
    (e as unknown as { stopPropagation: () => void }).stopPropagation()
    if (isActive && hotspotCardVisible) {
      setHotspotCardVisible(false)
      setActiveHotspot(null)
    } else {
      setActiveHotspot(hotspot)
      setHotspotCardVisible(true)
    }
  }

  const pos = hotspot.position

  return (
    <group position={pos}>
      <sprite
        ref={spriteRef}
        material={spriteMaterial}
        scale={[1, 1, 1]}
        onClick={handleClick}
        onPointerOver={() => {
          setHovered(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = "default"
        }}
      />
      <sprite
        material={labelMaterial}
        position={[0, -0.8, 0]}
        scale={[1.6, 0.4, 1]}
      />
    </group>
  )
}
