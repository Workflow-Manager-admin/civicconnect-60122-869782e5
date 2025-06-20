import React, { useState, useEffect, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./App.css";

// PUBLIC_INTERFACE
export const AuthContext = createContext();

/**
 * Simulated Local Storage - In real apps, connect API and use cookies/session
 */
const getUsersFromStorage = () =>
  JSON.parse(localStorage.getItem("users") || "[]");
const setUsersToStorage = (users) =>
  localStorage.setItem("users", JSON.stringify(users));

const getIssuesFromStorage = () =>
  JSON.parse(localStorage.getItem("issues") || "[]");
const setIssuesToStorage = (issues) =>
  localStorage.setItem("issues", JSON.stringify(issues));

/**
 * Helper hashing function (NOT real-world secure, demo only)
 */
function simpleHash(str) {
  // PUBLIC_INTERFACE
  // In production, use bcrypt or scrypt via backend!
  // Here: basic reversible obfuscation for local demo.
  let hash = 5381;
  for (let i = 0; i < str.length; i++)
    hash = (hash * 33) ^ str.charCodeAt(i);
  return "h" + (hash >>> 0).toString(36);
}

/**
 * AuthProvider for session management
 */
function AuthProvider({ children }) {
  // PUBLIC_INTERFACE
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("sessionUser") || "null")
  );

  const login = (username, password) => {
    const users = getUsersFromStorage();
    const found = users.find(
      (u) => u.username === username && u.passwordHash === simpleHash(password)
    );
    if (found) {
      localStorage.setItem("sessionUser", JSON.stringify(found));
      setUser(found);
      return { ok: true, isAdmin: found.isAdmin };
    }
    return { ok: false };
  };

  const logout = () => {
    localStorage.removeItem("sessionUser");
    setUser(null);
  };

  const register = (formData) => {
    const users = getUsersFromStorage();
    if (users.find((u) => u.username === formData.username)) {
      return { ok: false, error: "Username already exists" };
    }
    const newUser = {
      username: formData.username,
      passwordHash: simpleHash(formData.password),
      isAdmin: false,
      email: formData.email,
      registeredAt: new Date().toISOString(),
    };
    users.push(newUser);
    setUsersToStorage(users);
    localStorage.setItem("sessionUser", JSON.stringify(newUser));
    setUser(newUser);
    return { ok: true };
  };

  const value = { user, login, logout, register };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * RequireAuth: Protect routes for authenticated users only
 */
