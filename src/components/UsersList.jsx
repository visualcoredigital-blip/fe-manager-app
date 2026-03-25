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

    const handleSuccess = () => {
        loadUsers(); 
        setIsModalOpen(false); 
        setUserToEdit(null);
    };

    const handleAddClick = () => {
        setUserToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (user) => {
        setUserToEdit(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setUserToEdit(null);
    };

    const handleDelete = async (userId) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción eliminará permanentemente al usuario.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#ffffff',
            customClass: {
                title: 'swal-title-custom'
            }
        });

        if (result.isConfirmed) {
            try {
                await deleteUser(userId);
                loadUsers(); 
                Swal.fire({
                    title: '¡Eliminado!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (err) {
                Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
            }
        }
    };

    const filteredUsers = users.filter(user => 
        (user.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="users-container">
            <p className="loading-text" style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
                Cargando usuarios...
            </p>
        </div>
    );

    if (error) {
        return (
            <div className="error-container">
                <h3 className="error-title">⚠️ Error de Acceso</h3>
                <p>{error}</p>
                <button className="btn-add" onClick={loadUsers}>Reintentar</button>
            </div>
        );
    }

    return (
        <div className="users-container">
            <div className="users-header">
                <h2>Gestión de Usuarios</h2>
                <button className="btn-add" onClick={handleAddClick}>
                    + Nuevo Usuario
                </button>
            </div>

            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar por username o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button 
                        className="btn-clear-search" 
                        onClick={() => setSearchTerm("")}
                    >
                        ×
                    </button>
                )}
            </div>

            <div className="table-wrapper">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Roles</th>
                            <th>Estado</th>
                            <th style={{ textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => {
                                const userId = user.id || user._id;
                                return (
                                    <tr key={userId}>
                                        <td style={{ fontWeight: 600 }}>{user.username}</td>
                                        <td style={{ color: '#64748b' }}>{user.email}</td>
                                        <td>
                                            <span style={{ fontSize: '0.85rem' }}>
                                                {user.roles ? (
                                                    [].concat(user.roles) 
                                                    .map(r => (typeof r === 'object' ? r.name : r))
                                                    .join(", ")
                                                    .replace(/ROLE_/g, "") // Limpiamos el prefijo para que se vea mejor
                                                ) : "Sin rol"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={user.enabled ? "status-active" : "status-inactive"}>
                                                {user.enabled ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button className="btn-edit" onClick={() => handleEditClick(user)}>
                                                Editar
                                            </button>
                                            <button className="btn-delete" onClick={() => handleDelete(userId)}>
                                                Borrar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-results-td">
                                    {users.length === 0 
                                        ? "No hay usuarios registrados." 
                                        : `No hay coincidencias para "${searchTerm}"`}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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