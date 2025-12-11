import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "The mail we create",
      to,
      subject,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export const sendRegistrationConfirmation = async (email, eventTitle, ticketCode) => {
  const htmlContent = `
    <h2>Event Registration Confirmed!</h2>
    <p>Thank you for registering for <strong>${eventTitle}</strong></p>
    <p>Your ticket code: <strong>${ticketCode}</strong></p>
    <p>Please keep this code safe for check-in.</p>
  `;
  return sendEmail(email, `Registration Confirmation - ${eventTitle}`, htmlContent);
};

export const sendPaymentReceipt = async (email, eventTitle, amount) => {
  const htmlContent = `
    <h2>Payment Receipt</h2>
    <p>Thank you for your payment for <strong>${eventTitle}</strong></p>
    <p>Amount: <strong>$${amount}</strong></p>
    <p>Your registration is now complete.</p>
  `;
  return sendEmail(email, `Payment Receipt - ${eventTitle}`, htmlContent);
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  const htmlContent = `
    <h2>Password Reset Requested</h2>
    <p>We received a request to reset your password.</p>
    <p>Click the button below to set a new password. This link will expire in 1 hour.</p>
    <p style="margin: 20px 0;">
      <a href="${resetUrl}" style="
        background: #4f46e5;
        color: #ffffff;
        padding: 12px 20px;
        border-radius: 6px;
        text-decoration: none;
        display: inline-block;
      ">Reset Password</a>
    </p>
    <p>If you did not request this, you can safely ignore this email.</p>
  `;
  return sendEmail(email, "Reset your password", htmlContent);
};