import MaxWidthWrapper from './components/MaxWidthWrapper';
import Home from './pages/Landing/LandingPage';
import Navbar from './components/Navbar';

const App = () => {
  return (
    <div className="min-h-screen font-sans antialiased grainy">
      <Navbar />
      <MaxWidthWrapper>
        <Home />
      </MaxWidthWrapper>
    </div>
  );
};

export default App;
