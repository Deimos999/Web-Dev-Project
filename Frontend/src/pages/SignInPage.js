import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api";
import "./SignInPage.css";

const SignInPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let response;

      if (isLogin) {
        response = await login({
          email: formData.email,
          password: formData.password
        });
      } else {
        response = await register(formData);
      }

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    }

    setLoading(false);
  };

  const handleDemoLogin = (email, password) => {
    setFormData({ ...formData, email, password });
  };

  return (
    <div className="signin-page">
      {/* Animated Background */}
      <div className="background-container">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="animated-bg"></div>
      </div>

      {/* Floating Elements */}
      <div className="floating-elements">
        <div className="float-item item-1">🎉</div>
        <div className="float-item item-2">🎟️</div>
        <div className="float-item item-3">📅</div>
        <div className="float-item item-4">👥</div>
        <div className="float-item item-5">🌟</div>
        <div className="float-item item-6">🎪</div>
      </div>

      {/* Main Container */}
      <div className="signin-wrapper">
        <div className="content-section">
          <div className="welcome-text">
            <h1 className="main-title">Welcome</h1>
            <p className="subtitle">
              {isLogin 
                ? "Sign in to discover amazing events and register for experiences you'll never forget" 
                : "Join our community and start your event journey today"}
            </p>
            <div className="feature-list">
              <div className="feature-item">✨ Browse Events</div>
              <div className="feature-item">🎫 Get Tickets</div>
              <div className="feature-item">🌍 Network</div>
            </div>
          </div>
        </div>

        <div className="auth-section">
          <div className="auth-card">
            <div className="auth-header">
              <h2 className="auth-title">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="auth-subtitle">
                {isLogin ? "Sign in to your account" : "Join our community"}
              </p>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    onChange={handleChange}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    className={focusedField === "name" ? "focused" : ""}
                    required
                  />
                  <div className="input-underline"></div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  onChange={handleChange}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className={focusedField === "email" ? "focused" : ""}
                  required
                />
                <div className="input-underline"></div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className={focusedField === "password" ? "focused" : ""}
                  minLength={6}
                  required
                />
                <div className="input-underline"></div>
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="phone">Phone (Optional)</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    onChange={handleChange}
                    onFocus={() => setFocusedField("phone")}
                    onBlur={() => setFocusedField(null)}
                    className={focusedField === "phone" ? "focused" : ""}
                  />
                  <div className="input-underline"></div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="submit-btn"
              >
                <span className="btn-text">
                  {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
                </span>
                <span className="btn-icon">→</span>
              </button>
            </form>

            {/* Demo Accounts */}
            {isLogin && (
              <div className="demo-section">
                <p className="demo-title">Demo Accounts</p>
                <div className="demo-buttons">
                  <button
                    className="demo-btn"
                    onClick={() => handleDemoLogin("user@example.com", "password123")}
                  >
                    👤 User
                  </button>
                  <button
                    className="demo-btn"
                    onClick={() => handleDemoLogin("organizer1@example.com", "password123")}
                  >
                    🎪 Organizer
                  </button>
                </div>
              </div>
            )}

            {/* Toggle Auth */}
            <div className="toggle-section">
              <p>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ email: "", password: "", name: "", phone: "" });
                  setError("");
                }}
                className="toggle-btn"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </div>

            {isLogin && (
              <div className="forgot-section">
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
