export const optimizeImage = (url, width = 1280, quality = 80) => {
  if (!url) return "";
  
  // Don't proxy local images, SVGs, or already proxied URLs
  if (
    url.startsWith("/") || 
    url.endsWith(".svg") || 
    url.includes("wsrv.nl") ||
    url.includes("wallpapercave.com") ||
    url.includes("wallpaperaccess.com") ||
    url.includes("comicbook.com") ||
    url.includes("otakupt.com")
  ) {
    return url;
  }

  // Construct the wsrv.nl proxy URL
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&q=${quality}&output=webp`;
}
