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
import InfoIcon from "@mui/icons-material/Info";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Component imports
import StatusCard from "./components/StatusCard";
import MouseTrapConfigCard from "./components/MouseTrapConfigCard";
import PerkAutomationCard from "./components/PerkAutomationCard";
import NotificationsCard from "./components/NotificationsCard";

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <InfoIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MouseTrap
          </Typography>
          <IconButton color="inherit" onClick={() => setMode(mode === "light" ? "dark" : "light")}>
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Switch
            checked={mode === "dark"}
            onChange={() => setMode(mode === "light" ? "dark" : "light")}
            color="default"
            inputProps={{ "aria-label": "toggle dark mode" }}
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
        />
        <NotificationsCard />
      </Container>
    </ThemeProvider>
  );
}
