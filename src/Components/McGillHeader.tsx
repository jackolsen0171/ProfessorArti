import './McGillHeader.css';

function McGillHeader() {
  return (
    <header className="mcgill-header">
      <div className="mcgill-header-content">
        <div className="mcgill-brand">
          <div className="mcgill-logo">
            {/* McGill shield placeholder - in production, use official McGill logo */}
            <div className="mcgill-shield">
              <span className="shield-martlet">🦅</span>
            </div>
          </div>
          <div className="mcgill-text">
            <h1 className="mcgill-title">Professor Arti</h1>
            <p className="mcgill-subtitle">McGill Student Academic Assistant</p>
          </div>
        </div>
        <nav className="mcgill-nav">
          <a href="/dashboard" className="nav-link">Dashboard</a>
          <a href="/upload" className="nav-link">Upload</a>
          <a href="/about" className="nav-link">About</a>
        </nav>
      </div>
    </header>
  );
}

export default McGillHeader;
