import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { checkAuth, addSocketNotification } from './redux/slice/authSlice';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home';
import AnimeDetails from './pages/AnimeDetail/AnimeDetails';
import Watch from './pages/Watch';
import Search from './pages/Search';
import AdminDashboard from './pages/AdminDashBoard/AdminDashboard';
import Wishlist from './pages/WishList/Wishlist';
import Profile from './pages/Profile';
import Lenis from '@studio-freight/lenis';
import { Toaster, toast } from 'react-hot-toast';
import SmoothScroll from './components/common/animation/SmoothScroll';
import socketService from './services/socketService';

export default function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(checkAuth());
    
    // Initialize Socket Connection for Notifications
    socketService.getSocket();
    
    socketService.onNewNotification((notification) => {
      dispatch(addSocketNotification(notification));
      toast.success(notification.message, {
        icon: '🔔',
        style: {
          background: '#1c1c1c',
          color: '#fff',
          border: '1px solid #f33767',
        }
      });
    });

    return () => {
      socketService.off("new-notification");
    }
  }, [dispatch]);

  // Initialize Lenis
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] antialiased selection:bg-red-500/30 text-white overflow-x-hidden">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1c1c1c',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          }
        }}
      />
      <SmoothScroll>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/anime/:id" element={<AnimeDetails />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/search" element={<Search />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/watch/:episodeId" element={<Watch />} />
        </Routes>
      </SmoothScroll>
    </div>
  );
}