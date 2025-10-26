import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  // Don't show the header on the print-only view_invoice page
  const showHeader = location.pathname === '/';

  return (
    <>
      {showHeader && (
        <header className="app-header">
          <img src="/logo.png" alt="Company Logo" className="company-logo" />
          <div className="company-details">
            <h1>BILLING APP</h1>
          </div>
        </header>
      )}
      <main>
        {/* Outlet renders the current route's element (MainPage or InvoiceViewer) */}
        <Outlet /> 
      </main>
    </>
  );
}

export default App;