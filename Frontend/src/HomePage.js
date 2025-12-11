import "./HomePage.css";
import React, { useState, useEffect } from "react";
import EventCard from "./components/EventCard";
import TicketModal from "./components/TicketModal";
import Confetti from "react-confetti";
import { useNavigate } from "react-router-dom";

import {
  getEvents,
  createEvent,
  registerUser,
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
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  // Auth guard
  useEffect(() => {
    if (!currentUser) {
      navigate("/signin");
    } else {
      setRole(currentUser.role);
    }
  }, []);

  // Load events + registrations
  useEffect(() => {
    async function fetchData() {
      try {
        const eventsRes = await getEvents();
        setEvents(eventsRes.data);
        const regRes = await getRegistrations();
        setRegistrations(regRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingEvents(false);
      }
    }
    fetchData();
  }, []);

  const handleRegister = async (event) => {
    try {
      const res = await registerUser({ eventId: event.id });
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
      <h1 className="homepage-title">🎉 Online Event Registration</h1>

      <div className="role-switch">
        <button onClick={() => setRole("user")}>User</button>
        <button onClick={() => setRole("organizer")}>Organizer</button>
        <button onClick={() => setRole("admin")}>Admin</button>
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

      <h2>Events</h2>

      <div className="event-list">
        {events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            role={role}
            onRegister={() => handleRegister(event)}
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
