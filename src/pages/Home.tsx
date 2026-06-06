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

      <div className="absolute inset-0">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white/50 text-sm">初始化 3D 引擎...</div>
            </div>
          }
        >
          <PanoramaCanvas onCanvasClick={handleCanvasClick} />
        </Suspense>
      </div>

      <TopBar />
      <GyroHint />
      <LoadingBar />
      <FacilityCard />
      <LegendBar />

      <div className="fixed bottom-4 right-4 z-30 hidden md:block">
        <div
          className="px-4 py-3 rounded-xl text-xs text-white/70 max-w-xs"
          style={{
            backdropFilter: "blur(12px)",
            backgroundColor: "rgba(15,25,15,0.6)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="font-medium text-white/90 mb-1">使用说明</div>
          <div className="space-y-1">
            <div>• 拖动鼠标可 360° 旋转全景视角</div>
            <div>• 点击地面上的<span className="text-white font-bold">彩色标记点</span>查看设施详情</div>
            <div>• 标记点显示洗手点、急救站、停车场等设施</div>
            <div>• 点击卡片外空白处可关闭详情</div>
          </div>
        </div>
      </div>
    </div>
  )
}
