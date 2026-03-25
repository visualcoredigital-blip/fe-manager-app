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
  const username = localStorage.getItem('username');

  useEffect(() => {
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
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      ) : (
        <div className="dashboard-container">
          <Header /> 

          <div className="dashboard-main">
            <aside className="sidebar">
              {/* Bloque de Usuario Corporativo */}
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

            {/* Contenedor con Scroll Independiente */}
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