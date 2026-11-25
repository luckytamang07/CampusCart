import React from 'react';
import { AppSidebar } from './components/layout/AppSidebar';
import { Footer } from './components/layout/Footer';
import { MobileWorkspaceChrome } from './components/layout/MobileNav';
import { Navbar } from './components/layout/Navbar';
import { ToastContainer } from './components/ui/ToastContainer';
import { AppProvider, useApp } from './context/AppContext';
import { BrowsePage } from './pages/BrowsePage';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { MessagesPage } from './pages/MessagesPage';
import { MyListingsPage } from './pages/MyListingsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SavedItemsPage } from './pages/SavedItemsPage';
import { SellProductPage } from './pages/SellProductPage';
import { SettingsPage } from './pages/SettingsPage';
import { SignUpPage } from './pages/SignUpPage';

const AppRouter: React.FC = () => {
  const { route, currentUser } = useApp();

  if (route === 'landing') {
    return <LandingPage />;
  }
  if (route === 'login') {
    return <LoginPage />;
  }
  if (route === 'signup') {
    return <SignUpPage />;
  }
  // Public browsing without login uses clean top Navbar + Footer;
  // Authenticated browsing & workspace routes use the full Sidebar + Mobile Chrome!
  const useWorkspaceShell = Boolean(currentUser);

  const renderPage = () => {
    switch (route) {
      case 'dashboard':
        return <DashboardPage />;
      case 'browse':
        return <BrowsePage />;
      case 'product-details':
        return <ProductDetailsPage />;
      case 'sell':
        return <SellProductPage />;
      case 'my-listings':
        return <MyListingsPage />;
      case 'saved':
        return <SavedItemsPage />;
      case 'messages':
        return <MessagesPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <LandingPage />;
    }
  };

  if (!useWorkspaceShell) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderPage()}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <AppSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileWorkspaceChrome />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
      <ToastContainer />
    </AppProvider>
  );
}
