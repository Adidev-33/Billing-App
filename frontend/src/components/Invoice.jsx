import React, { useMemo } from 'react';

function Invoice({ 
    billItems, customerName, setCustomerName, 
    invoiceTitle, setInvoiceTitle,
    onRemoveItem, onSave, onClear, isEditing 
}) {

    const grandTotal = useMemo(() => {
        return billItems.reduce((sum, item) => sum + parseFloat(item.totalAmount || 0), 0);
    }, [billItems]);

    return (
        <div className="right-panel">
            <div id="invoice-wrapper">
                <div className="invoice-header-print">
                    <img src="/logo.png" alt="Company Logo" className="company-logo-print" />
                    <div className="company-details">
                        <h1>BILLING APP</h1>
                    </div>
                </div>
                <div className="bill-header">
                    <input 
                        type="text" 
                        id="invoice-title-input" 
                        value={invoiceTitle} 
                        onChange={(e) => setInvoiceTitle(e.target.value)}
                        className="invoice-title-input" 
                    />
                    <div className="customer-info">
                        <label htmlFor="customer-name-input">Customer Name: </label>
                        <input 
                            type="text" 
                            id="customer-name-input" 
                            placeholder="Enter customer's name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)} 
                        />
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
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="bill-body">
                        {billItems.map((item) => (
                            <tr key={item.slno}>
                                <td>{item.slno}</td>
                                <td>
                                    <strong>{item.itemName} ({item.materialName})</strong><br/>
                                    <small style={{color: '#555'}}>{item.itemDescription || ''}</small>
                                </td>
                                <td>{(item.uom === 'sqcm' || item.uom === 'sqft') ? `${item.width} x ${item.height}` : 'N/A'}</td>
                                <td>{item.quantity}</td>
                                <td>₹{parseFloat(item.unitPrice).toFixed(2)} / {item.uom}</td>
                                <td>₹{parseFloat(item.amount).toFixed(2)}</td>
                                <td>{parseFloat(item.tax_percentage || 0).toFixed(2)}%</td>
                                <td>₹{parseFloat(item.totalAmount).toFixed(2)}</td>
                                <td>
                                    <button 
                                        className="delete-btn remove-bill-item-btn" 
                                        onClick={() => onRemoveItem(item.slno)}
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="8" className="grand-total-label">Grand Total</td>
                            <td id="grand-total" className="grand-total-amount">₹{grandTotal.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
                <div className="invoice-footer">
                    {/* ... Footer content (Bank Details, T&C) ... */}
                </div>
            </div>
            <div className="invoice-actions">
                <button id="save-invoice-btn" className="primary-action" onClick={onSave}>
                    {isEditing ? 'Update' : 'SAVE'}
                </button>
                {isEditing && (
                    <button id="clear-bill-btn" onClick={onClear}>
                        Start New Invoice
                    </button>
                )}
            </div>
        </div>
    );
}

export default Invoice;