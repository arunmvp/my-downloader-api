import { Worker } from "bullmq";
import { redis } from "../queue/redis.js";
import ytdlp from "yt-dlp-exec";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const VIDEO_DIR = "storage/videos";
const AUDIO_DIR = "storage/audio";

if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

new Worker(
  "download-queue",
  async (job) => {
    const { url, format } = job.data;

    try {
      // =====================
      // MP3 DOWNLOAD
      // =====================

      if (format === "mp3") {
        const name = `audio_${crypto.randomUUID()}.mp3`;
        const output = path.join(AUDIO_DIR, name);

        await ytdlp(url, {
          extractAudio: true,
          audioFormat: "mp3",
          output: output,
          noPlaylist: true,
        });

        return {
          downloadUrl: `/download/audio/${name}`,
        };
      }

      // =====================
      // VIDEO + AUDIO MERGE
      // =====================

      const name = `video_${crypto.randomUUID()}.mp4`;
      const output = path.join(VIDEO_DIR, name);

      await ytdlp(url, {
        format:`${format}+140/bestaudio`,
        mergeOutputFormat: "mp4",
        output: output,
        noPlaylist: true,
        noWarnings: true,
      });

      return {
        downloadUrl: `/download/video/${name}`,
      };
    } catch (err) {
      console.log("Download worker error:", err);
      throw err;
    }
  },
  { connection: redis },
);

console.log("Download worker started");
