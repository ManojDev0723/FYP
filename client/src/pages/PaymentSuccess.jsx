import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Checkout.css";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [coupons, setCoupons] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) return;
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        const [couponsRes, invoiceRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/orders/${orderId}/coupons`, { headers }),
          axios.get(`http://localhost:5000/api/orders/${orderId}/invoice`, { headers }).catch(e => ({ data: null }))
        ]);
        
        setCoupons(couponsRes.data);
        if (invoiceRes && invoiceRes.data) {
          setInvoice(invoiceRes.data);
        }

        // ✅ Clear the shopping cart after successful payment
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cartUpdate"));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);


  return (
    <div className="checkout-page">
      <Navbar />
      <div className="checkout-main-container" style={{ textAlign: "center", padding: "4rem 1rem", maxWidth: "800px", margin: "auto" }}>
        <h1 style={{ color: "#28a745", marginBottom: "1rem" }}>Payment Successful!</h1>
        <p style={{ fontSize: "1.1rem", marginBottom: "2rem" }}>
          Your payment has been completed and your order <strong>#{orderId}</strong> is confirmed.
        </p>

        {loading ? (
          <p>Loading your details...</p>
        ) : (
          <>
            {invoice && (
              <div className="invoice-container" style={{ textAlign: "left", background: "#fff", padding: "2.5rem", borderRadius: "12px", marginBottom: "2rem", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}>
                <style>
                  {`
                    @media print {
                      body * {
                        visibility: hidden;
                      }
                      .invoice-container, .invoice-container * {
                        visibility: visible;
                      }
                      .invoice-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        border: none !important;
                        box-shadow: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                      }
                      .print-hide {
                        display: none !important;
                      }
                    }
                  `}
                </style>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #f1f5f9", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "1.8rem", color: "#1e293b" }}>INVOICE</h2>
                    <p style={{ margin: "0.5rem 0 0", color: "#64748b", fontSize: "0.9rem" }}>Thank you for your purchase.</p>
                  </div>
                  <button onClick={() => window.print()} className="btn-primary print-hide" style={{ padding: "0.5rem 1.25rem", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem", borderRadius: "6px" }}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                    Print Invoice
                  </button>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2.5rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem" }}>Billed To:</h3>
                    <div style={{ color: "#0f172a", fontSize: "1.1rem", fontWeight: "600" }}>{invoice.customerName}</div>
                    <div style={{ color: "#475569" }}>{invoice.customerEmail}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ marginBottom: "0.25rem" }}><strong style={{ color: "#64748b" }}>Order Number:</strong> <span style={{ color: "#0f172a", fontWeight: "600" }}>#{invoice.purchaseid}</span></div>
                    <div style={{ marginBottom: "0.25rem" }}><strong style={{ color: "#64748b" }}>Date:</strong> <span style={{ color: "#0f172a", fontWeight: "600" }}>{new Date(invoice.paidat || invoice.createdat).toLocaleString()}</span></div>
                    <div><strong style={{ color: "#64748b" }}>Payment Method:</strong> <span style={{ color: "#0f172a", fontWeight: "600" }}>{String(invoice.paymentmethod || "").toUpperCase()}</span></div>
                  </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2rem", minWidth: "600px" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                        <th style={{ padding: "1rem", textAlign: "left", color: "#475569", fontWeight: "600" }}>Item Details</th>
                        <th style={{ padding: "1rem", textAlign: "center", color: "#475569", fontWeight: "600" }}>Qty</th>
                        <th style={{ padding: "1rem", textAlign: "right", color: "#475569", fontWeight: "600" }}>Unit Price</th>
                        <th style={{ padding: "1rem", textAlign: "right", color: "#475569", fontWeight: "600" }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "1.25rem 1rem", color: "#0f172a", fontWeight: "500" }}>{invoice.dealTitle}</td>
                        <td style={{ padding: "1.25rem 1rem", textAlign: "center", color: "#475569" }}>{invoice.quantity}</td>
                        <td style={{ padding: "1.25rem 1rem", textAlign: "right", color: "#475569" }}>Rs. {Number(invoice.discountprice).toLocaleString()}</td>
                        <td style={{ padding: "1.25rem 1rem", textAlign: "right", color: "#0f172a", fontWeight: "600" }}>Rs. {Number(invoice.totalamount).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ width: "300px", background: "#f8fafc", padding: "1.5rem", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "1.3rem", fontWeight: "bold", borderTop: "2px solid #e2e8f0", paddingTop: "0.5rem" }}>
                      <span style={{ color: "#1e293b" }}>Total Paid:</span>
                      <span style={{ color: "#10b981" }}>Rs. {Number(invoice.totalamount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {coupons.length > 0 ? (
              <div className="print-hide" style={{ textAlign: "left", background: "#f8f9fa", padding: "2rem", borderRadius: "8px", marginBottom: "2rem" }}>
                <h2 style={{ marginBottom: "1.5rem", borderBottom: "2px solid #e9ecef", paddingBottom: "0.5rem" }}>
                  Your Vouchers
                </h2>
                <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                  {coupons.map((c, i) => (
                    <div key={i} style={{ border: "2px dashed #007bff", padding: "1.5rem", borderRadius: "8px", background: "white", textAlign: "center" }}>
                      <h3 style={{ fontSize: "1rem", color: "#6c757d", marginBottom: "0.5rem" }}>{c.dealTitle}</h3>
                      <div style={{ fontSize: "2rem", letterSpacing: "2px", fontWeight: "bold", color: "#007bff", margin: "1rem 0" }}>
                        {c.couponcode}
                      </div>
                      <p style={{ fontSize: "0.9rem", color: "#495057" }}>
                        Status: <span style={{ fontWeight: "600", textTransform: "uppercase", color: c.status === 'unused' ? '#28a745' : '#dc3545' }}>{c.status}</span>
                      </p>
                      <p style={{ fontSize: "0.8rem", color: "#adb5bd", marginTop: "0.5rem" }}>
                        Expires: {new Date(c.expiresat).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "0.9rem", color: "#6c757d", marginTop: "1.5rem", textAlign: "center" }}>
                  Show this code to the merchant to redeem your service. You can also view these at any time in your dashboard.
                </p>
              </div>
            ) : (
              <p className="print-hide">No coupons found for this order.</p>
            )}
          </>
        )}

        <br className="print-hide" />
        <Link to="/home" className="btn-primary print-hide" style={{ display: "inline-block" }}>
          Continue Shopping
        </Link>
        <Link to="/dashboard" className="btn-outline print-hide" style={{ display: "inline-block", marginLeft: "1rem", padding: "0.75rem 1.5rem", border: "1px solid #007bff", borderRadius: "4px", color: "#007bff", textDecoration: "none" }}>
          Go to Dashboard
        </Link>
      </div>
      <div className="print-hide">
        <Footer />
      </div>
    </div>
  );
};

export default PaymentSuccess;
