import ytdlp from "yt-dlp-exec";

export async function extractDirectUrl(url, format) {

  try {

    if (format === "mp3") {
      return null;
    }

    const info = await ytdlp(url, {
      dumpSingleJson: true,
      noWarnings: true
    });

    if (!info.formats) return null;

    const selected = info.formats.find(
      f => String(f.format_id) === String(format)
    );

    if (!selected) return null;

    const hasVideo = selected.vcodec && selected.vcodec !== "none";
    const hasAudio = selected.acodec && selected.acodec !== "none";

    // 🔇 video only format → force worker
    if (hasVideo && !hasAudio) {
      return null;
    }

    if (!selected.url) return null;

    return {
      url: selected.url,
      title: info.title,
      thumbnail: info.thumbnail
    };

  } catch (err) {

    console.log("Direct URL extraction failed", err);

    return null;

  }

}