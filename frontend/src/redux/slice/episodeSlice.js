import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import episodeService from "../../services/episodeService"

// Admin: Upload episode meta (with video, thumbnail, subtitles, audios)
export const uploadEpisodeMeta = createAsyncThunk(
  "episodes/uploadEpisodeMeta",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await episodeService.uploadEpisodeMeta(formData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to upload episode")
    }
  },
)

// Admin: Create anime
export const createAnime = createAsyncThunk(
  "episodes/createAnime",
  async (data, { rejectWithValue }) => {
    try {
      const response = await episodeService.createAnime(data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to create anime")
    }
  },
)

// Admin: Update anime
export const updateAnime = createAsyncThunk(
  "episodes/updateAnime",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await episodeService.updateAnime(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update anime")
    }
  },
)

// Admin: Delete anime
export const deleteAnime = createAsyncThunk(
  "episodes/deleteAnime",
  async (id, { rejectWithValue }) => {
    try {
      const response = await episodeService.deleteAnime(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete anime")
    }
  },
)

const episodeSlice = createSlice({
  name: "episodes",
  initialState: {
    isLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearEpisodeState: (state) => {
      state.error = null
      state.successMessage = null
    },
  },
  extraReducers: (builder) => {
    // Upload Episode
    builder.addCase(uploadEpisodeMeta.pending, (state) => {
      state.isLoading = true
      state.error = null
      state.successMessage = null
    })
    builder.addCase(uploadEpisodeMeta.fulfilled, (state) => {
      state.isLoading = false
      state.successMessage = "Episode uploaded successfully!"
    })
    builder.addCase(uploadEpisodeMeta.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload
    })

    // Other admin actions can share similar loading/error states...
    builder.addMatcher(
      (action) =>
        action.type.startsWith("episodes/") && action.type.endsWith("/pending"),
      (state) => {
        state.isLoading = true
        state.error = null
        state.successMessage = null
      },
    )
    builder.addMatcher(
      (action) =>
        action.type.startsWith("episodes/") &&
        action.type.endsWith("/fulfilled"),
      (state) => {
        state.isLoading = false
        state.successMessage = "Action completed successfully!"
      },
    )
    builder.addMatcher(
      (action) =>
        action.type.startsWith("episodes/") &&
        action.type.endsWith("/rejected"),
      (state, action) => {
        state.isLoading = false
        state.error = action.payload
      },
    )
  },
})

export const { clearEpisodeState } = episodeSlice.actions
export default episodeSlice.reducer
