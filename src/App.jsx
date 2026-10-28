import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ToastProvider } from './components/ui.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Landing from './pages/Landing.jsx';
import Discover from './pages/Discover.jsx';
import Join from './pages/Join.jsx';
import Login from './pages/Login.jsx';
import EditProfile from './pages/EditProfile.jsx';
import TalentProfile from './pages/TalentProfile.jsx';
import CompanyProfile from './pages/CompanyProfile.jsx';
import NotFound from './pages/NotFound.jsx';

/** Keeps the viewport at the top when navigating between routes. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col bg-white">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/join" element={<Join />} />
            <Route path="/login" element={<Login />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/talent/:id" element={<TalentProfile />} />
            <Route path="/company/:id" element={<CompanyProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
