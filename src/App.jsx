import { useState, useEffect } from 'react';
import Login from './components/Login';
import ContactList from './components/ContactList';
import UsersList from './components/UsersList';
import Header from './components/Header';
import Footer from './components/Footer';
import ForgotPassword from './components/ForgotPassword'; 
import './App.css';
import ResetPassword from './components/ResetPassword';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false); // Estado para navegación interna
  const [isResetting, setIsResetting] = useState(window.location.pathname === '/reset-password');
  const [view, setView] = useState("contacts");
  const [isWakingUp, setIsWakingUp] = useState(true); 
  
  const username = localStorage.getItem('username');

  const handleFinishReset = () => {
    // Al terminar, limpiamos la URL y volvemos al login
    window.history.pushState({}, '', '/'); 
    setIsResetting(false);
    setShowForgotPassword(false);
  };

  useEffect(() => {
    const wakeUpServices = async () => {
      const authBase = import.meta.env.VITE_AUTH_API_URL;
      const managerBase = import.meta.env.VITE_MANAGER_API_URL;

      if (!authBase || !managerBase) {
        console.warn("⚠️ Variables de entorno no detectadas");
        setIsWakingUp(false);
        return;
      }

      const services = [
        `${authBase}/api/auth/public/health`,
        `${managerBase}/api/contacts/public/health`
      ];

      try {
        const pings = services.map(url => 
          fetch(url, { mode: 'no-cors' }).catch(() => {})
        ); 
        await Promise.all(pings);
      } catch (err) {
        console.error("Error despertando servicios:", err);
      } finally {
        setTimeout(() => setIsWakingUp(false), 1500);
      }
    };
    
    wakeUpServices();
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setShowForgotPassword(false); 
  };

  return (
    <div className="App">
      {!isAuthenticated ? (
        isResetting ? (
          <ResetPassword onFinish={handleFinishReset} />
        ) : 
        showForgotPassword ? (
          <ForgotPassword onBack={() => setShowForgotPassword(false)} />
        ) : (
          <Login 
            onLoginSuccess={() => setIsAuthenticated(true)} 
            onForgotPassword={() => setShowForgotPassword(true)} // Pasa la función al componente Login
            isWakingUp={isWakingUp} 
          />
        )
      ) : (
        <div className="dashboard-container">
          <Header /> 
          <div className="dashboard-main">
            <aside className="sidebar">
              <div className="user-profile-card">
                <small className="welcome-text">BIENVENIDO,</small>
                <div className="user-name">👤 {username || 'Usuario'}</div>
              </div>              
              <nav className="sidebar-nav">
                <button 
                  className={`nav-btn ${view === "contacts" ? "active" : ""}`} 
                  onClick={() => setView("contacts")}
                >
                  📇 Contactos
                </button>
                <button 
                  className={`nav-btn ${view === "users" ? "active" : ""}`} 
                  onClick={() => setView("users")}
                >
                  👥 Usuarios
                </button>
              </nav>
              <button className="logout-button" onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </aside>

            <main className="content-area">
              {view === "contacts" && <ContactList />}
              {view === "users" && <UsersList />}
            </main>
          </div>
          <Footer/> 
        </div>
      )}
    </div>
  );
}

export default App;