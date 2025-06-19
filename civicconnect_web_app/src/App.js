import React, { useState, useEffect } from 'react';
import './App.css';

// PUBLIC_INTERFACE
// Main app container for CivicConnect
function App() {
  // Authentication state
  const [user, setUser] = useState(() => {
    // Try to restore session from storage
    const session = localStorage.getItem('civicconnect_user');
    return session ? JSON.parse(session) : null;
  });
  // Admin state for simplicity
  const [admin, setAdmin] = useState(() => {
    const adminSession = localStorage.getItem('civicconnect_admin');
    return adminSession ? JSON.parse(adminSession) : null;
  });

  // Routing state
  const [route, setRoute] = useState('home'); // home | login | register | report | status | admin | contact | departments

  // Issues state (will be per user and global for admin)
  const [issues, setIssues] = useState(() => {
    const stored = localStorage.getItem('civicconnect_issues');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('civicconnect_user', user ? JSON.stringify(user) : '');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('civicconnect_admin', admin ? JSON.stringify(admin) : '');
  }, [admin]);

  useEffect(() => {
    localStorage.setItem('civicconnect_issues', JSON.stringify(issues));
  }, [issues]);

  // Helper: Simple hash (insecure, for demo)
  function fakeHash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return hash.toString(16);
  }

  // Helper: User registration
  // PUBLIC_INTERFACE
  function handleRegister({ name, email, password }) {
    const users = JSON.parse(localStorage.getItem('civicconnect_users') || '[]');
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email already registered.' };
    }
    const hashPw = fakeHash(password);
    const userObj = { id: Date.now(), name, email, password: hashPw };
    users.push(userObj);
    localStorage.setItem('civicconnect_users', JSON.stringify(users));
    setUser({ id: userObj.id, name: userObj.name, email: userObj.email });
    return { success: true };
  }

  // PUBLIC_INTERFACE
  function handleLogin({ email, password }) {
    // Two options: admin or user
    if (email === 'admin@civicconnect.local' && password === 'admin') {
      setAdmin({ name: 'CivicConnect Admin', email });
      setUser(null);
      return { success: true, admin: true };
    }
    const users = JSON.parse(localStorage.getItem('civicconnect_users') || '[]');
    const found = users.find(u => u.email === email && u.password === fakeHash(password));
    if (!found) {
      return { success: false, message: 'Invalid credentials' };
    }
    setUser({ id: found.id, name: found.name, email: found.email });
    setAdmin(null);
    return { success: true };
  }

  // PUBLIC_INTERFACE
  function handleLogout() {
    setUser(null);
    setAdmin(null);
  }

  // PUBLIC_INTERFACE
  function handleReportIssue({ title, description, file, location, type }) {
    if (!user) return { success: false, message: 'You must be logged in.' };
    const issue = {
      id: Date.now(),
      userId: user.id,
      userName: user.name,
      title,
      description,
      file, // base64
      location,
      type,
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      updates: []
    };
    setIssues(prev => [...prev, issue]);
    return { success: true };
  }

  // PUBLIC_INTERFACE
  function handleUpdateIssueStatus(issueId, newStatus, adminNote) {
    setIssues(prev =>
      prev.map(issue =>
        issue.id === issueId
          ? {
              ...issue,
              status: newStatus,
              updates: [
                ...issue.updates,
                {
                  at: new Date().toISOString(),
                  status: newStatus,
                  adminNote: adminNote || ''
                }
              ]
            }
          : issue
      )
    );
  }

  // PUBLIC_INTERFACE
  function handleDeleteIssue(issueId) {
    setIssues(prev => prev.filter(issue => issue.id !== issueId));
  }

  // Routes
  // PUBLIC_INTERFACE
  function showPage() {
    if (admin) {
      // Admin have only dashboard and logout
      if (route !== 'admin') {
        setRoute('admin');
        return null;
      }
      return (
        <AdminDashboard
          issues={issues}
          onUpdateStatus={handleUpdateIssueStatus}
          onDeleteIssue={handleDeleteIssue}
        />
      );
    }
    // Not logged in
    if (!user) {
      if (route === 'register') return <RegisterForm onRegister={handleRegister} onSwitch={() => setRoute('login')} />;
      if (route === 'login') return <LoginForm onLogin={handleLogin} onSwitch={() => setRoute('register')} />;
      // Home page (prompt to login/register)
      return <HomePage onLogin={() => setRoute('login')} onRegister={() => setRoute('register')} />;
    }
    // Logged in as user
    switch (route) {
      case 'report':
        return <ReportIssueForm onReport={handleReportIssue} />;
      case 'status':
        return <StatusView user={user} issues={issues.filter(i => i.userId === user.id)} />;
      case 'contact':
        return <ContactPage />;
      case 'departments':
        return <DepartmentsPage />;
      default:
        return (
          <UserHome
            user={user}
            onReport={() => setRoute('report')}
            onStatus={() => setRoute('status')}
            onContact={() => setRoute('contact')}
            onDepartments={() => setRoute('departments')}
          />
        );
    }
  }

  // PUBLIC_INTERFACE
  function handleNav(target) {
    setRoute(target);
  }

  return (
    <div className="app" style={{ backgroundColor: "#000000", minHeight: '100vh', color: "#fff" }}>
      <Navbar
        user={user}
        admin={admin}
        onLogout={handleLogout}
        onNav={handleNav}
        current={route}
      />
      <main style={{ marginTop: 90, marginBottom: 40 }}>
        <div className="container">
          {showPage()}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// -------------------- Navbar --------------------

const navStyle = {
  backgroundColor: '#000000',
  color: '#fff',
  borderBottom: '1px solid #222',
  fontSize: '1rem',
};

const accentColor = '#ff0000';
const navBtnStyle = route => ({
  background: 'none',
  border: 'none',
  color: '#fff',
  fontWeight: route ? 'bold' : 'normal',
  margin: '0 10px',
  padding: 0,
  fontSize: '1rem',
  cursor: 'pointer'
});

// PUBLIC_INTERFACE
function Navbar({ user, admin, onLogout, onNav, current }) {

  return (
    <nav className="navbar" style={navStyle}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="logo">
          <span className="logo-symbol" style={{ color: accentColor, fontWeight: 900 }}>●</span>
          CivicConnect
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {admin ? (
            <>
              <button style={navBtnStyle(current === 'admin')} onClick={() => onNav('admin')}>Admin Dashboard</button>
              <button className="btn" onClick={onLogout}>Logout</button>
            </>
          ) : user ? (
            <>
              <button style={navBtnStyle(current === 'home')} onClick={() => onNav('home')}>Home</button>
              <button style={navBtnStyle(current === 'report')} onClick={() => onNav('report')}>Report Issue</button>
              <button style={navBtnStyle(current === 'status')} onClick={() => onNav('status')}>My Reports</button>
              <button style={navBtnStyle(current === 'contact')} onClick={() => onNav('contact')}>Contact</button>
              <button style={navBtnStyle(current === 'departments')} onClick={() => onNav('departments')}>Departments</button>
              <button className="btn" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <>
              <button style={navBtnStyle(current === 'home')} onClick={() => onNav('home')}>Home</button>
              <button style={navBtnStyle(current === 'login')} onClick={() => onNav('login')}>Login</button>
              <button style={navBtnStyle(current === 'register')} onClick={() => onNav('register')}>Register</button>
              <button style={navBtnStyle(current === 'contact')} onClick={() => onNav('contact')}>Contact</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// -------------------- Footer --------------------

// PUBLIC_INTERFACE
function Footer() {
  return (
    <footer style={{
      width: '100%', background: '#111', color: '#bbb', padding: '24px 0', textAlign: 'center',
      borderTop: '1px solid #222', letterSpacing: 0.25
    }}>
      <div style={{ fontSize: 13 }}>
        &copy; {new Date().getFullYear()} CivicConnect &mdash; Empowering Citizens •{' '}
        <span style={{ color: '#ff0000', fontWeight: 700 }}>Civic Engagement Platform</span>
      </div>
    </footer>
  );
}

// -------------------- HomePage (For Unauthenticated) --------------------
function HomePage({ onLogin, onRegister }) {
  return (
    <div className="hero">
      <div className="subtitle" style={{ color: '#ff0000' }}>Welcome to CivicConnect</div>
      <h1 className="title">Empowering Citizens, Improving Cities</h1>
      <div className="description">
        CivicConnect is your all-in-one platform for reporting civic issues, tracking their resolution, and connecting with your city’s departments. Register or login to get started!
      </div>
      <div>
        <button className="btn btn-large" style={{ marginRight: 14 }} onClick={onRegister}>Register</button>
        <button className="btn btn-large" onClick={onLogin}>Login</button>
      </div>
    </div>
  );
}

// -------------------- User Home --------------------

function UserHome({ user, onReport, onStatus, onContact, onDepartments }) {
  return (
    <div className="hero">
      <div style={{ color: "#ff0000", marginBottom: 10 }}>Welcome, {user.name}!</div>
      <h1 className="title" style={{fontSize: '2.2rem'}}>What would you like to do?</h1>
      <div style={{ marginBottom: 24, color: "#ccc" }}>
        Use the actions below to get involved and keep your city running smoothly!
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: 10 }}>
        <button className="btn btn-large" onClick={onReport}>Report Civic Issue</button>
        <button className="btn btn-large" onClick={onStatus}>My Submitted Reports</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        <button className="btn btn-large" onClick={onContact}>Contact</button>
        <button className="btn btn-large" onClick={onDepartments}>Departments</button>
      </div>
    </div>
  );
}

// -------------------- RegisterForm --------------------

// PUBLIC_INTERFACE
function RegisterForm({ onRegister, onSwitch }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState(null);
  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setMessage({ type: 'error', text: 'All fields required.' });
      return;
    }
    if (!validateEmail(form.email)) {
      setMessage({ type: 'error', text: 'Invalid email format.' });
      return;
    }
    if (form.password.length < 6) {
      setMessage({ type: 'error', text: 'Password should be 6+ chars.' });
      return;
    }
    const res = onRegister(form);
    if (!res.success) setMessage({ type: 'error', text: res.message });
    else setMessage({ type: 'success', text: 'Registration successful. Reloading...' });
    setTimeout(() => window.location.reload(), 800);
  }
  return (
    <div className="hero" style={{ maxWidth: 450, margin: '0 auto' }}>
      <div className="title" style={{ fontSize: '2rem' }}>Register</div>
      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} style={fieldStyle} maxLength={30} />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} style={fieldStyle} maxLength={40} />
        <input name="password" type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={handleChange} style={fieldStyle} maxLength={28}/>
        <button className="btn btn-large" type="submit">Register</button>
        <button type="button" style={{ ...fieldStyle, background: 'none', color: '#eee', border: 'none', cursor: 'pointer' }} onClick={onSwitch}>Already have an account? Login</button>
      </form>
      {message && <div style={{ marginTop: 15, color: message.type === 'error' ? '#ff3333' : '#45ff8f' }}>{message.text}</div>}
    </div>
  );
}

