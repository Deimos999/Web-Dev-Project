import React from "react";
import "./RegistrationTicket.css";
import { QRCodeCanvas } from "qrcode.react";

function RegistrationTicket({ id, event, registration, user }) {
  // Generate a unique ticket code
  const ticketCode = `EVT-${registration.id.substring(0, 8).toUpperCase()}`;

  return (
    <div id={id} className="registration-ticket">
      <div className="ticket-container">
        {/* Left Side - Colorful */}
        <div className="ticket-left">
          <div className="ticket-event-title">{event.title}</div>
          <div className="ticket-date">
            {new Date(event.startTime).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="ticket-time">
            {new Date(event.startTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            -{" "}
            {new Date(event.endTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        {/* Right Side - QR Code & Details */}
        <div className="ticket-right">
          {/* QR Code */}
          <div className="ticket-qr">
            <QRCodeCanvas
              value={ticketCode}
              size={100}
              level="H"
              includeMargin={false}
              fgColor="#667eea"
              bgColor="#ffffff"
            />
          </div>

          {/* Ticket Number */}
          <div className="ticket-number">{ticketCode}</div>
        </div>
      </div>

      {/* Ticket Details */}
      <div className="ticket-details">
        <div className="detail-row">
          <span className="detail-key">Attendee:</span>
          <span className="detail-val">{user.name}</span>
        </div>
        <div className="detail-row">
          <span className="detail-key">Email:</span>
          <span className="detail-val">{user.email}</span>
        </div>
        <div className="detail-row">
          <span className="detail-key">Registration Date:</span>
          <span className="detail-val">
            {new Date(registration.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-key">Event Status:</span>
          <span className="detail-val status-badge">{event.status}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="ticket-footer">
        <p>Please present this ticket at the event entrance</p>
      </div>
    </div>
  );
}

export default RegistrationTicket;
