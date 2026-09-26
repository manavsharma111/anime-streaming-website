import api from "./api"

const subscriptionService = {
  // Get all plans for pricing page
  getAllPlans: async () => {
    const response = await api.get("/subscriptions/plans")
    return response.data
  },

  // Admin: create default plans
  createPlans: async () => {
    const response = await api.post("/subscriptions/create-plans")
    return response.data
  },

  // Admin: get all active subscriptions
  getAllActiveSubscriptions: async () => {
    const response = await api.get("/subscriptions/all-subscriptions")
    return response.data
  },

  // Cancel subscription
  cancelPlan: async (userId) => {
    const response = await api.post("/subscriptions/cancel", { userId })
    return response.data
  },
}

export default subscriptionService