// -------------------- LoginForm --------------------

// PUBLIC_INTERFACE
function LoginForm({ onLogin, onSwitch }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState(null);
  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setMessage({ type: 'error', text: 'All fields required.' });
      return;
    }
    const res = onLogin(form);
    if (res.admin) setMessage({ type: 'success', text: 'Admin login successful.' });
    else if (res.success) setMessage({ type: 'success', text: 'Login successful. Reloading...' });
    else setMessage({ type: 'error', text: res.message || 'Login failed.' });
    setTimeout(() => window.location.reload(), 400);
  }
  return (
    <div className="hero" style={{ maxWidth: 400, margin: '0 auto' }}>
      <div className="title" style={{ fontSize: '2rem' }}>Login</div>
      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} style={fieldStyle} maxLength={40} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} style={fieldStyle} maxLength={28}/>
        <button className="btn btn-large" type="submit">Login</button>
        <button type="button" style={{ ...fieldStyle, background: 'none', color: '#eee', border: 'none', cursor: 'pointer' }} onClick={onSwitch}>No account? Register</button>
      </form>
      <div style={{ marginTop: 16, fontSize: 12, color: "#888" }}>
        (Tip: <span style={{ color: "#ff0000" }}>admin@civicconnect.local / admin</span> for admin demo)
      </div>
      {message && <div style={{ marginTop: 15, color: message.type === 'error' ? '#ff3333' : '#45ff8f' }}>{message.text}</div>}
    </div>
  );
}

