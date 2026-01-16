import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Availability from './pages/Availability';
import Meetings from './pages/Meetings';
import BookingPage from './pages/BookingPage';

function App() {
  return (
    <Router>
      <Toaster position="top-right" theme="dark" />
      <Routes>
        {/* Public Booking Route - No Sidebar Layout */}
        <Route path="/book/:slug" element={<BookingPage />} />

        {/* Protected App Routes - With Sidebar */}
        <Route path="/" element={<Layout><Navigate to="/event-types" replace /></Layout>} />
        <Route path="/event-types" element={<Layout><Dashboard /></Layout>} />
        <Route path="/availability" element={<Layout><Availability /></Layout>} />
        <Route path="/meetings" element={<Layout><Meetings /></Layout>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
