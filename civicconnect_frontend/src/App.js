import React, { useState, useEffect } from 'react';
import './App.css';

// PUBLIC_INTERFACE
function hashPassword(password) {
  // Very basic hash mock for demonstration.
  // In production, always hash/store passwords securely on the server, never in frontend JS!
  return btoa(password.split('').reverse().join('') + 'civic');
}

// Input validation helpers
const validateEmail = email =>
  typeof email === 'string' && email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
const validatePassword = pw => typeof pw === 'string' && pw.length >= 6;

import React, { useState, useEffect } from 'react';

// ==========================================
// THEME VARIABLES - Override via inline style
import React, { useState, useEffect } from 'react';

// ==========================================
const THEME = {
  '--base-dark': '#000000',
  '--base-light': '#ff0000',
  '--text-color': '#ffffff',
  '--accent': '#ffffff',
};

import React, { useState, useEffect } from 'react';

// ==========================================
// DEMO-ONLY SESSION STORAGE LAYER
// In real apps, use backend APIs.
import React, { useState, useEffect } from 'react';

// ==========================================
function getSession() {
  return JSON.parse(window.localStorage.getItem('civic_session') || 'null');
}
function setSession(session) {
  window.localStorage.setItem('civic_session', JSON.stringify(session));
}
function clearSession() {
  window.localStorage.removeItem('civic_session');
}
function saveUser(user) {
  // Save user to localStorage. In real app: backend API.
  const users = JSON.parse(window.localStorage.getItem('civic_users') || '[]');
  const idx = users.findIndex(u => u.email === user.email);
  if (idx !== -1) users[idx] = user;
  else users.push(user);
  window.localStorage.setItem('civic_users', JSON.stringify(users));
}
function loadUsers() {
  return JSON.parse(window.localStorage.getItem('civic_users') || '[]');
}
function getUser(email) {
  return loadUsers().find(u => u.email === email);
}

// Issue Management - stored locally
function loadIssues() {
  return JSON.parse(window.localStorage.getItem('civic_issues') || '[]');
}
function saveIssue(issue) {
  const issues = loadIssues();
  if (issue.id) {
    // update
    const idx = issues.findIndex(i => i.id === issue.id);
    if (idx !== -1) issues[idx] = issue;
    else issues.push(issue);
  } else {
    // add new
    issue.id = String(Date.now());
    issues.push(issue);
  }
  window.localStorage.setItem('civic_issues', JSON.stringify(issues));
}
function deleteIssue(issueId) {
  const issues = loadIssues().filter(i => i.id !== issueId);
  window.localStorage.setItem('civic_issues', JSON.stringify(issues));
}

const DEPARTMENTS = [
  { name: 'Public Works', email: 'publicworks@civic.local' },
  { name: 'Sanitation', email: 'sanitation@civic.local' },
  { name: 'Parks & Rec', email: 'parks@civic.local' },
  { name: 'City Hall', email: 'info@civic.local' },
];

import React, { useState, useEffect } from 'react';

// ==========================================
// LAYOUT COMPONENTS
import React, { useState, useEffect } from 'react';

// ==========================================

const Navbar = ({ session, onLogout, onNav, isAdmin }) => (
  <nav className="navbar" style={{ background: THEME['--base-dark'] }}>
    <div className="container" style={{justifyContent:'space-between',display:'flex'}}>
      <div className="logo" style={{color: THEME['--text-color']}}>
        <span className="logo-symbol" style={{ color: THEME['--base-light'], fontSize:'2rem', fontWeight:'bold', marginRight: 6 }}>⚫</span>
        CivicConnect
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'1.5rem',flexWrap:'wrap'}}>
        <NavLink onClick={() => onNav('home')}>Home</NavLink>
        {session ? (
          <>
            <NavLink onClick={() => onNav('status')}>My Issues</NavLink>
            <NavLink onClick={() => onNav('report')}>Report</NavLink>
            <NavLink onClick={() => onNav('contact')}>Contact</NavLink>
            {isAdmin && <NavLink onClick={() => onNav('admin')}>Admin</NavLink>}
            <button className="btn" style={{ background: THEME['--base-light'], color: "#fff" }} onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink onClick={() => onNav('login')}>Login</NavLink>
            <NavLink onClick={() => onNav('register')}>Register</NavLink>
            <NavLink onClick={() => onNav('contact')}>Contact</NavLink>
          </>
        )}
      </div>
    </div>
  </nav>
);

