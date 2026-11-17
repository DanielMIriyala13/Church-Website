import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Jubilee from './pages/Jubilee';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import PublicAnnouncements from './pages/PublicAnnouncements';
import PublicPrayers from './pages/PublicPrayers';
import VerifyChurchId from './pages/VerifyChurchId';
import Login from './pages/Login';

// Portal Management Pages
import Dashboard from './pages/portal/Dashboard';
import MemberManagement from './pages/portal/MemberManagement';
import AttendanceManagement from './pages/portal/AttendanceManagement';
import DepartmentManagement from './pages/portal/DepartmentManagement';
import AnnouncementManagement from './pages/portal/AnnouncementManagement';
import PrayerManagement from './pages/portal/PrayerManagement';
import MyIdCard from './pages/portal/MyIdCard';

import './App.css';

// Root portal redirect helper based on role
const PortalRootRedirect = () => {
    const { user, isStaff } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (isStaff) return <Navigate to="/portal/dashboard" replace />;
    return <Navigate to="/portal/my-id" replace />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Navbar />
                    <Routes>
                        {/* Public Church Website Pages */}
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/jubilee" element={<Jubilee />} />
                        <Route path="/events" element={<Events />} />
                        <Route path="/gallery" element={<Gallery />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/announcements" element={<PublicAnnouncements />} />
                        <Route path="/prayers" element={<PublicPrayers />} />
                        <Route path="/verify/:churchId" element={<VerifyChurchId />} />
                        <Route path="/login" element={<Login />} />

                        {/* Portal Default Redirect */}
                        <Route path="/portal" element={
                            <ProtectedRoute>
                                <PortalRootRedirect />
                            </ProtectedRoute>
                        } />

                        {/* Central Admin & Staff Dashboard */}
                        <Route path="/portal/dashboard" element={
                            <ProtectedRoute allowedRoles={['Super Admin', 'Church Admin', 'Pastor', 'Department Head']}>
                                <Dashboard />
                            </ProtectedRoute>
                        } />

                        {/* Church ID & Member Management */}
                        <Route path="/portal/members" element={
                            <ProtectedRoute allowedRoles={['Super Admin', 'Church Admin', 'Pastor']}>
                                <MemberManagement />
                            </ProtectedRoute>
                        } />

                        {/* Attendance & Check-in Management */}
                        <Route path="/portal/attendance" element={
                            <ProtectedRoute allowedRoles={['Super Admin', 'Church Admin', 'Pastor', 'Department Head']}>
                                <AttendanceManagement />
                            </ProtectedRoute>
                        } />

                        {/* Department Management */}
                        <Route path="/portal/departments" element={
                            <ProtectedRoute allowedRoles={['Super Admin', 'Church Admin', 'Pastor', 'Department Head']}>
                                <DepartmentManagement />
                            </ProtectedRoute>
                        } />

                        {/* Announcements Management */}
                        <Route path="/portal/announcements" element={
                            <ProtectedRoute allowedRoles={['Super Admin', 'Church Admin', 'Pastor', 'Department Head']}>
                                <AnnouncementManagement />
                            </ProtectedRoute>
                        } />

                        {/* Prayer Requests Management */}
                        <Route path="/portal/prayers" element={
                            <ProtectedRoute allowedRoles={['Super Admin', 'Church Admin', 'Pastor', 'Department Head', 'Church Member']}>
                                <PrayerManagement />
                            </ProtectedRoute>
                        } />

                        {/* Member's Digital ID Card & Personal Profile */}
                        <Route path="/portal/my-id" element={
                            <ProtectedRoute>
                                <MyIdCard />
                            </ProtectedRoute>
                        } />

                        {/* Catch-all fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
