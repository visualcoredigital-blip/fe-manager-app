import { useState, useEffect } from 'react';
import Login from './components/Login';
import ContactList from './components/ContactList';
import UsersList from './components/UsersList';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import './App.css'; // Importamos los nuevos estilos

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState("contacts");
  
  // Manejo de estados de autenticación: "login", "forgot", "reset"
  const [authMode, setAuthMode] = useState("login");

  const username = localStorage.getItem('username');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }

    // Detectar automáticamente si el usuario viene desde el link del correo
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('token')) {
      setAuthMode("reset");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setAuthMode("login");
  };

  // Función para renderizar el contenido de autenticación
  const renderAuthContent = () => {
    switch (authMode) {
      case "forgot":
        return <ForgotPassword onBack={() => setAuthMode("login")} />;
      case "reset":
        return (
          <ResetPassword 
            onFinish={() => {
              setAuthMode("login");
              // Limpiamos el token de la URL para que no reabra el formulario al recargar
              window.history.replaceState({}, document.title, "/");
            }} 
          />
        );
      case "login":
      default:
        return (
          <Login 
            onLoginSuccess={() => setIsAuthenticated(true)} 
            onForgotPassword={() => setAuthMode("forgot")} 
          />
        );
    }
  };

  return (
    <div className="App">
      {!isAuthenticated ? (
        // Pantallas de Acceso (Login / Recuperación)
        renderAuthContent()
      ) : (
        // Panel de Administración (Post-Login)
        <div style={{ display: "flex", height: "100vh" }}>
          
          {/* MENU LATERAL con las nuevas clases de App.css */}
          <div className="sidebar">
            <h3>VisualCore</h3>
            
            <div className="user-info-card">
               <small>Sesión iniciada:</small>
               <strong>👤 {username}</strong>
            </div>
            
            <button
              className={`sidebar-btn ${view === "contacts" ? "active" : ""}`}
              onClick={() => setView("contacts")}
            >
              Contactos
            </button>

            <button
              className={`sidebar-btn ${view === "users" ? "active" : ""}`}
              onClick={() => setView("users")}
            >
              Usuarios
            </button>

            <button className="logout-btn" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>

          {/* ÁREA DE CONTENIDO */}
          <div className="content-area">
            {view === "contacts" && <ContactList />}
            {view === "users" && <UsersList />}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;