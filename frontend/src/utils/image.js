export const getImageUrl = (url) => {
  if (!url)
    return "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80"
  if (url.startsWith("http")) return url
  const backendUrl = import.meta.env.VITE_BACKEND_URL
    ? import.meta.env.VITE_BACKEND_URL.replace("/api", "")
    : "http://localhost:8080"
  return `${backendUrl}${url}`
}
