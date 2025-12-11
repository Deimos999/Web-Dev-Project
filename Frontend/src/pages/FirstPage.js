import React from "react";
import { useNavigate } from "react-router-dom";
import "./FirstPage.css";

const FirstPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Animated Background */}
      <div className="landing-background">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>

      {/* Content */}
      <div className="landing-content">
        <div className="landing-header">
          <h1 className="landing-title">Welcome to Event Platform</h1>
          <p className="landing-subtitle">
            Discover amazing events and register for experiences you'll never forget
          </p>
        </div>

        {/* Auth Buttons */}
        <div className="auth-buttons-container">
          <button
            className="btn-auth btn-login"
            onClick={() => navigate("/login")}
          >
            <span className="btn-icon">🔓</span>
            <span className="btn-text">Sign In</span>
          </button>
          <button
            className="btn-auth btn-signup"
            onClick={() => navigate("/login")}
          >
            <span className="btn-icon">✨</span>
            <span className="btn-text">Sign Up</span>
          </button>
        </div>

        {/* Or continue text */}
        <div className="continue-section">
          <p className="continue-text">Or</p>
          <button
            className="btn-browse"
            onClick={() => navigate("/home")}
          >
            Browse Events as Guest →
          </button>
        </div>

        {/* Features List */}
        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-icon">🎫</div>
            <h3>Easy Registration</h3>
            <p>Sign up and register for events in seconds</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon">📅</div>
            <h3>Manage Events</h3>
            <p>Keep track of all your registrations</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon">🎟️</div>
            <h3>Digital Tickets</h3>
            <p>Download and print your event tickets</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstPage;
