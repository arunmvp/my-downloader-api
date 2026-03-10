import { Queue } from "bullmq"
import { redis } from "./redis.js"

export const downloadQueue = new Queue("download-queue", {
 connection: redis
})