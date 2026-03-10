import Fastify from "fastify"
import cors from "@fastify/cors"
import fastifyStatic from "@fastify/static"
import path from "path"
import { fileURLToPath } from "url"
import videoRoutes from "./routes/videoRoutes.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const fastify = Fastify({ logger: true })

await fastify.register(cors)
await fastify.register(videoRoutes)


// 👇 static downloads serve
await fastify.register(fastifyStatic, {
 root: path.join(__dirname, "../../storage/videos"),
 prefix: "/storage/videos/",
})

fastify.get("/", async () => {
 return { status: "Downloader API running" }
})

const start = async () => {
 try {
  await fastify.listen({ port: 5000 })
 } catch (err) {
  fastify.log.error(err)
  process.exit(1)
 }
}

start()