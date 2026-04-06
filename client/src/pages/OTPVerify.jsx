import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import './OTPVerify.css';

function OTPVerify() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes = 600 seconds
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      toast.error("No email specified. Redirecting to login.");
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Move to previous input on backspace
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/auth/resend-otp", { email });
      toast.success("OTP resent successfully!");
      setTimeLeft(600); // Reset timer to 10 minutes
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email,
        otp: otpValue
      });

      // Auto-login after successful verification
      localStorage.setItem("token", res.data.token);
      
      const user = res.data.user;
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user.role);
      } else if (res.data.role) {
        localStorage.setItem("role", res.data.role);
      }

      toast.success("Email verified successfully! Welcome.");
      
      setTimeout(() => {
        if (user?.role === 'business' || res.data.role === 'business') {
          navigate("/merchant-dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 1500);

    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
      // Optional: clear OTP boxes on failure
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="otp-container">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="otp-card">
        <div className="otp-header">
          <h2>Verify Your Email</h2>
          <p>We've sent a 6-digit code to <strong>{email}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-inputs">
            {otp.map((data, index) => {
              return (
                <input
                  className="otp-field"
                  type="text"
                  name="otp"
                  maxLength="1"
                  key={index}
                  value={data}
                  onChange={e => handleChange(e.target, index)}
                  onFocus={e => e.target.select()}
                  onKeyDown={e => handleKeyDown(e, index)}
                  ref={el => inputRefs.current[index] = el}
                />
              );
            })}
          </div>

          <button type="submit" className="otp-btn" disabled={loading || otp.join('').length !== 6}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="otp-footer">
          <p>
            Time remaining: <span className="timer">{formatTime(timeLeft)}</span>
          </p>
          <button 
            className={`resend-btn ${timeLeft > 0 ? 'disabled' : ''}`} 
            onClick={handleResend}
            disabled={timeLeft > 0 || loading}
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
}

export default OTPVerify;
