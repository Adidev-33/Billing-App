import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import MainPage from './pages/MainPage.jsx'
import InvoiceViewer from './pages/InvoiceViewer.jsx'
import './index.css' // Your main stylesheet

// Define the "pages" for your application
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // App contains the header and main layout
    children: [
      {
        path: '/',
        element: <MainPage />,
      },
      {
        path: '/view_invoice/:id', // This replaces view_invoice.html
        element: <InvoiceViewer />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)