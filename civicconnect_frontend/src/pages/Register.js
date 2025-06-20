import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

// PUBLIC_INTERFACE
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function validate({ name, email, password, confirm }) {
    if (!name || !email || !password || !confirm) return "All fields required";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Invalid email format";
    if (password.length < 6) return "Password must be at least 6 chars";
    if (password !== confirm) return "Passwords do not match";
    return "";
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); setSuccess("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validation = validate(form);
    if (validation) { setError(validation); return; }
    try {
      register({ name: form.name, email: form.email, password: form.password });
      setSuccess("Registered! Redirecting to dashboard...");
      setTimeout(() => { navigate("/"); }, 1500);
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  }

  return (
    <section className="container">
      <div className="card" style={{maxWidth:"420px",margin:"2.9rem auto"}}>
        <h2>Register</h2>
        <form  
          autoComplete="off" 
          spellCheck={false}
          onSubmit={handleSubmit}
        >
          <label htmlFor="name">Full Name</label>
          <input name="name" value={form.name} onChange={handleChange} />
          <label htmlFor="email">Email</label>
          <input name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} />
          <label htmlFor="password">Password</label>
          <input name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} />
          <label htmlFor="confirm">Confirm Password</label>
          <input name="confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={handleChange} />
          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}
          <button className="btn" type="submit" style={{width: "100%"}}>Register</button>
        </form>
        <div style={{marginTop:"1.5em"}}>
          Already have an account? <Link to="/login" style={{ color:"var(--secondary)"}}>Login</Link>
        </div>
      </div>
    </section>
  )
}
