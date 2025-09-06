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

  // Session/config state
  const [mamId, setMamId] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [ipMonitoringMode, setIpMonitoringMode] = useState("auto");
  const [mamIp, setMamIp] = useState("");
  const [checkFrequency, setCheckFrequency] = useState("");
  const [oldLabel, setOldLabel] = useState("");
  const [proxy, setProxy] = useState({});
  const [proxiedIp, setProxiedIp] = useState("");
  const [proxiedAsn, setProxiedAsn] = useState("");

  const [sessionInfo, setSessionInfo] = useState({});
  const [status, setStatus] = useState(null);
  const [points, setPoints] = useState(null);
  const [cheese, setCheese] = useState(null);
  const [detectedIp, setDetectedIp] = useState("");

  const value = {
    sessionLabel, setSessionLabel,
    sessionInfo, setSessionInfo,
    status, setStatus,
    points, setPoints,
    cheese, setCheese,
    detectedIp, setDetectedIp,
    mamId, setMamId,
    sessionType, setSessionType,
    ipMonitoringMode, setIpMonitoringMode,
    mamIp, setMamIp,
    checkFrequency, setCheckFrequency,
    oldLabel, setOldLabel,
    proxy, setProxy,
    proxiedIp, setProxiedIp,
    proxiedAsn, setProxiedAsn,
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
