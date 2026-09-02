export const getImageUrl = (url) => {
  if (!url)
    return "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80"
  if (url.startsWith("http")) return url
  const backendUrl = import.meta.env.VITE_BACKEND_URL
    ? import.meta.env.VITE_BACKEND_URL.replace("/api", "")
    : "http://localhost:8080"
  // If it's a raw Google Drive ID (typically 28-33 chars, no slashes, no dots)
  if (!url.includes("/") && !url.includes(".") && url.length > 15) {
    return `https://drive.google.com/uc?id=${url}`
  }

  const separator = backendUrl.endsWith("/") || url.startsWith("/") ? "" : "/"
  return `${backendUrl}${separator}${url}`
}
