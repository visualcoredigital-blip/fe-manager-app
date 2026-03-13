import React, { useState, useEffect } from 'react';
import { managerApi } from '../api/apiClient';
import './UserModal.css';
import Swal from 'sweetalert2';

const UserModal = ({ isOpen, onClose, onSuccess, user }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        roles: ['ROLE_USER'],
        enabled: true
    });
    const [loading, setLoading] = useState(false);

    // Efecto para cargar datos del usuario si estamos en modo edición
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                password: '', // Password vacío por seguridad en edición
                email: user.email || '',
                roles: user.roles || ['ROLE_USER'],
                enabled: user.enabled ?? true
            });
        } else {
            setFormData({ username: '', password: '', email: '', roles: ['ROLE_USER'], enabled: true });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (user) {
                // MODO EDICIÓN: Usamos el PUT que probamos al puerto 8000
                const response = await managerApi.put(`/api/users/${user.id || user._id}`, formData);
                Swal.fire('¡Actualizado!', 'Usuario modificado con éxito', 'success');
                onSuccess(response.data);
            } else {
                // MODO CREACIÓN: Tu lógica original
                const response = await managerApi.post('/api/users/create', formData);
                Swal.fire('¡Creado!', 'Usuario registrado con éxito', 'success');
                onSuccess(response.data);
            }
            onClose();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || "Error en la operación", 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre de Usuario</label>
                        <input 
                            type="text" 
                            required 
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input 
                            type="email" 
                            required 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    {/* La contraseña solo es requerida si estamos CREANDO un usuario */}
                    <div className="form-group">
                        <label>Contraseña {user && "(Dejar en blanco para mantener)"}</label>
                        <input 
                            type="password" 
                            required={!user} 
                            placeholder="********"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label>Rol asignado</label>
                        <select 
                            value={formData.roles[0]}
                            onChange={(e) => setFormData({...formData, roles: [e.target.value]})}
                        >
                            <option value="ROLE_USER">Usuario Estándar</option>
                            <option value="ROLE_ADMIN">Administrador</option>
                        </select>
                    </div>

                    {/* Campo de Estado (solo visible en edición para activar/desactivar) */}
                    {user && (
                        <div className="form-group">
                            <label>Estado</label>
                            <select 
                                value={formData.enabled}
                                onChange={(e) => setFormData({...formData, enabled: e.target.value === 'true'})}
                            >
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Guardando...' : (user ? 'Actualizar Cambios' : 'Crear Usuario')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;