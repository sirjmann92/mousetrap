import { createContext, useContext, useEffect, useState } from 'react';

/**
 * @typedef {Object} SessionContextType
 * @property {string} sessionLabel
 * @property {(label:string)=>void} setSessionLabel
 * @property {string} mamId
 * @property {(id:string)=>void} setMamId
 * @property {string} sessionType
 * @property {(s:string)=>void} setSessionType
 * @property {string} ipMonitoringMode
 * @property {(m:string)=>void} setIpMonitoringMode
 * @property {string} mamIp
 * @property {(ip:string)=>void} setMamIp
 * @property {number|''} checkFrequency
 * @property {(f:number|'')=>void} setCheckFrequency
 * @property {string} oldLabel
 * @property {(l:string)=>void} setOldLabel
 * @property {Object} proxy
 * @property {(p:Object)=>void} setProxy
 * @property {string} proxiedIp
 * @property {(ip:string)=>void} setProxiedIp
 * @property {string} proxiedAsn
 * @property {(asn:string)=>void} setProxiedAsn
 * @property {Object} sessionInfo
 * @property {(info:Object)=>void} setSessionInfo
 * @property {any} status
 * @property {(s:any)=>void} setStatus
 * @property {number|null} points
 * @property {(p:number|null)=>void} setPoints
 * @property {string} detectedIp
 * @property {(ip:string)=>void} setDetectedIp
 * @property {Object} prowlarr
 * @property {(p:Object)=>void} setProwlarr
 * @property {string|null} mamSessionCreatedDate
 * @property {(d:string|null)=>void} setMamSessionCreatedDate
 */

/** @type {SessionContextType} */
const defaultSessionContext = {
  sessionLabel: '',
  setSessionLabel: () => {},
  mamId: '',
  setMamId: () => {},
  sessionType: '',
  setSessionType: () => {},
  ipMonitoringMode: 'auto',
  setIpMonitoringMode: () => {},
  mamIp: '',
  setMamIp: () => {},
  checkFrequency: '',
  setCheckFrequency: () => {},
  oldLabel: '',
  setOldLabel: () => {},
  proxy: {},
  setProxy: () => {},
  proxiedIp: '',
  setProxiedIp: () => {},
  proxiedAsn: '',
  setProxiedAsn: () => {},
  sessionInfo: {},
  setSessionInfo: () => {},
  status: null,
  setStatus: () => {},
  points: null,
  setPoints: () => {},
  detectedIp: '',
  setDetectedIp: () => {},
  prowlarr: {},
  setProwlarr: () => {},
  mamSessionCreatedDate: null,
  setMamSessionCreatedDate: () => {},
};

const SessionContext = createContext(defaultSessionContext);

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
  const [checkFrequency, setCheckFrequency] = useState(/** @type {number|''} */ (''));
  const [oldLabel, setOldLabel] = useState('');
  const [proxy, setProxy] = useState({});
  const [proxiedIp, setProxiedIp] = useState('');
  const [proxiedAsn, setProxiedAsn] = useState('');

  const [sessionInfo, setSessionInfo] = useState({});
  const [status, setStatus] = useState(null);
  const [points, setPoints] = useState(null);
  const [detectedIp, setDetectedIp] = useState('');
  const [prowlarr, setProwlarr] = useState({});
  const [mamSessionCreatedDate, setMamSessionCreatedDate] = useState(
    /** @type {string|null} */ (null),
  );

  const value = {
    checkFrequency,
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
    prowlarr,
    setProwlarr,
    mamSessionCreatedDate,
    setMamSessionCreatedDate,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
