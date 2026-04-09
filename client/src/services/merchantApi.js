import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Get token from localStorage
const getToken = () => localStorage.getItem("token");

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to include token in requests
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Merchant API calls
export const merchantApi = {
  // Get merchant profile
  getProfile: () => api.get("/merchants/profile"),

  // Get merchant's orders/coupons
  getOrders: () => api.get("/merchants/orders"),

  // Get merchant's deals
  getDeals: () => api.get("/deals/merchant"),

  // Get merchant's reviews
  getReviews: () => api.get("/merchants/reviews"),

  // Update order redemption status
  updateOrderStatus: (orderId, data) =>
    api.patch(`/merchants/orders/${orderId}/redeem`, data),

  // Reply to a review
  replyToReview: (reviewId, reply) =>
    api.patch(`/merchants/reviews/${reviewId}/reply`, { reply }),
};

export default api;
