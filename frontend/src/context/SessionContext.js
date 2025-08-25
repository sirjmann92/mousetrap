import React, { createContext, useContext, useState, useEffect } from 'react';

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [sessionLabel, setSessionLabel] = useState("");

  // On mount, load last session from backend
  useEffect(() => {
    fetch('/api/last_session')
      .then(res => res.json())
      .then(data => {
        if (data && data.label) setSessionLabel(data.label);
      });
  }, []);

  // Persist sessionLabel to backend when it changes
  useEffect(() => {
    if (sessionLabel) {
      fetch('/api/last_session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: sessionLabel })
      });
    }
  }, [sessionLabel]);
  const [sessionInfo, setSessionInfo] = useState({});
  const [status, setStatus] = useState(null);
  const [points, setPoints] = useState(null);
  const [cheese, setCheese] = useState(null);
  const [detectedIp, setDetectedIp] = useState("");
  // Add more shared state as needed

  const value = {
    sessionLabel, setSessionLabel,
    sessionInfo, setSessionInfo,
    status, setStatus,
    points, setPoints,
    cheese, setCheese,
    detectedIp, setDetectedIp,
    // Add more setters/getters as needed
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
