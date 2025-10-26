import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/api';

function ManageItems({ onDataUpdate }) {
    const [items, setItems] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [editingId, setEditingId] = useState(null);

    const fetchItems = async () => {
        const data = await apiRequest('/items');
        if (data) setItems(data);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const resetForm = () => {
        setName('');
        setDescription('');
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) return alert('Item name is required.');

        if (editingId) {
            // Update
            await apiRequest(`/items/${editingId}`, 'PUT', { name, description });
        } else {
            // Create
            await apiRequest('/items', 'POST', { name, description });
        }
        
        resetForm();
        await fetchItems(); // Refresh our list
        await onDataUpdate(); // Refresh global data (for dropdowns)
    };

    const handleEdit = (item) => {
        setEditingId(item.item_id);
        setName(item.item_name);
        setDescription(item.item_description || '');
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            await apiRequest(`/items/${id}`, 'DELETE');
            await fetchItems();
            await onDataUpdate();
        }
    };

    return (
        <div className="management-section">
            <h2 id="manage-item-header">{editingId ? 'Edit Item' : 'Manage Items'}</h2>
            <form id="item-form" onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    id="item-name-input" 
                    placeholder="Item Name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                />
                <input 
                    type="text" 
                    id="item-desc-input" 
                    placeholder="Item Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)} 
                />
                <div className="form-actions">
                    <button type="submit" id="item-form-submit-btn" className="primary-action">
                        {editingId ? 'Update Item' : 'Add Item'}
                    </button>
                    {editingId && (
                        <button type="button" id="item-form-cancel-btn" className="cancel-action" onClick={resetForm}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>
            <table className="management-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="items-table-body">
                    {items.map(item => (
                        <tr key={item.item_id}>
                            <td>{item.item_name}</td>
                            <td>{item.item_description || '-'}</td>
                            <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="edit-action-btn" onClick={() => handleEdit(item)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(item.item_id)}>Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ManageItems;