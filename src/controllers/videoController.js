import ytdlp from "yt-dlp-exec";
import crypto from "crypto";
import { redis } from "../queue/redis.js";
import { detectPlatform } from "../utils/detectPlatform.js";
import { downloadQueue } from "../queue/downloadQueue.js";
import { extractDirectUrl } from "../services/extractUrlService.js";



// ===============================
// GET VIDEO INFO
// ===============================
export async function getVideoInfo(req, reply) {

 try {

  const { url } = req.body;

  if (!url) {
   return reply.code(400).send({
    error: "URL required"
   });
  }

  const platform = detectPlatform(url);

  if (platform === "unknown") {
   return reply.code(400).send({
    error: "Unsupported platform"
   });
  }

  const cacheKey =
   "video-info:" +
   crypto.createHash("md5").update(url).digest("hex");

  const cached = await redis.get(cacheKey);

  if (cached) {
   return reply.send({
    cached: true,
    result: JSON.parse(cached)
   });
  }

  const info = await ytdlp(url, {
   dumpSingleJson: true,
   noWarnings: true
  });


  // ===============================
  // FORMAT PARSER
  // ===============================

  const formats = [];

  info.formats.forEach((f) => {

   if (!f.format_id) return;

   const container = f.ext?.toUpperCase() || "";

   const hasVideo = f.vcodec && f.vcodec !== "none";
   const hasAudio = f.acodec && f.acodec !== "none";

   let type = "unknown";

   if (hasVideo && hasAudio) type = "video+audio";
   else if (hasVideo) type = "video";
   else if (hasAudio) type = "audio";

   formats.push({
    format_id: f.format_id,
    ext: container,
    height: f.height || null,
    filesize: f.filesize || f.filesize_approx || null,
    type,
    hasVideo,
    hasAudio
   });

  });


  formats.sort((a, b) => (b.height || 0) - (a.height || 0));

  const result = {
   title: info.title,
   thumbnail: info.thumbnail,
   duration: info.duration,
   formats
  };

  await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);

  return reply.send({
   cached: false,
   result
  });

 } catch (err) {

  console.log("Video info error:", err);

  return reply.code(500).send({
   error: "Failed to fetch video info"
  });

 }

}



// ===============================
// CREATE DOWNLOAD JOB
// ===============================
export async function createDownload(req, reply) {

 try {

  const { url, format } = req.body;

  if (!url || !format) {
   return reply.code(400).send({
    error: "URL and format required"
   });
  }


  // ===============================
  // TRY DIRECT DOWNLOAD
  // ===============================

  const direct = await extractDirectUrl(url, format);

  if (direct && direct.url) {

   return reply.send({
    type: "direct",
    downloadUrl: direct.url,
    title: direct.title,
    thumbnail: direct.thumbnail
   });

  }


  // ===============================
  // QUEUE DOWNLOAD
  // ===============================

  const job = await downloadQueue.add(
   "download-video",
   {
    url,
    format
   },
   {
    attempts: 3,
    removeOnComplete: false,
    removeOnFail: true
   }
  );


  return reply.send({
   type: "server",
   jobId: job.id,
   status: "queued"
  });

 } catch (err) {

  console.log("Create download error:", err);

  return reply.code(500).send({
   error: "Server error"
  });

 }

}



// ===============================
// JOB STATUS
// ===============================
export async function getJobStatus(req, reply) {

 try {

  const { id } = req.params;

  const job = await downloadQueue.getJob(id);

  if (!job) {

   return reply.send({
    status: "completed",
    progress: 100,
    result: null
   });

  }

  const state = await job.getState();

  return reply.send({
   status: state,
   progress: job.progress || 0,
   result: job.returnvalue || null
  });

 } catch (err) {

  console.log("Job status error:", err);

  return reply.code(500).send({
   error: "Server error"
  });

 }

}