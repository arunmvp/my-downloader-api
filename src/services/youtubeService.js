import ytdlp from "yt-dlp-exec"

export async function getYoutubeInfo(url){

 const info = await ytdlp(url,{
  dumpSingleJson:true
 })

 return {
  title: info.title,
  thumbnail: info.thumbnail,
  duration: info.duration,
  formats: info.formats
 }
}