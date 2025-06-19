import React, { useState, useEffect, useRef } from 'react';
import './App.css';

/*
  UI/UX Refactor Notes

  - New reusable Button and Modal components
  - Improved Navbar: more responsive, modern, animated
  - Color/contrast updated for all elements following dark theme
  - Modernized spacing; improved flex/grid layout usage
  - Better feedback for actions: loading, disabling, subtle transitions
  - Responsive design: layout and controls adapt at all breakpoints
  - Accessibility: improved labelling, focus states, ARIA for modals/menus
  - All components styled primarily with modern CSS-in-JS inline (fallbacks remain className for main theme)
  - Visual polish increased for feedback, overlay, and interactions
*/

/**
 * PUBLIC_INTERFACE
 * Main CivicConnect App (UI/UX refactor)
 */
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
  const [route, setRoute] = useState('home');
  const [flash, setFlash] = useState('');
  const [issues, setIssues] = useState(() => {
    try {
      const val = localStorage.getItem('issues');
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  });

  // Modal state (for confirmation dialogs, reusable elsewhere)
  const [modal, setModal] = useState({ open: false, title: "", content: null, onConfirm: null });

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

  // ======= Issue Helpers =======
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
    // Use modal for confirmation
    setModal({
      open: true,
      title: "Delete Issue",
      content: (
        <div>
          Are you sure you want to delete this issue? <br />
          This action <b>cannot</b> be undone.
        </div>
      ),
      onConfirm: () => {
        setIssues(issues.filter((iss) => iss.id !== issueId));
        setFlash('Issue deleted.');
        setModal({ ...modal, open: false }); // close
      }
    });
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

  // Gradient for main dark background
  const mainGradient = {
    background: 'linear-gradient(135deg, #000 0%, #1a0000 40%, #ff0000 100%)',
    minHeight: "100dvh",
    transition: "background 0.7s cubic-bezier(.77,.01,.46,1)",
  };

  return (
    <div className="app" tabIndex={-1} style={mainGradient}>
      <Navbar
        user={user}
        nav={nav}
        onLogout={logout}
        route={route}
        setRoute={setRoute}
      />
      <main style={{
        flex: "1 0 auto",
        marginTop: 80, marginBottom: 56,
        minHeight: "calc(100dvh - 136px)",
        transition: "background 0.45s cubic-bezier(.63,.16,.49,1), color 0.3s"
      }}>
        <div className="container" style={{ transition: "all 0.22s" }}>
          {flash && <FlashMsg msg={flash} onClose={()=>setFlash('')}/>}
          {mainContent}
        </div>
      </main>
      <Footer nav={nav} />
      {/* Universal modal for confirmations, alerts, onboarding etc */}
      <Modal
        open={modal.open}
        title={modal.title}
        onClose={() => setModal({ ...modal, open: false })}
        onConfirm={modal.onConfirm ? () => { modal.onConfirm(); setModal({ ...modal, open: false }); } : undefined}
      >
        {modal.content}
      </Modal>
    </div>
  );
}

// ======== Universal Action Button & Modal ==========
// PUBLIC_INTERFACE
function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "medium",
  disabled = false,
  style = {},
  ...props
}) {
  // Visual variants, unified theme
  // Brand-aligned gradient color theme for CTAs
  const color = {
    primary: {
      background: "linear-gradient(90deg, #000 0%, #ff0000 88%, #fff 100%)",
      color: "#fff",
      border: "none",
      boxShadow: "0 4px 18px #ff000055, 0 2px 5px #fff4"
    },
    secondary: {
      background: "linear-gradient(90deg, #232323 0%, #ff0000 90%)",
      color: "#fff",
      border: "1.5px solid #ff0000",
    },
    outlined: {
      background: "linear-gradient(90deg, #fff 0%, #000 90%)",
      color: "#000",
      border: "2px solid #fff"
    },
    danger: {
      background: "linear-gradient(100deg, #520000 0%, #ff0000 100%)",
      color: "#fff",
      border: "none"
    },
    success: {
      background: "linear-gradient(90deg, #e0ffe2 0%, #43ff84 100%)",
      color: "#103d13",
      border: "none"
    }
  }[variant] || {};
  const sizeStyle = {
    small: { padding: "6px 14px", fontSize: "0.96rem" },
    medium: { padding: "10px 22px", fontSize: "1.05rem" },
    large: { padding: "14px 30px", fontSize: "1.13rem" }
  }[size] || {};

  return (
    <button
      type={type}
      className="btn"
      tabIndex={0}
      disabled={disabled}
      style={{
        borderRadius: 6,
        boxShadow: disabled ? "none" : "0 0 0 1.7px #10b6d9, 0 2px 8px 0 #002f50b0",
        opacity: disabled ? 0.62 : 1,
        outline: "none",
        border: "none",
        fontWeight: 600,
        letterSpacing: 0.05,
        transition: "background-color 0.2s, color 0.2s, box-shadow 0.2s",
        cursor: disabled ? "not-allowed" : "pointer",
        ...color,
        ...sizeStyle,
        ...style,
      }}
      aria-disabled={!!disabled}
      onClick={disabled ? undefined : onClick}
      {...props}
    >
      {children}
    </button>
  );
}

