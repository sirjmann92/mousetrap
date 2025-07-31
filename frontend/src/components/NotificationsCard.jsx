import React, { useState } from "react";
import { Card, CardContent, Typography, IconButton, Collapse, Box } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function NotificationsCard() {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" gutterBottom>Notifications</Typography>
          <IconButton onClick={() => setExpanded(e => !e)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={expanded}>
          <Typography variant="body2" color="text.secondary">
            Configure email and webhook notifications here. (Coming soon!)
          </Typography>
        </Collapse>
      </CardContent>
    </Card>
  );
}