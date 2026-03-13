import { useState, useEffect } from 'react';
import Login from './components/Login';
import ContactList from './components/ContactList';
import UsersList from './components/UsersList';

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

        <div style={{ display: "flex", height: "100vh" }}>
          {/* MENU LATERAL */}
          <div style={{
            width: "220px",
            background: "#2c3e50",
            color: "white",
            padding: "20px",
            borderRight: "1px solid #ccc",
            display: "flex",
            flexDirection: "column"
          }}>
            <h3 style={{ borderBottom: "1px solid #555", paddingBottom: "10px" }}>Manager App</h3>
            <div style={{ marginBottom: "20px", padding: "10px", backgroundColor: "#34495e", borderRadius: "5px" }}>
               <small style={{ display: "block", color: "#bdc3c7" }}>Sesión iniciada:</small>
               <strong style={{ fontSize: "1.1em" }}>👤 {username}</strong>
            </div>
            
            <button
              style={{ width: "100%", marginBottom: "10px", padding: "8px", cursor: "pointer" }}
              onClick={() => setView("contacts")}
            >Contactos</button>

            <button
              style={{ width: "100%", marginBottom: "10px", padding: "8px", cursor: "pointer" }}
              onClick={() => setView("users")}
            >Usuarios</button>

            <div style={{ flexGrow: 1 }}></div>
            <hr style={{ width: "100%", borderColor: "#555" }} />

            <button
              style={{ 
                width: "100%", 
                padding: "10px", 
                backgroundColor: "#e74c3c", 
                color: "white", 
                border: "none", 
                borderRadius: "4px",
                cursor: "pointer" 
              }}
              onClick={handleLogout}
            >Cerrar Sesión</button>
          </div>

          {/* CONTENIDO */}
          <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
            {view === "contacts" && <ContactList />}
            {view === "users" && <UsersList />}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;