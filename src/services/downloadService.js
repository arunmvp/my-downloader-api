import ytdlp from "yt-dlp-exec"
import path from "path"
import fs from "fs"

const DOWNLOAD_VID = "storage/videos"
const DOWNLOAD_AUD = "storage/audio"

// Ensure folders exist
if (!fs.existsSync(DOWNLOAD_VID)) {
  fs.mkdirSync(DOWNLOAD_VID, { recursive: true })
}

if (!fs.existsSync(DOWNLOAD_AUD)) {
  fs.mkdirSync(DOWNLOAD_AUD, { recursive: true })
}

export async function downloadVideo(url, format) {

  const id = Date.now()

  // MP3 DOWNLOAD
  if (format === "mp3") {

    const fileName = `audio_${id}.mp3`
    const outputPath = path.join(DOWNLOAD_AUD, fileName)

    await ytdlp(url, {
      extractAudio: true,
      audioFormat: "mp3",
      audioQuality: 0,
      output: outputPath
    })

    return {
      downloadUrl: `/storage/audio/${fileName}`
    }
  }

  // MP4 VIDEO DOWNLOAD
  const fileName = `video_${id}.mp4`
  const outputPath = path.join(DOWNLOAD_VID, fileName)

  await ytdlp(url, {
    format: `${format}+bestaudio/best`,
    mergeOutputFormat: "mp4",
    output: outputPath
  })

  return {
    downloadUrl: `/storage/videos/${fileName}`
  }
}