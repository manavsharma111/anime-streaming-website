import api from "./api"

const paymentService = {
  // Create razorpay order
  createOrder: async (planId, userId) => {
    const response = await api.post("/payments/create-order", {
      planId,
      userId,
    })
    return response.data
  },

  // Verify signature and activate subscription
  verifySignature: async (paymentData) => {
    const response = await api.post("/payments/verify-signature", paymentData)
    return response.data
  },
}

export default paymentService