const NavLink = ({ children, onClick }) => (
  <button className="btn" onClick={onClick} style={{
    background: 'transparent',
    color: THEME['--accent'],
    border: 'none',
    outline: 'none',
    fontWeight:'bold',
    padding: '6px 12px',
    fontSize:'1rem',
    cursor:'pointer'
  }}>{children}</button>
);

const Footer = () => (
  <footer style={{
    background: THEME['--base-dark'],
    color: THEME['--accent'],
    borderTop: `1px solid ${THEME['--base-light']}`,
    marginTop: 'auto', padding: '28px 0', fontSize:'1rem', textAlign:'center'
  }}>
    CivicConnect &copy; {new Date().getFullYear()} &mdash; Empowering Citizens
  </footer>
);

import React, { useState, useEffect } from 'react';

// ==========================================
// MAIN APP COMPONENT
import React, { useState, useEffect } from 'react';

// ==========================================
function App() {
  // Routing & session
  const [route, setRoute] = useState('home');
  const [session, setSessionState] = useState(getSession());
  const isAdmin = !!session && session.isAdmin;

  useEffect(() => {
    // On app mount, set theme variables
    Object.entries(THEME).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
    // Restore session if available
    setSessionState(getSession());
  }, []);

  const logout = () => {
    clearSession();
    setSessionState(null);
    setRoute('home');
  };

  // Routing: show right page
  let Content = null;
  if (route === 'login') {
    Content = <LoginForm
      onLogin={user => {
        setSession(user);
        setSessionState(user);
        setRoute(user.isAdmin ? 'admin' : 'home');
      }}
      onNavRegister={() => setRoute('register')}
    />;
  } else if (route === 'register') {
    Content = <RegisterForm
      onRegister={user => {
        setSession(user);
        setSessionState(user);
        setRoute('home');
      }}
      onNavLogin={() => setRoute('login')}
    />;
  } else if (route === 'report') {
    if (!session) Content = <MustLogin onLogin={() => setRoute('login')} />;
    else Content = <ReportIssueForm user={session} onSuccess={() => setRoute('status')} />;
  } else if (route === 'status') {
    if (!session) Content = <MustLogin onLogin={() => setRoute('login')} />;
    else Content = <UserIssues user={session} />;
  } else if (route === 'admin') {
    if (!session || !isAdmin) Content = <MustAdmin />;
    else Content = <AdminDashboard />;
  } else if (route === 'contact') {
    Content = <ContactDepartments />;
  } else {
    // Home page
    Content = <Hero isLoggedIn={!!session} onReport={() => setRoute('report')} onAdmin={() => setRoute('admin')} />;
  }

  return (
    <div className="app" style={{ minHeight: '100vh', background: THEME['--base-dark'], color: THEME['--text-color'] }}>
      <Navbar
        session={session}
        isAdmin={isAdmin}
        onLogout={logout}
        onNav={setRoute}
      />
      <main style={{ marginTop: 80 }}>
        <div className="container" style={{ paddingBottom: 24 }}>
          {Content}
        </div>
      </main>
      <Footer />
    </div>
  );
}

import React, { useState, useEffect } from 'react';

// ==========================================
// HERO / LANDING PAGE
import React, { useState, useEffect } from 'react';

