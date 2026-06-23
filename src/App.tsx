import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { MyRegistrations } from './pages/MyRegistrations';
import { AdminDashboard } from './pages/AdminDashboard';
import { Certificates } from './pages/Certificates';
import { OrganizerModule } from './pages/OrganizerModule';
import { ScalabilityAudit } from './pages/ScalabilityAudit';
import { ExecutiveReports } from './pages/ExecutiveReports';
import { MobileDocs } from './pages/MobileDocs';
import { GovDigitalConsulting } from './pages/GovDigitalConsulting';
import { LgpdDashboard } from './pages/LgpdDashboard';
import { PublicValidation } from './pages/PublicValidation';
import { ProtectedRoute } from './components/ProtectedRoute';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

const AppContent: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Routes location={location}>
              {/* Rotas Públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/certificados" element={<Certificates />} />
              <Route path="/validar" element={<PublicValidation />} />
              <Route path="/validar/:code" element={<PublicValidation />} />

              {/* Rotas Protegidas */}
              <Route 
                path="/my-registrations" 
                element={
                  <ProtectedRoute>
                    <MyRegistrations />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rota Administrativa Oficial */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Rota do Organizador GOVVIVA */}
              <Route 
                path="/organizador" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <OrganizerModule />
                  </ProtectedRoute>
                } 
              />

              {/* Rota de Auditoria de Escalabilidade */}
              <Route 
                path="/auditoria" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ScalabilityAudit />
                  </ProtectedRoute>
                } 
              />

              {/* Rota de Relatórios Executivos */}
              <Route 
                path="/relatorios" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ExecutiveReports />
                  </ProtectedRoute>
                } 
              />

              {/* Rota de Documentação App Móvel React Native */}
              <Route 
                path="/mobiledocs" 
                element={<MobileDocs />} 
              />

              {/* Rota de Consultoria e Visão 2.0 */}
              <Route 
                path="/consultoria" 
                element={<GovDigitalConsulting />} 
              />

              {/* Central LGPD Completa */}
              <Route 
                path="/lgpd" 
                element={<LgpdDashboard />} 
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
