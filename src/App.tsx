import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// components
import MaxWidthWrapper from './components/MaxWidthWrapper';
import Home from './pages/Landing/LandingPage';
import Navbar from './components/Navbar';
import Dashboard from './pages/Home/Dashboard';
import Signin from './pages/Authentication/Signin';
import Signup from './pages/Authentication/Signup';
import Account from './pages/Authentication/Account';
// import { AuthContextProvider } from './context/AuthContext';
import { AuthProvider } from './provider/AuthProvider';

// shadcn
import { Toaster } from '@/components/ui/sonner';

const App = () => {
  return (
    <Router>
      {/* grainy */}
      <div className="min-h-screen antialiased dark:bg-gray-900 dark:bg-none dark:text-white">
        <Navbar />
        <MaxWidthWrapper>
          <AuthProvider>
            <Routes>
              {/* Landing page */}
              <Route path="/" element={<Home />} />
              {/* Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Authentication */}
              <Route path="/signin" element={<Signin />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/account" element={<Account />} />
            </Routes>
          </AuthProvider>
          <Toaster />
        </MaxWidthWrapper>
      </div>
    </Router>
  );
};

export default App;
