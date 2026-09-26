import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import subscriptionService from "../../services/subscriptionService"

export const fetchPlans = createAsyncThunk(
  "subscription/fetchPlans",
  async (_, thunkAPI) => {
    try {
      const response = await subscriptionService.getAllPlans()
      return response.data // the array of plans
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch plans",
      )
    }
  },
)

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: {
    plans: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false
        state.plans = action.payload
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default subscriptionSlice.reducer
