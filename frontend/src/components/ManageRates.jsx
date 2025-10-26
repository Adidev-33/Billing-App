import React, { useState } from 'react';
import { apiRequest } from '../api/api';

function ManageRates({ items, materials, rates, onDataUpdate }) {
    const [itemId, setItemId] = useState('');
    const [materialId, setMaterialId] = useState('');
    const [uom, setUom] = useState('sqcm');
    const [rate, setRate] = useState('');
    const [editingId, setEditingId] = useState(null);

    const resetForm = () => {
        setItemId('');
        setMaterialId('');
        setUom('sqcm');
        setRate('');
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rate || isNaN(parseFloat(rate))) return alert('A valid rate is required.');

        if (editingId) {
            await apiRequest(`/rates/${editingId}`, 'PUT', { rate });
        } else {
            if (!itemId || !materialId || !uom) return alert('Please select an item, material, and unit.');
            await apiRequest('/rates', 'POST', { itemId, materialId, uom, rate });
        }
        
        resetForm();
        await onDataUpdate(); // Refreshes the rates list
    };

    const handleEdit = (rate) => {
        setEditingId(rate.rate_id);
        setItemId(rate.item_id);
        setMaterialId(rate.material_id);
        setUom(rate.uom);
        setRate(rate.rate_per_sqcm);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this rate?')) {
            await apiRequest(`/rates/${id}`, 'DELETE');
            await onDataUpdate();
        }
    };

    return (
        <div className="management-section">
            <h2 id="manage-rate-header">{editingId ? 'Edit Rate' : 'Manage Rates'}</h2>
            <form id="rate-form" onSubmit={handleSubmit}>
                <select id="rate-item-select" value={itemId} onChange={(e) => setItemId(e.target.value)} required disabled={!!editingId}>
                    <option value="">-- Select Item --</option>
                    {items.map(item => (
                        <option key={item.item_id} value={item.item_id}>{item.item_name}</option>
                    ))}
                </select>
                <select id="rate-material-select" value={materialId} onChange={(e) => setMaterialId(e.target.value)} required disabled={!!editingId}>
                    <option value="">-- Select Material --</option>
                    {materials.map(mat => (
                        <option key={mat.material_id} value={mat.material_id}>{mat.material_name}</option>
                    ))}
                </select>
                <select id="rate-uom-select" value={uom} onChange={(e) => setUom(e.target.value)} required disabled={!!editingId}>
                    <option value="sqcm">sq. cm</option>
                    <option value="sqft">sq. ft</option>
                    <option value="nos">nos</option>
                    <option value="mtr">mtr</option>
                </select>
                <input 
                    type="number" step="0.01" id="rate-input" placeholder="Rate (e.g., 0.25)" 
                    value={rate} onChange={(e) => setRate(e.target.value)}
                    required 
                />
                <div className="form-actions">
                    <button type="submit" id="rate-form-submit-btn" className="primary-action">
                        {editingId ? 'Update Rate' : 'Save Rate'}
                    </button>
                    {editingId && (
                        <button type="button" id="rate-form-cancel-btn" className="cancel-action" onClick={resetForm}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>
            <table className="management-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Material</th>
                        <th>Unit</th>
                        <th>Rate</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="rates-table-body">
                    {rates.map(rate => (
                        <tr key={rate.rate_id}>
                            <td>{rate.item_name}</td>
                            <td>{rate.material_name}</td>
                            <td>{rate.uom.toUpperCase()}</td>
                            <td>₹{parseFloat(rate.rate_per_sqcm).toFixed(2)}</td>
                            <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="edit-action-btn" onClick={() => handleEdit(rate)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(rate.rate_id)}>Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ManageRates;