// ==========================================
const Hero = ({ isLoggedIn, onReport, onAdmin }) => (
  <div className="hero">
    <div className="subtitle">Empowering Smart & Safe Communities</div>
    <h1 className="title" style={{
      color: THEME['--base-light'],
      textShadow: '0px 1px 8px #000'
    }}>
      Welcome to CivicConnect
    </h1>
    <div className="description" style={{ marginBottom: '2rem', color: THEME['--accent'] }}>
      CivicConnect allows citizens to quickly report civic issues, track their status, and enables admins to respond and manage issues efficiently.
    </div>
    <div style={{display:'flex',flexDirection:'row', gap:'1.25rem',flexWrap:'wrap',justifyContent:'center'}}>
      <button className="btn btn-large" style={{ background: THEME['--base-light'], color: "#fff", minWidth: 120 }} onClick={onReport}>
        Report Issue
      </button>
      <button className="btn btn-large" style={{ background: '#fff', color: THEME['--base-light'], minWidth: 120}} onClick={onAdmin}>
        Admin Login
      </button>
    </div>
  </div>
);

import React, { useState, useEffect } from 'react';

// ==========================================
// AUTH: LOGIN & REGISTER
import React, { useState, useEffect } from 'react';

// ==========================================
function LoginForm({ onLogin, onNavRegister }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(null);

  function handleLogin(e) {
    e.preventDefault();
    setErr(null);
    if (!validateEmail(email)) return setErr('Invalid email format.');
    const user = getUser(email);
    if (!user) return setErr('User not found.');
    if (user.password !== hashPassword(pw)) return setErr('Incorrect password.');
    onLogin(user);
  }
  return (
    <div style={{maxWidth:450,margin:'40px auto',background:'#181818',borderRadius:8,padding:32,boxShadow:'0 0 16px #00000044'}}>
      <h2 style={{color:THEME['--base-light']}}>Login</h2>
      <form onSubmit={handleLogin} autoComplete="off" style={{display:'flex',flexDirection:'column',gap:18}}>
        <label>Email<input name="email" type="email" value={email} autoFocus required onChange={e=>setEmail(e.target.value)} style={{marginTop:2,marginBottom:10}} /></label>
        <label>Password<input name="password" type="password" value={pw} required onChange={e=>setPw(e.target.value)} /></label>
        <button className="btn btn-large" style={{background:THEME['--base-light'],color:'#fff'}}>Log in</button>
        {err && <div style={{color:'red',marginTop:8}}>{err}</div>}
      </form>
      <div style={{marginTop:16,fontSize:'0.97rem',color:'#aaa'}}>Don&apos;t have an account? <button onClick={onNavRegister} className="btn" style={{color:THEME['--base-light'],background:'transparent'}}>Register</button></div>
      <div style={{marginTop:12,fontSize:'0.9em',color:'#555'}}>For admin: email <b>admin@civic.local</b>, password <b>admin1234</b></div>
    </div>
  );
}

