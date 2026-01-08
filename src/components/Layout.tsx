import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
          <Header 
            title={title} 
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
          />
          
          <main className="flex-1 p-6 lg:p-8 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
