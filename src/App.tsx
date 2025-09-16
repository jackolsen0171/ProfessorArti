import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Components/Dashboard";
import Chat from "./Components/Chat";
import CalendarTest from "./Components/Calendar/CalendarTest";

import "./App.css"

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chatbot/:professorId" element={<Chat />} />
          <Route path="/calendar-test" element={<CalendarTest />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
