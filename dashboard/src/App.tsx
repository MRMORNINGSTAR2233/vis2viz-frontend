import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Hero from './components/layout/Hero';
import Features from './components/layout/Features';
import CTA from './components/layout/CTA';
import Footer from './components/layout/Footer';
import HolographicBackground from './components/effects/HolographicBackground';
import CircuitElements from './components/effects/CircuitElements';
import FloatingShapes from './components/effects/FloatingShapes';
import HowItWorks from './components/sections/HowItWorks';
import Pricing from './components/sections/Pricing';
import { useEffect } from 'react';
import './index.css';

function LandingPage() {
  useEffect(() => {
    // Add dark mode class to html element
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 text-white relative z-0">
      <HolographicBackground color="purple" opacity={0.15} />
      <CircuitElements color="purple" opacity={0.2} />
      <FloatingShapes color="purple" opacity={0.08} />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  useEffect(() => {
    // Add dark mode class to html element
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
