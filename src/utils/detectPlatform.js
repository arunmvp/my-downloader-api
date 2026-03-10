export function detectPlatform(url){

 if(url.includes("youtube.com") || url.includes("youtu.be")){
  return "youtube"
 }

 if(url.includes("instagram.com")){
  return "instagram"
 }

 if(url.includes("tiktok.com")){
  return "tiktok"
 }

 if(url.includes("twitter.com") || url.includes("x.com")){
  return "twitter"
 }

 if(url.includes("facebook.com") || url.includes("fb.watch")){
  return "facebook"
 }

 return "unknown"

}