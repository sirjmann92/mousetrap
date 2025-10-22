import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  IconButton,
  Switch,
  Toolbar,
  Typography,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React, { useCallback } from 'react';
import MouseTrapIcon from './assets/mousetrap-icon.svg';
import EventLogModalButton from './components/EventLogModalButton';
import MAMBrowserSetupCard from './components/MAMBrowserSetupCard';
import MouseTrapConfigCard from './components/MouseTrapConfigCard';
import NotificationsCard from './components/NotificationsCard';
import PerkAutomationCard from './components/PerkAutomationCard';
import PortMonitorCard from './components/PortMonitorCard';
import ProxyConfigCard from './components/ProxyConfigCard';
import SessionSelector from './components/SessionSelector';
import StatusCard from './components/StatusCard';
import VaultConfigCard from './components/VaultConfigCard';
import { useSession } from './context/SessionContext.jsx';

export default function App() {
  // Fetch all proxies and update state
  const refreshProxies = useCallback(async () => {
    try {
      const res = await fetch('/api/proxies');
      const data = await res.json();
      setProxies(data || {});
    } catch (_e) {
      setProxies({});
    }
  }, []);

  // Fetch all vault configurations and update state
  const refreshVaultConfigurations = useCallback(async () => {
    try {
      const res = await fetch('/api/vault/configurations');
      const data = await res.json();
      setVaultConfigurations(data.configurations || {});
    } catch (_e) {
      setVaultConfigurations({});
    }
  }, []);

  // Get context setters from SessionContext
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
    setMamSessionCreatedDate,
  } = useSession();
  // State for automation and perks
  const [autoWedge, setAutoWedge] = React.useState(false);
  const [autoVIP, setAutoVIP] = React.useState(false);
  const [autoUpload, setAutoUpload] = React.useState(false);
  const [uploadAmount, setUploadAmount] = React.useState(0);
  const [vipWeeks, setVipWeeks] = React.useState(0);
  const [wedgeMethod, setWedgeMethod] = React.useState('');
  const [forceExpandConfig, setForceExpandConfig] = React.useState(false);
  const [proxies, setProxies] = React.useState({});
  const [sessions, setSessions] = React.useState([]);
  const [selectedLabel, setSelectedLabel] = React.useState('');
  const [vaultConfigurations, setVaultConfigurations] = React.useState({});
  const statusCardRef = React.useRef(null);

  // Fetch all sessions and update state, restoring last session if available
  // (defined after loadSession)

  // On mount, fetch proxies
  React.useEffect(() => {
    refreshProxies();
  }, [refreshProxies]);

  // On mount, fetch vault configurations
  React.useEffect(() => {
    refreshVaultConfigurations();
  }, [refreshVaultConfigurations]);

  // Handler to refresh session and proxies after session save
  const handleSessionSaved = (label) => {
    // Always reload session after save to get latest proxy/password info
    loadSession(label);
    // Optionally refresh sessions or proxies if needed
    refreshSessions();
    // Always force status refresh to update timer immediately
    if (statusCardRef?.current?.forceStatusRefresh) {
      statusCardRef.current.forceStatusRefresh();
    }
  };

  // Load session config by label (now updates context)
  const loadSession = React.useCallback(
    async (labelToLoad) => {
      try {
        const res = await fetch(`/api/session/${labelToLoad}`);
        const cfg = await res.json();
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
        setProwlarr(cfg?.prowlarr ?? {});
        setMamSessionCreatedDate(cfg?.mam_session_created_date || '');
      } catch (_e) {
        // handle error
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
      setMamSessionCreatedDate,
    ],
  );

  // Fetch all sessions and update state, restoring last session if available
  const refreshSessions = React.useCallback(async () => {
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      setSessions(data.sessions || []);
      // Try to restore last session from backend
      if ((!selectedLabel || !data.sessions.includes(selectedLabel)) && data.sessions.length > 0) {
        try {
          const lastSessionRes = await fetch('/api/last_session');
          const lastSessionData = await lastSessionRes.json();
          const lastLabel = lastSessionData.label;
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
    } catch (_e) {
      setSessions([]);
    }
  }, [selectedLabel, loadSession]);
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
    // Try to avoid collisions
    while (true) {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      if (!data.sessions.includes(newLabel)) break;
      idx++;
      newLabel = base + idx;
    }
    // Save a new session with default config
    await fetch(`/api/session/save`, {
      body: JSON.stringify({ label: newLabel }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    loadSession(newLabel);
    refreshSessions();
    setForceExpandConfig(true); // Expand config card after creating a new session
  };

  // Delete session handler
  const handleDeleteSession = async (label) => {
    await fetch(`/api/session/delete/${label}`, { method: 'DELETE' });
    // After delete, load the first available session
    refreshSessions();
    const res = await fetch('/api/sessions');
    const data = await res.json();
    const nextLabel = data.sessions[0] || null;
    loadSession(nextLabel);
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
          <Typography component="div" sx={{ flexGrow: 1 }} variant="h6">
            MouseTrap
          </Typography>
          <SessionSelector
            onCreateSession={handleCreateSession}
            onDeleteSession={handleDeleteSession}
            onLoadSession={loadSession}
            sx={{
              background: mode === 'dark' ? '#222' : '#fff',
              borderRadius: 1,
              ml: 2,
            }}
          />
          <EventLogModalButton sessionLabel={selectedLabel} />
          <IconButton
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
              autoWedge={autoWedge}
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
              autoWedge={autoWedge}
              onActionComplete={() => {
                if (statusCardRef.current?.fetchStatus) {
                  statusCardRef.current.fetchStatus();
                }
              }}
              setAutoUpload={setAutoUpload}
              setAutoVIP={setAutoVIP}
              setAutoWedge={setAutoWedge}
              setUploadAmount={setUploadAmount}
              setVipWeeks={setVipWeeks}
              setWedgeMethod={setWedgeMethod}
              uploadAmount={uploadAmount}
              vipWeeks={vipWeeks}
              wedgeMethod={wedgeMethod}
            />
          )}
          {/* 4. Millionaire's Vault Configuration */}
          <VaultConfigCard
            _proxies={proxies}
            _sessions={sessions}
            onConfigUpdate={refreshVaultConfigurations}
            vaultConfigurations={vaultConfigurations}
          />
          {/* 5. Notifications */}
          <NotificationsCard />
          {/* 6. Browser Cookie Setup */}
          <MAMBrowserSetupCard
            onConfigUpdate={refreshVaultConfigurations}
            proxies={proxies}
            sessions={sessions}
            vaultConfigurations={vaultConfigurations}
          />
          {/* 7. Docker Port Monitor */}
          <PortMonitorCard />
          {/* 8. Proxy Configuration */}
          <ProxyConfigCard proxies={proxies} refreshProxies={refreshProxies} />
        </Container>
      </Box>
    </ThemeProvider>
  );
}
