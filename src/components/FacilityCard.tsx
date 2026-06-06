import { useEffect } from "react"
import { X, Footprints, Clock, Info } from "lucide-react"
import { usePanoStore } from "@/store/panoStore"
import { HOTSPOT_COLORS, HOTSPOT_ICONS, type HotspotType } from "@/types/pano"

const TYPE_LABELS: Record<HotspotType, string> = {
  restroom: "洗手点",
  firstaid: "急救站",
  parking: "停车场",
  playground: "游乐场",
  campsite: "露营区",
  food: "餐饮区",
}

export default function FacilityCard() {
  const activeHotspot = usePanoStore((s) => s.activeHotspot)
  const hotspotCardVisible = usePanoStore((s) => s.hotspotCardVisible)
  const setActiveHotspot = usePanoStore((s) => s.setActiveHotspot)
  const setHotspotCardVisible = usePanoStore((s) => s.setHotspotCardVisible)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHotspotCardVisible(false)
        setActiveHotspot(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [setActiveHotspot, setHotspotCardVisible])

  if (!hotspotCardVisible || !activeHotspot) return null

  const color = HOTSPOT_COLORS[activeHotspot.type]
  const icon = HOTSPOT_ICONS[activeHotspot.type]
  const typeLabel = TYPE_LABELS[activeHotspot.type]

  const handleClose = () => {
    setHotspotCardVisible(false)
    setActiveHotspot(null)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-6 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:px-0 md:pb-0 animate-slide-up">
      <div
        className="relative rounded-t-2xl md:rounded-2xl overflow-hidden shadow-2xl max-w-md mx-auto"
        style={{
          backdropFilter: "blur(20px)",
          backgroundColor: "rgba(15,25,15,0.88)",
          border: `1px solid ${color}44`,
        }}
      >
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: color }}
        />

        <div className="p-5">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")
            }
          >
            <X size={16} className="text-white/70" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: color + "22" }}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">
                {activeHotspot.name}
              </h3>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: color + "33", color }}
              >
                {typeLabel}
              </span>
            </div>
          </div>

          <p className="text-white/70 text-sm leading-relaxed mb-4">
            {activeHotspot.description}
          </p>

          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            >
              <Footprints size={16} style={{ color }} />
              <span className="text-white/80 text-sm">
                步行约 {activeHotspot.walkMinutes} 分钟
              </span>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            >
              <Info size={16} className="text-white/50" />
              <span className="text-white/60 text-xs">
                从中心位置出发
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
