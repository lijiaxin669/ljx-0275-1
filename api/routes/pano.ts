import { Router, type Request, type Response } from "express"
import sharp from "sharp"
import multer from "multer"
import path from "path"
import fs from "fs/promises"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()

const PANO_ROOT = path.resolve(__dirname, "../../public/pano")

const upload = multer({
  dest: path.resolve(__dirname, "../../tmp/uploads/"),
  limits: { fileSize: 100 * 1024 * 1024 },
})

const FACE_MAP: Record<string, { x: number; y: number; w: number; h: number }> = {
  pz: { x: 1, y: 1, w: 1, h: 1 },
  nz: { x: 3, y: 1, w: 1, h: 1 },
  px: { x: 2, y: 1, w: 1, h: 1 },
  nx: { x: 0, y: 1, w: 1, h: 1 },
  py: { x: 1, y: 0, w: 1, h: 1 },
  ny: { x: 1, y: 2, w: 1, h: 1 },
}

const LOD_SIZES: Record<number, number> = {
  0: 512,
  1: 1024,
  2: 2048,
}

router.get("/:sceneId/meta", async (req: Request, res: Response) => {
  try {
    const metaPath = path.join(PANO_ROOT, req.params.sceneId, "meta.json")
    const data = await fs.readFile(metaPath, "utf-8")
    res.json(JSON.parse(data))
  } catch {
    res.status(404).json({ error: "Scene not found" })
  }
})

router.post(
  "/:sceneId/slice",
  upload.single("image"),
  async (req: Request, res: Response) => {
    const { sceneId } = req.params
    const file = req.file

    if (!file) {
      res.status(400).json({ error: "No image file provided" })
      return
    }

    const outputDir = path.join(PANO_ROOT, sceneId)
    await fs.mkdir(outputDir, { recursive: true })

    res.json({
      sceneId,
      status: "processing",
      faces: Object.keys(FACE_MAP),
      lods: [0, 1, 2],
    })

    try {
      const image = sharp(file.path)
      const metadata = await image.metadata()
      const srcW = metadata.width || 4096
      const srcH = metadata.height || 2048
      const faceW = Math.floor(srcW / 4)
      const faceH = Math.floor(srcH / 3)

      for (const [face, region] of Object.entries(FACE_MAP)) {
        for (const [lodStr, size] of Object.entries(LOD_SIZES)) {
          const lod = parseInt(lodStr)
          const left = region.x * faceW
          const top = region.y * faceH

          const outPath = path.join(outputDir, `${face}_${lod}.jpg`)

          await sharp(file.path)
            .extract({ left, top, width: faceW, height: faceH })
            .resize(size, size, { fit: "fill" })
            .jpeg({ quality: lod === 0 ? 60 : lod === 1 ? 75 : 85 })
            .toFile(outPath)
        }
      }

      await fs.unlink(file.path).catch(() => {})
    } catch (err) {
      console.error("Slice processing error:", err)
    }
  }
)

export default router
