import { createContext, useContext, useEffect, useState } from 'react';
import { apiGet, apiPost } from '../utils/apiClient';

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
 * @property {Object} chaptarr
 * @property {(c:Object)=>void} setChaptarr
 * @property {Object} jackett
 * @property {(j:Object)=>void} setJackett
 * @property {Object} audiobookrequest
 * @property {(a:Object)=>void} setAudiobookrequest
 * @property {Object} autobrr
 * @property {(a:Object)=>void} setAutobrr
 * @property {string} error
 * @property {(message:string)=>void} reportError
 * @property {()=>void} dismissError
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
  chaptarr: {},
  setChaptarr: () => {},
  jackett: {},
  setJackett: () => {},
  audiobookrequest: {},
  setAudiobookrequest: () => {},
  autobrr: {},
  setAutobrr: () => {},
  error: '',
  reportError: () => {},
  dismissError: () => {},
};

const SessionContext = createContext(defaultSessionContext);

export function SessionProvider({ children }) {
  const [sessionLabel, setSessionLabel] = useState('');
  const [error, setError] = useState('');

  // On mount, load last session from backend
  useEffect(() => {
    apiGet('/api/last_session')
      .then((data) => {
        if (data?.label) setSessionLabel(data.label);
      })
      .catch((err) => setError(`Could not restore the last session: ${err.message}`));
  }, []);

  // Persist sessionLabel to backend when it changes
  useEffect(() => {
    if (sessionLabel) {
      apiPost('/api/last_session', { label: sessionLabel }).catch((err) =>
        setError(`Could not remember the selected session: ${err.message}`),
      );
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
  const [chaptarr, setChaptarr] = useState({});
  const [jackett, setJackett] = useState({});
  const [audiobookrequest, setAudiobookrequest] = useState({});
  const [autobrr, setAutobrr] = useState({});

  const value = {
    checkFrequency,
    detectedIp,
    dismissError: () => setError(''),
    error,
    ipMonitoringMode,
    mamId,
    mamIp,
    oldLabel,
    points,
    proxiedAsn,
    proxiedIp,
    proxy,
    reportError: setError,
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
    chaptarr,
    setChaptarr,
    jackett,
    setJackett,
    audiobookrequest,
    setAudiobookrequest,
    autobrr,
    setAutobrr,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
