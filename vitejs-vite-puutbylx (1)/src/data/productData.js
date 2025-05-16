// src/data/productData.js

// Export an empty array. The actual data will be loaded from localStorage
// which is populated by the ProductUpload component.
// You could put a few essential fallback items here if absolutely necessary,
// ensuring they have the correct structure (model, msrpGBP, msrpEUR, descriptionEN, type etc.)
export const productTable = [];

// Optional: Keep header mapping here for reference if needed by upload parser elsewhere
// Ensure these keys EXACTLY match your Excel file headers
export const productHeaderMapping = {
    'ID': 'id',
    'Article Number': 'articleNumber',
    'Type': 'type',
    'Method': 'method',
    'Product': 'model',
    'Description NL': 'descriptionNL',
    'Description EN': 'descriptionEN',
    'Status': 'status',
    'MRSP (€)': 'mrspEUR',
    'MRSP (£)': 'mrspGBP',
    'Discount (%)': 'discountPercent'
    'SMC (%)': 'smcPercent'
};

