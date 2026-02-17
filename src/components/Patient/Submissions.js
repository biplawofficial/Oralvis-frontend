import React, { useState, useEffect } from 'react';
import './Patient.css';

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/patient/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        setError(errorData.message || 'Failed to fetch submissions');
        console.error('Failed to fetch submissions:', errorData);
      }
    } catch (error) {
      setError('Error fetching submissions: ' + error.message);
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };
  const downloadReport = async (submissionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/patient/submission/${submissionId}/report`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Create a blob from the PDF stream
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `oral_health_report_${submissionId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download report');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report');
    }
  };

  if (loading) {
    return <div className="loading">Loading your submissions...</div>;
  }

  return (
    <div className="submissions">
      <h2>My Submissions</h2>
      {submissions.length === 0 ? (
        <div className="no-submissions">
          <p>You haven't made any submissions yet.</p>
          <p>Upload a teeth photo to get started!</p>
        </div>
      ) : (
        <div className="submissions-list">
          {submissions.map(submission => (
            <div key={submission._id} className="submission-card">
              <div className="submission-info">
                <h3>Submission from {new Date(submission.createdAt).toLocaleDateString()}</h3>
                <p className={`status ${submission.status.toLowerCase().replace(' ', '-')}`}>
                  Status: {submission.status}
                </p>
              </div>
              <div className="submission-actions">
                {submission.status === 'reported' && (
                  <button 
                    onClick={() => downloadReport(submission._id)}
                    className="btn btn-primary"
                  >
                    Download Report
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Submissions;