import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './pages/Hero';
import Sobre from './pages/Sobre'; // Importe a página Sobre
import Contatos from './pages/Contatos'; // Importe a página Contatos
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/contatos" element={<Contatos />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