function RequireAuth({ children }) {
  // PUBLIC_INTERFACE
  const { user } = useContext(AuthContext);
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

/**
 * RequireAdmin: Protect admin routes
 */
function RequireAdmin({ children }) {
  // PUBLIC_INTERFACE
  const { user } = useContext(AuthContext);
  if (!user || !user.isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}

/**
 * Navbar Component
 */
function Navbar() {
  // PUBLIC_INTERFACE
  const { user, logout } = useContext(AuthContext);
  return (
    <nav className="navbar">
      <div className="container" style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className="logo">
            <span
              className="logo-symbol"
              style={{ color: "#ff0000", fontWeight: 900, fontSize: 22 }}
            >
              ●
            </span>
            CivicConnect
          </div>
          <div>
            <Link to="/" className="btn" style={{ marginRight: 8 }}>
              Home
            </Link>
            {user && !user.isAdmin && (
              <>
                <Link to="/report" className="btn" style={{ marginRight: 8 }}>
                  Report Issue
                </Link>
                <Link to="/my-issues" className="btn" style={{ marginRight: 8 }}>
                  My Issues
                </Link>
              </>
            )}
            {user && user.isAdmin && (
              <Link to="/admin" className="btn" style={{ marginRight: 8 }}>
                Admin
              </Link>
            )}
            <Link to="/contact" className="btn" style={{ marginRight: 8 }}>
              Contact
            </Link>
            {user ? (
              <>
                <span style={{ marginRight: 6 }}>
                  <b>{user.isAdmin ? "Admin" : "User"}:</b> {user.username}
                </span>
                <button className="btn" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn" style={{ marginRight: 8 }}>
                  Login
                </Link>
                <Link to="/register" className="btn" style={{ marginRight: 8 }}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

/**
 * Footer Component
 */
function Footer() {
  // PUBLIC_INTERFACE
  return (
    <footer
      style={{
        background: "#000",
        color: "#fff",
        padding: "24px 0 12px 0",
        borderTop: "1px solid var(--border-color)",
        display: "flex",
        justifyContent: "center",
        marginTop: "auto",
      }}
    >
      <div className="container" style={{ fontSize: 14, opacity: 0.7 }}>
        CivicConnect © {new Date().getFullYear()} — a KAVIA Smart City Project
      </div>
    </footer>
  );
}

/**
 * HomePage / Landing
 */
function HomePage() {
  // PUBLIC_INTERFACE
  return (
    <main>
      <div className="container">
        <div className="hero">
          <div className="subtitle" style={{ color: "#ff0000" }}>
            Empowering Citizens for a Better City
          </div>
          <h1 className="title" style={{ color: "#fff" }}>
            CivicConnect
          </h1>
          <div className="description">
            CivicConnect lets you report and track civic issues, while providing the city administration with actionable insights to improve your community. Connect, report, and resolve—together.
          </div>
          <Link to="/report" className="btn btn-large" style={{ marginTop: 16 }}>
            Report an Issue
          </Link>
        </div>
      </div>
    </main>
  );
}

/**
 * Auth/Login Form
 */
function LoginPage() {
  // PUBLIC_INTERFACE
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Input validation
    if (!form.username || !form.password) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }
    // Prevent simple XSS
    if (
      /[<>'"]/g.test(form.username) ||
      /[<>'"]/g.test(form.password)
    ) {
      setError("Invalid characters detected.");
      setLoading(false);
      return;
    }
    setTimeout(() => {
      const res = login(form.username, form.password);
      setLoading(false);
      if (res.ok) {
        if (res.isAdmin) navigate("/admin", { replace: true });
        else navigate("/", { replace: true });
      } else {
        setError("Invalid username or password.");
      }
    }, 350);
  };

  // Demo: Add a predefined admin if not exists
  useEffect(() => {
    const users = getUsersFromStorage();
    if (!users.find((u) => u.username === "admin")) {
      users.push({
        username: "admin",
        passwordHash: simpleHash("admin123"),
        isAdmin: true,
        email: "admin@city.gov",
        registeredAt: new Date().toISOString(),
      });
      setUsersToStorage(users);
    }
  }, []);

  return (
    <main>
      <div className="container" style={{ maxWidth: 420 }}>
        <div className="hero">
          <div className="subtitle">Secure Login</div>
          <h2 className="title" style={{ fontSize: "2.2rem" }}>Access Your Account</h2>
          <form onSubmit={onSubmit} style={{ width: "100%" }} autoComplete="off">
            <label htmlFor="username" style={{ fontWeight: "bold" }}>
              Username
            </label>
            <input type="text" id="username" name="username" value={form.username} onChange={onChange} autoFocus
              className="input" style={inputStyle} minLength={3} maxLength={32} required />

            <label htmlFor="password" style={{ fontWeight: "bold" }}>
              Password
            </label>
            <input type="password" id="password" name="password" value={form.password} onChange={onChange}
              className="input" style={inputStyle} minLength={5} maxLength={32} autoComplete="current-password" required />

            {error && <div style={{ color: "#ff0000", marginTop: 6 }}>{error}</div>}

            <button className="btn btn-large" style={{ width: "100%", marginTop: 18 }} type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

/**
 * Registration Form
 */
function RegisterPage() {
  // PUBLIC_INTERFACE
  const { register } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Security: validate input length, characters
    if (
      !form.username ||
      !form.email ||
      !form.password ||
      !form.confirm
    ) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    if (
      /[<>'"]/g.test(form.username) ||
      /[<>'"]/g.test(form.email)
    ) {
      setError("Invalid characters detected.");
      setLoading(false);
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setError("Invalid email.");
      setLoading(false);
      return;
    }
    if (form.password.length < 5 || form.username.length < 3) {
      setError("Username or password too short.");
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const r = register(form);
      setLoading(false);
      if (!r.ok) setError(r.error || "Registration failed.");
      else {
        setSuccess("Registered successfully.");
        setTimeout(() => navigate("/", { replace: true }), 700);
      }
    }, 500);
  };

  return (
    <main>
      <div className="container" style={{ maxWidth: 440 }}>
        <div className="hero">
          <div className="subtitle">Sign Up</div>
          <h2 className="title" style={{ fontSize: "2.2rem" }}>Create Account</h2>
          <form onSubmit={onSubmit} style={{ width: "100%" }} autoComplete="off">
            <label htmlFor="username" style={{ fontWeight: "bold" }}>
              Username
            </label>
            <input type="text" name="username" value={form.username} onChange={onChange} style={inputStyle} minLength={3} maxLength={32} className="input" required />

            <label htmlFor="email" style={{ fontWeight: "bold" }}>
              Email
            </label>
            <input type="email" name="email" value={form.email} onChange={onChange} style={inputStyle} className="input" required />

            <label htmlFor="password" style={{ fontWeight: "bold" }}>
              Password
            </label>
            <input type="password" name="password" value={form.password} onChange={onChange} style={inputStyle} className="input" minLength={5} required autoComplete="new-password" />

            <label htmlFor="confirm" style={{ fontWeight: "bold" }}>
              Confirm Password
            </label>
            <input type="password" name="confirm" value={form.confirm} onChange={onChange} style={inputStyle} className="input" minLength={5} required autoComplete="new-password" />

            {error && <div style={{ color: "#ff0000", marginTop: 6 }}>{error}</div>}
            {success && <div style={{ color: "#00e676", marginTop: 6 }}>{success}</div>}

            <button className="btn btn-large" style={{ width: "100%", marginTop: 18 }} type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

/**
 * Issue Reporting Form
 */
function ReportIssuePage() {
  // PUBLIC_INTERFACE
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: "",
    description: "",
    photo: null,
    location: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [geoInProgress, setGeoInProgress] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      setGeoInProgress(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((f) => ({
            ...f,
            location: `${pos.coords.latitude},${pos.coords.longitude}`,
          }));
          setGeoInProgress(false);
        },
        () => setGeoInProgress(false),
        { maximumAge: 120000 }
      );
    }
  }, []);

  const onChange = (e) => {
    let val =
      e.target.type === "file"
        ? e.target.files[0]
        : e.target.value;
    setForm({
      ...form,
      [e.target.name]: val,
    });
    setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!form.type || !form.description) {
      setError("Type and description are required.");
      setLoading(false);
      return;
    }
    if (form.description.length < 10) {
      setError("Description too short.");
      setLoading(false);
      return;
    }
    if (form.photo && !form.photo.type.startsWith("image/")) {
      setError("Upload a valid image (jpeg/png/webp).");
      setLoading(false);
      return;
    }

    let photoUrl = "";
    if (form.photo) {
      // Only base64-url demo for localStorage: In real apps, send to backend!
      photoUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.readAsDataURL(form.photo);
      });
    }

    const issues = getIssuesFromStorage();
    const newIssue = {
      id: Date.now().toString(),
      username: user?.username,
      type: form.type,
      description: form.description,
      photo: photoUrl,
      location: form.location,
      status: "submitted",
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };
    issues.push(newIssue);
    setIssuesToStorage(issues);
    setLoading(false);
    navigate("/my-issues", { replace: true });
  };

  return (
    <main>
      <div className="container" style={{ maxWidth: 540 }}>
        <div className="hero">
          <div className="subtitle">Report an Issue</div>
          <h2 className="title" style={{ fontSize: "2rem" }}>Submit New Issue</h2>
          <form onSubmit={onSubmit} style={{ width: "100%" }} encType="multipart/form-data">
            <label htmlFor="type" style={{ fontWeight: "bold" }}>
              Issue Type
            </label>
            <select
              name="type"
              value={form.type}
              onChange={onChange}
              required
              className="input"
              style={inputStyle}
            >
              <option value="" disabled>
                Select...
              </option>
              <option value="Pothole">Pothole</option>
              <option value="Garbage">Garbage</option>
              <option value="Broken Streetlight">Broken Streetlight</option>
              <option value="Water Leakage">Water Leakage</option>
              <option value="Other">Other</option>
            </select>

            <label htmlFor="description" style={{ fontWeight: "bold" }}>
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              minLength={10}
              maxLength={350}
              required
              className="input"
              style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
              placeholder="Describe the issue (at least 10 characters)..."
            />

            <label htmlFor="photo" style={{ fontWeight: "bold" }}>
              Photo (optional)
            </label>
            <input type="file" name="photo" accept="image/*" onChange={onChange} className="input" style={inputStyle} />

            <label htmlFor="location" style={{ fontWeight: "bold" }}>
              Geolocation (Auto, optional)
            </label>
            <input
              name="location"
              value={form.location}
              onChange={onChange}
              className="input"
              style={{ ...inputStyle, backgroundColor: "#222" }}
              readOnly={geoInProgress}
              placeholder={geoInProgress ? "Retrieving location..." : "Latitude,Longitude"}
            />
            {error && <div style={{ color: "#ff0000", marginTop: 6 }}>{error}</div>}

            <button className="btn btn-large" style={{ width: "100%", marginTop: 18 }} type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Issue"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

/**
 * View my submitted issues
 */
function MyIssuesPage() {
  // PUBLIC_INTERFACE
  const { user } = useContext(AuthContext);
  const [issues, setIssues] = useState([]);
  useEffect(() => {
    setIssues(getIssuesFromStorage().filter((i) => i.username === user?.username));
  }, [user]);

  return (
    <main>
      <div className="container" style={{ maxWidth: 820 }}>
        <div className="hero" style={{ alignItems: "flex-start" }}>
          <div className="subtitle">Your Reported Issues</div>
          <h2 className="title" style={{ fontSize: "2rem" }}>Status Updates</h2>
          {issues && issues.length === 0 && (
            <div style={{ marginTop: 18 }}>No issues reported yet.</div>
          )}
          <div style={{ width: "100%" }}>
            {issues.map((issue) => (
              <div
                key={issue.id}
                style={{
                  background: "#151515",
                  border: "1px solid var(--border-color)",
                  borderRadius: 8,
                  padding: 18,
                  marginBottom: 14,
                  display: "flex",
                  gap: 22,
                  alignItems: "center",
                  boxShadow: "0 1px 4px #000b",
                }}
              >
                {issue.photo && (
                  <img
                    src={issue.photo}
                    alt="uploaded"
                    style={{ maxWidth: 85, maxHeight: 70, borderRadius: 5 }}
                  />
                )}
                <div>
                  <div>
                    <b>{issue.type}</b> <span style={{ opacity: 0.7 }}>| {new Date(issue.created).toLocaleString()}</span>
                  </div>
                  <div style={{ margin: "6px 0", color: "#eee" }}>{issue.description}</div>
                  <div style={{ color: "#ff0000", fontWeight: 500 }}>
                    {issue.status.toUpperCase()}
                  </div>
                  {issue.location && (
                    <div style={{ color: "#ccc", fontSize: 13 }}>
                      LOC: <span>{issue.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Admin Dashboard Page
 */
function AdminDashboard() {
  // PUBLIC_INTERFACE
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState("");
  const [statusUpdate, setStatusUpdate] = useState({});
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setIssues(getIssuesFromStorage());
  }, [refresh]);

  const onUpdateStatus = (id, newStatus) => {
    const updated = issues.map((issue) =>
      issue.id === id ? { ...issue, status: newStatus, updated: new Date().toISOString() } : issue
    );
    setIssuesToStorage(updated);
    setRefresh((r) => !r);
  };

  const onDelete = (id) => {
    const updated = issues.filter((issue) => issue.id !== id);
    setIssuesToStorage(updated);
    setRefresh((r) => !r);
  };

  const shownIssues = issues
    .filter(
      (i) => !filter || i.status === filter
    )
    .sort((a, b) => new Date(b.created) - new Date(a.created));

  return (
    <main>
      <div className="container" style={{ maxWidth: 960 }}>
        <div className="hero" style={{ alignItems: "flex-start" }}>
          <div className="subtitle">Admin Dashboard</div>
          <h2 className="title" style={{ fontSize: "2rem" }}>All Reported Issues</h2>
          <div style={{ margin: "8px 0 18px 0" }}>
            <label style={{ color: "#eee", fontWeight: 500 }}>Filter by status:&nbsp;</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={inputStyle}
            >
              <option value="">All</option>
              <option value="submitted">SUBMITTED</option>
              <option value="in-progress">IN-PROGRESS</option>
              <option value="resolved">RESOLVED</option>
            </select>
          </div>
          <div style={{ width: "100%" }}>
            {shownIssues.length === 0 && (
              <div>No issues found.</div>
            )}
            {shownIssues.map((issue, idx) => (
              <div
                key={issue.id}
                style={{
                  background: idx % 2 === 0 ? "#18191a" : "#191414",
                  border: "1px solid var(--border-color)",
                  borderRadius: 8,
                  padding: 18,
                  marginBottom: 13,
                  display: "flex",
                  gap: 24,
                  alignItems: "center",
                  boxShadow: "0 2px 6px #000c",
                  position: "relative",
                }}
              >
                {issue.photo && (
                  <img
                    src={issue.photo}
                    alt="uploaded"
                    style={{ maxWidth: 95, maxHeight: 85, borderRadius: 5 }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div>
                    <b>{issue.type}</b>{" "}
                    <span style={{ color: "#ff0000", marginLeft: 8 }}>
                      [{issue.status.toUpperCase()}]
                    </span>
                  </div>
                  <div style={{ margin: "6px 0", color: "#eee" }}>{issue.description}</div>
                  {issue.location && (
                    <div style={{ color: "#ccc", fontSize: 13 }}>
                      LOC: <span>{issue.location}</span>
                    </div>
                  )}
                  <div style={{ color: "#eee", fontSize: 13 }}>
                    Submitted by <b>{issue.username}</b>{" "}
                    at {new Date(issue.created).toLocaleString()}
                  </div>
                </div>
                <div>
                  <select
                    value={statusUpdate[issue.id] || issue.status}
                    onChange={(e) =>
                      setStatusUpdate((s) => ({
                        ...s,
                        [issue.id]: e.target.value,
                      }))
                    }
                    style={inputStyle}
                  >
                    <option value="submitted">SUBMITTED</option>
                    <option value="in-progress">IN-PROGRESS</option>
                    <option value="resolved">RESOLVED</option>
                  </select>
                  <button
                    className="btn"
                    style={{
                      backgroundColor: "#222",
                      color: "#fff",
                      marginTop: 6,
                      marginRight: 0,
                      border: "1px solid #ff000022",
                    }}
                    onClick={() =>
                      onUpdateStatus(issue.id, statusUpdate[issue.id] || issue.status)
                    }
                  >
                    Save
                  </button>
                  <button
                    className="btn"
                    style={{
                      backgroundColor: "#ff0000",
                      color: "#fff",
                      marginTop: 6,
                      marginLeft: 2,
                    }}
                    onClick={() =>
                      window.confirm("Are you sure you want to delete this issue?")
                        ? onDelete(issue.id)
                        : undefined
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Contact and Departments Page
 */
function ContactPage() {
  // PUBLIC_INTERFACE
  return (
    <main>
      <div className="container" style={{ maxWidth: 780 }}>
        <div className="hero" style={{ alignItems: "flex-start" }}>
          <div className="subtitle">Contact & Departments</div>
          <h2 className="title" style={{ fontSize: "2rem" }}>Get in Touch</h2>
          <div className="description" style={{ marginBottom: 14 }}>
            <b>Main Office:</b> <br />
            City Civic Center, 123 Main St, YourCity<br />
            Phone: <a href="tel:+1234567890" style={{ color: "#00ffff" }}>+1 234-567-890</a> <br />
            Email: <a href="mailto:contact@city.gov" style={{ color: "#00ffff" }}>contact@city.gov</a>
            <br /><br />
            <b>Departments:</b><br />
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>
                <b>Sanitation</b>: sanitation@city.gov | Ext. 120
              </li>
              <li>
                <b>Public Works</b>: publicworks@city.gov | Ext. 160
              </li>
              <li>
                <b>Transportation</b>: transport@city.gov | Ext. 150
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * 404 Page
 */
function NotFoundPage() {
  // PUBLIC_INTERFACE
  return (
    <main>
      <div className="container">
        <div className="hero">
          <div className="subtitle" style={{ color: "#ff0000" }}>
            404 — Page Not Found
          </div>
          <h2 className="title" style={{ color: "#fff" }}>
            Whoops!
          </h2>
          <div className="description">
            We couldn't find what you were looking for. Please use the navigation bar.
          </div>
        </div>
      </div>
    </main>
  );
}

// Helper for consistent input style
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  background: "#111",
  color: "#fff",
  borderRadius: 5,
  border: "1px solid var(--border-color)",
  marginBottom: 13,
  marginTop: 3,
  fontSize: "1rem",
};

/**
 * MAIN APP COMPONENT
 */
// PUBLIC_INTERFACE
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app" style={{ minHeight: "100vh", background: "#000" }}>
          <Navbar />
          <div style={{ minHeight: 64 }} /> {/* Navbar spacer */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/report"
              element={
                <RequireAuth>
                  <ReportIssuePage />
                </RequireAuth>
              }
            />
            <Route
              path="/my-issues"
              element={
                <RequireAuth>
                  <MyIssuesPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <RequireAdmin>
                    <AdminDashboard />
                  </RequireAdmin>
                </RequireAuth>
              }
            />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
