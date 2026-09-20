import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { ToastContainer } from '../../hooks/useToast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
};

export default Layout;