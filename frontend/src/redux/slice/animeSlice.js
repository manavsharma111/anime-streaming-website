import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import animeService from "../../services/animeService"

// Thunk for fetching anime with pagination and filters
export const fetchAnimes = createAsyncThunk('anime/fetchAnimes', async (query = {}, { rejectWithValue }) => {
    try {
        const response = await animeService.getAnimes(query)
        return response.data
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to fetch animes")
    }
})

// Thunk for fetching single anime details
export const fetchAnimeDetails = createAsyncThunk('anime/fetchAnimeDetails', async (id, { rejectWithValue }) => {
    try {
        const response = await animeService.getAnimeDetails(id)
        return response.data
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to fetch anime details")
    }
})

const animeSlice = createSlice({
    name: "anime",
    initialState: {
        animeList: [],
        animeDetails: null,
        pagination: null,
        isLoading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        clearAnimeDetails: (state) => {
            state.animeDetails = null
        }
    },
    extraReducers: (builder) => {
        // Fetch Animes
        builder.addCase(fetchAnimes.pending, (state) => {
            state.isLoading = true
            state.error = null
        })
        builder.addCase(fetchAnimes.fulfilled, (state, action) => {
            state.isLoading = false
            // Check the backend response structure. E.g. action.payload.data and action.payload.pagination
            state.animeList = action.payload?.data || action.payload || []
            state.pagination = action.payload?.pagination || null
        })
        builder.addCase(fetchAnimes.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload
        })

        // Fetch Anime Details
        builder.addCase(fetchAnimeDetails.pending, (state) => {
            state.isLoading = true
            state.error = null
        })
        builder.addCase(fetchAnimeDetails.fulfilled, (state, action) => {
            state.isLoading = false
            state.animeDetails = action.payload?.data || action.payload
        })
        builder.addCase(fetchAnimeDetails.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload
        })
    }
})

export const { clearError, clearAnimeDetails } = animeSlice.actions
export default animeSlice.reducer