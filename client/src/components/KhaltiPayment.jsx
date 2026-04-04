import React, { useState } from "react";
import axios from "axios";

const KhaltiPayment = ({ orderId, orderName, customerInfo, disabled, onError }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!orderId) {
      onError?.("Missing order ID. Please create the order first.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "/api/khalti/initiate",
        {
          orderId,
          orderName,
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const paymentUrl = response.data.payment_url;
      if (!paymentUrl) {
        throw new Error("Khalti did not return a payment URL.");
      }

      window.location.assign(paymentUrl);
    } catch (error) {
      const message =
        error.response?.data?.message || error.response?.data || error.message || "Unable to start payment.";
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="btn-buy"
      disabled={disabled || loading}
      onClick={handlePayment}
    >
      {loading ? "Redirecting to Khalti..." : "Pay with Khalti"}
    </button>
  );
};

export default KhaltiPayment;
