import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import DataManagement from './pages/DataManagement';
import './App.css';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/data" element={<DataManagement />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;



// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './contexts/AuthContext';
// import { ToastProvider } from './components/Toast';
// import ErrorBoundary from './components/ErrorBoundary';
// import ProtectedRoute from './components/ProtectedRoute';
// import Layout from './components/Layout';
// import Login from './pages/Login';
// import Signup from './pages/Signup';
// import Dashboard from './pages/Dashboard';
// import Customers from './pages/Customers';
// import Orders from './pages/Orders';
// import Payments from './pages/Payments';
// import Reports from './pages/Reports';
// import DataManagement from './pages/DataManagement';
// import './App.css';

// function App() {
//   return (
//     <ErrorBoundary>
//       <BrowserRouter>
//         <AuthProvider>
//           <ToastProvider>
//             <Routes>
//               <Route path="/login" element={<Login />} />
//               <Route path="/signup" element={<Signup />} />
//               <Route path="/" element={<Navigate to="/dashboard" replace />} />
//               <Route
//                 element={
//                   <ProtectedRoute>
//                     <Layout />
//                   </ProtectedRoute>
//                 }
//               >
//                 <Route path="/dashboard" element={<Dashboard />} />
//                 <Route path="/customers" element={<Customers />} />
//                 <Route path="/orders" element={<Orders />} />
//                 <Route path="/payments" element={<Payments />} />
//                 <Route path="/reports" element={<Reports />} />
//                 <Route path="/data" element={<DataManagement />} />
//               </Route>
//             </Routes>
//           </ToastProvider>
//         </AuthProvider>
//       </BrowserRouter>
//     </ErrorBoundary>
//   );
// }

// export default App;