import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home.js";
import Chat from "./Components/Chat.js";
import McGillHeader from "./Components/McGillHeader.js";
import McGillFooter from "./Components/McGillFooter.js";

import "./App.css"

function App() {
  return (
    <Router>
      <div className="app">
        <McGillHeader />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chatbot/:professorId" element={<Chat />} />
          </Routes>
        </main>
        <McGillFooter />
      </div>
    </Router>
  );
}

export default App;
