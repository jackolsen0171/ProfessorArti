import React from 'react';
import './McGillFooter.css';

function McGillFooter() {
  return (
    <footer className="mcgill-footer">
      <div className="mcgill-footer-content">
        <div className="footer-section">
          <h4>Professor Arti</h4>
          <p>Your AI-powered academic assistant for McGill University students</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><a href="/">Knowledge Graph</a></li>
            <li><a href="/upload">Upload Documents</a></li>
            <li><a href="/help">Help & Support</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>McGill University</h4>
          <ul className="footer-links">
            <li><a href="https://mcgill.ca" target="_blank" rel="noopener noreferrer">McGill.ca</a></li>
            <li><a href="https://minerva.mcgill.ca" target="_blank" rel="noopener noreferrer">Minerva</a></li>
            <li><a href="https://mycourses2.mcgill.ca" target="_blank" rel="noopener noreferrer">MyCourses</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; 2025 Professor Arti - McGill University Academic Assistant</p>
          <div className="footer-badges">
            <span className="mcgill-badge">McGill University</span>
            <span className="ai-badge">AI-Powered</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default McGillFooter;