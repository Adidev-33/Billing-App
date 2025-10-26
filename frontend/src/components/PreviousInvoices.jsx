import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/api';

function PreviousInvoices({ onLoadInvoice, activeTab }) {
    const [invoices, setInvoices] = useState([]);

    const fetchInvoices = async () => {
        const data = await apiRequest('/invoices');
        if (data) setInvoices(data);
    };

    // Fetch invoices when the component mounts
    // and whenever this tab becomes active
    useEffect(() => {
        if (activeTab === 'previous-invoices') {
            fetchInvoices();
        }
    }, [activeTab]);

    const handleDelete = async (e, id) => {
        e.preventDefault(); // Stop navigation
        if (confirm('Are you sure you want to permanently delete this invoice?')) {
            const result = await apiRequest(`/invoices/${id}`, 'DELETE');
            if (result && result.success) {
                alert(result.message);
                await fetchInvoices();
            }
        }
    };

    return (
        <div>
            <h2>Previous Invoices</h2>
            <p className="small-text">Click an invoice to view, or 'Edit' to load it.</p>
            <ul id="invoices-list" className="scrollable-list">
                {invoices.length === 0 ? (
                    <li><p style={{ padding: '15px' }}>No saved invoices found.</p></li>
                ) : (
                    invoices.map(inv => (
                        <li key={inv.invoice_id}>
                            <Link to={`/view_invoice/${inv.invoice_id}`} className="invoice-link" title="View invoice">
                                <span><strong>#{inv.invoice_number}</strong> - {inv.customer_name}</span>
                                <span>{new Date(inv.invoice_date).toLocaleDateString()} - <strong>₹{parseFloat(inv.grand_total).toFixed(2)}</strong></span>
                            </Link>
                            <div className="invoice-actions-container">
                                <button 
                                    className="edit-btn edit-action-btn" 
                                    onClick={() => onLoadInvoice(inv.invoice_id)}
                                >
                                    Edit
                                </button>
                                <button 
                                    className="delete-invoice-btn" 
                                    onClick={(e) => handleDelete(e, inv.invoice_id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}

export default PreviousInvoices;