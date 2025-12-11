import "./HomePage.css";
import React, { useState, useEffect } from "react";
import EventCard from "./components/EventCard";
import Confetti from "react-confetti";
import { useNavigate } from "react-router-dom";

import {
  getEvents,
  getTicketsByEvent,
  registerUser,
  createEvent,
  deleteEvent,
  getRegistrations,
  deleteRegistration
} from "./api";

function HomePage() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [role, setRole] = useState("user");
  const [showConfetti, setShowConfetti] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  // Scroll animation effect
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("scroll-animate");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    return () => observer.disconnect();
  }, []);

  // Auth guard - Allow viewing without login, but show login prompts when needed
  useEffect(() => {
    if (currentUser) {
      setRole(currentUser.role);
    }
  }, []);

  // Load events + tickets + registrations
  useEffect(() => {
    async function fetchData() {
      try {
        const eventsRes = await getEvents();
        const eventsData = eventsRes.data;

        // fetch tickets for all events
        const ticketsPromises = eventsData.map(e => getTicketsByEvent(e.id));
        const ticketsResults = await Promise.all(ticketsPromises);
        const eventsWithTickets = eventsData.map((event, i) => ({
          ...event,
          tickets: ticketsResults[i].data,
        }));

        setEvents(eventsWithTickets);

        // Only fetch registrations if user is logged in
        if (currentUser) {
          const regRes = await getRegistrations();
          setRegistrations(regRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingEvents(false);
      }
    }
    fetchData();
  }, [currentUser]);

  const handleRegister = async (event, ticketId) => {
    // Check if user is logged in
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      const res = await registerUser({ eventId: event.id, ticketId });
      setRegistrations([...registrations, res.data]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await deleteEvent(id);
      setEvents(events.filter(e => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRegistration = async (id) => {
    try {
      await deleteRegistration(id);
      setRegistrations(registrations.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEvent = async () => {
    const title = document.getElementById("title").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    if (!title || !date || !time) return alert("Fill all fields");

    try {
      const res = await createEvent({ title, date, time });
      setEvents([...events, res.data]);
    } catch (err) {
      console.error(err);
      alert("Failed to create event");
    }
  };

  if (loadingEvents) return <p style={{textAlign:"center", marginTop:"50px"}}>Loading events...</p>;

  return (
    <div className="HomePage">
      {showConfetti && <Confetti />}
      
      {/* Top Navigation Bar */}
      <div className="home-navbar">
        <div className="navbar-left">
          <h2 className="navbar-title">🎉 Event Platform</h2>
        </div>
        <div className="navbar-right">
          {currentUser ? (
            <>
              <button 
                className="btn-nav-profile" 
                onClick={() => navigate("/profile")}
                title="View your profile"
              >
                👤 My Profile
              </button>
              <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? "☀️" : "🌙"}
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn-nav-login" 
                onClick={() => navigate("/login")}
                title="Sign in to register for events"
              >
                🔓 Sign In / Sign Up
              </button>
              <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? "☀️" : "🌙"}
              </button>
            </>
          )}
        </div>
      </div>

      <h1 className="homepage-title">Discover Amazing Events</h1>
      <p className="homepage-subtitle">Find and register for events that interest you</p>

      {currentUser && (
        <>
          <div className="role-switch">
            <button 
              className={role === "user" ? "active" : ""} 
              onClick={() => setRole("user")}
            >
              User
            </button>
            <button 
              className={role === "organizer" ? "active" : ""} 
              onClick={() => setRole("organizer")}
            >
              Organizer
            </button>
            <button 
              className={role === "admin" ? "active" : ""} 
              onClick={() => setRole("admin")}
            >
              Admin
            </button>
          </div>

          {role === "organizer" && (
            <div className="create-event-form shadow-card">
              <h3>Create Event</h3>
              <input type="text" id="title" placeholder="Title" />
              <input type="date" id="date" />
              <input type="time" id="time" />
              <button onClick={handleCreateEvent} className="btn-primary">Create Event</button>
            </div>
          )}
        </>
      )}

      <h2>Events</h2>
      <div className="event-list">
        {events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            role={role}
            currentUser={currentUser}
            onRegister={(ticketId) => handleRegister(event, ticketId)}
            onDelete={() => handleDeleteEvent(event.id)}
            registrations={registrations.filter(r => r.eventId === event.id)}
            onDeleteRegistration={handleDeleteRegistration}
          />
        ))}
      </div>
    </div>
  );
}

export default HomePage;
