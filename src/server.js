import Fastify from "fastify"
import cors from "@fastify/cors"
import fastifyStatic from "@fastify/static"
import path from "path"
import fs from "fs"
import routes from "./routes/videoRoutes.js"

const fastify = Fastify({ logger: true })

await fastify.register(cors)

const STORAGE = path.join(process.cwd(), "storage")

const videoDir = path.join(STORAGE, "videos")
const audioDir = path.join(STORAGE, "audio")

// create folders
if (!fs.existsSync(videoDir)) {
 fs.mkdirSync(videoDir, { recursive: true })
}

if (!fs.existsSync(audioDir)) {
 fs.mkdirSync(audioDir, { recursive: true })
}

// static files
await fastify.register(fastifyStatic, {
 root: STORAGE,
 prefix: "/files/",
})

// api routes
await fastify.register(routes)

// health check
fastify.get("/", async () => {
 return { status: "Video Downloader API running" }
})

fastify.get("/download/:type/:file", async (req, reply) => {

 const { type, file } = req.params

 const folder = type === "video"
  ? path.join(process.cwd(),"storage/videos")
  : path.join(process.cwd(),"storage/audio")

 const filePath = path.join(folder,file)

 if(!fs.existsSync(filePath)){
  return reply.code(404).send({error:"File not found"})
 }

 reply.header(
  "Content-Disposition",
  `attachment; filename="${file}"`
 )

 reply.header("Content-Type","application/octet-stream")

 return reply.send(fs.createReadStream(filePath))

})

// auto cleanup (30 minutes)
setInterval(() => {

 const now = Date.now()

 fs.readdirSync(videoDir).forEach(file => {

  const filePath = path.join(videoDir, file)
  const stat = fs.statSync(filePath)

  if (now - stat.mtimeMs > 1800000) {
   fs.unlinkSync(filePath)
  }

 })

 fs.readdirSync(audioDir).forEach(file => {

  const filePath = path.join(audioDir, file)
  const stat = fs.statSync(filePath)

  if (now - stat.mtimeMs > 1800000) {
   fs.unlinkSync(filePath)
  }

 })

}, 600000)

// start server
const start = async () => {

 await fastify.listen({
  port: 5000,
  host: "0.0.0.0"
 })

}

start()