import { useEffect, useState } from 'react';
import { getContacts, updateContactStatus } from '../services/contactService';
import { jwtDecode } from 'jwt-decode';
import './ContactList.css'; // Importamos los estilos

const ContactSkeleton = ({ isAdmin }) => (
    <>
        {[1, 2, 3, 4, 5].map((n) => (
            <tr key={n}>
                <td><div className="skeleton-row"></div></td>
                <td><div className="skeleton-row"></div></td>
                <td><div className="skeleton-row"></div></td>
                <td><div className="skeleton-row"></div></td>
                {isAdmin && <td><div className="skeleton-row"></div></td>}
            </tr>
        ))}
    </>
);

const ContactList = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);

    const token = localStorage.getItem('token');
    let isAdmin = false;

    if (token) {
        try {
            const decoded = jwtDecode(token);
            isAdmin = decoded.role === 'ROLE_ADMIN';
        } catch (err) { console.error(err); }
    }

    const fetchContacts = async () => {
        setLoading(true);
        setError(false);
        try {
            const data = await getContacts();
            setContacts(data);
        } catch (err) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchContacts(); }, []);

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
            alert("Error de permisos o conexión.");
        }
    };

    return (
        <div className="contact-list-container">
            <div className="contact-list-header">
                <h2 className="contact-list-title">Listado de Contactos</h2>
                {loading && <span className="status-indicator">⏳ Conectando...</span>}
                {!isAdmin && !loading && <span className="read-only-badge">ℹ️ Modo Lectura</span>}
            </div>

            {error && !loading && (
                <div className="error-container">
                    <p className="error-text">El servidor está despertando. Por favor, reintenta.</p>
                    <button className="retry-button" onClick={fetchContacts}>🔄 Reintentar Carga</button>
                </div>
            )}

            <table className="custom-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Estado</th>
                        {isAdmin && <th style={{ textAlign: 'center' }}>Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <ContactSkeleton isAdmin={isAdmin} />
                    ) : (
                        contacts.map(contact => (
                            <tr key={contact.id}>
                                <td>{contact.nombre}</td>
                                <td>{contact.email}</td>
                                <td>{contact.telefono?.formateado || 'Sin teléfono'}</td>
                                <td>
                                    <span className={`status-badge ${contact.estado === 'Contactado' ? 'status-contactado' : 'status-pendiente'}`}>
                                        {contact.estado || 'Pendiente'}
                                    </span>
                                </td>
                                {isAdmin && (
                                    <td style={{ textAlign: 'center' }}>
                                        <button className="manage-btn" onClick={() => handleEditClick(contact)}>Gestionar</button>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {isModalOpen && selectedContact && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h4>Gestionar Contacto</h4>
                        <p>{selectedContact.nombre} ({selectedContact.email})</p>
                        <div className="modal-checkbox-container">
                            <input 
                                type="checkbox" id="statusCheck"
                                checked={selectedContact.estado === 'Contactado'} 
                                onChange={handleStatusChange}
                            />
                            <label htmlFor="statusCheck">Marcar como Contactado</label>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <button className="manage-btn" style={{backgroundColor: '#e2e8f0', color: '#475569'}} onClick={() => setIsModalOpen(false)}>Finalizar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactList;