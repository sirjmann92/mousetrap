import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import {
  AppBar,
  Box,
  Chip,
  Container,
  CssBaseline,
  IconButton,
  Switch,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React, { useCallback, useEffect, useState } from 'react';
import MouseTrapIcon from './assets/mousetrap-icon.svg';
import EventLogModalButton from './components/EventLogModalButton';
import FeedbackSnackbar from './components/FeedbackSnackbar';
import MouseTrapConfigCard from './components/MouseTrapConfigCard';
import NotificationsCard from './components/NotificationsCard';
import PerkAutomationCard from './components/PerkAutomationCard';
import PortMonitorCard from './components/PortMonitorCard';
import ProxyConfigCard from './components/ProxyConfigCard';
import SessionSelector from './components/SessionSelector';
import StatusCard from './components/StatusCard';
import { useSession } from './context/SessionContext.jsx';
import { apiDelete, apiGet, apiPost } from './utils/apiClient';

export default function App() {
  const {
    setSessionLabel,
    setMamId,
    setSessionType,
    setIpMonitoringMode,
    setMamIp,
    setCheckFrequency,
    setOldLabel,
    setProxy,
    setProxiedIp,
    setProxiedAsn,
    setProwlarr,
    setChaptarr,
    setJackett,
    setAudiobookrequest,
    setAutobrr,
    error,
    reportError,
    dismissError,
  } = useSession();

  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    apiGet('/api/version')
      .then((data) => setAppVersion(data.version || ''))
      .catch((err) => reportError(`Could not read the MouseTrap version: ${err.message}`));
  }, [reportError]);

  // Fetch all proxies and update state
  const refreshProxies = useCallback(async () => {
    try {
      setProxies((await apiGet('/api/proxies')) || {});
    } catch (err) {
      setProxies({});
      reportError(`Could not load proxies: ${err.message}`);
    }
  }, [reportError]);

  // Which sessions select which proxy, so the proxy card can disable deleting
  // one that is in use. It lives here because it changes with *sessions*, not
  // just proxies, and this is where session saves and deletes are handled.
  const refreshProxyUsage = useCallback(async () => {
    try {
      setProxyUsage((await apiGet('/api/proxies/usage')) || {});
    } catch (err) {
      setProxyUsage({});
      reportError(`Could not check which sessions are using a proxy: ${err.message}`);
    }
  }, [reportError]);

  const [autoVIP, setAutoVIP] = React.useState(false);
  const [autoUpload, setAutoUpload] = React.useState(false);
  const [uploadAmount, setUploadAmount] = React.useState(0);
  const [vipWeeks, setVipWeeks] = React.useState(0);
  const [forceExpandConfig, setForceExpandConfig] = React.useState(false);
  const [proxies, setProxies] = React.useState({});
  const [proxyUsage, setProxyUsage] = React.useState({});
  const [sessions, setSessions] = React.useState([]);
  const [selectedLabel, setSelectedLabel] = React.useState('');
  const statusCardRef = React.useRef(null);

  // Fetch all sessions and update state, restoring last session if available
  // (defined after loadSession)

  // On mount, fetch proxies
  React.useEffect(() => {
    refreshProxies();
    refreshProxyUsage();
  }, [refreshProxies, refreshProxyUsage]);

  // Handler to refresh session and proxies after session save
  const handleSessionSaved = (label) => {
    // Always reload session after save to get latest proxy/password info
    loadSession(label);
    // Optionally refresh sessions or proxies if needed
    refreshSessions();
    // The save may have taken or released a proxy, which changes whether that
    // proxy can be deleted.
    refreshProxyUsage();
    // Always force status refresh to update timer immediately
    if (statusCardRef?.current?.forceStatusRefresh) {
      statusCardRef.current.forceStatusRefresh();
    }
  };

  // Load session config by label (now updates context)
  const loadSession = React.useCallback(
    async (labelToLoad) => {
      try {
        const cfg = await apiGet(`/api/session/${labelToLoad}`);
        setSelectedLabel(cfg?.label ?? labelToLoad);
        setSessionLabel(cfg?.label ?? labelToLoad);
        setOldLabel(cfg?.label ?? labelToLoad);
        setMamId(cfg?.mam?.mam_id ?? '');
        setSessionType(cfg?.mam?.session_type ?? '');
        setIpMonitoringMode(cfg?.mam?.ip_monitoring_mode ?? 'auto');
        setMamIp(cfg?.mam_ip ?? '');
        setCheckFrequency(cfg?.check_freq ?? '');
        setProxy(cfg?.proxy ?? {});
        setProxiedIp(cfg?.proxied_public_ip ?? '');
        setProxiedAsn(cfg?.proxied_public_ip_asn ?? '');
        setProwlarr({
          auto_update_on_save: false,
          ...(cfg?.prowlarr ?? {}),
        });
        setChaptarr({
          auto_update_on_save: false,
          ...(cfg?.chaptarr ?? {}),
        });
        setJackett({
          auto_update_on_save: false,
          ...(cfg?.jackett ?? {}),
        });
        setAudiobookrequest({
          auto_update_on_save: false,
          ...(cfg?.audiobookrequest ?? {}),
        });
        setAutobrr({
          auto_update_on_save: false,
          ...(cfg?.autobrr ?? {}),
        });
      } catch (err) {
        reportError(`Could not load session '${labelToLoad}': ${err.message}`);
      }
    },
    [
      setSessionLabel,
      setOldLabel,
      setMamId,
      setSessionType,
      setIpMonitoringMode,
      setMamIp,
      setCheckFrequency,
      setProxy,
      setProxiedIp,
      setProxiedAsn,
      setProwlarr,
      setChaptarr,
      setJackett,
      setAudiobookrequest,
      setAutobrr,
      reportError,
    ],
  );

  // Fetch all sessions and update state, restoring last session if available
  const refreshSessions = React.useCallback(async () => {
    try {
      const data = await apiGet('/api/sessions');
      setSessions(data.sessions || []);
      // Try to restore last session from backend
      if ((!selectedLabel || !data.sessions.includes(selectedLabel)) && data.sessions.length > 0) {
        try {
          const lastLabel = (await apiGet('/api/last_session')).label;
          if (lastLabel && data.sessions.includes(lastLabel)) {
            setSelectedLabel(lastLabel);
            loadSession(lastLabel);
            return;
          }
        } catch (_e) {
          // Ignore and fall back to first session
        }
        setSelectedLabel(data.sessions[0]);
        loadSession(data.sessions[0]);
      }
    } catch (err) {
      setSessions([]);
      reportError(`Could not load your sessions: ${err.message}`);
    }
  }, [selectedLabel, loadSession, reportError]);
  // Theme state and persistence
  const [mode, setMode] = React.useState(() => {
    const saved = window.localStorage.getItem('themeMode');
    return saved ? saved : 'light';
  });

  React.useEffect(() => {
    window.localStorage.setItem('themeMode', mode);
  }, [mode]);

  // On mount, fetch sessions and set state
  React.useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: /** @type {'light'|'dark'} */ (mode),
          primary: {
            main: '#1976d2', // MUI default blue
          },
          background: {
            default: mode === 'light' ? '#f0f2f5' : '#121212', // Softer light gray for light mode
            paper: mode === 'light' ? '#ffffff' : '#242424', // Lighter dark mode cards for better contrast
          },
        },
      }),
    [mode],
  );

  // Create new session handler
  const handleCreateSession = async () => {
    // Generate a unique label
    const base = 'Session';
    let idx = 1;
    let newLabel = base + idx;
    try {
      while (true) {
        const data = await apiGet('/api/sessions');
        if (!data.sessions.includes(newLabel)) break;
        idx++;
        newLabel = base + idx;
      }
      await apiPost('/api/session/save', { label: newLabel });
    } catch (err) {
      reportError(`Could not create a session: ${err.message}`);
      return;
    }
    loadSession(newLabel);
    refreshSessions();
    setForceExpandConfig(true); // Expand config card after creating a new session
  };

  // Delete session handler
  const handleDeleteSession = async (label) => {
    try {
      await apiDelete(`/api/session/delete/${label}`);
    } catch (err) {
      reportError(`Could not delete session '${label}': ${err.message}`);
      return;
    }
    // After delete, load the first available session
    refreshSessions();
    // A deleted session releases whatever proxy it held.
    refreshProxyUsage();
    try {
      const data = await apiGet('/api/sessions');
      loadSession(data.sessions[0] || null);
    } catch (err) {
      reportError(`Could not load the remaining sessions: ${err.message}`);
    }
  };

  // Handler to update proxiedIp/proxiedAsn from StatusCard
  const handleStatusUpdate = (status) => {
    if (status?.proxied_public_ip) setProxiedIp(status.proxied_public_ip);
    else setProxiedIp('');
    if (status?.proxied_public_ip_asn) setProxiedAsn(status.proxied_public_ip_asn);
    else setProxiedAsn('');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          boxSizing: 'border-box',
          left: 0,
          mb: 3,
          right: 0,
          width: '100%',
        }}
      >
        <Toolbar>
          <img
            alt="MouseTrap"
            src={MouseTrapIcon}
            style={{ height: 48, marginRight: 20, width: 48 }}
          />
          <Typography
            component="div"
            sx={{ alignItems: 'center', display: 'flex', flexGrow: 1, gap: 1 }}
            variant="h6"
          >
            MouseTrap
            {appVersion && (
              <Tooltip arrow title={`Version ${appVersion}`}>
                <Chip
                  label={appVersion === 'dev' ? 'dev' : `v${appVersion}`}
                  size="small"
                  sx={{
                    cursor: 'default',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    height: 22,
                    opacity: 0.85,
                  }}
                  variant="outlined"
                />
              </Tooltip>
            )}
          </Typography>
          <SessionSelector
            onCreateSession={handleCreateSession}
            onDeleteSession={handleDeleteSession}
            onLoadSession={loadSession}
            sessions={sessions}
            sx={{
              background: mode === 'dark' ? '#222' : '#fff',
              borderRadius: 1,
              ml: 2,
            }}
          />
          <EventLogModalButton sessionLabel={selectedLabel} />
          <IconButton
            aria-label={`use ${mode === 'light' ? 'dark' : 'light'} theme`}
            color="inherit"
            onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
            sx={{ ml: 2 }}
          >
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Switch
            checked={mode === 'dark'}
            color="default"
            onChange={() => setMode(mode === 'light' ? 'dark' : 'light')}
            slotProps={{ input: { 'aria-label': 'toggle dark mode' } }}
            sx={{ ml: 1 }}
          />
        </Toolbar>
      </AppBar>

      {/* Add top padding to prevent content from being hidden behind fixed AppBar */}
      <Toolbar />
      <Box
        sx={{
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)', // Full height minus AppBar
          pb: 4,
          pt: 2,
        }}
      >
        <Container maxWidth="md">
          {/* 1. Session Status */}
          {sessions.length > 0 && (
            <StatusCard
              autoUpload={autoUpload}
              autoVIP={autoVIP}
              onSessionDataChanged={() => loadSession(selectedLabel)}
              onStatusUpdate={handleStatusUpdate}
              ref={statusCardRef}
            />
          )}
          {/* 2. Session Configuration */}
          <MouseTrapConfigCard
            forceExpand={forceExpandConfig}
            hasSessions={sessions.length > 0}
            onCreateNewSession={handleCreateSession}
            onForceExpandHandled={() => setForceExpandConfig(false)}
            onSessionSaved={handleSessionSaved}
            proxies={proxies}
          />
          {/* 3. Perk Purchase & Automation */}
          {sessions.length > 0 && (
            <PerkAutomationCard
              autoUpload={autoUpload}
              autoVIP={autoVIP}
              onActionComplete={() => {
                if (statusCardRef.current?.fetchStatus) {
                  statusCardRef.current.fetchStatus();
                }
              }}
              setAutoUpload={setAutoUpload}
              setAutoVIP={setAutoVIP}
              setUploadAmount={setUploadAmount}
              setVipWeeks={setVipWeeks}
              uploadAmount={uploadAmount}
              vipWeeks={vipWeeks}
            />
          )}
          {/* 4. Notifications */}
          <NotificationsCard />
          {/* 5. Docker Port Monitor */}
          <PortMonitorCard />
          {/* 6. Proxy Configuration */}
          <ProxyConfigCard
            proxies={proxies}
            proxyUsage={proxyUsage}
            refreshProxies={refreshProxies}
            refreshProxyUsage={refreshProxyUsage}
          />
        </Container>
      </Box>
      <FeedbackSnackbar
        message={error}
        onClose={dismissError}
        open={Boolean(error)}
        severity="error"
      />
    </ThemeProvider>
  );
}
