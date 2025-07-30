import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  FormControlLabel,
  Button,
  Switch,
  IconButton,
  CssBaseline,
  Tooltip,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { ThemeProvider, createTheme } from "@mui/material/styles";

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

  // App state (as before)
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

  const detectedIp = "97.91.210.200"; // Replace with actual detected IP logic

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <InfoIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MouseTrap
          </Typography>
          {/* Theme toggle */}
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
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Status</Typography>
            <Box sx={{ ml: 2 }}>
              <Typography variant="body1">MaM Cookie: <b>Missing</b></Typography>
              <Typography variant="body1">Points: <b>N/A</b></Typography>
              <Typography variant="body1">Wedge Automation: <b>N/A</b></Typography>
              <Typography variant="body1">VIP Automation: <b>N/A</b></Typography>
              <Typography variant="body1">Upload Automation: <b>N/A</b></Typography>
              <Typography variant="body1">
                Current IP: <b>{detectedIp}</b> (detected public IP)
              </Typography>
              <Typography variant="body1">ASN: <b>N/A</b></Typography>
              <Typography variant="body2" sx={{ mt: 1, color: "warning.main" }}>
                Please provide your MaM ID in the configuration.
              </Typography>
            </Box>
          </CardContent>
        </Card>

<Card sx={{ mb: 3 }}>
  <CardContent>
    <Typography variant="h6" gutterBottom>MouseTrap Configuration</Typography>
    <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
      <Grid item xs={12} sm={3}>
        <TextField
          label="MaM ID"
          value={mamId}
          onChange={e => setMamId(e.target.value)}
          fullWidth
          size="small"
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth size="small">
          <InputLabel>Session Type</InputLabel>
          <Select
            value={sessionType}
            label="Session Type"
            onChange={e => setSessionType(e.target.value)}
          >
            <MenuItem value="IP Locked">IP Locked</MenuItem>
            <MenuItem value="ASN Locked">ASN Locked</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="MaM IP (override)"
          value={mamIp}
          placeholder="e.g. 203.0.113.99"
          onChange={e => setMamIp(e.target.value)}
          size="small"
          fullWidth
        />
        <Box sx={{ mt: 1, display: "flex", alignItems: "center" }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setMamIp(detectedIp)}
            sx={{ mr: 1 }}
          >
            Use Detected Public IP
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
            Detected Public IP: <b>{detectedIp}</b>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ASN: <b>{currentASN || "N/A"}</b>
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Leave blank to use detected IP, or enter your VPN/public IP if you want MouseTrap to override.
        </Typography>
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth size="small">
          <InputLabel>Check Frequency (min)</InputLabel>
          <Select
            value={checkFrequency}
            label="Check Frequency (min)"
            onChange={e => setCheckFrequency(Number(e.target.value))}
          >
            {Array.from({ length: 60 }, (_, i) => (
              <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="caption" color="text.secondary">
          How often to check and update IP/ASN (minutes)
        </Typography>
      </Grid>
    </Grid>
  </CardContent>
</Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Perk Automation Options</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Buffer (points to keep)"
                  type="number"
                  value={buffer}
                  onChange={e => setBuffer(Number(e.target.value))}
                  size="small"
                  fullWidth
                  helperText="Points to maintain as safety buffer"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Wedge Hours (frequency)"
                  type="number"
                  value={wedgeHours}
                  onChange={e => setWedgeHours(Number(e.target.value))}
                  size="small"
                  fullWidth
                  helperText="Hours between wedge purchases"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                {/* Wedge Auto Purchase */}
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={autoWedge}
                        onChange={e => setAutoWedge(e.target.checked)}
                      />
                    }
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        Enable Wedge Auto Purchase
                        <Tooltip title="Automatically purchase freeleech wedges" arrow>
                          <IconButton size="small" sx={{ ml: 1 }}>
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: "block" }}>
                    Automatically purchase freeleech wedges
                  </Typography>
                </Box>
                {/* VIP Auto Purchase */}
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={autoVIP}
                        onChange={e => setAutoVIP(e.target.checked)}
                      />
                    }
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        Enable VIP Auto Purchase
                        <Tooltip title="Automatically purchase VIP status" arrow>
                          <IconButton size="small" sx={{ ml: 1 }}>
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: "block" }}>
                    Automatically purchase VIP status
                  </Typography>
                </Box>
                {/* Upload Credit Auto Purchase */}
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={autoUpload}
                        onChange={e => setAutoUpload(e.target.checked)}
                      />
                    }
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        Enable Upload Credit Auto Purchase
                        <Tooltip title="Automatically purchase upload credits" arrow>
                          <IconButton size="small" sx={{ ml: 1 }}>
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: "block" }}>
                    Automatically purchase upload credits
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" color="primary">Save</Button>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Notifications</Typography>
            <Typography variant="body2" color="text.secondary">
              Configure email and webhook notifications here. (Coming soon!)
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </ThemeProvider>
  );
}
