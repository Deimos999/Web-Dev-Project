import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../api";
import "./ForgotReset.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      await forgotPassword({ email });
      setMessage("If that email exists, we sent a reset link.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-wrapper">
      <div className="reset-card">
        <h2>Forgot Password</h2>
        <p className="reset-subtitle">
          Enter your email and we'll send you a link to reset your password.
        </p>
        {message && <div className="reset-success">{message}</div>}
        {error && <div className="reset-error">{error}</div>}
        <form onSubmit={handleSubmit} className="reset-form">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <button className="reset-link" onClick={() => navigate("/login")}>
          ← Back to sign in
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

