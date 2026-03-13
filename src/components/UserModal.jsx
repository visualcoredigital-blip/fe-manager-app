import React, { useState, useEffect } from 'react';
import { managerApi } from '../api/apiClient';
import './UserModal.css';
import Swal from 'sweetalert2';

const UserModal = ({ isOpen, onClose, onSuccess, user }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        roles: [],
        enabled: true
    });
    const [loading, setLoading] = useState(false);

    // Efecto para cargar datos del usuario si estamos en modo edición
    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                username: user.username || '',
                password: '', 
                email: user.email || '',
                roles: user.roles || [],
                enabled: user.enabled ?? true
            });
        } else if (!isOpen) {
            // Reset al cerrar: Por defecto ID 2 (Usuario)
            setFormData({ 
                username: '', 
                password: '', 
                email: '', 
                roles: [{id: 2, name: 'Usuario'}], 
                enabled: true 
            });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // --- SOLUCIÓN AL ERROR 403 / DESERIALIZACIÓN ---
        // Mapeamos los objetos de rol a los Strings técnicos que espera el Auth-Service
        const rolesForBackend = formData.roles.map(r => {
            if (typeof r === 'string') return r;
            // Si el ID es 1 es ADMIN, si es 2 es USER. 
            // Esto asegura que mandes el código duro y no la traducción.
            return r.id === 1 ? 'ROLE_ADMIN' : 'ROLE_USER';
        });

        const dataToSend = {
            username: formData.username,
            email: formData.email,
            roles: rolesForBackend, // Enviamos ["ROLE_ADMIN"], no objetos
            enabled: formData.enabled
        };
    
        if (!user) {
            dataToSend.password = formData.password;
        }
    
        try {
            if (user) {
                // MODO EDICIÓN
                const response = await managerApi.put(`/api/users/${user.id || user._id}`, dataToSend);
                Swal.fire('¡Actualizado!', 'Usuario modificado con éxito', 'success');
                onSuccess(response.data);
            } else {
                // MODO CREACIÓN
                const response = await managerApi.post('/api/users/create', dataToSend);
                Swal.fire('¡Creado!', 'Usuario registrado con éxito', 'success');
                onSuccess(response.data);
            }
            onClose();
        } catch (error) {
            console.log("Detalle del error:", error.response?.data);
            // Mostramos el mensaje específico del backend si existe
            const errorMsg = error.response?.data?.message || "Error en la operación (Posible error de formato)";
            Swal.fire('Error', errorMsg, 'error');
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

                    {!user && (
                        <div className="form-group">
                            <label>Password</label>
                            <input 
                                type="password" 
                                required 
                                placeholder="********"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Rol asignado</label>
                        <select 
                            // Sincronización por ID: evita fallos por traducciones
                            value={formData.roles[0]?.id || ''}
                            onChange={(e) => {
                                const selectedId = parseInt(e.target.value);
                                const selectedName = e.target.options[e.target.selectedIndex].text;
                                // Guardamos el objeto para la UI
                                setFormData({...formData, roles: [{ id: selectedId, name: selectedName }]});
                            }}
                        >
                            <option value="2">Usuario</option>
                            <option value="1">Administrador</option>
                        </select>
                    </div>

                    {user && (
                        <div className="form-group">
                            <label>Estado</label>
                            <select 
                                value={String(formData.enabled)}
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