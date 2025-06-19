import React from "react";

// PUBLIC_INTERFACE
function PageRegister({ registerForm, setRegisterForm, handleRegister, authError, inputStyles, errorStyles }) {
  return (
    <div className="container" style={{ paddingTop: 120, maxWidth: 420 }}>
      <h2 style={{ color: 'var(--accent)' }}>Register</h2>
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="text"
          placeholder="Username"
          name="username"
          value={registerForm.username}
          onChange={e => setRegisterForm({ ...registerForm, username: e.target.value })}
          autoComplete="username"
          style={inputStyles}
          required
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={registerForm.password}
          onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
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
          onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
          minLength={4}
          autoComplete="new-password"
          style={inputStyles}
          required
        />
        <button className="btn btn-large" style={{ marginTop: 6 }} type="submit">Register</button>
      </form>
      {authError && <div style={errorStyles}>{authError}</div>}
    </div>
  );
}

export default PageRegister;
