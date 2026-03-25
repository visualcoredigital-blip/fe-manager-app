import { useEffect, useState } from 'react';
import { getContacts, updateContactStatus } from '../services/contactService';
import { jwtDecode } from 'jwt-decode';

// --- COMPONENTE SKELETON (Efecto de carga) ---
const ContactSkeleton = ({ isAdmin }) => {
    const skeletonRowStyle = {
        height: '20px',
        backgroundColor: '#f1f5f9',
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
                    <td style={{ padding: '15px' }}><div style={skeletonRowStyle}></div></td>
                    <td style={{ padding: '15px' }}><div style={skeletonRowStyle}></div></td>
                    <td style={{ padding: '15px' }}><div style={skeletonRowStyle}></div></td>
                    <td style={{ padding: '15px' }}><div style={skeletonRowStyle}></div></td>
                    {isAdmin && <td style={{ padding: '15px' }}><div style={skeletonRowStyle}></div></td>}
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

    const handleEditClick = (contact) => {
        if (!isAdmin) return;
        setSelectedContact(contact);
        setIsModalOpen(true);
    };    

    const handleStatusChange = async (e) => {
        const nuevoEstado = e.target.checked ? 'Contactado' : 'Pendiente';
        try {
            await updateContactStatus(selectedContact.id, nuevoEstado);
            setContacts(contacts.map(c => 
                c.id === selectedContact.id ? { ...c, estado: nuevoEstado } : c
            ));
            setSelectedContact({ ...selectedContact, estado: nuevoEstado });
        } catch (err) {
            alert("Error: No tienes permisos para realizar esta acción.");
        }
    };

    return (
        <div className="contact-list-container">
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '25px'
            }}>
                <h2 style={{ color: '#002b5c', margin: 0, fontWeight: 800 }}>Listado de Contactos</h2>
                {!isAdmin && !loading && (
                    <span style={{ 
                        backgroundColor: '#e2e8f0', 
                        color: '#475569', 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '0.85rem',
                        fontWeight: 600
                    }}>
                        ℹ️ Modo Lectura
                    </span>
                )}
            </div>

            <table style={{ 
                width: '100%', 
                borderCollapse: 'separate', 
                borderSpacing: '0',
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}>
                <thead>
                    {/* CABECERA SUAVE: Reemplazamos el azul oscuro por un gris azulado profesional */}
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                        <th style={{ padding: '18px 15px', color: '#475569', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }}>Nombre</th>
                        <th style={{ padding: '18px 15px', color: '#475569', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }}>Email</th>
                        <th style={{ padding: '18px 15px', color: '#475569', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }}>Teléfono</th>
                        <th style={{ padding: '18px 15px', color: '#475569', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }}>Estado</th>
                        {isAdmin && <th style={{ padding: '18px 15px', color: '#475569', textAlign: 'center', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }}>Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <ContactSkeleton isAdmin={isAdmin} />
                    ) : (
                        contacts.map(contact => (
                            <tr key={contact.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '15px', color: '#1e293b', fontWeight: 500 }}>{contact.nombre}</td>
                                <td style={{ padding: '15px', color: '#64748b' }}>{contact.email}</td>
                                <td style={{ padding: '15px', color: '#64748b' }}>
                                    {contact.telefono?.formateado || 'Sin teléfono'}
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        padding: '5px 12px',
                                        borderRadius: '6px',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        backgroundColor: contact.estado === 'Contactado' ? '#dcfce7' : '#fef9c3',
                                        color: contact.estado === 'Contactado' ? '#166534' : '#854d0e'
                                    }}>
                                        {contact.estado || 'Pendiente'}
                                    </span>
                                </td>
                                {isAdmin && (
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => handleEditClick(contact)}
                                            style={{
                                                padding: '7px 14px',
                                                backgroundColor: '#00A3E0',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                transition: '0.2s'
                                            }}
                                            onMouseOver={(e) => e.target.style.backgroundColor = '#0082b3'}
                                            onMouseOut={(e) => e.target.style.backgroundColor = '#00A3E0'}
                                        >
                                            Gestionar
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {isModalOpen && selectedContact && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,43,92,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 2000, backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '400px', 
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', color: '#1e293b'
                    }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#002b5c', fontSize: '1.2rem' }}>Gestionar Contacto</h4>
                        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#64748b' }}>Actualiza el estado de seguimiento del cliente.</p>
                        <hr style={{ border: '0', borderTop: '1px solid #f1f5f9', marginBottom: '20px' }} />
                        
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ margin: '5px 0' }}><strong>Nombre:</strong> {selectedContact.nombre}</p>
                            <p style={{ margin: '5px 0' }}><strong>Email:</strong> {selectedContact.email}</p>
                        </div>
                        
                        <div style={{ 
                            backgroundColor: '#f8fafc', 
                            padding: '15px', 
                            borderRadius: '10px', 
                            marginBottom: '25px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <input 
                                type="checkbox" 
                                id="statusCheck"
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                checked={selectedContact.estado === 'Contactado'} 
                                onChange={handleStatusChange}
                            />
                            <label htmlFor="statusCheck" style={{ cursor: 'pointer', fontWeight: 600, color: '#002b5c' }}>
                                Marcar como Contactado
                            </label>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                style={{
                                    padding: '10px 20px', 
                                    backgroundColor: '#e2e8f0', 
                                    color: '#475569', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                Finalizar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactList;