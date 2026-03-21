import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './MyCoursePanel.css';

const ALLOWED_FACULTIES = ['Engineering', 'Business', 'Architecture', 'Computing'];

const MyCoursePanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we are on a page that should show the button
  const shouldShowButton = () => {
    // Hide explicitly on home page
    if (location.pathname === '/') return false;
    
    const path = decodeURIComponent(location.pathname);
    return ALLOWED_FACULTIES.some(faculty => path.includes(faculty));
  };

  if (!shouldShowButton()) {
    return null;
  }

  return (
    <>
      <div 
        className="mycourse-floating-btn"
        onClick={() => setIsOpen(true)}
      >
        <span className="btn-icon">📚</span>
        <span className="btn-text">My Course</span>
      </div>

      <div className={`mycourse-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}></div>
      
      <div className={`mycourse-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">
            <span className="title-icon">📚</span> Faculties
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            <span style={{color: '#ff6b6b'}}>✕</span> Close
          </button>
        </div>
        
        <div className="sidebar-content">
          <div className="quick-access-box">
            <h3 className="qa-title"><span className="qa-icon">⚡</span> Quick Access To Saved Options</h3>
            <p className="qa-subtitle">Select options below to quickly navigate to your module.</p>
            
            <div className="qa-form">
              <div className="qa-group">
                <label>Faculty</label>
                <select className="qa-select">
                  <option>-- Select Faculty --</option>
                  <option>Engineering</option>
                  <option>Business</option>
                  <option>Computing</option>
                  <option>Architecture</option>
                </select>
              </div>
              
              <div className="qa-group">
                <label>Year</label>
                <select className="qa-select">
                  <option>-- Select Year --</option>
                  <option>Year 1</option>
                  <option>Year 2</option>
                  <option>Year 3</option>
                  <option>Year 4</option>
                </select>
              </div>
              
              <div className="qa-group">
                <label>Semester</label>
                <select className="qa-select">
                  <option>-- Select Semester --</option>
                  <option>Semester 1</option>
                  <option>Semester 2</option>
                </select>
              </div>
              
              <div className="qa-group">
                <label>Module</label>
                <select className="qa-select">
                  <option>-- Select Module --</option>
                </select>
              </div>
              
              <div className="qa-actions">
                <button className="btn-my-course" onClick={() => setIsOpen(false)}>My Course</button>
                <button className="btn-clear-saved">Clear Saved</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyCoursePanel;
