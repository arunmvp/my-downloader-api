import ytdlp from "yt-dlp-exec";
import path from "path";
import fs from "fs";

const VIDEO_DIR = "storage/videos";
const AUDIO_DIR = "storage/audio";

// ensure folders exist
if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

export async function downloadVideo(url, format, onProgress) {
  const id = Date.now();

  // MP3 DOWNLOAD
  if (format === "mp3") {
    const fileName = `audio_${id}.mp3`;
    const output = path.join(AUDIO_DIR, fileName);

    await ytdlp(url, {
      extractAudio: true,
      audioFormat: "mp3",
      output,
      progress: true,
      newline: true,
      onProgress: (p) => {
        if (p.percent) {
          onProgress(Math.round(p.percent));
        }
      },
    });

    return {
      type: "audio",
      downloadUrl: `/download/audio/${fileName}`,
    };
  }

  // VIDEO DOWNLOAD
  const fileName = `video_${id}.mp4`;
  const output = path.join(VIDEO_DIR, fileName);

  await ytdlp(url, {
    format: format,
    mergeOutputFormat: "mp4",
    output,
    progress: true,
    newline: true,
    onProgress: (p) => {
      if (p.percent) {
        onProgress(Math.round(p.percent));
      }
    },
  });

  return {
    type: "video",
    downloadUrl: `/download/video/${fileName}`,
  };
}
