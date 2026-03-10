import { getVideoInfo, getJobStatus , createDownload } from "../controllers/videoController.js"

export default async function routes(fastify) {

  fastify.post("/api/info", getVideoInfo)

  fastify.get("/api/status/:id", getJobStatus)

  fastify.post("/api/download", createDownload)

}