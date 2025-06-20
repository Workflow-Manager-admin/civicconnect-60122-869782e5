import React, { createContext, useContext, useState, useEffect } from "react";

// Simulate database
const LOCAL_USER_KEY = "civicconnect_user";
const LOCAL_USERS_KEY = "civicconnect_allusers";

// PUBLIC_INTERFACE
const AuthContext = createContext();

// PUBLIC_INTERFACE
export function useAuth() {
  return useContext(AuthContext);
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load session from storage
  useEffect(() => {
    const data = localStorage.getItem(LOCAL_USER_KEY);
    if (data) setUser(JSON.parse(data));
  }, []);

  // PUBLIC_INTERFACE
  function login(credentials) {
    const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
    const found = users.find(
      u =>
        u.email === credentials.email &&
        u.passwordHash === hashPwd(credentials.password)
    );
    if (found)
      setUserAndSession({
        ...found,
        passwordHash: undefined
      });
    else throw new Error("Invalid credentials");
  }

  // PUBLIC_INTERFACE
  function register({ name, email, password }) {
    let users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
    if (users.some(u => u.email === email)) throw new Error("Email already registered");
    const newUser = {
      name,
      email,
      passwordHash: hashPwd(password),
      role: "user",
    };
    users.push(newUser);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    setUserAndSession({ ...newUser, passwordHash: undefined });
  }

  // PUBLIC_INTERFACE
  function logout() {
    setUser(null);
    localStorage.removeItem(LOCAL_USER_KEY);
  }

  // Middleware for admin login simulation: hardcoded admin credential
  useEffect(() => {
    let users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
    if (!users.some(u => u.role === "admin")) {
      users.push({
        name: "Admin",
        email: "admin@civicconnect.local",
        passwordHash: hashPwd("admin123"),
        role: "admin"
      });
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    }
  }, []);

  // Helper
  function setUserAndSession(u) {
    setUser(u);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(u));
  }

  // PUBLIC_INTERFACE
  function isAuthed() {
    return !!user;
  }

  // PUBLIC_INTERFACE
  function isAdmin() {
    return !!user && user.role === "admin";
  }

  // Hashing with builtin hashing (avoid real hashing in-browser, for demo only)
  function hashPwd(password) {
    // Simple hash: not for production!
    let hash = 0, i, chr;
    for (i = 0; i < password.length; i++) {
      chr = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash.toString();
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthed, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
