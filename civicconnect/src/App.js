import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// PUBLIC_INTERFACE
function CivicConnectApp() {
  // Auth/session state
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    if (!u) return null;
    try {
      return JSON.parse(u);
    } catch {
      return null;
    }
  });
  // "user": {username, isAdmin: boolean}
  const [route, setRoute] = useState('home'); // home | login | register | issue | status | admin | contact
  const [flash, setFlash] = useState('');
  const [issues, setIssues] = useState(() => {
    // Array<issue>
    try {
      const val = localStorage.getItem('issues');
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  });

  // =========== Session Convenience ============
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);
  useEffect(() => {
    localStorage.setItem('issues', JSON.stringify(issues));
  }, [issues]);

  // =========== Routing Convenience ============
  function nav(to) {
    setRoute(to);
    setFlash('');
    window.scrollTo(0,0);
  }

  // ========== Authentication Helpers ==========
  function handleLogin(loginData) {
    // loginData: { username, password }
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const match = users.find(
      (u) =>
        u.username === loginData.username &&
        u.passwordHash === hashPw(loginData.password)
    );
    if (match) {
      setUser({ username: match.username, isAdmin: !!match.isAdmin });
      setFlash('Login successful');
      setRoute('home');
    } else {
      setFlash('Invalid credentials');
    }
  }

  function handleRegister(reg) {
    // reg: { username, password }
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find((u) => u.username === reg.username)) {
      setFlash('Username already exists');
      return;
    }
    // For demo, make first user admin
    const isAdmin = users.length === 0;
    users.push({
      username: reg.username,
      passwordHash: hashPw(reg.password),
      isAdmin,
    });
    localStorage.setItem('users', JSON.stringify(users));
    setUser({ username: reg.username, isAdmin });
    setFlash('Registration successful');
    setRoute('home');
  }

  function logout() {
    setUser(null);
    setRoute('home');
  }

  // ========== Issue Helpers ===================
  function handleReportIssue(issueData) {
    // issueData: { title, desc, type, location, photo }
    const newIssue = {
      id: Date.now().toString(),
      ...issueData,
      user: user ? user.username : 'anon',
      status: 'Reported',
      comments: [],
      createdAt: new Date().toISOString(),
    };
    setIssues([newIssue, ...issues]);
    setFlash('Issue reported successfully.');
    setRoute('status');
  }

  function handleUpdateIssue(issueId, updates) {
    setIssues(
      issues.map((iss) =>
        iss.id === issueId ? { ...iss, ...updates } : iss
      )
    );
    setFlash('Issue updated.');
  }

  function handleDeleteIssue(issueId) {
    setIssues(issues.filter((iss) => iss.id !== issueId));
    setFlash('Issue deleted.');
  }

  // =========== Render Routing =============
  let mainContent = null;
  switch (route) {
    case 'login':
      mainContent = <LoginForm onLogin={handleLogin} nav={nav} />;
      break;
    case 'register':
      mainContent = <RegisterForm onRegister={handleRegister} nav={nav} />;
      break;
    case 'issue':
      mainContent = user ? (
        <IssueReportForm onReport={handleReportIssue} nav={nav} />
      ) : (
        <PleaseLogin nav={nav} what="report issues"/>
      );
      break;
    case 'status':
      mainContent = user ? (
        <IssueList
          issues={issues.filter((i) => i.user === user.username)}
          canEdit={false}
          canView={true}
          nav={nav}
        />
      ) : (
        <PleaseLogin nav={nav} what="view your status"/>
      );
      break;
    case 'admin':
      mainContent = user && user.isAdmin ? (
        <AdminDashboard
          issues={issues}
          onUpdateIssue={handleUpdateIssue}
          onDeleteIssue={handleDeleteIssue}
        />
      ) : (
        <PleaseLogin nav={nav} what="access the admin dashboard" />
      );
      break;
    case 'contact':
      mainContent = <ContactDepartments />;
      break;
    default:
      mainContent = <Home nav={nav} user={user} />;
  }

  return (
    <div className="app">
      <Navbar
        user={user}
        nav={nav}
        onLogout={logout}
        route={route}
        setRoute={setRoute}
      />
      <main style={{flex: "1 0 auto", marginTop: 80, marginBottom: 56}}>
        <div className="container">
          {flash && <FlashMsg msg={flash}/>}
          {mainContent}
        </div>
      </main>
      <Footer nav={nav} />
    </div>
  );
}

