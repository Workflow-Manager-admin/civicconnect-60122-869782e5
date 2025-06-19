import React, { useState } from 'react';
import './App.css';

import Layout from './layout/Layout';
import PageHome from './pages/Home';
import PageLogin from './pages/Login';
import PageRegister from './pages/Register';
import PageReportIssue from './pages/ReportIssue';
import PageMyIssues from './pages/MyIssues';
import PageAdmin from './pages/Admin';
import PageContact from './pages/Contact';

// Utility for user auth/session (demo only, in-memory)
const demoUsers = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'user', password: 'user123', role: 'user' }
];

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
  marginTop: 10,
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

function statusColor(status, who = 'user') {
  if (status === 'Resolved') return who === 'admin' ? '#00ff89' : 'lightgreen';
  if (status === 'Rejected') return 'var(--secondary)';
  if (status === 'In Progress') return who === 'admin' ? '#fff864' : '#ffe261';
  return 'var(--accent)';
}

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
    } else if (name === "location" && typeof value === "object") {
      // Accepts object {lat, lng} or {error}
      setIssueForm({ ...issueForm, location: value });
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
    <Layout go={go} user={user} handleLogout={handleLogout}>
      {page === 'home' && <PageHome go={go} user={user} />}
      {page === 'login' && (
        <PageLogin
          loginForm={loginForm}
          setLoginForm={setLoginForm}
          handleLogin={handleLogin}
          authError={authError}
          inputStyles={inputStyles}
          errorStyles={errorStyles}
        />
      )}
      {page === 'register' && (
        <PageRegister
          registerForm={registerForm}
          setRegisterForm={setRegisterForm}
          handleRegister={handleRegister}
          authError={authError}
          inputStyles={inputStyles}
          errorStyles={errorStyles}
        />
      )}
      {page === 'report' && (
        <PageReportIssue
          issueForm={issueForm}
          handleIssueFormChange={handleIssueFormChange}
          handleIssueSubmit={handleIssueSubmit}
          handleIssueLocation={handleIssueLocation}
          authError={authError}
          inputStyles={inputStyles}
          errorStyles={errorStyles}
        />
      )}
      {page === 'myissues' && user && (
        <PageMyIssues
          issues={issues}
          user={user}
          cardStyles={cardStyles}
          statusColor={statusColor}
        />
      )}
      {page === 'admin' && (
        <PageAdmin
          user={user}
          issues={issues}
          cardStyles={cardStyles}
          inputStyles={inputStyles}
          statusColor={statusColor}
          errorStyles={errorStyles}
          handleAdminUpdateIssue={handleAdminUpdateIssue}
        />
      )}
      {page === 'contact' && (
        <PageContact
          deptGridStyles={deptGridStyles}
          deptCardStyles={deptCardStyles}
        />
      )}
      {(page === 'myissues' && !user) && (
        <div className="container" style={{ paddingTop: 120 }}>
          <div style={errorStyles}>Login required.</div>
        </div>
      )}
    </Layout>
  );
}

export default CivicConnectApp;