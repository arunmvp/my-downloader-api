import { detectPlatform } from "../utils/detectPlatform.js"
import { downloadQueue } from "../queue/downloadQueue.js"

// Create Job (Get Video Info)
export async function getVideoInfo(req, reply) {

  try {

    const { url } = req.body

    if (!url) {
      return reply.send({ error: "URL required" })
    }

    const platform = detectPlatform(url)

    if (platform === "unknown") {
      return reply.send({ error: "Unsupported platform" })
    }

    const job = await downloadQueue.add("get-info", {
      url,
      platform
    })

    return reply.send({
      jobId: job.id,
      status: "queued"
    })

  } catch (err) {

    console.log(err)

    return reply.send({
      error: "Server error"
    })
  }

}



// Get Job Status (with progress)
export async function getJobStatus(req, reply) {

  try {

    const { id } = req.params

    const job = await downloadQueue.getJob(id)

    if (!job) {
      return reply.send({
        error: "Job not found"
      })
    }

    const state = await job.getState()

    const progress = job.progress || 0

    return reply.send({
      jobId: job.id,
      status: state,
      progress,
      result: job.returnvalue || null
    })

  } catch (err) {

    console.log(err)

    return reply.send({
      error: "Server error"
    })

  }

}



// Create Download Job
export async function createDownload(req, reply) {

  try {

    const { url, format } = req.body

    if (!url) {
      return reply.send({
        error: "URL required"
      })
    }

    const job = await downloadQueue.add("download-video", {
      url,
      format
    })

    return reply.send({
      jobId: job.id,
      status: "queued"
    })

  } catch (err) {

    console.log(err)

    return reply.send({
      error: "Server error"
    })

  }

}