// src/components/UploadModal.jsx
import React from 'react';
import './UploadModal.css';

export default function UploadModal({ onFileUpload, onClose }) {
  const handleFile = (file) => {
    onFileUpload(file);
    onClose();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="upload-modal-overlay">
      <div className="upload-modal" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
