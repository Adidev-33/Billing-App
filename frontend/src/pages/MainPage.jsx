import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api/api';
import Sidebar from '../components/Sidebar';
import Invoice from '../components/Invoice';

function MainPage() {
    const [billItems, setBillItems] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [invoiceTitle, setInvoiceTitle] = useState('Invoice / Bill');
    const [taxPercentage, setTaxPercentage] = useState(18);
    const [activeTab, setActiveTab] = useState('add-item');

    // Data for dropdowns
    const [items, setItems] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [rates, setRates] = useState([]);

    // State for editing
    const [currentEditingInvoiceId, setCurrentEditingInvoiceId] = useState(null);
    const [currentEditingInvoiceNumber, setCurrentEditingInvoiceNumber] = useState(null);

    // Fetch all data for dropdowns
    const refreshAllData = useCallback(async () => {
        const [itemsData, materialsData, ratesData] = await Promise.all([
            apiRequest('/items'),
            apiRequest('/materials'),
            apiRequest('/rates')
        ]);
        if (itemsData) setItems(itemsData);
        if (materialsData) setMaterials(materialsData);
        if (ratesData) setRates(ratesData);
    }, []);

    useEffect(() => {
        refreshAllData();
    }, [refreshAllData]);

    const handleAddItemToBill = async (newItemData) => {
        const { itemId, materialId, uom, width, height, quantity } = newItemData;

        // Fetch the rate
        const rateData = await apiRequest(`/rate?itemId=${itemId}&materialId=${materialId}&uom=${uom}`);
        if (!rateData || !rateData.rate_per_sqcm) {
            alert(`Could not find a rate for the selected item/material with UOM: ${uom}.`);
            return;
        }

        const unitPrice = parseFloat(rateData.rate_per_sqcm);
        const isAreaBased = (uom === 'sqcm' || uom === 'sqft');
        const amount = isAreaBased ? (width * height * unitPrice * quantity) : (unitPrice * quantity);
        const totalAmount = amount * (1 + (taxPercentage / 100));

        const newItem = {
            slno: billItems.length + 1,
            itemName: rateData.item_name,
            itemDescription: rateData.item_description,
            materialName: rateData.material_name,
            width,
            height,
            uom,
            quantity,
            unitPrice,
            amount,
            totalAmount,
            tax_percentage: taxPercentage
        };

        setBillItems([...billItems, newItem]);
    };

    const handleRemoveBillItem = (slnoToRemove) => {
        const newBillItems = billItems
            .filter(item => item.slno !== slnoToRemove)
            .map((item, index) => ({ ...item, slno: index + 1 })); // Re-order slno
        setBillItems(newBillItems);
    };

    const resetBill = () => {
        setBillItems([]);
        setCustomerName('');
        setInvoiceTitle('Invoice / Bill');
        setTaxPercentage(18);
        setCurrentEditingInvoiceId(null);
        setCurrentEditingInvoiceNumber(null);
        setActiveTab('add-item');
    };

    const handleSaveOrUpdateInvoice = async () => {
        if (!customerName) return alert('Please enter a customer name.');
        if (billItems.length === 0) return alert('Cannot save an empty invoice.');
        
        const grandTotal = billItems.reduce((sum, item) => sum + parseFloat(item.totalAmount || 0), 0);
        const invoiceData = { 
            customerName, 
            grandTotal, 
            items: billItems, 
            invoiceTitle 
        };

        let result;
        if (currentEditingInvoiceId) {
            // Update existing invoice
            result = await apiRequest(`/invoices/${currentEditingInvoiceId}`, 'PUT', invoiceData);
            if (result) {
                alert(`Invoice #${currentEditingInvoiceNumber} updated successfully!`);
                resetBill();
            }
        } else {
            // Save new invoice
            result = await apiRequest('/invoices', 'POST', invoiceData);
            if (result) {
                alert(`Invoice #${result.invoiceNumber} saved successfully!`);
                resetBill();
            }
        }
    };

    const loadInvoiceForEditing = async (invoiceId) => {
        resetBill();
        const data = await apiRequest(`/invoices/${invoiceId}`);
        if (!data) return;

        setCustomerName(data.details.customer_name);
        setInvoiceTitle(data.details.invoice_title || 'Invoice / Bill');
        setCurrentEditingInvoiceId(invoiceId);
        setCurrentEditingInvoiceNumber(data.details.invoice_number);

        const loadedBillItems = data.items.map(item => {
            const description = item.item_description || '';
            const mainParts = description.split(' - ');
            const nameAndMaterial = mainParts[0] || '';
            const specificDesc = mainParts[1] || '';
            const materialMatch = nameAndMaterial.match(/\((.*?)\)/);
            const materialName = materialMatch ? materialMatch[1] : 'Unknown';
            const itemName = nameAndMaterial.replace(/\s*\(.*\)/, '').trim();
            
            return {
                slno: item.slno,
                itemName,
                itemDescription: specificDesc,
                materialName,
                width: parseFloat(item.width || 0),
                height: parseFloat(item.height || 0),
                uom: item.uom,
                quantity: parseInt(item.quantity || 1),
                unitPrice: parseFloat(item.unit_price || 0),
                amount: parseFloat(item.amount || 0),
                tax_percentage: parseFloat(item.tax_percentage || 0),
                totalAmount: parseFloat(item.total_amount || 0)
            };
        });
        
        setBillItems(loadedBillItems);
        if (loadedBillItems.length > 0) {
            setTaxPercentage(loadedBillItems[0].tax_percentage || 18);
        }
        
        // Switch to the 'add-item' tab so the user sees the loaded invoice
        setActiveTab('add-item');
    };

    return (
        <div className="container">
            <div className="main-layout">
                <Sidebar
                    items={items}
                    materials={materials}
                    rates={rates}
                    taxPercentage={taxPercentage}
                    setTaxPercentage={setTaxPercentage}
                    onAddItem={handleAddItemToBill}
                    onDataUpdate={refreshAllData}
                    onLoadInvoice={loadInvoiceForEditing}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
                <Invoice
                    billItems={billItems}
                    customerName={customerName}
                    setCustomerName={setCustomerName}
                    invoiceTitle={invoiceTitle}
                    setInvoiceTitle={setInvoiceTitle}
                    onRemoveItem={handleRemoveBillItem}
                    onSave={handleSaveOrUpdateInvoice}
                    onClear={resetBill}
                    isEditing={!!currentEditingInvoiceId}
                />
            </div>
        </div>
    );
}

export default MainPage;