import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MainPage from './pages/MainPage';
import Login from './pages/Login';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/dashboard" element={<MainPage />} />
      <Route path="/tryon" element={<Home />} />
      {/* <Route path="/login" element={<Login />} /> */}
    </Routes>
  );
}

export default App;
