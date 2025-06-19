import React, { useState, useEffect, useRef } from 'react';
import './App.css';

/*
  UI/UX Dark Theme Refactor

  - Applies new dark green, black, and brown color palette as variables/constants for maintainability.
  - All core UI components (navbar, hero, forms, cards, modals, feedback, CTAs) are re-styled for modern dark UI/UX, accessibility, and responsiveness.
  - Uses flexbox/grid and media queries for robust layout on all breakpoints (mobile/tablet/desktop).
  - Color, spacing, font, elevation, and transitions tuned for visual hierarchy and clarity in low-light interfaces.
  - Inline styles use centralized color constants; CSS classes implement structure and typography best practices.
*/

// Dark green, black, and brown palette for UI theme
const PALETTE = {
  primary: "#14532d",       // dark green
  secondary: "#231f20",     // near-black
  accent: "#a68a64",        // brown
  background: "#121212",    // nearly black
  surface: "#19241b",       // deep olive
  on_primary: "#ffffff",    // white on green
  on_secondary: "#f0e8d9",  // light beige for dark backgrounds
  focus: "#308865",         // highlight
  border: "#353326",        // brownish-gray border
  error: "#9a4218",         // accent brown-red
  shadow: "0 2px 18px rgba(20, 83, 45, 0.14), 0 0 0 1.5px #2d2520cc"
};
const BREAKPOINTS = {
  mobile: 0,
  tablet: 700,
  desktop: 992
};

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

  // Main dark theme background with subtle gradient and soft surface overlay
  const mainGradient = {
    background: `linear-gradient(115deg, ${PALETTE.background} 0%, ${PALETTE.surface} 50%, ${PALETTE.secondary} 120%)`,
    minHeight: "100dvh",
    transition: "background 0.7s cubic-bezier(.77,.01,.46,1)",
    color: PALETTE.on_secondary
  };

  return (
    <div className="app" tabIndex={-1} style={mainGradient}>
      {/* HEADER with "cityfix" site name - visually distinct, above nav */}
      <header
        style={{
          width: "100%",
          background: `linear-gradient(100deg, ${PALETTE.secondary} 40%, ${PALETTE.primary} 100%)`,
          borderBottom: `2px solid ${PALETTE.border}`,
          boxShadow: "0 2px 16px 0 #13290f33, 0 0 0 1.6px #57442dcc",
          padding: "clamp(13px, 5vw, 28px) 0 14px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          position: "relative"
        }}
      >
        <h1
          style={{
            fontFamily: "inherit",
            fontWeight: 1000,
            fontSize: "clamp(2.5rem, 8vw, 4.8rem)",
            letterSpacing: "0.04em",
            color: PALETTE.accent,
            textShadow: `0 3px 22px ${PALETTE.primary}60, 0 1.5px 10px #fff3`,
            background: `linear-gradient(92deg, ${PALETTE.accent} 0%, #fff 55%, ${PALETTE.primary} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1.05,
            textAlign: "center",
            margin: 0,
            padding: 0,
            userSelect: "none",
            width: "100%",
            transition: "font-size 0.2s, color 0.2s"
          }}
          aria-label="cityfix homepage"
        >
          cityfix
        </h1>
      </header>
      {/* NAVBAR - visually below header */}
      <Navbar
        user={user}
        nav={nav}
        onLogout={logout}
        route={route}
        setRoute={setRoute}
        colors={PALETTE}
      />
      <main style={{
        flex: "1 0 auto",
        marginTop: 80,
        marginBottom: 56,
        minHeight: "calc(100dvh - 136px)",
        transition: "background 0.45s cubic-bezier(.63,.16,.49,1), color 0.3s",
        background: PALETTE.background
      }}>
        <div
          className="container"
          style={{
            background: "none",
            transition: "all 0.22s",
            boxShadow: "none"
          }}
        >
          {flash && <FlashMsg msg={flash} onClose={() => setFlash('')} colors={PALETTE} />}
          {mainContent}
        </div>
      </main>
      <Footer nav={nav} colors={PALETTE} />
      {/* Universal modal for confirmations, alerts, onboarding etc */}
      <Modal
        open={modal.open}
        title={modal.title}
        onClose={() => setModal({ ...modal, open: false })}
        onConfirm={
          modal.onConfirm ? () => { modal.onConfirm(); setModal({ ...modal, open: false }); } : undefined
        }
        colors={PALETTE}
      >
        {modal.content}
      </Modal>
    </div>
  );
}

// ======== Universal Action Button & Modal ==========
/**
 * PUBLIC_INTERFACE
 * Themed action Button for all use cases. Adapts to dark theme variants.
 */
function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "medium",
  disabled = false,
  style = {},
  colors = PALETTE,
  ...props
}) {
  // Centralized color variants for easy tuning
  const theme = colors || PALETTE;
  const color = {
    primary: {
      background: `linear-gradient(93deg, ${theme.primary} 75%, ${theme.accent} 100%)`,
      color: theme.on_primary,
      border: "none",
      boxShadow: !disabled
        ? `0 2px 16px ${theme.primary}44, 0 1.5px 8px ${theme.accent}22`
        : "none"
    },
    secondary: {
      background: `linear-gradient(90deg, ${theme.secondary} 44%, ${theme.surface} 90%)`,
      color: theme.on_secondary,
      border: `1.3px solid ${theme.accent}`,
      boxShadow: !disabled ? "0 1px 6px #12140e44" : "none"
    },
    outlined: {
      background: "none",
      color: theme.accent,
      border: `2px solid ${theme.accent}`,
      boxShadow: "none"
    },
    danger: {
      background: `linear-gradient(100deg, ${theme.error} 0%, ${theme.secondary} 89%)`,
      color: theme.on_secondary,
      border: `1.6px solid ${theme.error}`,
      boxShadow: !disabled ? "0 2px 9px #9a421820" : "none"
    },
    success: {
      background: `linear-gradient(92deg, #2e6d27 0%, #35844a 100%)`,
      color: "#d8f3dd",
      border: `1.4px solid #308865`,
      boxShadow: !disabled ? "0 2px 9px #35844a22" : "none"
    }
  }[variant] || {};
  const sizeStyle = {
    small: { padding: "7px 17px", fontSize: "1rem" },
    medium: { padding: "11px 25px", fontSize: "1.09rem" },
    large: { padding: "15px 34px", fontSize: "1.21rem" }
  }[size] || {};

  return (
    <button
      type={type}
      className="btn"
      tabIndex={0}
      disabled={disabled}
      style={{
        borderRadius: 7,
        opacity: disabled ? 0.62 : 1,
        outline: "none",
        fontWeight: 700,
        letterSpacing: 0.03,
        transition: "background 0.22s, color 0.18s, box-shadow 0.19s, border 0.15s, filter 0.11s",
        cursor: disabled ? "not-allowed" : "pointer",
        filter: disabled ? "grayscale(30%)" : undefined,
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

/*
// PUBLIC_INTERFACE
 * Modal component: refactored so all hooks are always called (never conditionally).
 */
function Modal({ open, title, onClose, onConfirm, children, colors = PALETTE }) {
  // Animation and focus for accessibility
  const modalRef = useRef(null);

  // Support accessibility and focus lock
  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;
  const theme = colors || PALETTE;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || "Dialog"}
      tabIndex={-1}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(30,35,22,0.74)",
        zIndex: 9750, display: "flex", alignItems: "center", justifyContent: "center"
      }}
      onClick={onClose}
      onKeyDown={e => { if (e.key === "Escape") onClose && onClose(); }}
    >
      <div
        ref={modalRef}
        style={{
          background: theme.surface,
          color: theme.on_secondary,
          minWidth: 340, maxWidth: 430,
          padding: "34px 28px 20px 28px",
          boxShadow: "0 6px 48px 0 #1a2d1f85, 0 0 0 2.2px #a68a6444",
          borderRadius: 13,
          border: `1.5px solid ${theme.border}`,
          position: "relative",
          outline: "none",
          pointerEvents: "all",
          animation: "modalin 0.13s cubic-bezier(.63,1.22,.5,1)",
        }}
        tabIndex={0}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          fontSize: 21,
          fontWeight: 900,
          color: theme.accent,
          letterSpacing: 0.05,
          marginBottom: 15,
          fontFamily: "inherit"
        }}>
          {title}
        </div>
        <div style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 23 }}>
          {children}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 14 }}>
          <Button variant="outlined" onClick={onClose} colors={theme}>Cancel</Button>
          {onConfirm && (
            <Button variant="danger" onClick={onConfirm} style={{ minWidth: 85 }} colors={theme}>Confirm</Button>
          )}
        </div>
      </div>
      <style>
        {`@keyframes modalin { from { transform: translateY(22px) scale(.96); opacity:0.24;}
          to { transform: translateY(0) scale(1); opacity:1; } } `}
      </style>
    </div>
  );
}

