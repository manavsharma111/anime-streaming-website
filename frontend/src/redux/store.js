import { configureStore } from "@reduxjs/toolkit"
import animeReducer from "./slice/animeSlice"
import authReducer from "./slice/authSlice"
import episodeReducer from "./slice/episodeSlice"
import historyReducer from "./slice/historySlice"
import wishlistReducer from "./slice/wishlistSlice"
import reviewReducer from "./slice/reviewSlice"

export const store = configureStore({
    reducer: {
        anime: animeReducer,
        auth: authReducer,
        episode: episodeReducer,
        history: historyReducer,
        wishlist: wishlistReducer,
        review: reviewReducer,
    },
})