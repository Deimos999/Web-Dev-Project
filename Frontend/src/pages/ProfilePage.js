
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import RegistrationTicket from "../components/RegistrationTicket";
import { getRegistrations, getTicketsByEvent, getEvents } from "../api";
import html2canvas from "html2canvas";

function ProfilePage() {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  // Auth guard
  useEffect(() => {
    if (!currentUser) {
      navigate("/signin");
    }
  }, [navigate, currentUser]);

  // Load registrations and events
  useEffect(() => {
    async function fetchData() {
      try {
        const regsRes = await getRegistrations();
        const eventsRes = await getEvents();

        setRegistrations(regsRes.data);
        setEvents(eventsRes.data);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleDownloadTicket = async (registration, event) => {
    setDownloadingId(registration.id);
    try {
      const element = document.getElementById(`ticket-${registration.id}`);
      if (!element) {
        alert("Ticket element not found");
        return;
      }

      // Convert HTML to canvas with high quality
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      // Convert canvas to PNG blob
      canvas.toBlob((blob) => {
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `ticket-${event.title.replace(/\s+/g, "-")}-${registration.id}.png`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        window.URL.revokeObjectURL(url);
        
        alert("Ticket image downloaded successfully!");
        setDownloadingId(null);
      }, "image/png");
    } catch (err) {
      console.error("Failed to download ticket:", err);
      alert("Failed to download ticket. Please try again.");
      setDownloadingId(null);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (!currentUser) {
    return null;
  }

  const registeredEventIds = registrations.map((r) => r.eventId);
  const registeredEvents = events.filter((e) => registeredEventIds.includes(e.id));

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {currentUser.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="profile-info">
            <h1>{currentUser.name}</h1>
            <p className="profile-email">{currentUser.email}</p>
            <p className="profile-role">
              Role: <span className="role-badge">{currentUser.role}</span>
            </p>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Registration Statistics */}
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-number">{registrations.length}</div>
            <div className="stat-label">Registered Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{registeredEvents.length}</div>
            <div className="stat-label">Upcoming Events</div>
          </div>
        </div>

        {/* Registered Events with Tickets */}
        <div className="registrations-section">
          <h2>My Registrations & Tickets</h2>

          {registrations.length === 0 ? (
            <div className="empty-state">
              <p>You haven't registered for any events yet.</p>
              <button
                className="btn-primary"
                onClick={() => navigate("/home")}
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="registrations-grid">
              {registrations.map((registration) => {
                const event = events.find((e) => e.id === registration.eventId);

                if (!event) return null;

                return (
                  <div key={registration.id} className="registration-card">
                    <div className="registration-header">
                      <h3>{event.title}</h3>
                      <span className="registration-date">
                        Registered:{" "}
                        {new Date(registration.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Event Details */}
                    <div className="event-details">
                      <div className="detail-item">
                        <span className="detail-label">📅 Date:</span>
                        <span className="detail-value">
                          {new Date(event.startTime).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">⏰ Time:</span>
                        <span className="detail-value">
                          {new Date(event.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {new Date(event.endTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">📍 Status:</span>
                        <span className="detail-value event-status">
                          {event.status}
                        </span>
                      </div>
                    </div>

                    {/* Event Description/Criteria */}
                    <div className="event-criteria">
                      <h4>Event Criteria & Description</h4>
                      <p>{event.description}</p>
                    </div>

                    {/* Registration Ticket Preview */}
                    <div className="ticket-preview">
                      <RegistrationTicket
                        id={`ticket-${registration.id}`}
                        event={event}
                        registration={registration}
                        user={currentUser}
                      />
                    </div>

                    {/* Download Ticket Button */}
                    <button
                      className="btn-download"
                      onClick={() => handleDownloadTicket(registration, event)}
                      disabled={downloadingId === registration.id}
                    >
                      {downloadingId === registration.id 
                        ? "⏳ Downloading..." 
                        : "📥 Download Ticket"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="back-to-home">
          <button className="btn-primary" onClick={() => navigate("/home")}>
            ← Back to Events
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