const fieldStyle = {
  background: "#161616",
  color: "#eee",
  border: "1px solid #222",
  borderRadius: 4,
  fontSize: 15,
  padding: "11px 10px",
  marginBottom: 0
};

// -------------------- ReportIssueForm --------------------

import GoogleMap from "./GoogleMap";

import GoogleMap from "./GoogleMap";

// PUBLIC_INTERFACE
function ReportIssueForm({ onReport }) {
// (rest of function unchanged)
  const [form, setForm] = useState({
    title: "",
    description: "",
    file: null,
    type: "Road",
    location: "",
  });
  const [fileData, setFileData] = useState(null);
  const [message, setMessage] = useState(null);

  // Track map coordinates for Google Map component display
  const [coords, setCoords] = useState({ lat: null, lng: null });

  // Geolocation API integration
  function handleGeo() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setForm(f =>
          ({ ...f, location: `${lat}, ${lng}` })
        );
        setCoords({ lat, lng });
      },
      (err) => setMessage({ type: 'error', text: "Unable to fetch location." }),
      { enableHighAccuracy: true }
    );
  }

  // Parse location field into coords when edited/filled
  useEffect(() => {
    if (form.location) {
      const [lat, lng] = form.location.split(",").map(x => parseFloat(x.trim()));
      if (!isNaN(lat) && !isNaN(lng)) setCoords({ lat, lng });
    }
  }, [form.location]);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file && ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      const reader = new window.FileReader();
      reader.onload = function (ev) {
        setFileData(ev.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setMessage({ type: 'error', text: 'Only PNG/JPEG files allowed.' });
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.description) {
      setMessage({ type: 'error', text: 'Title & description required.' });
      return;
    }
    if (!fileData) {
      setMessage({ type: 'error', text: 'Photo upload required.' });
      return;
    }
    if (!form.location) {
      setMessage({ type: 'error', text: 'Location required.' });
      return;
    }
    const res = onReport({
      ...form,
      file: fileData,
    });
    if (res.success) setMessage({ type: 'success', text: 'Report submitted.' });
    else setMessage({ type: 'error', text: res.message });
    setTimeout(() => setMessage(null), 2000);
    setForm({ title: "", description: "", file: null, type: "Road", location: "" });
    setFileData(null);
  }

  return (
    <div className="hero" style={{ maxWidth: 520, margin: '0 auto' }}>
      <div className="title" style={{ fontSize: '2rem', marginBottom: 4 }}>Report Civic Issue</div>
      {/* Show map visually if available */}
      {coords.lat && coords.lng && (
        <div style={{ width: '100%', marginBottom: 12 }}>
          <GoogleMap lat={coords.lat} lng={coords.lng} />
          <div style={{ fontSize: 12, color: "#66defc", marginTop: 5 }}>
            Map displays your chosen/device location.
          </div>
        </div>
      )}
      <form style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15 }} onSubmit={handleSubmit}>
        <input name="title" placeholder="Issue Title" value={form.title} maxLength={40}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={fieldStyle} />
        <textarea name="description" placeholder="Describe the issue" value={form.description} maxLength={300}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...fieldStyle, fontFamily: 'inherit', minHeight: 48 }} />
        <label style={{ color: '#eee', fontWeight: 400, margin: "4px 0 0 4px" }}>Issue Type</label>
        <select name="type" value={form.type}
          onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={fieldStyle}>
          <option>Road</option>
          <option>Water</option>
          <option>Electricity</option>
          <option>Garbage</option>
          <option>Other</option>
        </select>
        <div style={{ margin: "11px 0 0 0" }}>
          <label style={{ color: "#eee", fontWeight: 400 }}>Photo (PNG/JPEG)
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'block', margin: "6px 0" }} />
          </label>
          {fileData && <img src={fileData} alt="Uploaded Issue" style={{ width: 80, display: 'block', borderRadius: 5, marginTop: 7 }} />}
        </div>
        <div>
          <label style={{ color: "#eee", fontWeight: 400 }}>Geolocation
            <input type="text" name="location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="Click to auto-fill" style={{ ...fieldStyle, width: '80%', marginLeft: 10 }} />
            <button type="button" className="btn" style={{ padding: "8px 14px", marginLeft: 8 }} onClick={handleGeo}>📍 Use My Location</button>
          </label>
        </div>
        <button className="btn btn-large" type="submit" style={{ marginTop: 11 }}>Submit Report</button>
      </form>
      {message && <div style={{ marginTop: 14, color: message.type === 'error' ? '#ff3333' : '#45ff8f' }}>{message.text}</div>}
    </div>
  );
}

