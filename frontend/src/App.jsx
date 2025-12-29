import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Workers from './pages/Workers';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user/dashboard" element={<Dashboard />} />
        <Route path="/user/workers" element={<Workers />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