// PUBLIC_INTERFACE
function Modal({ open, title, onClose, onConfirm, children }) {
  // Animation and focus for accessibility
  const modalRef = useRef(null);
  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  // Esc key closes modal
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || "Dialog"}
      tabIndex={-1}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,8,40,0.77)",
        zIndex: 9750, display: "flex", alignItems: "center", justifyContent: "center"
      }}
      onClick={onClose}
      onKeyDown={e => { if (e.key === "Escape") onClose && onClose(); }}
    >
      <div
        ref={modalRef}
        style={{
          background: "#191e34",
          color: "#f0ffff",
          minWidth: 330, maxWidth: 420,
          padding: "38px 32px 21px 32px",
          boxShadow: "0 6px 60px 0 #44f2ff40, 0 0 0 2.7px #00ffff66",
          borderRadius: 12,
          position: "relative",
          outline: "none",
          pointerEvents: "all",
          animation: "modalin 0.14s cubic-bezier(.63,1.22,.5,1)",
        }}
        tabIndex={0}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 19, fontWeight: 700, color: "#00ffff", letterSpacing: 0.05, marginBottom: 18 }}>
          {title}
        </div>
        <div style={{ fontSize: 16, marginBottom: 24 }}>
          {children}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}>
          <Button variant="outlined" onClick={onClose}>Cancel</Button>
          {onConfirm && (
            <Button variant="danger" onClick={onConfirm} style={{ minWidth: 80 }}>Confirm</Button>
          )}
        </div>
      </div>
      <style>
        {`@keyframes modalin { from { transform: translateY(16px) scale(.98); opacity:0.5; }
        to { transform: translateY(0) scale(1); opacity:1; } } `}
      </style>
    </div>
  );
}

