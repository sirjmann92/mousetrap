import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Button,
  Tooltip,
  IconButton,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function PerkAutomationCard({
  buffer, setBuffer,
  wedgeHours, setWedgeHours,
  autoWedge, setAutoWedge,
  autoVIP, setAutoVIP,
  autoUpload, setAutoUpload
}) {
  return (
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
  );
}