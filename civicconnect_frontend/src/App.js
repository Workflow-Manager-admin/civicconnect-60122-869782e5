import React, { useState } from 'react';
import './App.css';

/*
  CivicConnect Main Container
  Features:
  - Dark theme with primary (#000), secondary (#f00), accent (#fff) colors
  - Responsive layout: Navbar, Main content, Footer
  - User Registration & Login (UI/Validation/demo, actual backend not included)
  - Issue Reporting (form, file upload, geolocation)
  - Status Viewing (user's issues)
  - Admin Dashboard (view/update issues)
  - Contact & Departments (static)
  - Minimal state management, suitable for demo/pure frontend context
*/

// Utility for user auth/session (demo only, in-memory)
const demoUsers = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'user', password: 'user123', role: 'user' }
];

// PUBLIC_INTERFACE
function CivicConnectApp() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState([]); // [{id, type, desc, location, photo, status, createdBy}]
  const [authError, setAuthError] = useState('');
  const [issueForm, setIssueForm] = useState({
    type: '',
    description: '',
    photo: null,
    location: null
  });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });

  // ---- Basic Navigation ----
  const go = (pg) => {
    setAuthError('');
    setPage(pg);
  };

  // ---- Auth Logic ----
  // PUBLIC_INTERFACE
  function handleLogin(e) {
    e.preventDefault();
    // Demo: Simple user lookup
    const found = demoUsers.find(
      u => u.username === loginForm.username && u.password === loginForm.password
    );
    if (found) {
      setUser({ username: found.username, role: found.role });
      setPage('home');
      setAuthError('');
    } else {
      setAuthError('Invalid username or password.');
    }
  }
  // PUBLIC_INTERFACE
  function handleRegister(e) {
    e.preventDefault();
    // Imitate form validation (no real registration backend)
    if (!registerForm.username.trim() || !registerForm.password) {
      setAuthError('Username and password are required.');
    } else if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError('Passwords do not match.');
    } else {
      setAuthError('Registration disabled (demo only)');
    }
  }
  // PUBLIC_INTERFACE
  function handleLogout() {
    setUser(null);
    setPage('home');
  }

  // ---- Issue Reporting Logic ----
  // PUBLIC_INTERFACE
  function handleIssueFormChange(e) {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setIssueForm({ ...issueForm, [name]: files[0] });
    } else {
      setIssueForm({ ...issueForm, [name]: value });
    }
  }
  // PUBLIC_INTERFACE
  function handleIssueLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIssueForm({
            ...issueForm,
            location: {
              lat: pos.coords.latitude.toFixed(5),
              lng: pos.coords.longitude.toFixed(5)
            }
          });
        },
        () => {
          setIssueForm({
            ...issueForm,
            location: { error: 'Location access denied' }
          });
        }
      );
    } else {
      setIssueForm({
        ...issueForm,
        location: { error: 'Geolocation not supported' }
      });
    }
  }
  // PUBLIC_INTERFACE
  function handleIssueSubmit(e) {
    e.preventDefault();
    // Validate
    if (!issueForm.type || !issueForm.description) {
      setAuthError('Issue type and description required.');
      return;
    }
    // Add issue
    setIssues([
      ...issues,
      {
        id: Date.now(),
        type: issueForm.type,
        description: issueForm.description,
        photo: issueForm.photo,
        location: issueForm.location,
        status: 'Submitted',
        createdBy: user ? user.username : 'Anonymous'
      }
    ]);
    setIssueForm({ type: '', description: '', photo: null, location: null });
    setAuthError('');
    setPage('myissues');
  }

  // ---- Admin Issue Update ----
  // PUBLIC_INTERFACE
  function handleAdminUpdateIssue(id, newStatus) {
    setIssues(
      issues.map(iss =>
        iss.id === id ? { ...iss, status: newStatus } : iss
      )
    );
  }

  // ---- UI Components ----
  function Navbar() {
    return (
      <nav className="navbar" style={{ background: 'var(--primary)' }}>
        <div className="container" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          {/* App Logo */}
          <div className="logo" style={{color: 'var(--accent)', fontWeight:600}}>
            <span className="logo-symbol" style={{ color: 'var(--secondary)', fontSize:'2rem' }}>★</span> CivicConnect
          </div>
          <div style={{display: 'flex', gap: '12px', alignItems:'center'}}>
            <button className="btn" onClick={() => go('home')}>Home</button>
            <button className="btn" onClick={() => go('report')}>Report Issue</button>
            <button className="btn" onClick={() => go('myissues')} disabled={!user}>My Issues</button>
            <button className="btn" onClick={() => go('contact')}>Contact</button>
            {user && user.role === 'admin' && (
              <button className="btn" style={{ fontWeight: 700, color: 'var(--secondary)', border: '1px solid var(--secondary)' }} onClick={() => go('admin')}>Admin</button>
            )}
            {!user ? (
              <>
                <button className="btn" onClick={() => go('login')}>Login</button>
                <button className="btn" onClick={() => go('register')}>Register</button>
              </>
            ) : (
              <span style={{ color: 'var(--accent)', fontSize: '1rem', marginLeft:'10px'}}>
                {user.username}&nbsp;
                <button className="btn" onClick={handleLogout}>Logout</button>
              </span>
            )}
          </div>
        </div>
      </nav>
    );
  }

  function Footer() {
    return (
      <footer style={{
        background: 'var(--primary)',
        color: 'var(--accent)',
        padding: '20px 0',
        marginTop: 'auto',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.95rem',
        textAlign: 'center'
      }}>
        © 2024 CivicConnect.
      </footer>
    );
  }

  // ---- Pages ----
  function PageHome() {
    return (
      <div className="container" style={{paddingTop:120, marginBottom:24}}>
        <div className="hero">
          <div className="subtitle">A Civic Engagement Platform</div>
          <h1 className="title" style={{color:'var(--accent)'}}>Welcome to CivicConnect</h1>
          <div className="description">
            Easily report civic issues, track their progress, and help improve your community. 
            <br />
            <strong style={{color:'var(--secondary)'}}>Get involved & make a difference.</strong>
          </div>
          <div style={{display:'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap'}}>
            <button className="btn btn-large" style={{background:'var(--secondary)'}} onClick={()=>go('report')}>Report Issue</button>
            <button className="btn btn-large" onClick={()=>go('myissues')} disabled={!user}>My Issues</button>
            <button className="btn btn-large" onClick={()=>go('admin')} disabled={!user || user.role!=='admin'}>Admin</button>
          </div>
        </div>
      </div>
    );
  }
  function PageRegister() {
    return (
      <div className="container" style={{paddingTop:120, maxWidth:420}}>
        <h2 style={{ color: 'var(--accent)' }}>Register</h2>
        <form onSubmit={handleRegister} style={{display:'flex', flexDirection:'column', gap:12}}>
          <input
            type="text"
            placeholder="Username"
            name="username"
            value={registerForm.username}
            onChange={e => setRegisterForm({...registerForm, username: e.target.value})}
            autoComplete="username"
            style={inputStyles}
            required
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={registerForm.password}
            onChange={e => setRegisterForm({...registerForm, password: e.target.value})}
            minLength={4}
            autoComplete="new-password"
            style={inputStyles}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            value={registerForm.confirmPassword}
            onChange={e => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
            minLength={4}
            autoComplete="new-password"
            style={inputStyles}
            required
          />
          <button className="btn btn-large" style={{marginTop:6}} type="submit">Register</button>
        </form>
        {authError && <div style={errorStyles}>{authError}</div>}
      </div>
    );
  }
  function PageLogin() {
    return (
      <div className="container" style={{paddingTop:120, maxWidth:420}}>
        <h2 style={{ color: 'var(--accent)' }}>Login</h2>
        <form onSubmit={handleLogin} style={{display:'flex', flexDirection:'column', gap:12}}>
          <input
            type="text"
            placeholder="Username"
            name="username"
            value={loginForm.username}
            onChange={e => setLoginForm({...loginForm, username: e.target.value})}
            autoComplete="username"
            style={inputStyles}
            required
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={loginForm.password}
            onChange={e => setLoginForm({...loginForm, password: e.target.value})}
            minLength={4}
            autoComplete="current-password"
            style={inputStyles}
            required
          />
          <button className="btn btn-large" style={{marginTop:6}} type="submit">Login</button>
        </form>
        {authError && <div style={errorStyles}>{authError}</div>}
      </div>
    );
  }
  function PageReportIssue() {
    return (
      <div className="container" style={{paddingTop:120, maxWidth:520}}>
        <h2 style={{ color: 'var(--secondary)' }}>Report a Civic Issue</h2>
        <form onSubmit={handleIssueSubmit} style={{display:'flex', flexDirection:'column', gap:12}} >
          <select
            name="type"
            value={issueForm.type}
            onChange={handleIssueFormChange}
            style={inputStyles}
            required
          >
            <option value="">Select Issue Type</option>
            <option value="Pothole">Pothole</option>
            <option value="Streetlight">Streetlight</option>
            <option value="Garbage">Garbage</option>
            <option value="Water Leakage">Water Leakage</option>
            <option value="Other">Other</option>
          </select>
          <textarea
            name="description"
            placeholder="Describe the issue..."
            value={issueForm.description}
            onChange={handleIssueFormChange}
            style={{...inputStyles, minHeight: 60, resize: 'vertical'}}
            required
            maxLength={400}
          />
          <input
            type="file"
            name="photo"
            accept="image/*"
            onChange={handleIssueFormChange}
            style={inputStyles}
          />
          <button
            className="btn"
            type="button"
            style={{background:'var(--secondary)',color:'var(--accent)'}}
            onClick={handleIssueLocation}
          >
            {issueForm.location ? 'Location Captured' : 'Use My Location'}
          </button>
          {issueForm.location && issueForm.location.error && (
            <div style={errorStyles}>{issueForm.location.error}</div>
          )}
          <button className="btn btn-large" style={{marginTop:10}} type="submit">Submit Issue</button>
        </form>
        {authError && <div style={errorStyles}>{authError}</div>}
      </div>
    );
  }
  function PageMyIssues() {
    const myIssues = issues.filter(i => (user && i.createdBy === user.username));
    return (
      <div className="container" style={{paddingTop:120, marginBottom:48}}>
        <h2 style={{ color: 'var(--accent)' }}>My Reported Issues</h2>
        {myIssues.length === 0 && (
          <div className="description">No issues reported yet.</div>
        )}
        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          {myIssues.map(issue =>
            <div key={issue.id} style={cardStyles}>
              <div><b>Type:</b> {issue.type}</div>
              <div><b>Description:</b> {issue.description}</div>
              <div><b>Status:</b> <span style={{color:statusColor(issue.status, 'user')}}>{issue.status}</span></div>
              {issue.location && !issue.location.error &&
                <div style={{fontSize:'0.95em',color:'var(--text-secondary)'}}><b>Location:</b> {issue.location.lat}, {issue.location.lng}</div>
              }
              {issue.photo && <span style={{fontSize:'0.95em'}}>Photo attached</span>}
            </div>
          )}
        </div>
      </div>
    );
  }
  function PageAdmin() {
    if (!user || user.role !== 'admin') {
      return (
        <div className="container" style={{paddingTop:120}}>
          <div style={errorStyles}>Admin access only.</div>
        </div>
      );
    }
    return (
      <div className="container" style={{paddingTop:120, marginBottom:48}}>
        <h2 style={{ color: 'var(--secondary)' }}>Admin Dashboard</h2>
        {issues.length === 0 && (
          <div className="description">No issues reported.</div>
        )}
        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          {issues.map(issue =>
            <div key={issue.id} style={cardStyles}>
              <div><b>User:</b> {issue.createdBy}</div>
              <div><b>Type:</b> {issue.type}</div>
              <div><b>Description:</b> {issue.description}</div>
              <div><b>Status:</b> 
                <select
                  style={inputStyles}
                  value={issue.status}
                  onChange={e => handleAdminUpdateIssue(issue.id, e.target.value)}
                >
                  <option>Submitted</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Rejected</option>
                </select>
                <span style={{marginLeft:12,color:statusColor(issue.status, 'admin')}}>{issue.status}</span>
              </div>
              {issue.location && !issue.location.error &&
                <div style={{fontSize:'0.94em',color:'var(--text-secondary)'}}><b>Location:</b> {issue.location.lat}, {issue.location.lng}</div>
              }
              {issue.photo && (
                <span style={{fontSize:'0.94em'}}>Photo attached</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
  function PageContact() {
    return (
      <div className="container" style={{paddingTop:120, maxWidth:680}}>
        <h2 style={{ color: 'var(--accent)' }}>Contact & Departments</h2>
        <div className="description">Contact us below or reach out to the relevant department.</div>
        <div style={deptGridStyles}>
          <div style={deptCardStyles}>
            <h4 style={{color:'var(--secondary)'}}>Public Works</h4>
            <div>publicworks@civicconnect.gov</div>
            <div>Phone: 123-456-1001</div>
          </div>
          <div style={deptCardStyles}>
            <h4 style={{color:'var(--secondary)'}}>Garbage/Sanitation</h4>
            <div>sanitation@civicconnect.gov</div>
            <div>Phone: 123-456-1010</div>
          </div>
          <div style={deptCardStyles}>
            <h4 style={{color:'var(--secondary)'}}>Water Dept</h4>
            <div>waterdept@civicconnect.gov</div>
            <div>Phone: 123-456-1022</div>
          </div>
          <div style={deptCardStyles}>
            <h4 style={{color:'var(--secondary)'}}>Streetlights</h4>
            <div>lights@civicconnect.gov</div>
            <div>Phone: 123-456-1099</div>
          </div>
        </div>
        <div style={{marginTop:24, color:'var(--accent)'}}>
          General contact: info@civicconnect.gov
        </div>
      </div>
    );
  }

  // ---- Theme and Styles ----
  React.useEffect(() => {
    // Apply custom CSS variables for theme colors
    const root = document.documentElement;
    root.style.setProperty('--primary', '#000000');
    root.style.setProperty('--secondary', '#ff0000');
    root.style.setProperty('--accent', '#ffffff');
    root.style.setProperty('--base-dark', '#000000');
    root.style.setProperty('--base-light', '#ff0000');
    root.style.setProperty('--text-color', '#ffffff');
    root.style.setProperty('--border-color', 'rgba(255,255,255,0.16)');
  }, []);

  // ---- Main Render ----
  return (
    <div className="app" style={{background:'var(--primary)', color:'var(--accent)', minHeight:'100vh', display:'flex', flexDirection:'column'}}>
      <Navbar />
      <main style={{flex: '1 0 auto', minHeight: '60vh', marginTop:64}}>
        {page === 'home' && <PageHome />}
        {page === 'login' && <PageLogin />}
        {page === 'register' && <PageRegister />}
        {page === 'report' && <PageReportIssue />}
        {page === 'myissues' && user && <PageMyIssues />}
        {page === 'admin' && <PageAdmin />}
        {page === 'contact' && <PageContact />}
        {(page === 'myissues' && !user) && (
          <div className="container" style={{paddingTop:120}}><div style={errorStyles}>Login required.</div></div>
        )}
      </main>
      <Footer />
    </div>
  );
}

// -------- UI STYLE HELPERS -------
const inputStyles = {
  background: 'var(--primary)',
  color: 'var(--accent)',
  border: '1px solid var(--border-color)',
  borderRadius: 4,
  fontSize: '1rem',
  padding: '10px 12px',
  marginBottom: 2,
  outline: 'none'
};
const errorStyles = {
  marginTop:10,
  color: 'var(--secondary)',
  background: 'rgba(50,0,0,0.43)',
  padding: '8px 16px',
  borderRadius: 4
};
const cardStyles = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--border-color)',
  borderRadius: 8,
  padding: '16px',
  color: 'var(--accent)'
};
const deptGridStyles = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))',
  gap: 20,
  marginTop: 20
};
const deptCardStyles = {
  background: 'rgba(50,50,50,0.40)',
  borderRadius: 8,
  padding: '14px 16px'
};

function statusColor(status, who='user') {
  if (status === 'Resolved') return who === 'admin' ? '#00ff89' : 'lightgreen';
  if (status === 'Rejected') return 'var(--secondary)';
  if (status === 'In Progress') return who === 'admin' ? '#fff864' : '#ffe261';
  return 'var(--accent)'
}

export default CivicConnectApp;