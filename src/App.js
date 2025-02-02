import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home.js";
import Chat from "./Components/Chat.js";

import "./App.css"

function App() {


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chatbot/:professorId" element={<Chat />} />
      </Routes>
    </Router>

  );
}

export default App;
