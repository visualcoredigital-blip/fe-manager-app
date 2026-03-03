import { useState, useEffect } from 'react';
import Login from './components/Login';
import ContactList from './components/ContactList';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificamos si ya existe un token al cargar la app
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      {!isAuthenticated ? (
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      ) : (
      <div style={{ padding: '20px' }}>
          <h1>Bienvenido a Manager App</h1>
          <button onClick={handleLogout}>Cerrar Sesión</button>
          <hr />
          <ContactList /> 
      </div>
      )}
    </div>
  );
}

export default App;