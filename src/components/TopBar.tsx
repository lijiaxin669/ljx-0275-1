import { TreePine } from "lucide-react"

export default function TopBar() {
  return (
    <div className="fixed top-0 inset-x-0 z-40">
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(15,25,15,0.55)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "rgba(45,90,39,0.5)" }}
          >
            <TreePine size={18} className="text-green-300" />
          </div>
          <div>
            <h1 className="text-white text-sm font-bold leading-tight tracking-wide">
              郊野亲子营地
            </h1>
            <p className="text-white/40 text-[10px] leading-tight">
              360° 全景导览
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px]"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/50">拖动旋转 · 滚轮缩放</span>
          </div>
          <div
            className="flex md:hidden items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px]"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/50">滑动旋转 · 双指缩放</span>
          </div>
        </div>
      </div>
    </div>
  )
}
