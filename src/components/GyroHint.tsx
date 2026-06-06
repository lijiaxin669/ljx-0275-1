import { Smartphone } from "lucide-react"
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation"

export default function GyroHint() {
  const { gyroSupported, gyroEnabled, permissionNeeded, requestPermission } =
    useDeviceOrientation()

  if (gyroSupported === null) {
    return (
      <div className="fixed top-4 right-4 z-40">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg animate-pulse"
          style={{
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(15,25,15,0.6)",
          }}
        >
          <Smartphone size={16} className="text-white/50" />
          <span className="text-white/50 text-xs">检测陀螺仪...</span>
        </div>
      </div>
    )
  }

  if (!gyroSupported) {
    return null
  }

  if (permissionNeeded && !gyroEnabled) {
    return (
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={requestPermission}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105"
          style={{
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(30,90,39,0.7)",
            border: "1px solid rgba(45,90,39,0.5)",
          }}
        >
          <Smartphone size={16} className="text-green-300" />
          <span className="text-green-200 text-xs font-medium">
            启用陀螺仪环视
          </span>
        </button>
      </div>
    )
  }

  if (gyroEnabled) {
    return (
      <div className="fixed top-4 right-4 z-40">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(30,90,39,0.5)",
            border: "1px solid rgba(45,90,39,0.3)",
          }}
        >
          <Smartphone size={16} className="text-green-400" />
          <span className="text-green-300 text-xs">陀螺仪已启用</span>
        </div>
      </div>
    )
  }

  return null
}
