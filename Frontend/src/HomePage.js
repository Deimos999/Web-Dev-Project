import "./App.css";
import React, { useState, useEffect } from "react";
import EventCard from "./components/EventCard";
import TicketModal from "./components/TicketModal";
import Confetti from "react-confetti";
import { useNavigate } from "react-router-dom";
import {
  getEvents,
  createEvent,
  registerUser,
  getMyRegistrations,
  getRegistrationsByEventPublic,
  deleteEvent,
  deleteRegistration
} from "./api";

function HomePage() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [role, setRole] = useState("user");
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const isGuest = !currentUser;

  // AUTH GUARD
  useEffect(() => {
    if (!currentUser) {
      setRole("guest");
    } else {
      setRole(currentUser.role);
      // Load registrations for logged-in user
      getMyRegistrations().then(res => setRegistrations(res.data)).catch(() => {});
    }
  }, []);

  // Load events for everyone
  useEffect(() => {
    getEvents()
      .then(res => setEvents(res.data))
      .catch(err => console.log(err));
  }, []);

  // REGISTER FOR EVENT
  const handleRegister = (event) => {
    if (isGuest) {
      alert("Guests cannot register. Please sign in.");
      return;
    }

    registerUser({ eventId: event.id })
      .then(res => {
        setRegistrations([...registrations, res.data]);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      })
      .catch(err => console.log(err));
  };

  // CREATE EVENT (organizer)
  const handleCreateEvent = () => {
    const title = document.getElementById("title").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    if (!title || !date || !time) return alert("Fill all fields");

    createEvent({ title, date, time })
      .then(res => setEvents([...events, res.data]))
      .catch(err => console.log(err));
  };

  // DELETE EVENT
  const handleDeleteEvent = (id) => {
    deleteEvent(id)
      .then(() => setEvents(events.filter(e => e.id !== id)))
      .catch(err => console.log(err));
  };

  // DELETE REGISTRATION
  const handleDeleteRegistration = (id) => {
    deleteRegistration(id)
      .then(() => setRegistrations(registrations.filter(r => r.id !== id)))
      .catch(err => console.log(err));
  };

  return (
    <div className="HomePage">
      {showConfetti && <Confetti />}
      <h1>🎉 Online Event Registration</h1>

      <div className="role-switch">
        <button onClick={() => setRole("user")}>User</button>
        <button onClick={() => setRole("organizer")}>Organizer</button>
        <button onClick={() => setRole("admin")}>Admin</button>
        <button onClick={() => setRole("guest")}>Guest</button>
      </div>

      {role === "organizer" && (
        <div className="create-event-form">
          <h3>Create Event</h3>
          <input type="text" id="title" placeholder="Title" />
          <input type="date" id="date" />
          <input type="time" id="time" />
          <button onClick={handleCreateEvent}>Create Event</button>
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
            registrations={isGuest ? [] : registrations.filter(r => r.eventId === event.id)}
            onDeleteRegistration={handleDeleteRegistration}
          />
        ))}
      </div>
    </div>
  );
}

export default HomePage;
