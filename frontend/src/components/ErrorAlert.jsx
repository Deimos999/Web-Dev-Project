import React from 'react';
import { X } from 'lucide-react';

function ErrorAlert({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded-lg text-red-200 flex justify-between items-start">
      <span>{message}</span>
      <button
        onClick={onClose}
        className="text-red-200 hover:text-red-100 transition"
      >
        <X size={18} />
      </button>
    </div>
  );
}

export default ErrorAlert;