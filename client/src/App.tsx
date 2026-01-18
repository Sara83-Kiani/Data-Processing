import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
          <Route path="/" element={<ProfileGuard><Home /></ProfileGuard>} />
          <Route path="/films" element={<ProfileGuard><Films /></ProfileGuard>} />
          <Route path="/series" element={<ProfileGuard><Series /></ProfileGuard>} />
          <Route path="/movies/:id" element={<ProfileGuard><MovieDetails /></ProfileGuard>} />
          <Route path="/series/:id" element={<ProfileGuard><SeriesDetails /></ProfileGuard>} />
          <Route path="/my-list" element={<AuthGuard><ProfileGuard><MyList /></ProfileGuard></AuthGuard>} />
          <Route path="/history" element={<AuthGuard><ProfileGuard><History /></ProfileGuard></AuthGuard>} />
          <Route path="/admin" element={<AuthGuard><Admin /></AuthGuard>} />
        </Routes>
      </main>
      {!isAuthRoute && <Footer />}
    </div>
  );
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
