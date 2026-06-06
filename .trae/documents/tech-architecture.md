## 1. 架构设计

```mermaid
graph TB
    subgraph "前端 React+Three.js"
        A["全景首页"] --> B["PanoramaViewer"]
        B --> C["CubeMapLoader (LOD)"]
        B --> D["HotspotManager"]
        B --> E["GyroController"]
        D --> F["FacilityCard"]
        C --> G["LODManager"]
    end
    subgraph "后端 Node+Express"
        H["切片服务 /api/pano"]
        I["静态资源 /pano/*"]
        H --> J["sharp 图片切片"]
    end
    subgraph "Docker"
        K["nginx: 静态资源+前端"]
        L["node: 切片服务"]
    end
    A -->|"加载全景"| H
    B -->|"请求切片"| I
```

## 2. 技术说明

- **前端**：React@18 + Three.js + @react-three/fiber + @react-three/drei + TailwindCSS@3 + Vite
- **初始化工具**：已有 Vite 项目
- **后端**：Express@4 + sharp（图片切片）
- **数据库**：无，热点数据存储在 meta.json 静态文件中
- **部署**：Docker Compose（nginx 静态资源 + Node 切片服务）

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| `/` | 全景首页，主交互界面 |
| `/api/pano/:sceneId/meta` | 获取场景热点数据与元信息 |
| `/api/pano/:sceneId/slice` | 上传原始全景图并触发切片 |
| `/pano/:sceneId/:face/:lod.jpg` | 静态切片资源 |

## 4. API 定义

```typescript
interface HotspotData {
  id: string
  position: [number, number, number]
  type: "restroom" | "firstaid" | "parking" | "playground" | "campsite" | "food"
  name: string
  walkMinutes: number
  description: string
}

interface SceneMeta {
  sceneId: string
  name: string
  hotspots: HotspotData[]
  maxLod: number
  faces: ("px" | "nx" | "py" | "ny" | "pz" | "nz")[]
}

interface SliceRequest {
  sceneId: string
  imageUrl: string
}

interface SliceResponse {
  sceneId: string
  faces: string[]
  lods: number[]
  status: "processing" | "done"
}
```

## 5. 服务架构图

```mermaid
graph LR
    subgraph "Docker Compose"
        N["Nginx :80"] -->|"反向代理 /api"| S["Node Service :3001"]
        N -->|"静态文件 /pano"| V["Volume: /public/pano"]
        S -->|"读写切片"| V
        S -->|"sharp 切片"| T["临时处理目录"]
    end
    Client["浏览器"] --> N
```

## 6. 核心组件架构

```mermaid
graph TD
    subgraph "React 组件树"
        Home --> PanoramaCanvas
        PanoramaCanvas --> PanoScene
        PanoScene --> CubeSphere["CubeSphere 全景球"]
        PanoScene --> HotspotSprite["HotspotSprite 热点精灵"]
        PanoScene --> LODController["LODController LOD控制器"]
        PanoramaCanvas --> OverlayUI["OverlayUI 浮动UI层"]
        OverlayUI --> FacilityCard["FacilityCard 设施卡片"]
        OverlayUI --> GyroHint["GyroHint 陀螺仪提示"]
        OverlayUI --> LoadingBar["LoadingBar 加载进度"]
    end
```

## 7. LOD 策略

1. **首屏加载**：仅请求正面(pz)、左(nx)、右(px) 三面的 LOD0 (512px)，约 225KB
2. **视角变化**：LODController 监听相机朝向，计算当前可见面与相邻面
3. **渐进升级**：可见面先加载 LOD0，3 秒后自动升级到 LOD1 (1024px)，空闲时升级 LOD2 (2048px)
4. **内存管理**：背面降级为 LOD0 或卸载，最多同时持有 3 面 LOD2

## 8. 场景图

```mermaid
graph TD
    subgraph "Three.js Scene Graph"
        Scene["Scene"]
        Scene --> Camera["PerspectiveCamera FOV=75"]
        Scene --> Sphere["Mesh: SphereGeometry r=500"]
        Sphere --> Mat["MeshBasicMaterial: CubeMap 6面"]
        Scene --> Group["Group: Hotspots"]
        Group --> HS1["Sprite: 洗手点1"]
        Group --> HS2["Sprite: 洗手点2"]
        Group --> HS3["Sprite: 急救站"]
        Group --> HS4["Sprite: 停车场"]
        Group --> HS5["Sprite: 餐饮区"]
        Group --> HS6["Sprite: 游乐场"]
    end
```
