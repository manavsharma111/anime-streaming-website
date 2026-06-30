import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import authService from "../../services/authService"

// Check user auth status on page refresh (uses the /me endpoint)
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser()
      return response.data // Contains the user object
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to authenticate")
    }
  },
)

// Logout thunk
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.logout()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to logout")
    }
  },
)

// Notifications thunks
export const fetchNotifications = createAsyncThunk(
  "auth/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getNotifications()
      return response.data // array of notifications
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch notifications",
      )
    }
  },
)

export const markNotificationReadAsync = createAsyncThunk(
  "auth/markNotificationRead",
  async (id, { rejectWithValue }) => {
    try {
      await authService.markNotificationRead(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to mark read")
    }
  },
)

export const deleteNotificationAsync = createAsyncThunk(
  "auth/deleteNotification",
  async (id, { rejectWithValue }) => {
    try {
      await authService.deleteNotification(id)
      return id
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete notification",
      )
    }
  },
)

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    isLoading: true, // Start as true so UI can wait for checkAuth on mount
    error: null,
    notifications: [],
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    addSocketNotification: (state, action) => {
      state.notifications.unshift(action.payload)
    },
  },
  extraReducers: (builder) => {
    // Check Auth Cases
    builder.addCase(checkAuth.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.isAuthenticated = true
      state.user = action.payload
      state.isLoading = false
    })
    builder.addCase(checkAuth.rejected, (state, action) => {
      state.isAuthenticated = false
      state.user = null
      state.isLoading = false
      // Don't set error on rejected checkAuth to avoid flashing errors on unauthenticated visits
    })

    // Logout Cases
    builder.addCase(logout.fulfilled, (state) => {
      state.isAuthenticated = false
      state.user = null
      state.error = null
      state.notifications = []
    })
    builder.addCase(logout.rejected, (state, action) => {
      state.error = action.payload
    })

    // Notifications Cases
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.notifications = action.payload
    })
    builder.addCase(markNotificationReadAsync.fulfilled, (state, action) => {
      const notification = state.notifications.find(
        (n) => n._id === action.payload,
      )
      if (notification) {
        notification.read = true
      }
    })
    builder.addCase(deleteNotificationAsync.fulfilled, (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n._id !== action.payload,
      )
    })
  },
})

export const { clearError, addSocketNotification } = authSlice.actions
export default authSlice.reducer
