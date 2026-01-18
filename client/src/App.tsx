import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Films from './pages/Films';
import Series from './pages/Series';
import MovieDetails from './pages/MovieDetails';
import SeriesDetails from './pages/SeriesDetails';
import MyList from './pages/MyList';
import History from './pages/History';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profiles from './pages/Profiles';
import Account from './pages/Account';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProfileProvider } from './context/ProfileContext';
import { AuthProvider } from './context/AuthContext';
import AuthGuard from './components/AuthGuard';
import ProfileGuard from './components/ProfileGuard';
import { useAuth } from './context/AuthContext';
import { useProfile } from './context/ProfileContext';

function AppLayout() {
  const location = useLocation();
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isAuthRoute = authRoutes.some(route => location.pathname.startsWith(route));
  const isProfilesRoute = location.pathname === '/profiles';
  const hideNavbar = isAuthRoute || isProfilesRoute;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!hideNavbar && <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profiles" element={<AuthGuard><Profiles /></AuthGuard>} />
          <Route path="/account" element={<AuthGuard><Account /></AuthGuard>} />
          <Route path="/profile" element={<AuthGuard><Account /></AuthGuard>} />
          <Route path="/" element={<AuthGuard><ProfileGuard><Home /></ProfileGuard></AuthGuard>} />
          <Route path="/films" element={<AuthGuard><ProfileGuard><Films /></ProfileGuard></AuthGuard>} />
          <Route path="/series" element={<AuthGuard><ProfileGuard><Series /></ProfileGuard></AuthGuard>} />
          <Route path="/movies/:id" element={<AuthGuard><ProfileGuard><MovieDetails /></ProfileGuard></AuthGuard>} />
          <Route path="/series/:id" element={<AuthGuard><ProfileGuard><SeriesDetails /></ProfileGuard></AuthGuard>} />
          <Route path="/my-list" element={<AuthGuard><ProfileGuard><MyList /></ProfileGuard></AuthGuard>} />
          <Route path="/history" element={<AuthGuard><ProfileGuard><History /></ProfileGuard></AuthGuard>} />
          <Route path="/admin" element={<AuthGuard><Admin /></AuthGuard>} />
          <Route path="*" element={<NotFoundRedirect />} />
        </Routes>
      </main>
      {!isAuthRoute && <Footer />}
    </div>
  );
}

function NotFoundRedirect() {
  const { isAuthenticated } = useAuth();
  const { activeProfile } = useProfile();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!activeProfile) return <Navigate to="/profiles" replace />;
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </ProfileProvider>
    </AuthProvider>
  );
}
