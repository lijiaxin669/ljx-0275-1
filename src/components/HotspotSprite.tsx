import { useRef, useState, useMemo, useEffect } from "react"
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
  const labelRef = useRef<THREE.Sprite>(null)
  const [hovered, setHovered] = useState(false)
  const setActiveHotspot = usePanoStore((s) => s.setActiveHotspot)
  const setHotspotCardVisible = usePanoStore((s) => s.setHotspotCardVisible)
  const hotspotCardVisible = usePanoStore((s) => s.hotspotCardVisible)
  const activeHotspot = usePanoStore((s) => s.activeHotspot)
  const { camera } = useThree()

  const isActive = activeHotspot?.id === hotspot.id

  const pos = hotspot.position
  const dist = Math.sqrt(pos[0] ** 2 + pos[1] ** 2 + pos[2] ** 2)
  const baseScale = dist * 0.45

  const spriteMaterial = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext("2d")!
    const color = HOTSPOT_COLORS[hotspot.type]
    const icon = HOTSPOT_ICONS[hotspot.type]

    ctx.clearRect(0, 0, 256, 256)

    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 110)
    gradient.addColorStop(0, color + "60")
    gradient.addColorStop(0.6, color + "30")
    gradient.addColorStop(1, color + "00")
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(128, 128, 110, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = color + "CC"
    ctx.beginPath()
    ctx.arc(128, 128, 75, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.arc(128, 128, 75, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 72px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(icon, 128, 132)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.needsUpdate = true
    return new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      sizeAttenuation: true,
      alphaTest: 0,
    })
  }, [hotspot.type])

  const labelMaterial = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 128
    const ctx = canvas.getContext("2d")!
    const color = HOTSPOT_COLORS[hotspot.type]

    ctx.clearRect(0, 0, 512, 128)

    ctx.fillStyle = "rgba(0,0,0,0.85)"
    const radius = 24
    ctx.beginPath()
    ctx.moveTo(radius, 0)
    ctx.lineTo(512 - radius, 0)
    ctx.quadraticCurveTo(512, 0, 512, radius)
    ctx.lineTo(512, 128 - radius)
    ctx.quadraticCurveTo(512, 128, 512 - radius, 128)
    ctx.lineTo(radius, 128)
    ctx.quadraticCurveTo(0, 128, 0, 128 - radius)
    ctx.lineTo(0, radius)
    ctx.quadraticCurveTo(0, 0, radius, 0)
    ctx.closePath()
    ctx.fill()

    ctx.strokeStyle = color + "CC"
    ctx.lineWidth = 4
    ctx.stroke()

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 44px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(hotspot.name, 256, 64)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.needsUpdate = true
    return new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      sizeAttenuation: true,
    })
  }, [hotspot.name, hotspot.type])

  useFrame(() => {
    if (!spriteRef.current || !labelRef.current) return

    const targetBase = hovered || isActive ? baseScale * 0.55 : baseScale * 0.45
    const targetScale = new THREE.Vector3(targetBase, targetBase, targetBase)
    spriteRef.current.scale.lerp(targetScale, 0.15)

    const labelTargetScale = new THREE.Vector3(
      hovered || isActive ? baseScale * 1.0 : baseScale * 0.9,
      hovered || isActive ? baseScale * 0.28 : baseScale * 0.25,
      baseScale
    )
    labelRef.current.scale.lerp(labelTargetScale, 0.15)
  })

  useEffect(() => {
    return () => {
      document.body.style.cursor = "default"
    }
  }, [])

  const handleClick = (e: any) => {
    e.stopPropagation()
    if (isActive && hotspotCardVisible) {
      setHotspotCardVisible(false)
      setActiveHotspot(null)
    } else {
      setActiveHotspot(hotspot)
      setHotspotCardVisible(true)
    }
  }

  return (
    <group position={pos}>
      <sprite
        ref={spriteRef}
        material={spriteMaterial}
        scale={[baseScale * 0.45, baseScale * 0.45, baseScale * 0.45]}
        renderOrder={9999}
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
        ref={labelRef}
        material={labelMaterial}
        position={[0, -baseScale * 0.5, 0]}
        scale={[baseScale * 0.9, baseScale * 0.25, baseScale]}
        renderOrder={9999}
      />
    </group>
  )
}
