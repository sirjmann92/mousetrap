import React, { useState, useEffect } from "react";
import ConfigForm from "./components/ConfigForm";
import StatusPanel from "./components/StatusPanel";
import NotificationSettings from "./components/NotificationSettings";
import BrandingBar from "./components/BrandingBar";

function App() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch("/api/status")
      .then(res => res.json())
      .then(setStatus);
  }, []);

  return (
    <div>
      <BrandingBar />
      <main>
        <StatusPanel status={status} />
        <ConfigForm />
        <NotificationSettings />
      </main>
    </div>
  );
}

export default App;
