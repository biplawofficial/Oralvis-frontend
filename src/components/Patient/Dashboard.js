import React, { useState } from 'react';
import UploadForm from './UploadForm';
import Submissions from './Submissions';
import './Patient.css';

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="patient-dashboard">
      <div className="dashboard-header">
        <h1>Patient Dashboard</h1>
        <p>Welcome to OralVis Healthcare</p>
      </div>
      
      <div className="dashboard-nav">
        <button 
          className={activeTab === 'upload' ? 'active' : ''}
          onClick={() => setActiveTab('upload')}
        >
          Upload New
        </button>
        <button 
          className={activeTab === 'submissions' ? 'active' : ''}
          onClick={() => setActiveTab('submissions')}
        >
          My Submissions
        </button>
      </div>
      
      <div className="dashboard-content">
        {activeTab === 'upload' && <UploadForm />}
        {activeTab === 'submissions' && <Submissions />}
      </div>
    </div>
  );
};

export default PatientDashboard;