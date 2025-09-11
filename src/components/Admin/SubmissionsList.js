// src/components/Admin/SubmissionsList.js
import React, { useState, useEffect } from 'react';
import './Admin.css';

const SubmissionsList = ({ onSelectSubmission, refresh  }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [imageUrls, setImageUrls] = useState({});

  useEffect(() => {
    fetchSubmissions();
  }, [refresh]);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/admin/submissions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
        data.forEach(sub => fetchFirstImage(sub));
      } else {
        console.error('Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFirstImage = async (submission) => {
    try {
      if (!submission.imageURLs || submission.imageURLs.length === 0) return;
      
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/admin/get-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imagePath: submission.imageURLs[0] })
      });
      
      if (!res.ok) {
        throw new Error('Image not found');
      }
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setImageUrls(prev => ({ ...prev, [submission._id]: url }));
    } catch (err) {
      console.error(`Error fetching image for ${submission._id}:`, err);
    }
  };


  const fetchImage = async (submission) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/admin/get-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imagePath: submission.imageURL }) // the path stored in DB
      });
      if (!res.ok) {
        throw new Error('Image not found');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setImageUrls(prev => ({ ...prev, [submission._id]: url }));
    } catch (err) {
      console.error(`Error fetching image for ${submission._id}:`, err);
    }
  };

  const filteredSubmissions = filter === 'all'
    ? submissions
    : submissions.filter(s => s.status === filter);

  if (loading) {
    return <div className="loading">Loading submissions...</div>;
  }

  return (
    <div className="submissions-list">
      <div className="list-header">
        <h2>Patient Submissions ({submissions.length})</h2>
        <div className="filters">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >All</button>
          <button
            className={filter === 'uploaded' ? 'active' : ''}
            onClick={() => setFilter('uploaded')}
          >New</button>
          <button
            className={filter === 'annotated' ? 'active' : ''}
            onClick={() => setFilter('annotated')}
          >Annotated</button>
          <button
            className={filter === 'reported' ? 'active' : ''}
            onClick={() => setFilter('reported')}
          >Reported</button>
        </div>
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="no-submissions">
          <p>No submissions found.</p>
        </div>
      ) : (
        <div className="submissions-grid">
          {filteredSubmissions.map(submission => (
            <div key={submission._id} className="submission-card">
              <div className="submission-image">
                {imageUrls[submission._id] ? (
                  <img
                    src={imageUrls[submission._id]}
                    alt="Teeth"
                    style={{ width: '100%' }}
                  />
                ) : (
                  <p>Loading image...</p>
                )}
              </div>
              <div className="submission-details">
                <h3>{submission.name}</h3>
                <p>ID: {submission.patientID}</p>
                <p>Phone: {submission.phone}</p>
                <p>Date: {new Date(submission.createdAt).toLocaleDateString()}</p>
                <p className={`status ${submission.status}`}>
                  Status: {submission.status}
                </p>
              </div>
              <div className="submission-actions">
                <button
                  onClick={() => onSelectSubmission(submission)}
                  className="btn btn-primary"
                >
                  {submission.status === 'uploaded' ? 'Annotate' : 'View'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmissionsList;
