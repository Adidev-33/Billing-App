import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/api';

function ManageMaterials({ onDataUpdate }) {
    const [materials, setMaterials] = useState([]);
    const [name, setName] = useState('');
    const [editingId, setEditingId] = useState(null);

    const fetchMaterials = async () => {
        const data = await apiRequest('/materials');
        if (data) setMaterials(data);
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    const resetForm = () => {
        setName('');
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) return alert('Material name is required.');

        if (editingId) {
            await apiRequest(`/materials/${editingId}`, 'PUT', { name });
        } else {
            await apiRequest('/materials', 'POST', { name });
        }
        
        resetForm();
        await fetchMaterials();
        await onDataUpdate();
    };

    const handleEdit = (material) => {
        setEditingId(material.material_id);
        setName(material.material_name);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this material?')) {
            await apiRequest(`/materials/${id}`, 'DELETE');
            await fetchMaterials();
            await onDataUpdate();
        }
    };

    return (
        <div className="management-section">
            <h2 id="manage-material-header">{editingId ? 'Edit Material' : 'Manage Materials'}</h2>
            <form id="material-form" onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    id="material-name-input" 
                    placeholder="New Material Name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                />
                <div className="form-actions">
                    <button type="submit" id="material-form-submit-btn" className="primary-action">
                        {editingId ? 'Update Material' : 'Add Material'}
                    </button>
                    {editingId && (
                        <button type="button" id="material-form-cancel-btn" className="cancel-action" onClick={resetForm}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>
            <table className="management-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="materials-table-body">
                    {materials.map(mat => (
                        <tr key={mat.material_id}>
                            <td>{mat.material_name}</td>
                            <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="edit-action-btn" onClick={() => handleEdit(mat)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(mat.material_id)}>Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ManageMaterials;