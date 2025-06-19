import React from "react";

// PUBLIC_INTERFACE
function PageLogin({ loginForm, setLoginForm, handleLogin, authError, inputStyles, errorStyles }) {
  return (
    <div className="container" style={{ paddingTop: 120, maxWidth: 420 }}>
      <h2 style={{ color: 'var(--accent)' }}>Login</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="text"
          placeholder="Username"
          name="username"
          value={loginForm.username}
          onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
          autoComplete="username"
          style={inputStyles}
          required
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={loginForm.password}
          onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
          minLength={4}
          autoComplete="current-password"
          style={inputStyles}
          required
        />
        <button className="btn btn-large" style={{ marginTop: 6 }} type="submit">Login</button>
      </form>
      {authError && <div style={errorStyles}>{authError}</div>}
    </div>
  );
}

export default PageLogin;
