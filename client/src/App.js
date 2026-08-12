import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import QueueEntryPage from "./pages/QueueEntryPage";
import UserStatus from "./pages/UserStatus";
import AdminDashboard from "./pages/AdminDashboard";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/queue-entry" element={<QueueEntryPage />} />
        <Route path="/status/:phone" element={<UserStatus />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Router>
  );
}

export default App;