// =================== Navbar Component =====================
function Navbar({ user, nav, onLogout, route, setRoute }) {
  const [open, setOpen] = useState(false);

  // Responsive: closes menu on main nav
  useEffect(() => { setOpen(false); }, [route]);

  return (
    <nav className="navbar" style={{backgroundColor: 'var(--base-dark)'}}>
      <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div
          className="logo"
          style={{cursor: "pointer"}}
          onClick={() => nav('home')}
        >
          <span className="logo-symbol" style={{color:'#00ffff'}}>&#9673;</span>
          CivicConnect
        </div>
        <div className="desktop-nav" style={{display: 'flex', gap: 16, alignItems:'center'}}>
          <NavLink label="Home" onClick={() => nav('home')} active={route==='home'}/>
          <NavLink label="Report Issue" onClick={() => nav('issue')} active={route==='issue'} />
          <NavLink label="Status" onClick={() => nav('status')} active={route==='status'} />
          <NavLink label="Contact" onClick={() => nav('contact')} active={route==='contact'} />
          {user && user.isAdmin && (
            <NavLink label="Admin" onClick={() => nav('admin')} active={route==='admin'}/>
          )}
          {!user && (
            <>
              <NavLink label="Login" onClick={() => nav('login')} active={route==='login'} />
              <NavLink label="Register" onClick={() => nav('register')} active={route==='register'} />
            </>
          )}
          {user && (
            <span style={{color:'#fff',marginRight:12}}>Hi, <b>{user.username}</b>!</span>
          )}
          {user && (
            <button
              className="btn"
              style={{background:'#222', color:'#fff', border:'1px solid #00ffff'}}
              onClick={onLogout}
            >Logout</button>
          )}
        </div>
        {/* Mobile menu button */}
        <button
          className="btn"
          aria-label="Menu"
          style={{display:'none'}}
          onClick={()=>setOpen(o=>!o)}
        >☰</button>
      </div>
    </nav>
  );
}

