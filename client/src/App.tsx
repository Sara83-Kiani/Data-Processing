import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Films from './pages/Films';
import Series from './pages/Series';
import MovieDetails from './pages/MovieDetails';
import SeriesDetails from './pages/SeriesDetails';
import MyList from './pages/MyList';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProfileProvider } from './context/ProfileContext';

export default function App() {
  return (
    <ProfileProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/films" element={<Films />} />
              <Route path="/series" element={<Series />} />
              <Route path="/movies/:id" element={<MovieDetails />} />
              <Route path="/series/:id" element={<SeriesDetails />} />
              <Route path="/my-list" element={<MyList />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ProfileProvider>
  );
}
