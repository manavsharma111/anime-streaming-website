import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/reviews` : 'http://localhost:8080/api/reviews';

export const getAnimeReviewsAsync = createAsyncThunk(
    'review/getAnimeReviews',
    async (animeId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/${animeId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
        }
    }
);

export const addReviewAsync = createAsyncThunk(
    'review/addReview',
    async ({ animeId, reviewData }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/${animeId}`, reviewData, {
                withCredentials: true,
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add review');
        }
    }
);

export const deleteReviewAsync = createAsyncThunk(
    'review/deleteReview',
    async (reviewId, { rejectWithValue }) => {
        try {
            await axios.delete(`${API_URL}/${reviewId}`, {
                withCredentials: true,
            });
            return reviewId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
        }
    }
);

export const addReplyAsync = createAsyncThunk(
    'review/addReply',
    async ({ reviewId, comment }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/${reviewId}/reply`, { comment }, {
                withCredentials: true,
            });
            return response.data.data; // This is the updated review object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add reply');
        }
    }
);

export const deleteReplyAsync = createAsyncThunk(
    'review/deleteReply',
    async ({ reviewId, replyId }, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`${API_URL}/${reviewId}/reply/${replyId}`, {
                withCredentials: true,
            });
            return response.data.data; // This is the updated review object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete reply');
        }
    }
);

const initialState = {
    reviews: [],
    loading: false,
    error: null,
};

const reviewSlice = createSlice({
    name: 'review',
    initialState,
    reducers: {
        socketAddReview: (state, action) => {
            // Only add if it doesn't already exist to prevent duplicates from the thunk
            const exists = state.reviews.find(r => r._id === action.payload._id);
            if (!exists) {
                state.reviews.unshift(action.payload);
            }
        },
        socketUpdateReview: (state, action) => {
            const index = state.reviews.findIndex(r => r._id === action.payload._id);
            if (index !== -1) {
                state.reviews[index] = action.payload;
            }
        },
        socketDeleteReview: (state, action) => {
            state.reviews = state.reviews.filter(r => r._id !== action.payload);
        },
        clearReviews: (state) => {
            state.reviews = [];
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get Anime Reviews
            .addCase(getAnimeReviewsAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAnimeReviewsAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = action.payload;
            })
            .addCase(getAnimeReviewsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add Review
            .addCase(addReviewAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addReviewAsync.fulfilled, (state, action) => {
                state.loading = false;
                // Handled by socket, but we can also add it here
                const exists = state.reviews.find(r => r._id === action.payload._id);
                if (!exists) {
                    state.reviews.unshift(action.payload);
                }
            })
            .addCase(addReviewAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete Review
            .addCase(deleteReviewAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteReviewAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = state.reviews.filter(r => r._id !== action.payload);
            })
            .addCase(deleteReviewAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add Reply
            .addCase(addReplyAsync.fulfilled, (state, action) => {
                const index = state.reviews.findIndex(r => r._id === action.payload._id);
                if (index !== -1) {
                    state.reviews[index] = action.payload;
                }
            })
            // Delete Reply
            .addCase(deleteReplyAsync.fulfilled, (state, action) => {
                const index = state.reviews.findIndex(r => r._id === action.payload._id);
                if (index !== -1) {
                    state.reviews[index] = action.payload;
                }
            });
    }
});

export const { socketAddReview, socketUpdateReview, socketDeleteReview, clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