// =================== Navbar Component =====================
function Navbar({ user, nav, onLogout, route, colors=PALETTE }) {
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [route]);

  // Responsive utility
  const theme = colors || PALETTE;

  // Hide hamburger on desktop — show below tablet
  const isMobile = (typeof window !== "undefined" ? window.innerWidth : 1200) < BREAKPOINTS.tablet;

  return (
    <nav
      className="navbar"
      style={{
        backgroundColor: theme.secondary,
        boxShadow: "0 2px 14px 0 #22271545",
        borderBottom: `1.7px solid ${theme.border}`,
        transition: "box-shadow 0.22s",
        zIndex: 101,
        minHeight: 56,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          minHeight: 56,
          paddingRight: 3,
          paddingLeft: 3,
          position: 'relative',
          width: '100%',
        }}>
        {/* Centered BIG Navbar Title */}
        <div
          tabIndex={0}
          style={{
            position: 'absolute',
            left: 0,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            minWidth: 0
          }}
          aria-hidden="true"
        />
        {/* Spacer for left alignment, prevents nav from hugging left edge */}
        <div
          style={{
            flex: '1 1 0%',
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
        <div
          className="desktop-nav"
          style={{
            display: 'flex',
            gap: 13,
            alignItems: 'center',
            flexWrap: "wrap",
            minWidth: 0,
            transition: "all 0.22s",
            marginLeft: 'auto'
          }}
        >
          <NavLink label="Home" onClick={() => nav('home')} active={route==='home'} colors={theme} />
          <NavLink label="Report Issue" onClick={() => nav('issue')} active={route==='issue'} colors={theme} />
          <NavLink label="Status" onClick={() => nav('status')} active={route==='status'} colors={theme} />
          <NavLink label="Contact" onClick={() => nav('contact')} active={route==='contact'} colors={theme} />
          {user && user.isAdmin && (
            <NavLink label="Admin" onClick={() => nav('admin')} active={route==='admin'} colors={theme}/>
          )}
          {!user && (
            <>
              <NavLink label="Login" onClick={() => nav('login')} active={route==='login'} colors={theme} />
              <NavLink label="Register" onClick={() => nav('register')} active={route==='register'} colors={theme} />
            </>
          )}
          {user && (
            <span style={{
              color:theme.on_secondary,
              fontSize:16,
              marginLeft:3,
              background: "rgba(166, 138, 100, 0.11)",
              borderRadius: 6,
              padding: '5px 13px 5px 10px',
              border: `1px solid ${theme.accent}18`,
              letterSpacing: ".01em"
            }}>
              Hi, <b>{user.username}</b>!
            </span>
          )}
          {user && (
            <Button
              variant="outlined"
              onClick={onLogout}
              size="small"
              colors={theme}
              style={{
                marginLeft:10,
                padding:"5px 18px",
                border: `1.6px solid ${theme.border}`,
                color: theme.accent
              }}
            >Logout</Button>
          )}
        </div>
        {/* Hamburger mobile button visible on tablet and below */}
        <button
          className="btn"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(o=>!o)}
          style={{
            display:'none',
            marginLeft:18,
            fontSize:25,
            padding: '7px 12px',
            background: open ? theme.accent : theme.secondary,
            color: theme.on_secondary,
            border: 'none',
            borderRadius: 6,
            transition: "all 0.2s"
          }}
        >☰</button>
      </div>
      {/* Responsive nav for mobile/tablet */}
      <div
        style={{
          display: open ? 'block' : 'none',
          background: `${theme.surface}ee`,
          color: theme.on_secondary,
          position: "absolute",
          top: 56,
          width: "100vw",
          left: 0,
          textAlign: "center",
          boxShadow: "0 8px 40px #23200018",
          zIndex: 120
        }}
        tabIndex={-1}
      >
        <div style={{padding:"18px 0", display: "flex", flexDirection:"column", gap:13}}>
          <NavLink label="Home" onClick={() => { nav('home'); setOpen(false); }} active={route==='home'} colors={theme} />
          <NavLink label="Report Issue" onClick={() => { nav('issue'); setOpen(false); }} active={route==='issue'} colors={theme} />
          <NavLink label="Status" onClick={() => { nav('status'); setOpen(false); }} active={route==='status'} colors={theme} />
          <NavLink label="Contact" onClick={() => { nav('contact'); setOpen(false); }} active={route==='contact'} colors={theme} />
          {user && user.isAdmin && (
            <NavLink label="Admin" onClick={() => { nav('admin'); setOpen(false); }} active={route==='admin'} colors={theme} />
          )}
          {!user && (
            <>
              <NavLink label="Login" onClick={() => { nav('login'); setOpen(false); }} active={route==='login'} colors={theme} />
              <NavLink label="Register" onClick={() => { nav('register'); setOpen(false); }} active={route==='register'} colors={theme} />
            </>
          )}
          {user && (
            <Button
              variant="outlined"
              size="small"
              colors={theme}
              style={{margin:"0 auto", width:130, border:`1.6px solid ${theme.accent}`}}
              onClick={() => { onLogout(); setOpen(false); }}
            >Logout</Button>
          )}
        </div>
      </div>
    </nav>
  );
}

