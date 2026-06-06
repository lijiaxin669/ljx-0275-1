import { HOTSPOT_COLORS, HOTSPOT_ICONS, type HotspotType } from "@/types/pano"

const LEGEND_ITEMS: { type: HotspotType; label: string }[] = [
  { type: "restroom", label: "洗手点" },
  { type: "firstaid", label: "急救站" },
  { type: "parking", label: "停车场" },
  { type: "playground", label: "游乐场" },
  { type: "campsite", label: "露营区" },
  { type: "food", label: "餐饮区" },
]

export default function LegendBar() {
  return (
    <div className="fixed bottom-4 inset-x-0 z-30 px-4 md:hidden">
      <div
        className="flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl mx-auto max-w-sm"
        style={{
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(15,25,15,0.65)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {LEGEND_ITEMS.map((item) => (
          <div key={item.type} className="flex items-center gap-1">
            <span className="text-sm">{HOTSPOT_ICONS[item.type]}</span>
            <span className="text-white/50 text-[9px]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
