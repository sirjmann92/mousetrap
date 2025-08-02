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

// Component imports
import StatusCard from "./components/StatusCard";
import MouseTrapConfigCard from "./components/MouseTrapConfigCard";
import PerkAutomationCard from "./components/PerkAutomationCard";
import NotificationsCard from "./components/NotificationsCard";
import SessionSelector from "./components/SessionSelector";

// Asset imports
import MouseTrapIcon from "./assets/mousetrap-icon.svg";

export default function App() {
  // Theme state and persistence
  const [mode, setMode] = React.useState(() => {
    const saved = window.localStorage.getItem('themeMode');
    return saved ? saved : "light";
  });

  React.useEffect(() => {
    window.localStorage.setItem('themeMode', mode);
  }, [mode]);

  const theme = React.useMemo(() =>
    createTheme({
      palette: {
        mode: mode,
        primary: {
          main: "#1976d2", // MUI default blue
        },
      },
    }), [mode]);

  // App state (shared via props)
  const [mamId, setMamId] = React.useState("");
  const [sessionType, setSessionType] = React.useState("IP Locked");
  const [mamIp, setMamIp] = React.useState("");
  const [buffer, setBuffer] = React.useState(52000);
  const [wedgeHours, setWedgeHours] = React.useState(168);
  const [autoWedge, setAutoWedge] = React.useState(true);
  const [autoVIP, setAutoVIP] = React.useState(false);
  const [autoUpload, setAutoUpload] = React.useState(false);
  const [currentASN, setCurrentASN] = React.useState("12345"); // Replace with actual ASN logic!
  const [checkFrequency, setCheckFrequency] = React.useState(5); // Default frequency in minutes
  const [detectedIp, setDetectedIp] = React.useState("");
  const [points, setPoints] = React.useState(null);
  const [selectedLabel, setSelectedLabel] = React.useState("Session01");
  const [label, setLabel] = React.useState("Session01");
  const [oldLabel, setOldLabel] = React.useState("Session01");
  const [uploadAmount, setUploadAmount] = React.useState(1); // 1, 2.5, 5, 20, 100, 'Max Affordable'
  const [vipWeeks, setVipWeeks] = React.useState(4); // 4, 8, 'max'
  const [wedgeMethod, setWedgeMethod] = React.useState('points'); // 'points' or 'cheese'

  // Load session config by label
  const loadSession = async (labelToLoad) => {
    try {
      const res = await fetch(`/api/session/${labelToLoad}`);
      const cfg = await res.json();
      setSelectedLabel(cfg?.label ?? labelToLoad); // Use label from config file
      setLabel(cfg?.label ?? labelToLoad); // Set label for config card
      setOldLabel(cfg?.label ?? labelToLoad); // Track old label for rename
      setMamId(cfg?.mam?.mam_id ?? "");
      setSessionType(cfg?.mam?.session_type ?? "IP Locked");
      setMamIp(cfg?.mam_ip ?? "");
      setCheckFrequency(cfg?.check_freq ?? 5);
      // Add other fields as needed
    } catch (e) {
      // handle error
    }
  };

  // Refresh session list after save
  const handleSessionSaved = (label) => {
    loadSession(label);
  };

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
  };

  // Delete session handler
  const handleDeleteSession = async (label) => {
    await fetch(`/api/session/delete/${label}`, { method: "DELETE" });
    // After delete, load the first available session
    const res = await fetch("/api/sessions");
    const data = await res.json();
    const nextLabel = data.sessions[0] || "Session01";
    loadSession(nextLabel);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <img src={MouseTrapIcon} alt="MouseTrap" style={{ width: 48, height: 48, marginRight: 20 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MouseTrap
          </Typography>
          <SessionSelector
            selectedLabel={selectedLabel}
            setSelectedLabel={setSelectedLabel}
            onLoadSession={loadSession}
            onCreateSession={handleCreateSession}
            onDeleteSession={handleDeleteSession}
            sx={{ background: mode === "dark" ? "#222" : "#fff", borderRadius: 1, ml: 2 }}
          />
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

      <Container maxWidth="md">
        <StatusCard
          detectedIp={detectedIp}
          currentASN={currentASN}
          autoWedge={autoWedge}
          autoVIP={autoVIP}
          autoUpload={autoUpload}
          setDetectedIp={setDetectedIp}
          setPoints={setPoints}
        />
        <MouseTrapConfigCard
          mamId={mamId}
          setMamId={setMamId}
          sessionType={sessionType}
          setSessionType={setSessionType}
          mamIp={mamIp}
          setMamIp={setMamIp}
          detectedIp={detectedIp}
          currentASN={currentASN}
          checkFrequency={checkFrequency}
          setCheckFrequency={setCheckFrequency}
          label={label}
          setLabel={setLabel}
          oldLabel={oldLabel}
          onSessionSaved={handleSessionSaved}
        />
        <PerkAutomationCard
          buffer={buffer}
          setBuffer={setBuffer}
          wedgeHours={wedgeHours}
          setWedgeHours={setWedgeHours}
          autoWedge={autoWedge}
          setAutoWedge={setAutoWedge}
          autoVIP={autoVIP}
          setAutoVIP={setAutoVIP}
          autoUpload={autoUpload}
          setAutoUpload={setAutoUpload}
          points={points}
          uploadAmount={uploadAmount}
          setUploadAmount={setUploadAmount}
          vipWeeks={vipWeeks}
          setVipWeeks={setVipWeeks}
          wedgeMethod={wedgeMethod}
          setWedgeMethod={setWedgeMethod}
        />
        <NotificationsCard />
      </Container>
    </ThemeProvider>
  );
}
