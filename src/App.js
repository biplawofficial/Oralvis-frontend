// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import PatientDashboard from './components/Patient/Dashboard';
import AdminDashboard from './components/Admin/Dashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    // Check if userData is not "undefined" string and is valid JSON
    if (userData && userData !== "undefined" && token) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data from localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else if (userData === "undefined") {
      // Clean up the "undefined" string if it exists
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  const handleLogin = (userData) => {
    // Ensure userData has the expected structure
    const user = {
      id: userData.id || userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role
    };
    
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <h1>OralVis Healthcare</h1>
          {user && (
            <div className="user-menu">
              <span>Welcome, {user.name} ({user.role})</span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          )}
        </header>

        <main className="app-main">
          <Routes>
            <Route 
              path="/" 
              element={
                user ? (
                  <Navigate to={user.role === 'admin' ? '/admin' : '/patient'} />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/login" 
              element={
                user ? (
                  <Navigate to={user.role === 'admin' ? '/admin' : '/patient'} />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              } 
            />
            <Route 
              path="/register" 
              element={
                user ? (
                  <Navigate to={user.role === 'admin' ? '/admin' : '/patient'} />
                ) : (
                  <Register onLogin={handleLogin} />
                )
              } 
            />
            <Route 
              path="/patient/*" 
              element={
                user && user.role === 'patient' ? (
                  <PatientDashboard />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/admin/*" 
              element={
                user && user.role === 'admin' ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>&copy; 2023 OralVis Healthcare. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;