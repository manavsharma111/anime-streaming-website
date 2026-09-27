import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchPlans } from "../redux/slice/subscriptionSlice"
import paymentService from "../services/paymentService"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { Check, Zap, Download, MonitorPlay } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const Pricing = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { plans, loading } = useSelector((state) => state.subscription)
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  const [billingCycle, setBillingCycle] = useState("monthly") // monthly or yearly

  useEffect(() => {
    dispatch(fetchPlans())
  }, [dispatch])

  // Load Razorpay Script dynamically
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleSubscribe = async (plan) => {
    if (!isAuthenticated) {
      toast.error("Please login to subscribe!")
      // Redirect to login or open login modal
      return
    }

    const res = await loadRazorpay()
    if (!res) {
      toast.error("Razorpay SDK failed to load. Check your connection.")
      return
    }

    try {
      toast.loading("Initiating secure payment...", { id: "payment" })

      // 1. Create Order on Backend
      const orderData = await paymentService.createOrder(plan._id, user._id)
      const { id: order_id, amount, currency } = orderData.data

      // 2. Open Razorpay Window
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Add this to your frontend .env
        amount: amount.toString(),
        currency: currency,
        name: "Anime Stream",
        description: `Upgrade to ${plan.name}`,
        order_id: order_id,
        handler: async function (response) {
          try {
            toast.loading("Verifying payment...", { id: "payment" })

            // 3. Verify Payment
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user._id,
              planId: plan._id,
            }

            const result = await paymentService.verifySignature(verifyData)

            if (result.success) {
              toast.success(`Welcome to ${plan.name}! 🚀`, { id: "payment" })
              // Redirect to home or profile
              setTimeout(() => {
                window.location.href = "/profile"
              }, 2000)
            }
          } catch (err) {
            toast.error("Payment verification failed!", { id: "payment" })
            console.error(err)
          }
        },
        prefill: {
          name: user.username,
          email: user.email,
        },
        theme: {
          color: "#f33767",
        },
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.on('payment.failed', function (response) {
        toast.error(`Payment failed: ${response.error.description}`, { id: "payment" })
      })
      paymentObject.open()
      toast.dismiss("payment")
    } catch (error) {
      toast.error("Failed to initiate payment. Please try again.", {
        id: "payment",
      })
      console.error(error)
    }
  }

  // Filter plans based on billing cycle toggle
  const filteredPlans = plans.filter((p) =>
    billingCycle === "monthly" ? p.duration === 30 : p.duration === 365,
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-[#f33767]/20 border-t-[#f33767] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#f33767]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight font-sans">
            Choose Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f33767] to-purple-600">
              Power Level
            </span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Unlock ad-free anime, ultra-high resolutions, and unlimited
            downloads to take your streaming experience to the next level.
          </p>

          {/* Billing Toggle (Premium Sliding Pill) */}
          <div className="flex items-center justify-center mt-10">
            <div className="bg-[#110e16] border border-white/5 p-1.5 rounded-2xl flex items-center relative shadow-xl">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`relative px-8 py-3 rounded-xl font-bold text-sm transition-colors z-10 w-36 tracking-widest ${
                  billingCycle === "monthly"
                    ? "text-white"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                {billingCycle === "monthly" && (
                  <motion.div
                    layoutId="billing-pill"
                    className="absolute inset-0 bg-gradient-to-r from-[#f33767] to-purple-600 rounded-xl"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-20">MONTH</span>
              </button>

              <button
                onClick={() => setBillingCycle("yearly")}
                className={`relative px-8 py-3 rounded-xl font-bold text-sm transition-colors z-10 w-48 flex items-center justify-center gap-2 tracking-widest ${
                  billingCycle === "yearly"
                    ? "text-white"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                {billingCycle === "yearly" && (
                  <motion.div
                    layoutId="billing-pill"
                    className="absolute inset-0 bg-gradient-to-r from-[#f33767] to-purple-600 rounded-xl"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-20">YEAR</span>
                <span
                  className={`relative z-20 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                    billingCycle === "yearly"
                      ? "bg-white/20"
                      : "bg-[#f33767]/20 text-[#f33767]"
                  }`}
                >
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
        >
          <AnimatePresence mode="popLayout">
            {filteredPlans.map((plan, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                key={plan._id}
                className={`relative bg-[#151515] rounded-3xl p-8 border transition-all duration-300
                  ${
                    idx === 1
                      ? "border-[#f33767] shadow-[0_0_40px_-10px_rgba(243,55,103,0.3)] md:scale-105 z-10"
                      : "border-gray-800"
                  }
                `}
              >
                {idx === 1 && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#f33767] to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-400 text-sm mb-6 h-10">
                  {plan.description}
                </p>

                <div className="mb-8">
                  <span className="text-5xl font-black tracking-tight">
                    ₹{plan.price}
                  </span>
                  <span className="text-gray-500 font-medium">
                    /{billingCycle === "monthly" ? "mo" : "yr"}
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-gray-300">
                    <Check className="w-5 h-5 text-[#f33767] mr-3 shrink-0" />
                    <span>Ad-free streaming</span>
                  </li>
                  <li className="flex items-center text-gray-300">
                    <MonitorPlay className="w-5 h-5 text-[#f33767] mr-3 shrink-0" />
                    <span>Watch in {plan.maxResolution}p Resolution</span>
                  </li>
                  <li className="flex items-center text-gray-300">
                    <Download
                      className={`w-5 h-5 mr-3 shrink-0 ${plan.isAllowedDownloads ? "text-[#f33767]" : "text-gray-600"}`}
                    />
                    <span
                      className={
                        plan.isAllowedDownloads
                          ? ""
                          : "text-gray-600 line-through"
                      }
                    >
                      Unlimited Downloads
                    </span>
                  </li>
                  <li className="flex items-center text-gray-300">
                    <Zap className="w-5 h-5 text-[#f33767] mr-3 shrink-0" />
                    <span>Watch on any device</span>
                  </li>
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  className={`w-full py-4 rounded-xl font-bold transition-all duration-300
                  ${
                    idx === 1
                      ? "bg-gradient-to-r from-[#f33767] to-purple-600 text-white shadow-lg hover:shadow-[#f33767]/25"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  }
                `}
                >
                  {user?.isPremium ? "Upgrade Plan" : "Subscribe Now"}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default Pricing
