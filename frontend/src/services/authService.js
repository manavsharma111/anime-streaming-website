import axiosInstance from "./api"

const authService = {
    loginWithGoogle: () => {
        // Redirect browser to backend Google OAuth route
        window.location.href = import.meta.env.VITE_BACKEND_URL + "/auth/google"
    },
    getCurrentUser: async () => {
        try {
            const response = await axiosInstance.get("/auth/me")
            return response.data
        } catch (error) {
            // Suppress console.error for expected 401 (Not logged in)
            if (error.response && error.response.status !== 401) {
                console.error("Get Current User Error:", error);
            }
            throw error;
        }
    },
    logout: async () => {
        try {
            const response = await axiosInstance.post("/auth/logout")
            return response.data
        } catch (error) {
            console.error("Logout Error:", error);
            return error
        }
    },
    getNotifications: async () => {
        try {
            const response = await axiosInstance.get("/auth/notifications")
            return response.data
        } catch (error) {
            console.error("Get Notifications Error:", error);
            throw error;
        }
    },
    markNotificationRead: async (id) => {
        try {
            const response = await axiosInstance.put(`/auth/notifications/${id}/read`)
            return response.data
        } catch (error) {
            console.error("Mark Notification Read Error:", error);
            throw error;
        }
    },
    deleteNotification: async (id) => {
        try {
            const response = await axiosInstance.delete(`/auth/notifications/${id}`)
            return response.data
        } catch (error) {
            console.error("Delete Notification Error:", error);
            throw error;
        }
    }
}

export default authService

