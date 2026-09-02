import axiosInstance from "./api"

const wishlistService = {
  getWishlist: () => {
    return axiosInstance.get("/wishlist/get-wishlist")
  },
  addWishlist: (data) => {
    return axiosInstance.post("/wishlist/add-wishlist", data)
  },
  deleteWishlist: (id) => {
    return axiosInstance.delete(`/wishlist/remove-from-wishlist/${id}`)
  },
  updateWishlistStatus: (id, status) => {
    return axiosInstance.put(`/wishlist/update-status/${id}`, { status })
  }
}

export default wishlistService