// ========== NavLink Subcomponent ===========
function NavLink({ label, onClick, active, colors = PALETTE }) {
  const theme = colors || PALETTE;
  return (
    <Button
      variant={active ? "primary" : "secondary"}
      size="small"
      onClick={onClick}
      colors={theme}
      style={{
        border: active ? `2.2px solid ${theme.accent}` : undefined,
        fontWeight: active ? 800 : 600,
        boxShadow: active ? `0 2px 12px ${theme.primary}88` : "none",
        marginLeft: 1,
        letterSpacing: ".01em",
        minWidth: 87,
        borderRadius: 7,
        filter: active ? "brightness(1.18)" : undefined,
        transition: "background 0.18s, color .15s, box-shadow .17s"
      }}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Button>
  );
}

// ============= FlashMsg ==============
function FlashMsg({ msg, onClose, colors = PALETTE }) {
  // Animate in/out, allow dismiss
  const [show, setShow] = useState(true);
  const theme = colors || PALETTE;
  useEffect(() => {
    if (!msg) return;
    setShow(true);
    const closeTimer = setTimeout(() => setShow(false), 4200);
    return () => clearTimeout(closeTimer);
  }, [msg]);
  useEffect(() => {
    if (!show && onClose) onClose();
  }, [show, onClose]);
  if (!msg || !show) return null;
  return (
    <div
      style={{
        margin: '18px 0 12px 0',
        padding: '12px 24px',
        background: `${theme.surface}cc`,
        color: theme.accent,
        border: `1.5px solid ${theme.accent}`,
        borderRadius: 8,
        textAlign: 'center',
        position: "relative",
        fontWeight: 700,
        fontSize: 16,
        animation: "fadeInFlash .18s",
        boxShadow: "0 2px 12px #0003, 0 0 0 2.4px #a68a6422"
      }}>
      {msg}
      <button
        aria-label="Close"
        style={{
          position: "absolute",
          right: 12, top: 8,
          background: "none",
          color: theme.on_primary,
          border: "none",
          fontSize: 20,
          cursor: "pointer",
          opacity: 0.65
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
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const theme = PALETTE;
  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const smallScreen = windowWidth < BREAKPOINTS.tablet;
  const smallerGap = windowWidth < 800;

  // Central hero section - now without main "City" title, which appears in site header
  return (
    <section
      className="hero"
      style={{
        paddingTop: smallScreen ? 40 : 85,
        paddingBottom: smallScreen ? 34 : 80,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 39,
        transition: "all 0.17s",
        background: `linear-gradient(118deg, ${theme.background} 0%, ${theme.surface}  65%, ${theme.accent}19 99%)`,
        borderRadius: "24px",
        boxShadow: `0 0 80px ${theme.primary}44, 0 2px 22px #0002`,
        margin: smallScreen ? "0 0 18px 0" : "0 0 30px 0",
        border: `1.4px solid ${theme.border}`,
      }}
      aria-label="cityfix hero"
    >
      <div
        style={{
          color: theme.primary,
          fontWeight: 700,
          fontSize: smallScreen ? "1.19rem" : "1.29rem",
          letterSpacing: 0.09,
          marginBottom: 4,
          textShadow: "0 2px 11px #1d2528c0"
        }}
      >
        Citizen Services Platform
      </div>
      <p
        className="description"
        style={{
          fontSize: smallScreen ? "1.09rem" : "1.19rem",
          lineHeight: 1.63,
          color: theme.on_secondary,
          maxWidth: 620,
          margin: "0 auto 19px auto",
          textShadow: `0 3px 16px #030c0a8e, 0 1px 1px #fff1`,
          transition: "all 0.16s"
        }}
      >
        City helps you report civic issues, track status, and connect with city departments.
        <br />
        {user
          ? <span style={{ color: theme.accent, fontWeight: 800 }}>
              Ready to make a difference in your community?
            </span>
          : <span style={{ color: theme.primary, fontWeight: 700 }}>
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
          colors={theme}
          style={{
            minWidth: 171,
            fontWeight: 800,
            border: `2.1px solid ${theme.accent}`,
            boxShadow: `0 4px 14px ${theme.primary}70, 0 1.1px 4.8px ${theme.accent}55`
          }}
          onClick={() => nav('issue')}
        >
          Report an Issue
        </Button>
        {user ? (
          <Button
            variant="outlined"
            size="large"
            colors={theme}
            style={{
              minWidth: 165,
              fontWeight: 700,
              border: `2.4px solid ${theme.primary}`,
              boxShadow: `0 1px 13px ${theme.primary}28`
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
              colors={theme}
              style={{
                minWidth: 132,
                fontWeight: 700,
                border: `2.1px solid ${theme.accent}99`
              }}
              onClick={() => nav('register')}
            >
              Register
            </Button>
            <Button
              variant="outlined"
              size="large"
              colors={theme}
              style={{
                minWidth: 102,
                fontWeight: 700,
                border: `2.1px solid ${theme.primary}`,
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

/**
 * PUBLIC_INTERFACE
 * Registration form for new users with validation and real-time feedback.
 */
function RegisterForm({ onRegister, nav }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function validateFields() {
    if (!username || !password) {
      setError('All fields are required.');
      return false;
    }
    if (username.length < 3 || password.length < 5) {
      setError('Username must be at least 3 chars and password at least 5 chars long.');
      return false;
    }
    setError('');
    return true;
  }

  function submit(e) {
    e.preventDefault();
    if (!validateFields()) return;
    onRegister({ username, password });
  }

  return (
    <section>
      <h2>Register</h2>
      <form onSubmit={submit} style={formStyle} autoComplete="off">
        <FormField
          label="Username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          autoFocus
        />
        <FormField
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button className="btn btn-large" type="submit">Register</button>
        <button className="btn" type="button" style={{ marginLeft: 12 }} onClick={() => nav('home')}>
          Cancel
        </button>
      </form>
      {error && (
        <div style={{ color: '#ff7070', marginTop: 12, fontWeight: 500 }}>{error}</div>
      )}
      <p style={{ marginTop: 16 }}>
        Already have an account?{' '}
        <button
          onClick={() => nav('login')}
          className="btn"
          style={{ padding: '4px 14px' }}
          type="button"
        >
          Login
        </button>
      </p>
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
/**
 * Google Maps API Key for server-side geocoding (do NOT expose on frontend to avoid public leakage).
 * Use for backend/reverse geocoding fetches, not direct browser geolocation.
 * const GOOGLE_MAPS_API_KEY = "AIzaSyAh45zSQ_-TvIwvHfPVhCG31a0ttZatp2E";
 */

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

  // Device Geolocation via browser API.
  // Uses device-level (browser) Geolocation only!
  async function fetchLocation() {
    setStatus("");
    setLoadingLoc(true);

    // Check Permissions API first, for accurate permission status
    const hasPermAPI = typeof navigator.permissions !== "undefined" && navigator.permissions.query;
    try {
      if (hasPermAPI) {
        const permStatus = await navigator.permissions.query({ name: "geolocation" });
        if (permStatus.state === "denied") {
          setStatus("Location permission is denied in your browser settings. Please enable location access for autofill.");
          setLoadingLoc(false);
          return;
        }
      }
    } catch (e) {
      // Permissions API failed, ignore and proceed
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
          setLocation(coords);
          setStatus("Device location detected. You may edit or keep as is.");
          setLoadingLoc(false);
        },
        (err) => {
          // Check permission state via Permissions API if possible
          if (err.code === err.PERMISSION_DENIED || err.code === 1) {
            // Check if browser explicitly says denied, else ask user to check
            setStatus("Permission denied. Please check your browser settings and reload the page. If already allowed, you may need to clear site data.");
          } else if (err.code === err.POSITION_UNAVAILABLE || err.code === 2) {
            setStatus("Location unavailable. Try moving to an open area or check your device settings.");
          } else if (err.code === err.TIMEOUT || err.code === 3) {
            setStatus("Location timeout. Please try again or enter location manually.");
          } else {
            setStatus("Could not obtain geolocation. Please enter location manually.");
          }
          setLoadingLoc(false);
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
      );
    } else {
      setStatus("Geolocation API not supported in your browser.");
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
              aria-label="Issue location"
            />
            <button
              className="btn"
              style={{marginLeft:12,padding:'6px 12px'}}
              type="button"
              onClick={fetchLocation}
              disabled={loadingLoc}
              aria-label="Fetch device location"
            >
              {loadingLoc ? "Detecting..." : "Autofill"}
            </button>
          </label>
          <div style={{fontSize:13, color:"#aaf", marginTop:4}}>
            For privacy, only your coordinates will be stored, not a full address. 
          </div>
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

/*
 * PUBLIC_INTERFACE
 * Contact & Departments page with visually distinct department cards;
 * each card shows department icon, name, contact info. Responsive, dark theme, accessible.
 */
function ContactDepartments() {
  // Department data as per requirements
  const departments = [
    { name: 'Roads', icon: '🛣️', phone: '123-000-1111', email: 'roads@civicconnect.org' },
    { name: 'Electricity', icon: '💡', phone: '123-000-2222', email: 'electricity@civicconnect.org' },
    { name: 'Water', icon: '🚰', phone: '123-000-3333', email: 'water@civicconnect.org' },
    { name: 'Sewage', icon: '🕳️', phone: '123-000-4444', email: 'sewage@civicconnect.org' },
    { name: 'Road Encroachment', icon: '🚧', phone: '123-000-5555', email: 'encroachment@civicconnect.org' },
    { name: 'Parking', icon: '🅿️', phone: '123-000-6666', email: 'parking@civicconnect.org' }
  ];

  // Responsive grid for department cards
  return (
    <section>
      <h2 style={{ textAlign: "center", marginBottom: 12 }}>Contact Information &amp; Departments</h2>
      <div style={{
        margin: '24px 0 18px 0',
        background: "linear-gradient(90deg, #011a2f 0%, #13151a 100%)",
        borderRadius: 12,
        padding: "20px 18px",
        boxShadow: "0 3px 32px #00baff10, 0 0 0 2.2px #00ffff33"
      }}>
        <b style={{ color: "#00ffff" }}>General Inquiries:</b> {" "}
        <a href="mailto:info@civicconnect.com" style={{color:'#00ffff', fontWeight:500, wordBreak:"break-word"}}>
          info@civicconnect.com
        </a>
        <div style={{ fontSize: 15, color:'#c9eaff', marginTop:6 }}>
          For all other questions, use the departmental contacts below.
        </div>
      </div>
      <div
        aria-label="Department Contacts"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(248px, 1fr))',
          gap: '24px',
          width: '100%',
          margin: '0 auto',
          padding: '10px 0 40px 0'
        }}
      >
        {departments.map((dept) => (
          <div
            key={dept.name}
            style={{
              background: "linear-gradient(120deg, #0c0f14 0%, #11262e 90%)",
              color: "#fff",
              borderRadius: 11,
              boxShadow: "0 2px 18px #00ffff15, 0 0 0 1.7px #0297a5cc",
              padding: "20px 18px 20px 18px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minHeight: 174,
              transition: "box-shadow 0.17s, transform 0.18s",
              border: "1.7px solid #00fff91e"
            }}
            tabIndex={0}
            aria-label={dept.name + " department"}
            role="region"
          >
            <span
              aria-hidden="true"
              style={{
                fontSize: 38,
                marginBottom: 12,
                textShadow: "0 2px 20px #00fff541,0 0 1px #000"
              }}
              title={dept.name}
            >{dept.icon}</span>
            <span style={{
              fontWeight: 700,
              fontSize: 20,
              color: "#00ffff",
              marginBottom: 7,
              textAlign: "center"
            }}>
              {dept.name}
            </span>
            <div style={{
              color: "#bdf",
              fontSize: 15,
              marginBottom: 7,
              wordBreak: "break-word",
              textAlign: "center"
            }}>
              <span style={{fontWeight:500}}>Phone:</span>{" "}
              <a href={'tel:' + dept.phone.replace(/[^0-9]/g, '')}
                 style={{ color:'#2fd0e4', textDecoration:'underline', fontWeight:500 }}>
                {dept.phone}
              </a>
            </div>
            <div style={{
              color: "#bdf",
              fontSize: 15,
              wordBreak: "break-word",
              textAlign: "center"
            }}>
              <span style={{fontWeight:500}}>Email:</span>{" "}
              <a href={'mailto:' + dept.email}
                 style={{ color:'#2fd0e4', textDecoration:'underline', fontWeight:500 }}>
                {dept.email}
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// =============== Footer Component =============
function Footer({ nav, colors = PALETTE }) {
  const theme = colors || PALETTE;
  return (
    <footer
      style={{
        background: theme.secondary,
        color: theme.on_secondary,
        textAlign: 'center',
        padding: '13px 0',
        borderTop: `1.2px solid ${theme.border}`,
        marginTop: '38px',
        fontSize: '1.04rem',
        position: 'relative',
        width: '100%',
        flexShrink: 0,
        letterSpacing: ".01em"
      }}
    >
      <div>
        <span style={{color:theme.accent, fontWeight:900, letterSpacing: ".04em"}}>CivicConnect</span> &copy; {new Date().getFullYear()} &mdash;&nbsp;
        <button
          className="btn"
          style={{
            color: theme.accent,
            background: 'none',
            fontSize: '1rem',
            fontWeight: 700,
            border: "none",
            padding: '2px 14px',
            cursor: "pointer"
          }}
          onClick={() => nav('contact')}
        >Contact</button>
      </div>
    </footer>
  );
}

/*
 * Responsive and Accessible Shared Subcomponent Styles
 *
 * Applies grid/flex properties and adaptive sizing for cross-device UI consistency.
 */
const formStyle = {
  maxWidth: "100%",
  width: "min(98vw, 380px)",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "min(4vw,22px)",
  background: "#051921b8",
  padding: "clamp(24px, 8vw, 36px) clamp(10px, 4vw, 19px)",
  borderRadius: 8,
  border: "1px solid #00ffff38",
  boxSizing: "border-box"
};
const labelStyle = {
  color: "#fff",
  marginRight: 8,
  fontWeight: 500,
  display: "block",
  marginBottom: 2,
  fontSize: "clamp(1rem, 1.3vw, 1.04rem)"
};
const inputStyle = {
  padding: "7px 8px",
  borderRadius: 4,
  border: "1.5px solid #00ffff66",
  marginTop: 1,
  minWidth: 0,
  width: "100%",
  background: "#1a1a2b",
  color: "#fff",
  fontSize: "clamp(1rem, 3vw, 1.06rem)"
};

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
