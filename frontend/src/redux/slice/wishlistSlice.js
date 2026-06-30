import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import wishlistService from "../../services/wishlistService"

export const getWishlist = createAsyncThunk("wishlist/getWishlist", async (_, { rejectWithValue }) => {
    try {
        const response = await wishlistService.getWishlist()
        return response.data
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to fetch wishlist")
    }
})
export const addToWishlist = createAsyncThunk("wishlist/addToWishlist", async (data, { rejectWithValue }) => {
    try {
        const response = await wishlistService.addWishlist(data)
        return response.data
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to add to wishlist")
    }
})
export const deleteWishlist = createAsyncThunk("wishlist/deleteWishlist", async (id, { rejectWithValue }) => {
    try {
        const response = await wishlistService.deleteWishlist(id)
        return response.data
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to delete from wishlist")
    }
})

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState: {
        wishlist: [],
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        // Get Wishlist Cases
        builder.addCase(getWishlist.pending, (state) => {
            state.isLoading = true
            state.error = null
        })
        builder.addCase(getWishlist.fulfilled, (state, action) => {
            state.isLoading = false
            const list = action.payload?.data || action.payload || [];
            const unique = [];
            const seen = new Set();
            for (const item of list) {
                 const animeId = item.anime?._id || item.anime;
                 if (animeId && !seen.has(animeId)) {
                     seen.add(animeId);
                     unique.push(item);
                 }
            }
            state.wishlist = unique;
        })
        builder.addCase(getWishlist.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload
        })

        // Add to Wishlist Cases
        builder.addCase(addToWishlist.fulfilled, (state, action) => {
            if(action.payload?.data) {
                 const newItem = action.payload.data;
                 const animeId = newItem.anime?._id || newItem.anime;
                 const exists = state.wishlist.some(item => (item.anime?._id || item.anime) === animeId);
                 if (!exists) {
                     state.wishlist.push(newItem);
                 }
            }
        })

        // Delete Wishlist Cases
        builder.addCase(deleteWishlist.fulfilled, (state, action) => {
             // Assuming backend returns the deleted id or we use the arg
            const deletedId = action.payload?.data?._id || action.meta?.arg;
            state.wishlist = state.wishlist.filter(item => item._id !== deletedId)
        })
    }
})

export default wishlistSlice.reducer