function RegisterForm({ onRegister, onNavLogin }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState(null);
  function handleRegister(e) {
    e.preventDefault();
    setErr(null);
    if (!validateEmail(email)) return setErr('Invalid email address.');
    if (!validatePassword(pw)) return setErr('Password must be at least 6 chars.');
    if (pw !== confirm) return setErr('Passwords do not match.');
    if (getUser(email)) return setErr('User already exists.');
    // Add default admin if it doesn't exist
    if (!getUser('admin@civic.local')) {
      saveUser({
        email: 'admin@civic.local',
        password: hashPassword('admin1234'),
        isAdmin: true
      });
    }
    const user = { email, password: hashPassword(pw), isAdmin: false };
    saveUser(user);
    onRegister(user);
  }
  return (
    <div style={{maxWidth:450,margin:'40px auto',background:'#181818',borderRadius:8,padding:32,boxShadow:'0 0 16px #00000044'}}>
      <h2 style={{color:THEME['--base-light']}}>Register</h2>
      <form onSubmit={handleRegister} autoComplete="off" style={{display:'flex',flexDirection:'column',gap:18}}>
        <label>Email<input name="email" type="email" value={email} autoFocus required onChange={e=>setEmail(e.target.value)} /></label>
        <label>Password<input name="password" type="password" value={pw} required onChange={e=>setPw(e.target.value)} /></label>
        <label>Confirm Password<input name="confirm" type="password" value={confirm} required onChange={e=>setConfirm(e.target.value)} /></label>
        <button className="btn btn-large" style={{background:THEME['--base-light'],color:'#fff'}}>Register</button>
        {err && <div style={{color:'red',marginTop:8}}>{err}</div>}
      </form>
      <div style={{marginTop:16,fontSize:'0.97rem',color:'#aaa'}}>Already have an account? <button onClick={onNavLogin} className="btn" style={{color:THEME['--base-light'],background:'transparent'}}>Login</button></div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

// ==========================================
// ISSUE REPORTING WITH PHOTO & LOCATION
import React, { useState, useEffect } from 'react';

// ==========================================
function ReportIssueForm({ user, onSuccess }) {
  const [description, setDesc] = useState('');
  const [type, setType] = useState('Pothole');
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState(null);
  const [file, setFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [err, setErr] = useState(null);

  // Camera support state
  const [showCamera, setShowCamera] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null); // null | 'granted' | 'denied'
  const [stream, setStream] = useState(null);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  const types = ['Pothole', 'Garbage', 'Lighting', 'Water', 'Noise', 'Other'];

  // Check camera capabilities on mount
  useEffect(() => {
    // Check camera support (for modern browsers)
    if (
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function"
    ) {
      setCameraAvailable(true);
    } else {
      setCameraAvailable(false);
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  // We want to shutdown stream if unmounted or stream changes
  }, [stream]);

  // Turn on camera on user demand (not auto-activate for privacy)
  function handleOpenCamera(e) {
    e.preventDefault();
    setErr(null);
    if (!cameraAvailable || !navigator.mediaDevices?.getUserMedia) {
      setErr('Camera is not supported on this device/browser.');
      setShowCamera(false);
      return;
    }
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(mediaStream => {
        setStream(mediaStream);
        setShowCamera(true);
        setCameraPermission('granted');
        // Attach stream to video
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch(error => {
        setErr('Camera access was denied or failed. Try file upload instead.');
        setCameraPermission('denied');
        setShowCamera(false);
        setStream(null);
      });
  }

  // Attach camera stream to video element when available
  useEffect(() => {
    if (showCamera && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [showCamera, stream]);

  // Take photo from camera
  function handleTakePhoto(e) {
    e.preventDefault();
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      // Fit canvas to video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Get base64 from canvas
      const dataUrl = canvas.toDataURL('image/png');
      setPhotoPreview(dataUrl);
      setFile(null);
      setShowCamera(false);
      // Stop stream for privacy and battery
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  }

  // Cancel camera modal and shut camera
  function handleCancelCamera(e) {
    if (e) e.preventDefault();
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  }

  // Remove/cancel photo (reset preview and file)
  function handleRemovePhoto(e) {
    e.preventDefault();
    setFile(null);
    setPhotoPreview(null);
    setShowCamera(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }

  // File input handler (fallback or user preference)
  function handlePhoto(e) {
    const f = e.target.files[0];
    setFile(f || null);
    if (f) {
      const reader = new FileReader();
      reader.onloadend = () => { setPhotoPreview(reader.result); };
      reader.readAsDataURL(f);
    } else setPhotoPreview(null);
  }

  function fetchLocation() {
    setErr(null);
    if (!navigator.geolocation) {
      setErr('Geolocation not supported in this browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords(pos.coords);
        setLocation(`${pos.coords.latitude},${pos.coords.longitude}`);
      },
      () => setErr('Failed to fetch location'),
      { timeout: 10000 }
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    setErr(null);
    if (!description.trim() || description.length < 6)
      return setErr('Description is required (6+ chars)');
    if (!type) return setErr('Select an issue type.');
    setSubmitLoading(true);
    // "Upload" photo (simulate as base64)
    let photoData = photoPreview;
    // Save issue
    const newIssue = {
      id: String(Date.now()),
      user: user.email,
      description: description.trim(),
      type,
      coords,
      location,
      photo: photoData,
      status: 'Submitted',
      submitted: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    saveIssue(newIssue);
    setTimeout(() => {
      setSubmitLoading(false);
      onSuccess();
    }, 700);
  }

  return (
    <div style={{maxWidth:600,margin:'32px auto',padding:32,background:'#181818',borderRadius:10,boxShadow:'0 0 20px #00000066'}}>
      <h2 style={{color:THEME['--base-light']}}>Report an Issue</h2>
      <form autoComplete="off" onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
        <label>
          Description *
          <textarea value={description} onChange={e=>setDesc(e.target.value)} required maxLength={512} placeholder="Describe the issue in detail" style={{width:'100%',height:80,resize:'vertical',marginTop:4}}/>
        </label>
        <label>
          Issue Type *
          <select value={type} onChange={e=>setType(e.target.value)} style={{marginTop:6}}>
            {types.map(t=><option value={t} key={t}>{t}</option>)}
          </select>
        </label>
        <label>
          Attach Photo
          <div style={{display:'flex',flexDirection:'column', gap: 8}}>
            {/* "Take Photo" for browser with camera, fallback file input always available */}
            {(!photoPreview && cameraAvailable) && (
              <button type="button" className="btn" style={{width:160,background:THEME['--base-light'],color:'#fff',marginBottom:6}}
                    onClick={handleOpenCamera}>
                📷 Take Photo
              </button>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhoto}
              style={{marginTop:4}}
              disabled={showCamera}
            />
            {photoPreview && (
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <img src={photoPreview} alt="Preview" style={{width:130,height:86,borderRadius:8,objectFit:'cover',margin:'6px 0 8px 0',border:'1px solid #444'}} />
                <button type="button" className="btn" style={{background:'#555',color:'#eee',fontSize:'0.99em',padding:'5px 10px'}} onClick={handleRemovePhoto}>Remove</button>
              </div>
            )}
          </div>
        </label>
        {/* Camera modal for live capture */}
        {showCamera && (
          <div style={{
            position:'fixed',top:0,left:0,width:'100vw',height:'100vh',
            background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'
          }}>
            <div style={{background:'#191a1c',borderRadius:12,padding:22,boxShadow:'0 8px 40px #000e',display:'flex',flexDirection:'column',alignItems:'center'}}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{width:320,maxWidth:'70vw',height:200,background:'#000',borderRadius:9,marginBottom:10,objectFit:'cover'}}
              />
              <div style={{display:'flex',gap:12,marginTop:3}}>
                <button type="button" className="btn" style={{background:THEME['--base-light'],color:'#fff',fontWeight:'bold',fontSize:'1.09em'}} onClick={handleTakePhoto}>
                  Capture
                </button>
                <button type="button" className="btn" style={{background:'#555',color:'#eee'}} onClick={handleCancelCamera}>
                  Cancel
                </button>
              </div>
              <div style={{marginTop:7,fontSize:'0.93em',color:'#ccc'}}>
                Please allow camera permission to take a photo.
              </div>
              <canvas ref={canvasRef} style={{display:'none'}} />
            </div>
          </div>
        )}
        <label>
          Location (optional)
          <input value={location} readOnly placeholder="latitude,longitude" style={{marginLeft:10,marginTop:2}}/>
          <button type="button" className="btn" style={{marginLeft:8,padding:'4px 10px',fontSize:'0.95em',background:THEME['--base-light']}} onClick={fetchLocation}>Use GPS</button>
        </label>
        <button className="btn btn-large" style={{background:THEME['--base-light'],color:'#fff'}} disabled={submitLoading}>
          {submitLoading ? 'Submitting...' : 'Submit Issue'}
        </button>
        {err && <div style={{color:'red',marginTop:8}}>{err}</div>}
      </form>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

// ==========================================
// USER ISSUES STATUS VIEW
import React, { useState, useEffect } from 'react';

// ==========================================
function UserIssues({ user }) {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    setIssues(loadIssues().filter(i => i.user === user.email));
  }, [user.email]);

  if (issues.length === 0)
    return <div style={{margin:'60px auto',textAlign:'center',color:'#9f9'}}>No issues submitted yet. <br/>Go to <b>Report</b> to create a new one!</div>;

  return (
    <div style={{maxWidth:700,margin:'32px auto',background:'#181818',padding:28,borderRadius:10}}>
    <h2 style={{color:THEME['--base-light'],marginBottom:10}}>My Reported Issues</h2>
    {issues.slice().reverse().map(issue=>(
      <div key={issue.id} style={{
        background:'#191a1c',
        borderRadius:6,
        padding:18, margin:'14px 0',
        border:'1px solid #333',
        boxShadow:'0 1px 8px #0002'
      }}>
        <div><b>Type:</b> {issue.type}</div>
        <div><b>Description:</b> {issue.description}</div>
        <div>
          <b>Status:</b> <span style={{color: issue.status==='Resolved'? '#48e948': THEME['--base-light']}}>{issue.status}</span>
          {issue.statusMsg && <span style={{color:'#aaa',marginLeft:8}}>{" - "+issue.statusMsg}</span>}
        </div>
        {issue.photo && <img src={issue.photo} alt="issue" style={{margin:'11px 0',maxWidth:200,borderRadius:8}} />}
        {issue.location && <div><b>Location:</b> <span style={{color:'#ddd'}}>{issue.location}</span></div>}
        <div style={{fontSize:'0.93em',color:'#777',marginTop:6}}>
          <span>Submitted: {(new Date(issue.submitted)).toLocaleString()}</span>
          {issue.updated && <span style={{marginLeft:24}}>Updated: {(new Date(issue.updated)).toLocaleString()}</span>}
        </div>
      </div>
    ))}
    </div>
  );
}

import React, { useState, useEffect } from 'react';

// ==========================================
// ADMIN DASHBOARD
import React, { useState, useEffect } from 'react';

// ==========================================
function AdminDashboard() {
  const [issues, setIssues] = useState(loadIssues());
  const [filter, setFilter] = useState('All');
  const [editing, setEditing] = useState(null);
  const filtered = filter === 'All' ? issues : issues.filter(i => i.status === filter);

  function updateStatus(issueId, status, statusMsg) {
    const issue = issues.find(i=>i.id===issueId);
    if (issue) {
      issue.status = status;
      issue.statusMsg = statusMsg || '';
      issue.updated = (new Date()).toISOString();
      saveIssue(issue);
      setIssues(loadIssues());
      setEditing(null);
    }
  }
  function handleDelete(id) {
    if (window.confirm('Delete this issue?')) {
      deleteIssue(id);
      setIssues(loadIssues());
    }
  }

  return (
    <div style={{maxWidth:900,margin:'30px auto',padding:20,background:'#181818',borderRadius:10}}>
      <h2 style={{color:THEME['--base-light']}}>Admin Issue Dashboard</h2>
      <div style={{display:'flex',gap:12,margin:'12px 0',alignItems:'center'}}>
        <span>Filter:</span>
        <select value={filter} onChange={e=>setFilter(e.target.value)}>
          <option>All</option>
          <option>Submitted</option>
          <option>In Progress</option>
          <option>Resolved</option>
        </select>
        <span style={{marginLeft:'auto',fontSize:'0.97em',color:'#bbb'}}>Total: {filtered.length}</span>
      </div>
      <div style={{overflowX:'auto'}}>
        {filtered.length === 0 ? (
          <div style={{margin:'50px auto',color:'#bbb'}}>No issues found.</div>
        ) : (
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead style={{background:THEME['--base-dark'],color:THEME['--base-light']}}>
            <tr>
              <th style={{border:'1px solid #333',padding:'6px'}}>ID</th>
              <th style={{border:'1px solid #333'}}>User</th>
              <th style={{border:'1px solid #333'}}>Type</th>
              <th style={{border:'1px solid #333'}}>Description</th>
              <th style={{border:'1px solid #333'}}>Status</th>
              <th style={{border:'1px solid #333'}}>Photo</th>
              <th style={{border:'1px solid #333'}}>Location</th>
              <th style={{border:'1px solid #333'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice().reverse().map(issue=>
              <tr key={issue.id}>
                <td style={{border:'1px solid #333',fontSize:'0.97em'}}>{issue.id}</td>
                <td style={{border:'1px solid #333'}}>{issue.user}</td>
                <td style={{border:'1px solid #333'}}>{issue.type}</td>
                <td style={{border:'1px solid #333'}}>{issue.description}</td>
                <td style={{border:'1px solid #333',color: issue.status === 'Resolved'?'#48e948':issue.status==='In Progress'? '#eee' : THEME['--base-light']}}>
                  {editing === issue.id
                    ? (
                        <EditStatusRow
                          currentStatus={issue.status}
                          statusMsg={issue.statusMsg}
                          onSave={(status, msg)=>updateStatus(issue.id, status, msg)}
                          onCancel={()=>setEditing(null)}
                        />
                      )
                    : (
                        <>
                          {issue.status} <br />
                          {issue.statusMsg && <span style={{color:'#aaa'}}>{issue.statusMsg}</span>}
                          <button className="btn" style={{padding:'3px 8px',marginLeft:8,background:THEME['--base-light'],fontSize:'0.98em'}} onClick={()=>setEditing(issue.id)}>Edit</button>
                        </>
                      )
                  }
                </td>
                <td style={{border:'1px solid #333'}}>{issue.photo ? <img src={issue.photo} alt="preview" style={{width:62,height:41,borderRadius:7}} /> : '-'}</td>
                <td style={{border:'1px solid #333'}}>{issue.location||'-'}</td>
                <td style={{border:'1px solid #333'}}>
                  <button className="btn" style={{background:'#c01',color:'#fff',padding:'4px 9px',fontSize:'0.93em'}} onClick={()=>handleDelete(issue.id)}>Delete</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}

function EditStatusRow({ currentStatus, statusMsg, onSave, onCancel }) {
  const [status, setStatus] = useState(currentStatus || 'Submitted');
  const [msg, setMsg] = useState(statusMsg||'');
  return (
    <div style={{display:'flex',flexDirection:'column',gap:2}}>
      <select value={status} onChange={e=>setStatus(e.target.value)} style={{marginBottom:4}}>
        <option>Submitted</option>
        <option>In Progress</option>
        <option>Resolved</option>
      </select>
      <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Status Message (optional)" style={{marginBottom:5}} maxLength={100} />
      <div style={{display:'flex',gap:6}}>
        <button className="btn" style={{background:'#0a0',color:'#fff',padding:'3px 9px'}} onClick={()=>onSave(status, msg)}>Save</button>
        <button className="btn" style={{background:'#454',color:'#fff',padding:'3px 9px'}} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

// ==========================================
// CONTACT & DEPARTMENTS
import React, { useState, useEffect } from 'react';

// ==========================================
function ContactDepartments() {
  return (
    <div className="hero" style={{alignItems:'flex-start'}}>
      <h2 style={{color:THEME['--base-light'],width:'100%'}}>Contact & Departments</h2>
      <div style={{background:'#181818',padding:22,borderRadius:10,width:'100%',maxWidth:500}}>
        <div>
          <b>Email:</b> <a href="mailto:info@civic.local" style={{color:THEME['--base-light']}}>info@civic.local</a>
        </div>
        <div>
          <b>Phone:</b> <a href="tel:+12345678900" style={{color:THEME['--base-light']}}>+1 (234) 567-8900</a>
        </div>
        <hr style={{margin:'12px 0',borderTop:'1px solid #222'}} />
        <h4 style={{marginBottom:10}}>Departments:</h4>
        <ul>
          {DEPARTMENTS.map(dep=>(
            <li key={dep.email} style={{marginBottom:6}}><b>{dep.name}:</b> <a style={{color:THEME['--base-light']}} href={`mailto:${dep.email}`}>{dep.email}</a></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

// ==========================================
// ACCESS CONTROL SCREENS
import React, { useState, useEffect } from 'react';

// ==========================================
function MustLogin({ onLogin }) {
  return (
    <div className="hero">
      <h2 style={{color:THEME['--base-light']}}>Login Required</h2>
      <p>You must log in to access this feature.</p>
      <button className="btn btn-large" style={{background:THEME['--base-light'],color:'#fff'}} onClick={onLogin}>Go to Login</button>
    </div>
  );
}
function MustAdmin() {
  return (
    <div className="hero">
      <h2 style={{color:THEME['--base-light']}}>Admin Access Required</h2>
      <p>You must log in as an administrator to access this page.</p>
    </div>
  );
}

export default App;
