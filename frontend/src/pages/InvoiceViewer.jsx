import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/api';

function InvoiceViewer() {
    const [invoice, setInvoice] = useState(null);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const grandTotalFooterCell = useRef(null);

    useEffect(() => {
        const loadInvoice = async () => {
            const data = await apiRequest(`/invoices/${id}`);
            if (data) {
                setInvoice(data);
                document.title = `${data.details.invoice_title || 'Invoice'} #${data.details.invoice_number} - ${data.details.customer_name}`;
            } else {
                setError('Could not load invoice data.');
            }
        };
        loadInvoice();
    }, [id]);

    const handlePrint = () => {
        const cell = grandTotalFooterCell.current;
        if (!cell) {
            window.print();
            return;
        }
        const originalColspan = cell.colSpan;
        cell.colSpan = 6;
        window.print();
        cell.colSpan = originalColspan;
    };

    const handleBack = () => {
        navigate('/');
    };

    if (error) {
        return <div className="container"><h1>{error}</h1></div>;
    }

    if (!invoice) {
        return <div className="container"><h1>Loading invoice...</h1></div>;
    }

    const { details, items } = invoice;

    return (
        <div className="container view-only-body">
            <div id="invoice-wrapper">
                <div className="invoice-top-section">
                    <div className="print-company-info">
                        <img src="/logo.png" alt="Company Logo" className="company-logo-print" />
                        <div className="company-details">
                            <h1>BILLING APP</h1>
                        </div>
                    </div>
                    <div className="print-invoice-details">
                        <h2 id="invoice-title-display">{details.invoice_title || 'Invoice / Bill'}</h2>
                        <div className="customer-info">
                            <strong>Customer:</strong> <span id="customer-name-display">{details.customer_name}</span><br />
                            <strong>Date:</strong> <span id="invoice-date-display">{new Date(details.invoice_date).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <table id="bill-table">
                    <thead>
                        <tr>
                            <th>Sl.No.</th>
                            <th>Item & Description</th>
                            <th>Dimensions</th>
                            <th>Qty</th>
                            <th>Unit Price</th>
                            <th>Amount</th>
                            <th>Tax</th>
                            <th>Total Amount</th>
                        </tr>
                    </thead>
                    <tbody id="bill-body">
                        {items.map(item => {
                            const description = item.item_description || '';
                            const mainParts = description.split(' - ');
                            const nameAndMaterial = mainParts[0] || '';
                            const specificDesc = mainParts[1] || '';
                            const materialMatch = nameAndMaterial.match(/\((.*?)\)/);
                            const materialName = materialMatch ? materialMatch[1] : 'Unknown';
                            const itemName = nameAndMaterial.replace(/\s*\(.*\)/, '').trim();
                            
                            return (
                                <tr key={item.invoice_item_id}>
                                    <td>{item.slno}</td>
                                    <td>
                                        <strong>{itemName} ({materialName})</strong><br />
                                        <small style={{ color: '#555' }}>{specificDesc}</small>
                                    </td>
                                    <td>{(item.uom === 'sqcm' || item.uom === 'sqft') ? `${item.width} x ${item.height}` : 'N/A'}</td>
                                    <td>{item.quantity}</td>
                                    <td>₹{parseFloat(item.unit_price).toFixed(2)} / {item.uom}</td>
                                    <td>₹{parseFloat(item.amount).toFixed(2)}</td>
                                    <td>{parseFloat(item.tax_percentage).toFixed(2)}%</td>
                                    <td>₹{parseFloat(item.total_amount).toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td ref={grandTotalFooterCell} colSpan="7" className="grand-total-label">Grand Total</td>
                            <td id="grand-total" className="grand-total-amount">₹{parseFloat(details.grand_total).toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
                <div className="invoice-footer">
                    <div className="footer-section">
                        <strong>Payment Information / Bank Details:</strong>
                       
                    </div>
                    <div className="footer-section">
                        <strong>Terms & Conditions:</strong>
                        <p>Payment is due within 15 days of the invoice date.</p>
                    </div>
                </div>
            </div>
            <div className="invoice-actions">
                <button id="print-btn" onClick={handlePrint}>Print</button>
                <button id="edit-invoice-btn" className="primary-action" onClick={handleBack}>
                    Back to Main
                </button>
            </div>
        </div>
    );
}

export default InvoiceViewer;