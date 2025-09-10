import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  IconButton,
  Switch,
  CssBaseline
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useSession } from "./context/SessionContext";
import StatusCard from "./components/StatusCard";
import EventLogModalButton from "./components/EventLogModalButton";
import MouseTrapConfigCard from "./components/MouseTrapConfigCard";
import ProxyConfigCard from "./components/ProxyConfigCard";
import PerkAutomationCard from "./components/PerkAutomationCard";
import NotificationsCard from "./components/NotificationsCard";
import VaultConfigCard from "./components/VaultConfigCard";
import PortMonitorCard from "./components/PortMonitorCard";
import SessionSelector from "./components/SessionSelector";
import MouseTrapIcon from "./assets/mousetrap-icon.svg";

export default function App() {
  // Fetch all proxies and update state
  const refreshProxies = async () => {
    try {
      const res = await fetch("/api/proxies");
      const data = await res.json();
      setProxies(data || {});
    } catch (e) {
      setProxies({});
    }
  };
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
    setProxiedAsn
  } = useSession();
  // State for automation and perks
  const [autoWedge, setAutoWedge] = React.useState(false);
  const [autoVIP, setAutoVIP] = React.useState(false);
  const [autoUpload, setAutoUpload] = React.useState(false);
  const [uploadAmount, setUploadAmount] = React.useState(0);
  const [vipWeeks, setVipWeeks] = React.useState(0);
  const [wedgeMethod, setWedgeMethod] = React.useState("");
  const [forceExpandConfig, setForceExpandConfig] = React.useState(false);
  const [proxies, setProxies] = React.useState({});
  const [sessions, setSessions] = React.useState([]);
  const [selectedLabel, setSelectedLabel] = React.useState("");
  const statusCardRef = React.useRef();

  // Fetch all sessions and update state, restoring last session if available
  const refreshSessions = async () => {
    try {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
      // Try to restore last session from backend
      if ((!selectedLabel || !data.sessions.includes(selectedLabel)) && data.sessions.length > 0) {
        // Fetch last session from backend
        try {
          const lastSessionRes = await fetch("/api/last_session");
          const lastSessionData = await lastSessionRes.json();
          const lastLabel = lastSessionData.label;
          if (lastLabel && data.sessions.includes(lastLabel)) {
            setSelectedLabel(lastLabel);
            loadSession(lastLabel);
            return;
          }
        } catch (e) {
          // Ignore and fall back to first session
        }
        setSelectedLabel(data.sessions[0]);
        loadSession(data.sessions[0]);
      }
    } catch (e) {
      setSessions([]);
    }
  };

  // On mount, fetch proxies
  React.useEffect(() => {
    refreshProxies();
  }, []);

  // Handler to refresh session and proxies after session save
  const handleSessionSaved = (label, oldLabel) => {
    // Always reload session after save to get latest proxy/password info
    loadSession(label);
    // Optionally refresh sessions or proxies if needed
    refreshSessions();
    // Always force status refresh to update timer immediately
    if (statusCardRef && statusCardRef.current && statusCardRef.current.forceStatusRefresh) {
      statusCardRef.current.forceStatusRefresh();
    }
  };

  // Load session config by label (now updates context)
  const loadSession = async (labelToLoad) => {
    try {
      const res = await fetch(`/api/session/${labelToLoad}`);
      const cfg = await res.json();
      setSelectedLabel(cfg?.label ?? labelToLoad);
      setSessionLabel(cfg?.label ?? labelToLoad);
      setOldLabel(cfg?.label ?? labelToLoad);
      setMamId(cfg?.mam?.mam_id ?? "");
      setSessionType(cfg?.mam?.session_type ?? "");
      setIpMonitoringMode(cfg?.mam?.ip_monitoring_mode ?? "auto");
      setMamIp(cfg?.mam_ip ?? "");
      setCheckFrequency(cfg?.check_freq ?? "");
      setProxy(cfg?.proxy ?? {});
      setProxiedIp(cfg?.proxied_public_ip ?? "");
      setProxiedAsn(cfg?.proxied_public_ip_asn ?? "");
    } catch (e) {
      // handle error
    }
  };
  // Theme state and persistence
  const [mode, setMode] = React.useState(() => {
    const saved = window.localStorage.getItem('themeMode');
    return saved ? saved : "light";
  });


  React.useEffect(() => {
    window.localStorage.setItem('themeMode', mode);
  }, [mode]);

  // On mount, fetch sessions and set state
  React.useEffect(() => {
    refreshSessions();
    // eslint-disable-next-line
  }, []);

  const theme = React.useMemo(() =>
    createTheme({
      palette: {
        mode: mode,
        primary: {
          main: "#1976d2", // MUI default blue
        },
      },
    }), [mode]
  );

  // Create new session handler
  const handleCreateSession = async () => {
    // Generate a unique label
    let base = "Session";
    let idx = 1;
    let newLabel = base + idx;
    // Try to avoid collisions
    while (true) {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      if (!data.sessions.includes(newLabel)) break;
      idx++;
      newLabel = base + idx;
    }
    // Save a new session with default config
    await fetch(`/api/session/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel })
    });
    loadSession(newLabel);
    refreshSessions();
    setForceExpandConfig(true); // Expand config card after creating a new session
  };

  // Delete session handler
  const handleDeleteSession = async (label) => {
    await fetch(`/api/session/delete/${label}`, { method: "DELETE" });
    // After delete, load the first available session
    refreshSessions();
    const res = await fetch("/api/sessions");
    const data = await res.json();
    const nextLabel = data.sessions[0] || null;
    loadSession(nextLabel);
  };

  // Handler to update proxiedIp/proxiedAsn from StatusCard
  const handleStatusUpdate = (status) => {
    if (status && status.proxied_public_ip) setProxiedIp(status.proxied_public_ip);
    else setProxiedIp("");
    if (status && status.proxied_public_ip_asn) setProxiedAsn(status.proxied_public_ip_asn);
    else setProxiedAsn("");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ mb: 3, width: '100%', left: 0, right: 0, boxSizing: 'border-box' }}>
        <Toolbar>
          <img src={MouseTrapIcon} alt="MouseTrap" style={{ width: 48, height: 48, marginRight: 20 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MouseTrap
          </Typography>
          <SessionSelector
            onLoadSession={loadSession}
            onCreateSession={handleCreateSession}
            onDeleteSession={handleDeleteSession}
            sx={{ background: mode === "dark" ? "#222" : "#fff", borderRadius: 1, ml: 2 }}
          />
          <EventLogModalButton sessionLabel={selectedLabel} />
          <IconButton color="inherit" onClick={() => setMode(mode === "light" ? "dark" : "light")}
            sx={{ ml: 2 }}>
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Switch
            checked={mode === "dark"}
            onChange={() => setMode(mode === "light" ? "dark" : "light")}
            color="default"
            inputProps={{ "aria-label": "toggle dark mode" }}
            sx={{ ml: 1 }}
          />
        </Toolbar>
      </AppBar>

      {/* Add top padding to prevent content from being hidden behind fixed AppBar */}
      <Toolbar />
      <Container maxWidth="md">
        {/* 1. Session Status */}
        {sessions.length > 0 && (
          <StatusCard
            ref={statusCardRef}
            autoWedge={autoWedge}
            autoVIP={autoVIP}
            autoUpload={autoUpload}
            onSessionDataChanged={() => loadSession(selectedLabel)}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
        {/* 2. Session Configuration */}
        <MouseTrapConfigCard
          proxies={proxies}
          onSessionSaved={handleSessionSaved}
          hasSessions={sessions.length > 0}
          onCreateNewSession={handleCreateSession}
          forceExpand={forceExpandConfig}
          onForceExpandHandled={() => setForceExpandConfig(false)}
        />
        {/* 3. Perk Purchase & Automation */}
        {sessions.length > 0 && (
          <PerkAutomationCard
            autoWedge={autoWedge}
            setAutoWedge={setAutoWedge}
            autoVIP={autoVIP}
            setAutoVIP={setAutoVIP}
            autoUpload={autoUpload}
            setAutoUpload={setAutoUpload}
            uploadAmount={uploadAmount}
            setUploadAmount={setUploadAmount}
            vipWeeks={vipWeeks}
            setVipWeeks={setVipWeeks}
            wedgeMethod={wedgeMethod}
            setWedgeMethod={setWedgeMethod}
            onActionComplete={() => {
              if (statusCardRef.current && statusCardRef.current.fetchStatus) {
                statusCardRef.current.fetchStatus();
              }
            }}
          />
        )}
        {/* 4. Millionaire's Vault Configuration */}
        <VaultConfigCard 
          proxies={proxies}
          sessions={sessions}
        />
        {/* 5. Notifications */}
        <NotificationsCard />
        {/* 6. Docker Port Monitor */}
        <PortMonitorCard />
        {/* 7. Proxy Configuration */}
        <ProxyConfigCard proxies={proxies} setProxies={setProxies} refreshProxies={refreshProxies} />
      </Container>
    </ThemeProvider>
  );
}
