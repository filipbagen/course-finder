import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// components
import MaxWidthWrapper from './components/MaxWidthWrapper';
import Home from './pages/Landing/LandingPage';
import Navbar from './components/Navbar';
import Dashboard from './pages/Home/Dashboard';

// shadcn
import { Toaster } from '@/components/ui/sonner';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen antialiased grainy">
        <Navbar />
        <MaxWidthWrapper>
          <Routes>
            {/* Landing page */}
            <Route path="/" element={<Home />} />
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
          <Toaster />
        </MaxWidthWrapper>
      </div>
    </Router>
  );
};

export default App;
