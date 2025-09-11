import React, { useState } from 'react';
import SubmissionsList from './SubmissionsList';
import AnnotationTool from './AnnotationTool';
import './Admin.css';

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState('submissions');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const handleSelectSubmission = (submission) => {
    setSelectedSubmission(submission);
    setActiveView('annotation');
  };

  const handleBackToList = () => {
    setSelectedSubmission(null);
    setActiveView('submissions');
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>OralVis Healthcare Professional Portal</p>
      </div>
      
      {activeView === 'submissions' && (
        <SubmissionsList onSelectSubmission={handleSelectSubmission} />
      )}
      
      {activeView === 'annotation' && selectedSubmission && (
        <AnnotationTool 
          submission={selectedSubmission} 
          onBack={handleBackToList}
        />
      )}
    </div>
  );
};

export default AdminDashboard;