// ========== NavLink Subcomponent ===========
function NavLink({ label, onClick, active }) {
  return (
    <button
      className="btn"
      style={{
        backgroundColor: active ? "#00ffff" : "#000010",
        color: "#fff",
        border: "none",
        fontWeight: active ? "bold" : undefined,
        marginLeft: 2,
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// ============= FlashMsg ==============
function FlashMsg({ msg }) {
  return (
    <div
      style={{
        margin: '16px 0 8px 0',
        padding: '8px 20px',
        background: 'rgba(0,255,255,0.1)',
        color: '#00ffff',
        border: '1px solid #00ffff',
        borderRadius: 4,
        textAlign: 'center',
      }}>
      {msg}
    </div>
  );
}

// =========== Home Section ============
function Home({ nav, user }) {
  return (
    <section className="hero" style={{paddingTop:'48px'}}>
      <div className="subtitle">Citizen Services Platform</div>
      <h1 className="title" style={{color:'#00ffff'}}>CivicConnect</h1>
      <p className="description">
        CivicConnect helps you report civic issues, track status, and connect with city departments.<br/>
        {user
        ? "Ready to make a difference in your community?"
        : "Register or log in to get started — your city at your fingertips!"
        }
      </p>
      <div style={{display:'flex',gap:16,justifyContent:'center'}}>
        <button className="btn btn-large" onClick={()=>nav('issue')}>
          Report an Issue
        </button>
        {user
        ? <button className="btn btn-large" onClick={()=>nav('status')}>
            View Your Reports
          </button>
        : <>
            <button className="btn btn-large" onClick={()=>nav('register')}>Register</button>
            <button className="btn btn-large" onClick={()=>nav('login')}>Login</button>
          </>
        }
      </div>
    </section>
  );
}

// ============= Login/Registration ===============
// PUBLIC_INTERFACE
function LoginForm({ onLogin, nav }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  function submit(e) {
    e.preventDefault();
    onLogin({ username, password });
  }
  return (
    <section>
      <h2>Login</h2>
      <form onSubmit={submit} style={formStyle}>
        <FormField label="Username" type="text" value={username}
          onChange={e=>setUsername(e.target.value)} required />
        <FormField label="Password" type="password" value={password}
          onChange={e=>setPassword(e.target.value)} required />
        <button className="btn btn-large" type="submit">Login</button>
      </form>
      <p style={{marginTop:16}}>No account? <button onClick={()=>nav('register')} className="btn" style={{padding: '4px 14px'}}>Register</button></p>
    </section>
  );
}

// PUBLIC_INTERFACE
function RegisterForm({ onRegister, nav }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  function submit(e) {
    e.preventDefault();
    if (!username || !password) return;
    if (username.length < 3 || password.length < 5) {
      alert('Username or password too short');
      return;
    }
    onRegister({ username, password });
  }
  return (
    <section>
      <h2>Register</h2>
      <form onSubmit={submit} style={formStyle}>
        <FormField label="Username" type="text" value={username}
          onChange={e=>setUsername(e.target.value)} required />
        <FormField label="Password" type="password" value={password}
          onChange={e=>setPassword(e.target.value)} required />
        <button className="btn btn-large" type="submit">Register</button>
      </form>
      <p style={{marginTop:16}}>Already have an account? <button onClick={()=>nav('login')} className="btn" style={{padding: '4px 14px'}}>Login</button></p>
    </section>
  );
}

// ============= Please Login Prompt ===========
function PleaseLogin({ nav, what }) {
  return (
    <div style={{margin:'36px 0',textAlign:'center'}}>
      <b>You must be logged in to {what}.</b><br/>
      <button className="btn" onClick={()=>nav('login')}>Login</button>
      <button className="btn" onClick={()=>nav('register')}>Register</button>
    </div>
  );
}

// ============== Issue Report Form =============
// PUBLIC_INTERFACE
function IssueReportForm({ onReport, nav }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('Pothole');
  const [photo, setPhoto] = useState(null);
  const [photoData, setPhotoData] = useState(null);
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  const [loadingLoc, setLoadingLoc] = useState(false);

  // Geolocation
  function fetchLocation() {
    setLoadingLoc(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
          setLocation(coords);
          setLoadingLoc(false);
        },
        (err) => {
          setStatus("Could not obtain geolocation.");
          setLoadingLoc(false);
        }
      );
    } else {
      setStatus("Geolocation API not supported.");
      setLoadingLoc(false);
    }
  }
  // Handle photo preview
  function handlePhoto(e) {
    const file = e.target.files[0];
    setPhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoData(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setPhotoData(null);
    }
  }
  function submit(e) {
    e.preventDefault();
    if (!(title && desc && type)) {
      setStatus('Please fill all required fields.');
      return;
    }
    const reporting = {
      title: sanitize(title),
      desc: sanitize(desc),
      type: sanitize(type),
      photo: photoData || '',
      location: sanitize(location),
    };
    onReport(reporting);
  }
  return (
    <section>
      <h2>Report an Issue</h2>
      <form onSubmit={submit} style={formStyle}>
        <FormField label="Title" type="text"
          value={title} onChange={e=>setTitle(e.target.value)} required maxLength={40}/>
        <FormField label="Description" type="textarea"
          value={desc} onChange={e=>setDesc(e.target.value)} required maxLength={160}/>
        <FormField label="Type" type="select"
          value={type} onChange={e=>setType(e.target.value)}
          options={['Pothole', 'Streetlight', 'Garbage', 'Water Leak', 'Other']} />
        <div style={{margin:'8px 0'}}>
          <label style={labelStyle}>
            Photo (optional):
            <input type="file" accept="image/*"
                style={{marginLeft:10}} onChange={handlePhoto} />
          </label>
          {photoData && (
            <img src={photoData} alt="Preview"
                 style={{maxWidth:80,maxHeight:80,border:'1px solid #00ffff',marginTop:8}} />
          )}
        </div>
        <div style={{margin:'8px 0'}}>
          <label style={labelStyle}>
            Location:
            <input
              type="text"
              value={location}
              onChange={e=>setLocation(e.target.value)}
              placeholder="Click to autofill"
              style={{marginLeft:8,minWidth:120}}
              maxLength={96}
            />
            <button
              className="btn"
              style={{marginLeft:12,padding:'6px 12px'}}
              type="button"
              onClick={fetchLocation}
              disabled={loadingLoc}
            >
              {loadingLoc ? "Detecting..." : "Autofill"}
            </button>
          </label>
        </div>
        <button className="btn btn-large" type="submit">Submit Issue</button>
        <button className="btn" type="button" style={{marginLeft:12}} onClick={()=>nav('home')}>Cancel</button>
      </form>
      {status && <div style={{marginTop:12, color:'#ff7070'}}>{status}</div>}
    </section>
  );
}

// =============== Issue List ===============
function IssueList({ issues, canEdit = false, canView = true, nav }) {
  if (!issues.length)
    return (<div style={{margin:'36px 0', textAlign:'center'}}>No issues found.</div>);
  return (
    <section>
      <h2>Your Issues</h2>
      <ul style={{
        listStyle: 'none', 
        padding: 0, 
        marginTop: 16
      }}>
        {issues.map((iss) => (
          <li
            style={{
              background: 'rgba(0,255,255,0.09)',
              border: '1px solid #00ffff18',
              borderRadius: 8,
              marginBottom: 16,
              padding: 18,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 18,
              flexWrap: 'wrap'
            }}
            key={iss.id}
          >
            {iss.photo && (
              <img
                src={iss.photo}
                alt="Issue"
                style={{
                  maxWidth: '80px',
                  maxHeight: '80px',
                  borderRadius: 6,
                  border: '1px solid #00ffff'
                }}
              />
            )}
            <div style={{flex:1,minWidth:240}}>
              <b style={{fontSize:18,color:'#fff'}}>{iss.title}</b> 
              <div style={{margin:"4px 0 4px 0"}}>Reported: <span style={{color:"#ccc"}}>{niceDate(iss.createdAt)}</span></div>
              <div><b>Type:</b> {iss.type}</div>
              <div><b>Description:</b> <span style={{color:'#89f'}}>{iss.desc}</span></div>
              <div><b>Location:</b> <span style={{color:'#affa'}}>{iss.location || "N/A"}</span></div>
            </div>
            <div style={{minWidth:160}}>
              <div><b>Status:</b> <span style={{
                color: iss.status === "Closed" ? "#0ff" : "#ff0"
              }}>{iss.status}</span></div>
              <div style={{margin:"6px 0"}}>&nbsp;</div>
              {canEdit && (
                <button
                  className="btn"
                  style={{ backgroundColor: "#1a1a1a", color: "#fff", marginBottom: 6}}
                  onClick={()=>nav('edit-'+iss.id)}
                >Update</button>
              )}
              {/* For users: maybe show "details" per-design */}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// =============== Admin Dashboard ==============
function AdminDashboard({ issues, onUpdateIssue, onDeleteIssue }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter==='all'
    ? issues
    : issues.filter((i)=>i.status===filter);

  function handleStatusChange(id, e) {
    onUpdateIssue(id, { status: e.target.value });
  }
  return (
    <section>
      <h2>Admin Dashboard</h2>
      <div>
        <label style={labelStyle}>Filter:
          <select style={inputStyle}
            value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="Reported">Reported</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
        </label>
      </div>
      <ul style={{
        listStyle: 'none', padding: 0, marginTop: 16
      }}>
        {filtered.map((iss) => (
          <li key={iss.id}
              style={{
                border: '2px solid #00ffff',
                borderRadius: 8,
                marginBottom: 18,
                padding: 18,
                background: 'rgba(0,0,32,0.7)'
              }}>
            <div><b style={{fontSize:17}}>{iss.title}</b></div>
            <div><b>User:</b> {iss.user}</div>
            <div><b>Type:</b> {iss.type}</div>
            <div><b>Description:</b> <span style={{color:'#89f'}}>{iss.desc}</span></div>
            <div><b>Location:</b> <span style={{color:'#affa'}}>{iss.location}</span></div>
            <div>
              <b>Reported:</b> <span style={{color:'#ccc'}}>{niceDate(iss.createdAt)}</span>
            </div>
            {iss.photo && (
              <div style={{margin:"8px 0"}}>
                <img src={iss.photo} alt="Issue" style={{maxWidth:100,maxHeight:100, border:'1px solid #00ffff'}}/>
              </div>
            )}
            <div>
              <b>Status:</b>
              <select
                style={{
                  ...inputStyle,
                  marginLeft: 8,
                  width: 130,
                  color: iss.status==="Closed" ? '#0ff' : '#ff0'
                }}
                value={iss.status}
                onChange={(e)=>handleStatusChange(iss.id,e)}
              >
                <option value="Reported">Reported</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
              <button
                className="btn"
                style={{marginLeft:16,background:'#170', color:'#fff'}}
                onClick={()=>onDeleteIssue(iss.id)}
              >Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ============== Contact/Departments ===========
function ContactDepartments() {
  return (
    <section>
      <h2>Contact Information &amp; Departments</h2>
      <div style={{margin:'16px 0'}}>
        <b>General Inquiries:</b> <a href="mailto:info@civicconnect.com" style={{color:'#00ffff'}}>info@civicconnect.com</a>
      </div>
      <div>
        <b>Departments</b>
        <ul>
          <li><b>Public Works:</b> <span style={{color:'#00ffff'}}>pw@civicconnect.com</span></li>
          <li><b>Sanitation:</b> <span style={{color:'#00ffff'}}>sanitation@civicconnect.com</span></li>
          <li><b>Water Department:</b> <span style={{color:'#00ffff'}}>water@civicconnect.com</span></li>
        </ul>
      </div>
    </section>
  );
}

// =============== Footer Component =============
function Footer({ nav }) {
  return (
    <footer
      style={{
        background: '#0a0a2f',
        color: '#aaa',
        textAlign: 'center',
        padding: '12px 0',
        borderTop: "1px solid #222",
        marginTop:'36px',
        fontSize: '1rem',
        position: 'relative',
        width: '100%',
        flexShrink:0,
      }}
    >
      <div>
        <span style={{color:'#00ffff',fontWeight:500}}>CivicConnect</span> &copy; {new Date().getFullYear()} &mdash;&nbsp;
        <button className="btn" style={{color:"#00ffff",background:'transparent',fontSize:'1rem',padding:'2px 14px'}} onClick={()=>nav('contact')}>Contact</button>
      </div>
    </footer>
  );
}

// ==================== Shared Subcomponents ====================
const formStyle = { maxWidth: 340, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18, background:'#051921b8',padding:'36px 16px', borderRadius:8, border:'1px solid #00ffff38' };
const labelStyle = {color:'#fff',marginRight:8,fontWeight:500,display:'block',marginBottom:2};
const inputStyle = {padding:'7px 8px',borderRadius:4,border:'1.5px solid #00ffff66',marginTop:1,minWidth:180,background:'#1a1a2b',color:'#fff'};

// PUBLIC_INTERFACE
function FormField({ label, type, value, onChange, options, ...rest }) {
  if (type === 'textarea')
    return (
      <label style={labelStyle}>
        {label}:
        <textarea style={{...inputStyle,minHeight:60, resize:'vertical'}}
          value={value} onChange={onChange} {...rest}/>
      </label>
    );
  if (type === 'select')
    return (
      <label style={labelStyle}>
        {label}:
        <select style={inputStyle} value={value} onChange={onChange} {...rest}>
          {options.map((o) => <option value={o} key={o}>{o}</option>)}
        </select>
      </label>
    );
  return (
    <label style={labelStyle}>
      {label}:
      <input style={inputStyle} type={type} value={value} onChange={onChange} {...rest}/>
    </label>
  );
}

// ========== Utility Functions ================
function hashPw(password) {
  // NOT SECURE in real life; demo only. This is a simple reversible rot13 + salt
  const salt = 'civic20';
  return btoa([...password+salt].map(c =>
    String.fromCharCode(c.charCodeAt(0) ^ 0x19)
  ).join(''));
}
function sanitize(str) {
  // Remove < > and " and single quotes, basic XSS/SQLi demofix.
  return String(str).replace(/[<>"'\\;]/g, '');
}
function niceDate(dateStr) {
  // Outputs: MM/DD/YY, h:mm am/pm
  try {
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString() +
      ', ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  } catch {
    return dateStr;
  }
}

export default CivicConnectApp;
