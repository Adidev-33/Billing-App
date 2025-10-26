import React from 'react';
import AddItemForm from "./AddItemForm";
import ManageItems from "./ManageItems";
import ManageMaterials from "./ManageMaterials";
import ManageRates from "./ManageRates";
import PreviousInvoices from "./PreviousInvoices";

function Sidebar({ 
    items, materials, rates, 
    taxPercentage, setTaxPercentage, 
    onAddItem, onDataUpdate, onLoadInvoice,
    activeTab, setActiveTab
}) {

    const renderPanel = () => {
        switch (activeTab) {
            case 'add-item':
                return (
                    <AddItemForm 
                        items={items} 
                        materials={materials} 
                        taxPercentage={taxPercentage}
                        setTaxPercentage={setTaxPercentage}
                        onAddItem={onAddItem} 
                    />
                );
            case 'manage-items':
                return <ManageItems onDataUpdate={onDataUpdate} />;
            case 'manage-materials':
                return <ManageMaterials onDataUpdate={onDataUpdate} />;
            case 'manage-rates':
                return <ManageRates items={items} materials={materials} rates={rates} onDataUpdate={onDataUpdate} />;
            case 'previous-invoices':
                return <PreviousInvoices onLoadInvoice={onLoadInvoice} activeTab={activeTab} />;
            default:
                return null;
        }
    };

    return (
        <div className="left-panel">
            <div className="left-nav">
                <button 
                    className={`nav-button ${activeTab === 'add-item' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('add-item')}
                >
                    Add Item
                </button>
                <button 
                    className={`nav-button ${activeTab === 'manage-items' ? 'active' : ''}`}
                    onClick={() => setActiveTab('manage-items')}
                >
                    Manage Items
                </button>
                <button 
                    className={`nav-button ${activeTab === 'manage-materials' ? 'active' : ''}`}
                    onClick={() => setActiveTab('manage-materials')}
                >
                    Manage Materials
                </button>
                <button 
                    className={`nav-button ${activeTab === 'manage-rates' ? 'active' : ''}`}
                    onClick={() => setActiveTab('manage-rates')}
                >
                    Manage Rates
                </button>
                <button 
                    className={`nav-button ${activeTab === 'previous-invoices' ? 'active' : ''}`}
                    onClick={() => setActiveTab('previous-invoices')}
                >
                    Previous Invoices
                </button>
            </div>
            <div className="left-content">
                <div className="left-content-panel active">
                    {renderPanel()}
                </div>
            </div>
        </div>
    );
}

export default Sidebar;