// =================== Navbar Component =====================
function Navbar({ user, nav, onLogout, route }) {
  const [open, setOpen] = useState(false);
  // Responsive: closes menu on route change
  useEffect(() => { setOpen(false); }, [route]);

  // Mobile nav: show hamburger at narrow widths, slide in/out
  return (
    <nav className="navbar" style={{
      backgroundColor: 'var(--base-dark)',
      boxShadow: "0 2px 10px 0 #00f2ffc5",
      borderBottom: "1.5px solid var(--border-color)",
      transition: "box-shadow 0.22s"
    }}>
      <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between', gap:16,paddingRight:0}}>
        <div
          className="logo"
          tabIndex={0}
          style={{cursor: "pointer", outline:'none'}}
          onClick={() => nav('home')}
          aria-label="Go to homepage"
        >
          <span className="logo-symbol" style={{color:'#00ffff', fontSize:26, verticalAlign:"middle"}}>&#9673;</span>
          <span style={{marginLeft:6,letterSpacing:0.05}}>CivicConnect</span>
        </div>
        {/* Desktop Nav */}
        <div
          className="desktop-nav"
          style={{
            display: 'flex',
            gap: 13,
            alignItems: 'center',
            flexWrap: "wrap",
            minWidth: 0,
            transition: "all 0.22s"
          }}
        >
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
            <span style={{
              color:'#EEE', fontSize:16, marginLeft:2,
              background: "rgba(0,255,255,0.04)", borderRadius: 6, padding: '5px 13px 5px 10px',
              border: "1px solid #00fff318", letterSpacing: ".01em"
            }}>
              Hi, <b>{user.username}</b>!
            </span>
          )}
          {user && (
            <Button
              variant="outlined"
              onClick={onLogout}
              size="small"
              style={{marginLeft:10, padding:"5px 18px"}}
            >Logout</Button>
          )}
        </div>
        {/* Hamburger mobile button */}
        <button
          className="btn"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(o=>!o)}
          style={{
            display:'none',
            marginLeft:15,
            fontSize:25,
            padding: '6px 12px',
            background: open ? "#00ffffbb" : "#151f3d",
            color: "#fff",
            border: 'none',
            borderRadius: 6,
            transition: "all 0.2s"
          }}
        >☰</button>
      </div>
      {/* Responsive nav for mobile */}
      <div
        style={{
          display: open ? 'block' : 'none',
          background: "#091229ee",
          color: "#f7ffff",
          position: "absolute",
          top: 56,
          width: "100vw",
          left: 0,
          textAlign: "center",
          boxShadow: "0 8px 40px #00f5ff18",
          zIndex: 120
        }}
        tabIndex={-1}
      >
        <div style={{padding:"18px 0", display: "flex", flexDirection:"column", gap:13}}>
          <NavLink label="Home" onClick={() => { nav('home'); setOpen(false); }} active={route==='home'}/>
          <NavLink label="Report Issue" onClick={() => { nav('issue'); setOpen(false); }} active={route==='issue'} />
          <NavLink label="Status" onClick={() => { nav('status'); setOpen(false); }} active={route==='status'} />
          <NavLink label="Contact" onClick={() => { nav('contact'); setOpen(false); }} active={route==='contact'} />
          {user && user.isAdmin && (
            <NavLink label="Admin" onClick={() => { nav('admin'); setOpen(false); }} active={route==='admin'}/>
          )}
          {!user && (
            <>
              <NavLink label="Login" onClick={() => { nav('login'); setOpen(false); }} active={route==='login'} />
              <NavLink label="Register" onClick={() => { nav('register'); setOpen(false); }} active={route==='register'} />
            </>
          )}
          {user && (
            <Button
              variant="outlined"
              size="small"
              style={{margin:"0 auto", width:130}}
              onClick={() => { onLogout(); setOpen(false); }}
            >Logout</Button>
          )}
        </div>
      </div>
    </nav>
  );
}

// ========== NavLink Subcomponent ===========
function NavLink({ label, onClick, active }) {
  return (
    <Button
      variant={active ? "primary" : "secondary"}
      size="small"
      onClick={onClick}
      style={{
        border: active ? "2.4px solid #00ffff" : undefined,
        fontWeight: active ? 800 : 500,
        boxShadow: active ? "0 2px 10px #00ffd966" : undefined,
        marginLeft: 1,
        letterSpacing: ".01em",
        minWidth: 87,
        borderRadius: 6,
        transition: "background 0.19s, color .16s, box-shadow .21s"
      }}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Button>
  );
}

// ============= FlashMsg ==============
function FlashMsg({ msg, onClose }) {
  // Animate in/out, allow dismiss
  const [show, setShow] = useState(true);
  useEffect(() => {
    if (!msg) return;
    setShow(true);
    const closeTimer = setTimeout(() => setShow(false), 3800);
    return () => clearTimeout(closeTimer);
  }, [msg]);
  useEffect(() => {
    if (!show && onClose) onClose();
  }, [show]);
  if (!msg || !show) return null;
  return (
    <div
      style={{
        margin: '16px 0 8px 0',
        padding: '10px 22px',
        background: 'rgba(0,255,255,0.13)',
        color: '#1ad2ff',
        border: '1.7px solid #1ad2ff',
        borderRadius: 7,
        textAlign: 'center',
        position: "relative",
        fontWeight: 600,
        fontSize: 16,
        animation: "fadeInFlash 0.17s",
        boxShadow: "0 2px 10px #00f2ff11"
      }}>
      {msg}
      <button
        aria-label="Close"
        style={{
          position: "absolute",
          right: 11, top: 7,
          background: "none", color: "#00ffff", border: "none", fontSize: 20, cursor: "pointer", opacity:0.7
        }}
        onClick={() => setShow(false)}
        tabIndex={0}
      >×</button>
      <style>
        {`@keyframes fadeInFlash { from { opacity:0; transform:translateY(-10px);}
          to {opacity:1; transform:translateY(0);} }`}
      </style>
    </div>
  );
}
/**
 * Refined hero section with improved visual hierarchy, spacing, contrast, and accessible, branded buttons using new Button component.
 */
