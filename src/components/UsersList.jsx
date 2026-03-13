import { useEffect, useState } from "react";
import { getUsers, deleteUser } from "../services/userService";
import UserModal from "./UserModal";
import "./UsersList.css"; 
import Swal from 'sweetalert2';

function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // ESTADO PARA EL USUARIO EN EDICIÓN
    const [userToEdit, setUserToEdit] = useState(null);

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
            if (err.response?.status === 403) {
                setError("Acceso denegado: No tienes permisos de administrador.");
            } else if (err.response?.status === 401) {
                setError("Sesión expirada. Por favor reingresa.");
            } else {
                setError("Error al cargar lista de usuarios.");
            }
            setUsers([]);    
        } finally {
            setLoading(false);
        }
    };

    // MANEJO DE ÉXITO (CREACIÓN O EDICIÓN)
    const handleSuccess = () => {
        loadUsers(); 
        setIsModalOpen(false); 
        setUserToEdit(null); // Limpiar el usuario tras el éxito
    };

    // ABRIR MODAL PARA CREAR
    const handleAddClick = () => {
        setUserToEdit(null);
        setIsModalOpen(true);
    };

    // ABRIR MODAL PARA EDITAR
    const handleEditClick = (user) => {
        setUserToEdit(user);
        setIsModalOpen(true);
    };

    // CERRAR MODAL
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setUserToEdit(null);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esta acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await deleteUser(id);
                loadUsers(); 
                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'El usuario ha sido borrado correctamente.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Error al borrar:", err);
                Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
            }
        }
    };

    const filteredUsers = users.filter(user => 
        (user.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <p className="loading-text">Cargando usuarios...</p>;

    if (error) {
        return (
            <div className="error-container">
                <h3 className="error-title">⚠️ Error de Acceso</h3>
                <p>{error}</p>
                <button onClick={loadUsers}>Reintentar</button>
            </div>
        );
    }

    return (
        <div className="users-container">
            <div className="users-header">
                <h2>Listado de Usuarios</h2>
                <button className="btn-add" onClick={handleAddClick}>
                    + Agregar Usuario
                </button>
            </div>

            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Filtrar por username o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button 
                        className="btn-clear-search" 
                        onClick={() => setSearchTerm("")}
                        title="Limpiar búsqueda"
                    >
                        ×
                    </button>
                )}
            </div>

            {users.length === 0 ? (
                <p>No hay usuarios registrados en el sistema.</p>
            ) : (
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
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
                                        <span className={user.enabled ? "status-active" : "status-inactive"}>
                                            {user.enabled ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-edit" onClick={() => handleEditClick(user)}>
                                            Editar
                                        </button>
                                        <button className="btn-delete" onClick={() => handleDelete(user.id || user._id)}>
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-results-td">
                                    No se encontraron resultados para "{searchTerm}"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            {/* MODAL CONFIGURADO CON DATA DINÁMICA */}
            <UserModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSuccess={handleSuccess}
                user={userToEdit} 
            />
        </div>
    );
}

export default UsersList;