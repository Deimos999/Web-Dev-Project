import React from "react";
import "./EventCard.css";

const EventCard = ({
  event,
  role,
  currentUser,
  onRegister,
  onDelete,
  registrations,
  onDeleteRegistration
}) => {
  const start = event.startTime ? new Date(event.startTime) : null;
  const end = event.endTime ? new Date(event.endTime) : null;
  const startDate = start ? start.toLocaleDateString() : "TBD";
  const timeRange = start && end
    ? `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : "Time TBA";

  const isRegistered = registrations.some((r) => r.userId === currentUser?.id);
  const bgStyle = event.imageUrl
    ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.65) 55%, rgba(0,0,0,0.7) 100%), url(${event.imageUrl})` }
    : undefined;

  return (
    <div className="event-card">
      {event.imageUrl && <div className="event-card-bg" style={{ backgroundImage: `url(${event.imageUrl})` }}></div>}
      <div className="event-card-overlay"></div>
      <div className="event-card-content">
        <div className="event-meta">
        <div className="chip">{event.category?.name || "Event"}</div>
        {event.isFeatured && <div className="chip featured">Featured</div>}
      </div>
      <h3>{event.title}</h3>
      <p className="event-desc">{event.description}</p>
      <div className="event-details">
        <span>📅 {startDate}</span>
        <span>⏰ {timeRange}</span>
        <span>📍 {event.timezone || "UTC"}</span>
      </div>

      {/* User view: Register button */}
      {role === "user" && (
        <div className="action-row">
          {isRegistered ? (
            <>
              <p className="registered-pill">You are registered ✅</p>
              {registrations
                .filter(r => r.userId === currentUser?.id)
                .map(r => (
                  <button
                    key={r.id}
                    onClick={() => onDeleteRegistration(r.id)}
                    className="delete-reg-btn"
                  >
                    Unregister
                  </button>
                ))}
            </>
          ) : (
            <button onClick={() => onRegister(event.tickets?.[0]?.id)} className="register-btn">
              Register
            </button>
          )}
        </div>
      )}

      {/* Organizer view: Delete event */}
      {role === "organizer" && (
        <div className="action-row">
          <button onClick={onDelete} className="delete-event-btn">
            Delete Event
          </button>
        </div>
      )}

      {/* Admin view: Show attendees */}
      {role === "admin" && registrations.length > 0 && (
        <div className="attendee-list">
          <h4>Attendees ({registrations.length}):</h4>
          <ul>
            {registrations.map(r => (
              <li key={r.id}>{r.user?.name || "Unknown"} - {r.user?.email || "N/A"}</li>
            ))}
          </ul>
        </div>
      )}
      </div>
    </div>
  );
};

export default EventCard;