/**
 * PUBLIC_INTERFACE
 * Home/Landing section with dark-gradient, responsive layout, and brand-aligned CTAs.
 */
function Home({ nav, user }) {
  // Responsive window width
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const smallScreen = windowWidth < 700;
  const smallerGap = windowWidth < 800;

  return (
    <section
      className="hero"
      style={{
        paddingTop: smallScreen ? 32 : 70,
        paddingBottom: smallScreen ? 36 : 64,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 27,
        transition: "all 0.17s",
        background: "linear-gradient(120deg, #101010 0%, #550000 50%, #ff0000 120%)",
        borderRadius: "24px",
        boxShadow: "0 0 80px #ff0000a4, 0 2px 24px #0004",
        margin: "0 0 38px 0",
      }}
      aria-labelledby="civicconnect-title"
    >
      <div
        className="subtitle"
        style={{
          color: "#ff7070",
          fontWeight: 600,
          fontSize: "1.12rem",
          letterSpacing: 0.08,
          marginBottom: 4,
          textShadow: "0 2px 12px #000"
        }}
      >
        Citizen Services Platform
      </div>
      <h1
        id="civicconnect-title"
        className="title"
        style={{
          background: "linear-gradient(94deg, #fff 0%, #ff0000 40%, #000 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontSize: smallScreen ? "2.15rem" : "3.57rem",
          fontWeight: 800,
          lineHeight: 1.12,
          margin: 0,
          letterSpacing: ".01em",
          textShadow: "0 2px 22px #ff000044, 0 1px 1px #000"
        }}
      >
        CivicConnect
      </h1>
      <p
        className="description"
        style={{
          fontSize: smallScreen ? "1rem" : "1.15rem",
          lineHeight: 1.6,
          color: "#fff",
          maxWidth: 610,
          margin: "0 auto 18px auto",
          textShadow: "0 2px 13px #090909ee, 0 1px 1px #fff2",
          transition: "all 0.17s"
        }}
      >
        CivicConnect helps you report civic issues, track status, and connect with city departments.
        <br />
        {user
          ? <span style={{ color: "#fff", fontWeight: 700 }}>
              Ready to make a difference in your community?
            </span>
          : <span style={{ color: "#ff0000", fontWeight: 700 }}>
              Register or log in to get started — your city at your fingertips!
            </span>
        }
      </p>
      <div
        style={{
          display: "flex",
          gap: smallerGap ? 10 : 22,
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: 10,
          transition: "gap 0.18s"
        }}
      >
        <Button
          variant="primary"
          size="large"
          style={{
            minWidth: 165,
            fontWeight: 700,
            background: "linear-gradient(90deg, #ff2a2a 0%, #fff 75%, #ff0000 100%)",
            color: "#000",
            boxShadow: "0 5px 26px #ff0000a2, 0 2px 6px #fff5",
            border: "none",
            transition: "background 0.3s, color 0.3s",
          }}
          onClick={() => nav('issue')}
        >
          Report an Issue
        </Button>
        {user ? (
          <Button
            variant="outlined"
            size="large"
            style={{
              minWidth: 165,
              fontWeight: 700,
              background: "linear-gradient(90deg, #000 0%, #333 93%, #ff0000 100%)",
              color: "#fff",
              border: "2.2px solid #ff0000",
              boxShadow: "0 1px 14px #9e000051"
            }}
            onClick={() => nav('status')}
          >
            View Your Reports
          </Button>
        ) : (
          <>
            <Button
              variant="outlined"
              size="large"
              style={{
                minWidth: 130,
                fontWeight: 600,
                background: "linear-gradient(100deg, #fff 0%, #ff0000 85%)",
                color: "#000",
                border: "2.2px solid #fff",
                boxShadow: "0 1px 9px #fff9",
              }}
              onClick={() => nav('register')}
            >
              Register
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{
                minWidth: 104,
                fontWeight: 600,
                background: "linear-gradient(120deg, #121212 0%, #ff0000 80%)",
                color: "#fff",
                border: "2.2px solid #ff0000",
                boxShadow: "0 1px 7px #9003",
              }}
              onClick={() => nav('login')}
            >
              Login
            </Button>
          </>
        )}
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
