import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

// PUBLIC_INTERFACE
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  function validate(email, password) {
    if (!email || !password) return "All fields required";
    // Basic email format check
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Invalid email format";
    if (password.length < 6) return "Password too short";
    return "";
  }

  // PUBLIC_INTERFACE
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  // PUBLIC_INTERFACE
  function handleSubmit(e) {
    e.preventDefault();
    const validation = validate(form.email, form.password);
    if (validation) return setError(validation);

    try {
      login(form);
      setError("");
      navigate("/");
    } catch (err) {
      setError(err.message || "Unable to login");
    }
  }

  return (
    <section className="container">
      <div className="card" style={{ maxWidth: "420px", margin: "2.9rem auto"}}>
        <h2>Login</h2>
        <form autoComplete="off" spellCheck={false} onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} />
          <label htmlFor="password">Password</label>
          <input name="password" type="password" autoComplete="current-password" value={form.password} onChange={handleChange} />
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn" style={{width: "100%"}}>Login</button>
        </form>
        <div style={{marginTop:"1.5em"}}>
          Don't have an account? <Link to="/register" style={{ color:"var(--secondary)"}}>Register</Link>
        </div>
      </div>
    </section>
  );
}
