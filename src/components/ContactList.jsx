import { useState, useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TableVirtuoso } from 'react-virtuoso';
import { getContacts, updateContactStatus } from '../services/contactService';
import { jwtDecode } from 'jwt-decode';
import './ContactList.css';

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
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);

    // Lógica de Auth
    const token = localStorage.getItem('token');
    const isAdmin = useMemo(() => {
        if (!token) return false;
        try {
            return jwtDecode(token).role === 'ROLE_ADMIN';
        } catch { return false; }
    }, [token]);

    // --- 1. Carga Infinita (20k registros) ---
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        error
    } = useInfiniteQuery({
        queryKey: ['contacts'],
        queryFn: ({ pageParam = 0 }) => getContacts(pageParam, 50), // Usamos la paginación de Java
        getNextPageParam: (lastPage) => {
            // Spring Boot Page object nos dice si es la última página
            return lastPage.last ? undefined : lastPage.number + 1;
        },
    });

    // Aplanamos los datos de las páginas para la tabla virtual
    const allContacts = useMemo(() => 
        data?.pages.flatMap(page => page.content) || [], 
    [data]);

    // --- 2. Mutación Optimista (Cambio Instantáneo) ---
    const mutation = useMutation({
        mutationFn: ({ id, estado }) => updateContactStatus(id, estado),
        onMutate: async (updatedContact) => {
            await queryClient.cancelQueries({ queryKey: ['contacts'] });
            const previousData = queryClient.getQueryData(['contacts']);

            // Actualizamos localmente ANTES de que el servidor responda
            queryClient.setQueryData(['contacts'], (old) => ({
                ...old,
                pages: old.pages.map(page => ({
                    ...page,
                    content: page.content.map(c => 
                        c.id === updatedContact.id ? { ...c, estado: updatedContact.estado } : c
                    )
                }))
            }));

            return { previousData };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['contacts'], context.previousData);
            alert("Error al actualizar el estado.");
        },
    });

    const handleStatusChange = (e) => {
        const nuevoEstado = e.target.checked ? 'Contactado' : 'Pendiente';
        const contactId = selectedContact.id;
        
        // Ejecutamos la mutación (esto es instantáneo en la UI)
        mutation.mutate({ id: contactId, estado: nuevoEstado });
        
        // Actualizamos el modal localmente para que no parpadee
        setSelectedContact(prev => ({ ...prev, estado: nuevoEstado }));
    };

    const handleEditClick = (contact) => {
        if (!isAdmin) return;
        setSelectedContact(contact);
        setIsModalOpen(true);
    };

    // --- Renderizado de Filas para Virtuoso ---
    const rowRenderer = (index, contact) => (
        <>
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
        </>
    );

    return (
        <div className="contact-list-container">
            <div className="contact-list-header">
                <h2 className="contact-list-title">Listado de Contactos ({allContacts.length})</h2>
                {status === 'loading' && <span className="status-indicator">⏳ Cargando...</span>}
            </div>

            {/* TABLA VIRTUALIZADA */}
            <div style={{ height: '70vh', width: '100%' }}>
                <TableVirtuoso
                    data={allContacts}
                    totalCount={allContacts.length}
                    className="custom-table"
                    fixedHeaderContent={() => (
                        <tr style={{ background: 'white' }}>
                            <th style={{ width: '25%' }}>Nombre</th>
                            <th style={{ width: '30%' }}>Email</th>
                            <th style={{ width: '15%' }}>Teléfono</th>
                            <th style={{ width: '15%' }}>Estado</th>
                            {isAdmin && <th style={{ width: '15%', textAlign: 'center'}}>Acciones</th>}
                        </tr>
                    )}
                    itemContent={rowRenderer}
                    endReached={() => {
                        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                    }}
                />
            </div>

            {isFetchingNextPage && <div style={{textAlign: 'center', padding: '10px'}}>Cargando más contactos...</div>}

            {/* MODAL (Se mantiene igual, solo cambia el handleStatusChange) */}
            {isModalOpen && selectedContact && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h4>Gestionar Contacto</h4>
                        <p>{selectedContact.nombre}</p>
                        <div className="modal-checkbox-container">
                            <input 
                                type="checkbox" id="statusCheck"
                                checked={selectedContact.estado === 'Contactado'} 
                                onChange={handleStatusChange}
                            />
                            <label htmlFor="statusCheck">Marcar como Contactado</label>
                        </div>
                        <button className="manage-btn" onClick={() => setIsModalOpen(false)}>Finalizar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactList;