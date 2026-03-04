import { useEffect, useState } from 'react';
import { getContacts, updateContactStatus } from '../services/contactService';
import { jwtDecode } from 'jwt-decode';

// --- COMPONENTE SKELETON (Efecto de carga) ---
const ContactSkeleton = ({ isAdmin }) => {
    const skeletonRowStyle = {
        height: '20px',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        margin: '10px 0',
        animation: 'pulse 1.5s infinite ease-in-out'
    };

    return (
        <>
            <style>
                {`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }`}
            </style>
            {[1, 2, 3, 4, 5].map((n) => (
                <tr key={n}>
                    <td style={{ padding: '10px' }}><div style={skeletonRowStyle}></div></td>
                    <td style={{ padding: '10px' }}><div style={skeletonRowStyle}></div></td>
                    <td style={{ padding: '10px' }}><div style={skeletonRowStyle}></div></td>
                    <td style={{ padding: '10px' }}><div style={skeletonRowStyle}></div></td>
                    {isAdmin && <td style={{ padding: '10px' }}><div style={skeletonRowStyle}></div></td>}
                </tr>
            ))}
        </>
    );
};

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
            isAdmin = decoded.role === 'ROLE_ADMIN';
        } catch (err) {
            console.error("Error al decodificar el token:", err);
        }
    }

    const handleEditClick = (contact) => {
        if (!isAdmin) return;
        setSelectedContact(contact);
        setIsModalOpen(true);
    };    

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                // Aquí es donde se nota la demora de Render
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

    return (
        <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Lista de Contactos (Desde MongoDB)</h3>
                {!isAdmin && !loading && (
                    <span style={{ color: '#666', fontSize: '0.9rem' }}>ℹ️ Modo Lectura</span>
                )}
            </div>

            <table border="1" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f4f4f4' }}>
                        <th style={{ padding: '10px' }}>Nombre</th>
                        <th style={{ padding: '10px' }}>Email</th>
                        <th style={{ padding: '10px' }}>Teléfono</th>
                        <th style={{ padding: '10px' }}>Estado</th>
                        {isAdmin && <th style={{ padding: '10px' }}>Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        /* Mostramos esqueletos con animación mientras loading sea true */
                        <ContactSkeleton isAdmin={isAdmin} />
                    ) : (
                        contacts.map(contact => (
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
                        ))
                    )}
                </tbody>
            </table>

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