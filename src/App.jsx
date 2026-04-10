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
    // --- ESTRATEGIA DE DESPERTADO Render ---
    const wakeUpServices = async () => {
      const services = [
        'https://ms-auth-service-q21j.onrender.com/api/auth/health',
        'https://be-manager-app.onrender.com/api/contacts/health'
      ];

      console.log("Iniciando 'ping' de despertado...");
      
      try {
        // Ejecutamos todos los pings
        const pings = services.map(url => fetch(url, { mode: 'no-cors' }));
        await Promise.all(pings);
        
        // Una vez que los pings terminan (o fallan pero responden), quitamos el aviso
        console.log("Servicios alertados.");
        setIsWakingUp(false);
      } catch (err) {
        console.log("Esperando respuesta de servicios...");
        // Si hay error, igual quitamos el aviso tras un tiempo prudente
        setTimeout(() => setIsWakingUp(false), 5000);
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
          <Login onLoginSuccess={() => setIsAuthenticated(true)} />
          
          {/* MENSAJE INFORMATIVO DE RENDER FREE */}
          {isWakingUp && (
            <div className="wake-up-notice">
              <small>
                ⏳ <strong>Nota:</strong> Los servicios están despertando. 
                El primer intento de ingreso podría tardar unos segundos.
              </small>
            </div>
          )}
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