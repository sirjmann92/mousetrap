import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

export default function NotificationsCard() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Notifications</Typography>
        <Typography variant="body2" color="text.secondary">
          Configure email and webhook notifications here. (Coming soon!)
        </Typography>
      </CardContent>
    </Card>
  );
}