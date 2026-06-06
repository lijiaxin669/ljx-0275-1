import { usePanoStore } from "@/store/panoStore"

export default function LoadingBar() {
  const loadingProgress = usePanoStore((s) => s.loadingProgress)
  const sceneLoaded = usePanoStore((s) => s.sceneLoaded)

  if (sceneLoaded && loadingProgress >= 100) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className="flex flex-col items-center gap-4 px-8 py-6 rounded-2xl"
        style={{
          backdropFilter: "blur(20px)",
          backgroundColor: "rgba(15,25,15,0.85)",
        }}
      >
        <div className="relative w-48 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${loadingProgress}%`,
              backgroundColor: "#2D5A27",
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/80 text-sm font-medium">
            加载全景
          </span>
          <span className="text-green-400 text-sm font-bold">
            {loadingProgress}%
          </span>
        </div>
      </div>
    </div>
  )
}
