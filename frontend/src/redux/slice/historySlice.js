import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import historyService from "../../services/historyService"

export const getWatchHistory = createAsyncThunk(
  "history/getWatchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await historyService.getHistory()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch history")
    }
  },
)
export const addToHistory = createAsyncThunk(
  "history/addToHistory",
  async (data, { rejectWithValue }) => {
    try {
      const response = await historyService.addHistory(data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to add history")
    }
  },
)
export const deleteHistory = createAsyncThunk(
  "history/deleteHistory",
  async (id, { rejectWithValue }) => {
    try {
      const response = await historyService.deleteHistory(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete history")
    }
  },
)
export const deleteAllHistory = createAsyncThunk(
  "history/deleteAllHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await historyService.deleteAllHistory()
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete all history",
      )
    }
  },
)

const historySlice = createSlice({
  name: "history",
  initialState: {
    history: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Get Watch History Cases
    builder.addCase(getWatchHistory.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(getWatchHistory.fulfilled, (state, action) => {
      state.isLoading = false
      state.history = action.payload?.data || action.payload || []
    })
    builder.addCase(getWatchHistory.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload
    })

    // Add to History Cases
    builder.addCase(addToHistory.fulfilled, (state, action) => {
      if (action.payload?.data) {
        state.history.push(action.payload.data)
      }
    })

    // Delete History Cases
    builder.addCase(deleteHistory.fulfilled, (state, action) => {
      const deletedId = action.payload?.data?._id || action.meta?.arg
      state.history = state.history.filter((item) => item._id !== deletedId)
    })

    // Delete All History Cases
    builder.addCase(deleteAllHistory.fulfilled, (state) => {
      state.history = []
    })
  },
})

export default historySlice.reducer
