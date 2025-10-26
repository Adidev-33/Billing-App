import React, { useState, useEffect } from 'react';

function AddItemForm({ items, materials, taxPercentage, setTaxPercentage, onAddItem }) {
    const [itemId, setItemId] = useState('');
    const [materialId, setMaterialId] = useState('');
    const [uom, setUom] = useState('sqcm');
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [error, setError] = useState('');

    const isAreaBased = uom === 'sqcm' || uom === 'sqft';

    useEffect(() => {
        if (!isAreaBased) {
            setWidth('');
            setHeight('');
        }
    }, [uom, isAreaBased]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const qty = parseInt(quantity);
        const w = parseFloat(width) || 0;
        const h = parseFloat(height) || 0;
        const tax = parseFloat(taxPercentage);

        if (!itemId || !materialId || !uom || !qty || qty <= 0 || isNaN(tax) || tax < 0) {
            setError('Please fill all fields with valid, positive values.');
            return;
        }
        if (isAreaBased && (w <= 0 || h <= 0)) {
            setError('Width and Height must be positive numbers for area-based units.');
            return;
        }

        onAddItem({
            itemId,
            materialId,
            uom,
            width: w,
            height: h,
            quantity: qty
        });

        // Reset form
        // setItemId('');
        // setMaterialId('');
        setWidth('');
        setHeight('');
        setQuantity('1');
    };

    return (
        <div className="form-container">
            <h2>Add Item to Bill</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <label htmlFor="item-select">Item:</label>
                    <select id="item-select" value={itemId} onChange={(e) => setItemId(e.target.value)} required>
                        <option value="">-- Select Item --</option>
                        {items.map(item => (
                            <option key={item.item_id} value={item.item_id}>{item.item_name}</option>
                        ))}
                    </select>

                    <label htmlFor="material-select">Material:</label>
                    <select id="material-select" value={materialId} onChange={(e) => setMaterialId(e.target.value)} required>
                        <option value="">-- Select Material --</option>
                        {materials.map(mat => (
                            <option key={mat.material_id} value={mat.material_id}>{mat.material_name}</option>
                        ))}
                    </select>

                    <label htmlFor="uom-select">Unit:</label>
                    <select id="uom-select" value={uom} onChange={(e) => setUom(e.target.value)}>
                        <option value="sqcm">sq. cm</option>
                        <option value="sqft">sq. ft</option>
                        <option value="nos">nos</option>
                        <option value="mtr">mtr</option>
                    </select>

                    <label htmlFor="width-input">Width:</label>
                    <input 
                        type="number" id="width-input" placeholder="e.g., 120"
                        value={width} onChange={(e) => setWidth(e.target.value)}
                        disabled={!isAreaBased} 
                    />

                    <label htmlFor="height-input">Height:</label>
                    <input 
                        type="number" id="height-input" placeholder="e.g., 200"
                        value={height} onChange={(e) => setHeight(e.target.value)}
                        disabled={!isAreaBased} 
                    />

                    <label htmlFor="quantity-input">Quantity:</label>
                    <input 
                        type="number" id="quantity-input" value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)} min="1" 
                    />

                    <label htmlFor="tax-percentage-input">Tax (%):</label>
                    <input 
                        type="number" id="tax-percentage-input" value={taxPercentage} 
                        onChange={(e) => setTaxPercentage(parseFloat(e.target.value))} 
                        min="0" step="0.01" 
                    />
                </div>
                <button type="submit" id="add-item-btn">Add Item</button>
                <p id="error-msg" className="error-text">{error}</p>
            </form>
        </div>
    );
}

export default AddItemForm;