import React, { useState, useEffect, useRef } from 'react';
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
    
    // Estados para control de UI
    const [loading, setLoading] = useState(false);
    // Estados para validación de email
    const [emailError, setEmailError] = useState(false);
    const [checkingEmail, setCheckingEmail] = useState(false);

    const usernameInputRef = useRef(null);
    const originalEmailRef = useRef('');

    // Efecto para cargar datos en edición o resetear al cerrar
    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                username: user.username || '',
                password: '', 
                email: user.email || '',
                roles: user.roles || [],
                enabled: user.enabled ?? true
            });
            originalEmailRef.current = user.email || '';
        } else if (!isOpen) {
            setFormData({ 
                username: '', password: '', email: '', 
                roles: [{id: 2, name: 'Usuario'}], enabled: true 
            });
            originalEmailRef.current = '';
            setEmailError(false);
        }
        if (isOpen) setTimeout(() => usernameInputRef.current?.focus(), 100);
    }, [user, isOpen]);

    // Lógica de validación con Debounce para el email
    useEffect(() => {
        if (!formData.email || formData.email === originalEmailRef.current) {
            setEmailError(false);
            return;
        }

        const timer = setTimeout(async () => {
            setCheckingEmail(true);
            try {
                const userId = user ? (user.id || user._id) : '';
                const response = await managerApi.get(`/api/users/exists?email=${formData.email}&userId=${userId}`);
                setEmailError(response.data.exists);
            } catch (err) {
                console.error("Error al validar email:", err);
            } finally {
                setCheckingEmail(false);
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [formData.email, user]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (emailError) {
            Swal.fire('Error', 'El correo electrónico ya está registrado por otro usuario.', 'warning');
            return;
        }

        setLoading(true);
        const rolesForBackend = formData.roles.map(r => typeof r === 'string' ? r : (r.id === 1 ? 'ROLE_ADMIN' : 'ROLE_USER'));

        const dataToSend = {
            username: formData.username,
            email: formData.email,
            roles: rolesForBackend, 
            enabled: formData.enabled
        };
    
        if (!user) dataToSend.password = formData.password;
    
        try {
            if (user) {
                const response = await managerApi.put(`/api/users/${user.id || user._id}`, dataToSend);
                Swal.fire('¡Actualizado!', 'Usuario modificado con éxito', 'success');
                onSuccess(response.data);
            } else {
                const response = await managerApi.post('/api/users/create', dataToSend);
                Swal.fire('¡Creado!', 'Usuario registrado con éxito', 'success');
                onSuccess(response.data);
            }
            onClose();
        } catch (error) {
            const serverMessage = error.response?.data?.message || error.response?.data;
            if (error.response?.status === 409) {
                Swal.fire('Error de Duplicidad', 'Ese email ya está siendo utilizado.', 'warning');
            } else {
                Swal.fire('Error', serverMessage || "Ocurrió un error inesperado", 'error');
            }
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
                            ref={usernameInputRef}    
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
                            style={{ borderColor: emailError ? '#ff4d4d' : '#ccc' }}
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                        {checkingEmail && <small>Verificando disponibilidad...</small>}
                        {emailError && <small style={{color: '#ff4d4d', fontWeight: 'bold'}}>Este email ya está en uso.</small>}
                    </div>

                    {!user && (
                        <div className="form-group">
                            <label>Password</label>
                            <input 
                                type="password" 
                                required 
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Rol asignado</label>
                        <select 
                            value={formData.roles[0]?.id || ''}
                            onChange={(e) => {
                                const selectedId = parseInt(e.target.value);
                                const selectedName = e.target.options[e.target.selectedIndex].text;
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
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                        <button 
                            type="submit" 
                            className="btn-save" 
                            disabled={loading || emailError}
                        >
                            {loading ? 'Guardando...' : (user ? 'Actualizar Cambios' : 'Crear Usuario')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;