// -------------------- StatusView --------------------

// PUBLIC_INTERFACE
function StatusView({ user, issues }) {
  return (
    <div className="hero" style={{ maxWidth: 650, margin: '0 auto' }}>
      <div className="title" style={{ fontSize: '2rem', marginBottom: 2 }}>My Submitted Issues</div>
      <div style={{ marginBottom: 18, color: '#ccc', fontSize: 14 }}>
        You have submitted <b>{issues.length}</b> {issues.length === 1 ? 'report' : 'reports'}.
      </div>
      {issues.length === 0 ? (
        <div>No reports yet. Submit an issue to see it here!</div>
      ) : (
        <div>
          {issues.slice().sort((a, b) => b.id - a.id).map(issue => (
            <div key={issue.id} style={{
              background: '#121316',
              color: '#eee',
              border: '1px solid #1d2129',
              borderRadius: 6,
              padding: 16,
              marginBottom: 18
            }}>
              <div style={{ fontWeight: 500, fontSize: 17 }}>{issue.title}</div>
              <div style={{ color: '#bbb', fontSize: 13, marginBottom: 4 }}>{issue.description}</div>
              <div style={{ marginBottom: 5, fontSize: 13 }}>
                <b>Type:</b> {issue.type} &nbsp; | &nbsp; <b>Status:</b> <span style={{
                  color: issue.status === 'Submitted' ? '#ffe25d' :
                    issue.status === 'In Progress' ? '#33e4fd' :
                      issue.status === 'Resolved' ? '#45ff8f' : '#ff0000'
                }}>{issue.status}</span>
              </div>
              <div style={{ fontSize: 12, marginBottom: 4 }}>
                <b>Reported:</b> {dateShort(issue.createdAt)}
                {issue.location &&
                  <> &nbsp; | &nbsp;<b>Location:</b> <span style={{ color: '#d2e1fb' }}>{issue.location}</span></>
                }
              </div>
              {issue.file &&
                <div style={{ marginTop: 5 }}>
                  <img src={issue.file} alt="Issue" style={{ width: 80, borderRadius: 4, border: "1.5px solid #333" }} />
                </div>
              }
              {issue.updates && issue.updates.length > 0 && (
                <div style={{ marginTop: 9, fontSize: 12 }}>
                  <b>Status Updates:</b>
                  <ul>
                    {issue.updates.map((upd, idx) => (
                      <li key={idx}>
                        <span>{upd.status}</span> ({dateShort(upd.at)})
                        {upd.adminNote && <span>: <i>{upd.adminNote}</i></span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------- AdminDashboard --------------------

// PUBLIC_INTERFACE
function AdminDashboard({ issues, onUpdateStatus, onDeleteIssue }) {
  const [filter, setFilter] = useState('All');
  const [note, setNote] = useState({});
  const filtered = filter === 'All' ? issues : issues.filter(i => i.status === filter);

  return (
    <div className="hero" style={{ alignItems: 'flex-start', maxWidth: 900 }}>
      <div className="title" style={{ fontSize: '2rem', marginBottom: 10 }}>Admin Dashboard</div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center', fontSize: 15 }}>
        <span>Filter:</span>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={fieldStyle}>
          <option>All</option>
          <option>Submitted</option>
          <option>In Progress</option>
          <option>Resolved</option>
          <option>Rejected</option>
        </select>
        <span style={{ color: "#ccc", marginLeft: 12 }}>Total: {filtered.length}</span>
      </div>
      <div style={{ width: '100%' }}>
        {filtered.length === 0 && (
          <div style={{ color: "#ccc", fontSize: 15 }}>No issues in this filter.</div>
        )}
        {filtered.slice().sort((a, b) => b.id - a.id).map(issue => (
          <div key={issue.id} style={{
            background: '#181927',
            color: '#eee',
            border: '1px solid #243042',
            borderRadius: 6,
            padding: 16,
            marginBottom: 19,
            width: '100%'
          }}>
            <div style={{ fontWeight: 500, fontSize: 16 }}>
              {issue.title}
              <span style={{ color: '#ff4343', fontWeight: 400, marginLeft: 16, fontSize: 14 }}>({issue.type})</span>
            </div>
            <div style={{ fontSize: 13, color: '#aaa' }}>{issue.description}</div>
            <div style={{marginTop: 2, fontSize: 12}}>
              <b>Reported by:</b> {issue.userName} | <b>User ID:</b> {issue.userId}
            </div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>
              <b>Status:</b> <span style={{
                color: issue.status === 'Submitted' ? '#ffe25d' :
                  issue.status === 'In Progress' ? '#33e4fd' :
                    issue.status === 'Resolved' ? '#45ff8f' : '#ff0000'
              }}>{issue.status}</span> | <b>Created:</b> {dateShort(issue.createdAt)}
            </div>
            {issue.location &&
              <div style={{ fontSize: 13 }}>
                <b>Location:</b> <span style={{ color: '#36ecff' }}>{issue.location}</span>
              </div>
            }
            <div style={{marginTop: 2, fontSize: 13}}>
              <b>Status Actions:</b>
              <button style={miniBtn('#ffe25d')} onClick={() => onUpdateStatus(issue.id, 'Submitted', note[issue.id])}>Submitted</button>
              <button style={miniBtn('#33e4fd')} onClick={() => onUpdateStatus(issue.id, 'In Progress', note[issue.id])}>In Progress</button>
              <button style={miniBtn('#45ff8f')} onClick={() => onUpdateStatus(issue.id, 'Resolved', note[issue.id])}>Resolved</button>
              <button style={miniBtn('#ff4343')} onClick={() => onUpdateStatus(issue.id, 'Rejected', note[issue.id])}>Rejected</button>
              <button style={miniBtn('#ff1111')} onClick={() => onDeleteIssue(issue.id)}>Delete</button>
            </div>
            <div style={{ fontSize: 12, marginTop: 2 }}>
              <input
                type="text"
                style={{ ...fieldStyle, fontSize: 12, padding: 7, margin: '2px 2px 0 0', width: 190, background: '#24292f' }}
                placeholder="Admin note for next status update"
                maxLength={60}
                value={note[issue.id] || ''}
                onChange={e => setNote(n => ({ ...n, [issue.id]: e.target.value }))}
              />
            </div>
            {issue.file &&
              <div style={{ marginTop: 7 }}>
                <img src={issue.file} alt="Issue" style={{ width: 80, borderRadius: 4, border: "1.5px solid #333" }} />
              </div>
            }
            {issue.updates && issue.updates.length > 0 && (
              <div style={{ marginTop: 9, fontSize: 12 }}>
                <b>Status Updates:</b>
                <ul>
                  {issue.updates.map((upd, idx) => (
                    <li key={idx}>
                      <span>{upd.status}</span> ({dateShort(upd.at)})
                      {upd.adminNote && <span>: <i>{upd.adminNote}</i></span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
const miniBtn = (color) => ({
  background: color,
  color: "#181927",
  border: "none",
  borderRadius: 4,
  padding: "7px 11px",
  margin: "0 7px 0 0",
  fontSize: 12,
  cursor: "pointer",
  fontWeight: 600
});

function dateShort(dt) {
  try {
    const d = new Date(dt);
    return d.toLocaleString(undefined, {
      year: '2-digit', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return dt;
  }
}

// -------------------- ContactPage --------------------

// PUBLIC_INTERFACE
function ContactPage() {
  return (
    <div className="hero" style={{ maxWidth: 550, margin: "0 auto" }}>
      <div className="title" style={{ fontSize: "2rem" }}>Contact CivicConnect</div>
      <div style={{ color: "#ccc", marginBottom: 8 }}>
        Get in touch with our support team for help or suggestions.
      </div>
      <div style={{
        background: "#141518",
        border: "1px solid #20222a",
        padding: 18, borderRadius: 7, color: "#eee", marginBottom: 17
      }}>
        <div><b>Email:</b> <a href="mailto:support@civicconnect.org" style={{ color: accentColor }}>support@civicconnect.org</a></div>
        <div><b>Phone:</b> <a href="tel:1234567890" style={{ color: accentColor }}>123-456-7890</a></div>
        <div><b>Address:</b> 123 Civic Ave, Metropolis City, 12345</div>
      </div>
    </div>
  );
}

// -------------------- DepartmentsPage --------------------

// PUBLIC_INTERFACE
function DepartmentsPage() {
  return (
    <div className="hero" style={{ maxWidth: 700, margin: "0 auto" }}>
      <div className="title" style={{ fontSize: "2rem" }}>Departments & Contacts</div>
      <div style={{ color: "#ccc", marginBottom: 12 }}>
        Reach the right department directly for issue-specific assistance.
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
        <DepartmentCard name="Public Works" email="pw@civicconnect.org" phone="123-555-4001" />
        <DepartmentCard name="Water & Sanitation" email="sanitation@civicconnect.org" phone="123-555-4002" />
        <DepartmentCard name="Road Maintenance" email="roads@civicconnect.org" phone="123-555-4003" />
        <DepartmentCard name="Electricity Board" email="electric@civicconnect.org" phone="123-555-4004" />
        <DepartmentCard name="Health & Hygiene" email="health@civicconnect.org" phone="123-555-4005" />
      </div>
    </div>
  );
}
function DepartmentCard({ name, email, phone }) {
  return (
    <div style={{
      background: "#181927", color: "#eee", border: "1px solid #243042", borderRadius: 6,
      padding: 18, minWidth: 200, maxWidth: 230
    }}>
      <div style={{ fontWeight: 600, color: "#ff0000", marginBottom: 2, fontSize: 17 }}>{name}</div>
      <div style={{ fontSize: 12 }}>
        <div><b>Email:</b> <a href={`mailto:${email}`} style={{ color: accentColor }}>{email}</a></div>
        <div><b>Phone:</b> <a href={`tel:${phone}`} style={{ color: accentColor }}>{phone}</a></div>
      </div>
    </div>
  );
}

export default App;
