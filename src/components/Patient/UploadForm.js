// src/components/Patient/UploadForm.js
import React, { useState } from 'react';
import './Patient.css';

const UploadForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    patientId: '',
    email: '',
    phone: '',
    note: '',
    images: [] // store multiple images here
  });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length !== 3) {
      setMessage('Please select exactly 3 images (upper, front, and lower teeth)');
      return;
    }
    setMessage('');
    setFormData(prev => ({ ...prev, images: files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('patientID', formData.patientId);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('note', formData.note);

      // append all selected images under the same key 'images'
      if (formData.images && formData.images.length) {
        formData.images.forEach(file => {
          formDataToSend.append('images', file); // backend must expect upload.array('images', 3)
        });
      }

      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:3001/patient/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Submission uploaded successfully! Your dental professional will review it shortly.');
        setFormData({
          name: '',
          patientId: '',
          email: '',
          phone: '',
          note: '',
          images: []
        });
        // reset file input
        document.getElementById('images').value = '';
      } else {
        setMessage(data.message || 'Error uploading submission');
      }
    } catch (error) {
      setMessage('Error uploading submission. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-form">
      <h2>Upload Teeth Photos</h2>
      {message && <div className="message success">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Patient ID</label>
          <input
            type="text"
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Note</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows="3"
            placeholder="Any specific concerns or notes for the dental professional?"
          />
        </div>
        <div className="form-group">
          <label>Teeth Photos</label>
          <input
            type="file"
            id="images"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            required
          />
          <p className="file-hint">Upload exactly 3 clear photos of your teeth (upper, front, lower)</p>
        </div>
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
