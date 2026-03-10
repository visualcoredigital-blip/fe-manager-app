import { useEffect, useState } from "react";
import { getUsers } from "../services/userService";

function UsersList() {
    const [users, setUsers] = useState([]); // Mantener siempre como array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getUsers();
            setUsers(data || []); 
        } catch (err) {
            console.log("Status del error:", err.response?.status);

            if (err.response?.status === 403) {
                setError("Acceso denegado: No tienes permisos de administrador.");
            } else if (err.response?.status === 401) {
                setError("Sesión expirada. Por favor reingresa.");
            } else {
                setError("Error al cargar lista de usuarios.");
            }
            // IMPORTANTE: No pongas null, mantén el array vacío para no romper .length
            setUsers([]);    
        } finally {
            setLoading(false);
        }
    };

    // --- 1. PRIORIDAD: ESTADO DE CARGA ---
    if (loading) return <p style={{ padding: "20px" }}>Cargando usuarios...</p>;

    // --- 2. PRIORIDAD: ESTADO DE ERROR ---
    // Si hay un error (como el 403), mostramos esto y cortamos la ejecución aquí
    if (error) {
        return (
            <div style={{ margin: "20px", padding: "15px", border: "1px solid red", backgroundColor: "#fff5f5" }}>
                <h3 style={{ color: "red", marginTop: 0 }}>⚠️ Error de Acceso</h3>
                <p>{error}</p>
                <button onClick={loadUsers} style={{ marginTop: "10px" }}>Reintentar</button>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>
            <h2>Lista de Usuarios</h2>

            {/* 3. PRIORIDAD: LISTA VACÍA (Solo si no hay error y terminó de cargar) */}
            {users.length === 0 ? (
                <p>No hay usuarios registrados en el sistema.</p>
            ) : (
                <table border="1" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#eee" }}>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id || user._id}>
                                <td>{user.id || user._id}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>
                                    {user.roles ? (
                                            [].concat(user.roles) 
                                            .map(r => (typeof r === 'object' ? r.name : r))
                                            .join(", ")
                                        ) : "Sin rol"}
                                      </td>
                                <td>
                                    <span style={{ 
                                        color: user.enabled ? "green" : "red",
                                        fontWeight: "bold"
                                    }}>
                                        {user.enabled ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default UsersList;