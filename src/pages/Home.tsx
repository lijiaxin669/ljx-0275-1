import { useEffect, Suspense } from "react"
import { usePanoStore } from "@/store/panoStore"
import { DEMO_SCENE_META } from "@/data/sceneMeta"
import PanoramaCanvas from "@/components/PanoramaCanvas"
import TopBar from "@/components/TopBar"
import GyroHint from "@/components/GyroHint"
import LoadingBar from "@/components/LoadingBar"
import FacilityCard from "@/components/FacilityCard"
import LegendBar from "@/components/LegendBar"

export default function Home() {
  const setMeta = usePanoStore((s) => s.setMeta)
  const hotspotCardVisible = usePanoStore((s) => s.hotspotCardVisible)
  const setHotspotCardVisible = usePanoStore((s) => s.setHotspotCardVisible)
  const setActiveHotspot = usePanoStore((s) => s.setActiveHotspot)

  useEffect(() => {
    setMeta(DEMO_SCENE_META)
  }, [setMeta])

  const handleCanvasClick = () => {
    if (hotspotCardVisible) {
      setHotspotCardVisible(false)
      setActiveHotspot(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=ZCOOL+XiaoWei&display=swap"
        rel="stylesheet"
      />

      <div className="absolute inset-0" onClick={handleCanvasClick}>
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white/50 text-sm">初始化 3D 引擎...</div>
            </div>
          }
        >
          <PanoramaCanvas />
        </Suspense>
      </div>

      <TopBar />
      <GyroHint />
      <LoadingBar />
      <FacilityCard />
      <LegendBar />

      <div className="fixed bottom-4 right-4 z-30 hidden md:block">
        <div
          className="px-3 py-2 rounded-lg text-[10px] text-white/30"
          style={{
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(15,25,15,0.4)",
          }}
        >
          点击地面标记查看设施信息
        </div>
      </div>
    </div>
  )
}
