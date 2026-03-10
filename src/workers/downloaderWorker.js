import { Worker } from "bullmq"
import { redis } from "../queue/redis.js"
import { getYoutubeInfo } from "../services/youtubeService.js"
import { downloadVideo } from "../services/downloadService.js"

const worker = new Worker(
 "download-queue",
 async job => {

  try{

   const { url, platform, format } = job.data

   if (job.name === "get-info") {

    const data = await getYoutubeInfo(url)
    return data

   }

   if (job.name === "download-video") {

    const file = await downloadVideo(url, format)
    return file

   }

  }catch(err){

   console.error("❌ Job failed:",err)
   throw err

  }

 },
 { connection: redis }
)

worker.on("completed", job => {
 console.log("✅ Job completed:", job.id)
})

worker.on("failed", (job,err) => {
 console.log("❌ Job failed:", err)
})

export default worker