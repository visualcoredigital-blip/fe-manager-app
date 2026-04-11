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
  const [isWakingUp, setIsWakingUp] = useState(true); 
  const username = localStorage.getItem('username');

  useEffect(() => {
    const wakeUpServices = async () => {
      const services = [
        'https://ms-auth-service-q21j.onrender.com/api/auth/health',
        'https://be-manager-app.onrender.com/api/contacts/health'
      ];

      try {
        // Ejecutamos los pings
        const pings = services.map(url => fetch(url).catch(() => {})); 
        await Promise.all(pings);
      } finally {
        // Importante: un delay de 2 segundos para que el usuario alcance a leer
        // si el servidor responde demasiado rápido.
        setTimeout(() => setIsWakingUp(false), 2000);
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
        <Login 
          onLoginSuccess={() => setIsAuthenticated(true)} 
          isWakingUp={isWakingUp} 
        />
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