import { useEffect, useState } from 'react';
import { getContacts, updateContactStatus } from '../services/contactService';
import { jwtDecode } from 'jwt-decode'; // Importamos para leer el rol del token

const ContactList = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);

    // --- LÓGICA DE CONTROL DE ROLES ---
    const token = localStorage.getItem('token');
    let isAdmin = false;

    if (token) {
        try {
            const decoded = jwtDecode(token);
            // Verificamos que el rol coincida exactamente con el del backend
            isAdmin = decoded.role === 'ROLE_ADMIN';
        } catch (err) {
            console.error("Error al decodificar el token:", err);
        }
    }

    const handleEditClick = (contact) => {
        if (!isAdmin) return; // Doble validación de seguridad
        setSelectedContact(contact);
        setIsModalOpen(true);
    };    

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const data = await getContacts();
                setContacts(data);
            } catch (err) {
                console.error("Error cargando contactos:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchContacts();
    }, []);

    const handleStatusChange = async (e) => {
        const nuevoEstado = e.target.checked ? 'Contactado' : 'Pendiente';
        
        try {
            // Llamada al backend (el backend rechazará esto si el token no es ROLE_ADMIN)
            await updateContactStatus(selectedContact.id, nuevoEstado);
            
            setContacts(contacts.map(c => 
                c.id === selectedContact.id ? { ...c, estado: nuevoEstado } : c
            ));
            
            setSelectedContact({ ...selectedContact, estado: nuevoEstado });
            alert("Estado actualizado con éxito");
        } catch (err) {
            alert("Error: No tienes permisos para realizar esta acción.");
        }
    };

    // --- ESTILOS ---
    const modalOverlayStyle = {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000
    };

    const modalContentStyle = {
        backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px', boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        color: '#333'
    };

    const btnCancelStyle = {
        padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
    };

    if (loading) return <p>Cargando contactos...</p>;

    return (
        <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Lista de Contactos (Desde MongoDB)</h3>
                {!isAdmin && <span style={{ color: '#666', fontSize: '0.9rem' }}>ℹ️ Modo Lectura</span>}
            </div>

            <table border="1" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f4f4f4' }}>
                        <th style={{ padding: '10px' }}>Nombre</th>
                        <th style={{ padding: '10px' }}>Email</th>
                        <th style={{ padding: '10px' }}>Teléfono</th>
                        <th style={{ padding: '10px' }}>Estado</th>
                        {/* 1. Encabezado condicional */}
                        {isAdmin && <th style={{ padding: '10px' }}>Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {contacts.map(contact => (
                        <tr key={contact.id}>
                            <td style={{ padding: '10px' }}>{contact.nombre}</td>
                            <td style={{ padding: '10px' }}>{contact.email}</td>
                            <td style={{ padding: '10px' }}>
                                {contact.telefono ? (
                                    <span>{contact.telefono.formateado || ''} </span>
                                ) : 'Sin teléfono'}
                            </td>
                            <td style={{ padding: '10px' }}>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: contact.estado === 'Contactado' ? '#d4edda' : '#fff3cd',
                                    color: contact.estado === 'Contactado' ? '#155724' : '#856404'
                                }}>
                                    {contact.estado || 'Pendiente'}
                                </span>
                            </td>
                            {/* 2. Botón condicional */}
                            {isAdmin && (
                                <td style={{ padding: '10px' }}>
                                    <button 
                                        onClick={() => handleEditClick(contact)}
                                        style={{
                                            padding: '5px 10px',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Editar
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 3. Modal condicional (solo accesible si es Admin) */}
            {isModalOpen && selectedContact && isAdmin && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h4>Editar Estado de Contacto</h4>
                        <hr />
                        <p><strong>Nombre:</strong> {selectedContact.nombre}</p>
                        <p><strong>Email:</strong> {selectedContact.email}</p>
                        
                        <div style={{ margin: '20px 0' }}>
                            <label style={{ cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedContact.estado === 'Contactado'} 
                                    onChange={handleStatusChange}
                                />
                                Marcar como <strong>Contactado</strong>
                            </label>
                            <p><small>Estado actual: {selectedContact.estado}</small></p>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <button onClick={() => setIsModalOpen(false)} style={btnCancelStyle}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactList;