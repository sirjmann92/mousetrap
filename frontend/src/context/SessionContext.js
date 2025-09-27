import { createContext, useContext, useEffect, useState } from 'react';

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [sessionLabel, setSessionLabel] = useState('');

  // On mount, load last session from backend
  useEffect(() => {
    fetch('/api/last_session')
      .then((res) => res.json())
      .then((data) => {
        if (data?.label) setSessionLabel(data.label);
      });
  }, []);

  // Persist sessionLabel to backend when it changes
  useEffect(() => {
    if (sessionLabel) {
      fetch('/api/last_session', {
        body: JSON.stringify({ label: sessionLabel }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
    }
  }, [sessionLabel]);

  // Session/config state
  const [mamId, setMamId] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [ipMonitoringMode, setIpMonitoringMode] = useState('auto');
  const [mamIp, setMamIp] = useState('');
  const [checkFrequency, setCheckFrequency] = useState('');
  const [oldLabel, setOldLabel] = useState('');
  const [proxy, setProxy] = useState({});
  const [proxiedIp, setProxiedIp] = useState('');
  const [proxiedAsn, setProxiedAsn] = useState('');

  const [sessionInfo, setSessionInfo] = useState({});
  const [status, setStatus] = useState(null);
  const [points, setPoints] = useState(null);
  const [cheese, setCheese] = useState(null);
  const [detectedIp, setDetectedIp] = useState('');

  const value = {
    checkFrequency,
    cheese,
    detectedIp,
    ipMonitoringMode,
    mamId,
    mamIp,
    oldLabel,
    points,
    proxiedAsn,
    proxiedIp,
    proxy,
    sessionInfo,
    sessionLabel,
    sessionType,
    setCheckFrequency,
    setCheese,
    setDetectedIp,
    setIpMonitoringMode,
    setMamId,
    setMamIp,
    setOldLabel,
    setPoints,
    setProxiedAsn,
    setProxiedIp,
    setProxy,
    setSessionInfo,
    setSessionLabel,
    setSessionType,
    setStatus,
    status,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
