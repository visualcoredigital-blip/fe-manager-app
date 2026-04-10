import { useState, useEffect } from 'react';
import Login from './components/Login';
import ContactList from './components/ContactList';
import UsersList from './components/UsersList';
import Header from './components/Header';
import './App.css';
import Footer from './components/Footer';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState("contacts");
  const [isWakingUp, setIsWakingUp] = useState(true); // Estado para controlar el aviso
  const username = localStorage.getItem('username');

  useEffect(() => {
    const wakeUpServices = async () => {
      const services = [
        'https://ms-auth-service-q21j.onrender.com/api/auth/health',
        'https://be-manager-app.onrender.com/api/contacts/health'
      ];

      try {
        const pings = services.map(url => fetch(url).catch(() => {})); 
        await Promise.all(pings);
      } finally {
        // Agregamos un pequeño retraso de un segundo y quitamos el aviso
        setTimeout(() => setIsWakingUp(false), 1000);
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
  };

  return (
    <div className="App">
      {!isAuthenticated ? (
        <div className="login-wrapper">
          {isWakingUp && (
          <div className="wake-up-notice">
            <small>
              🚀 <strong>Visual Core Digital</strong> está iniciando sus módulos de seguridad. 
              El primer ingreso puede tardar unos segundos.
            </small>
          </div>
          )}
          <Login onLoginSuccess={() => setIsAuthenticated(true)} />
        </div>
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