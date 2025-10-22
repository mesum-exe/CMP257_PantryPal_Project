// 1. Define the Inventory Data
const inventory = [
    { name: "Flour (All-Purpose)", category: "Baking", quantity: "2 kg", inStock: true },
    { name: "Eggs", category: "Dairy/Protein", quantity: "1 dozen", inStock: true },
    { name: "Sugar (Granulated)", category: "Baking", quantity: "500 g", inStock: true },
    { name: "Milk (Whole)", category: "Dairy", quantity: "1 L", inStock: false },
    { name: "Chicken Breast", category: "Meat/Protein", quantity: "4 pieces", inStock: true },
    { name: "Tomatoes", category: "Produce", quantity: "5 large", inStock: true },
    { name: "Spinach", category: "Produce", quantity: "1 bag", inStock: false },
    { name: "Olive Oil", category: "Pantry", quantity: "1 bottle", inStock: true },
];

// 2. Function to Render the Table
function renderInventoryTable() {
    // Get the table body element
    const tableBody = document.querySelector('#inventoryTable tbody');
    
    // Clear any existing rows (useful if you update the data later)
    tableBody.innerHTML = ''; 

    // Loop through each item in the inventory array
    inventory.forEach(item => {
        // Create a new table row (<tr>)
        const row = document.createElement('tr');

        // Create the four table data cells (<td>) and set their content
        
        // --- Ingredient Name ---
        const nameCell = document.createElement('td');
        nameCell.textContent = item.name;
        row.appendChild(nameCell);

        // --- Category ---
        const categoryCell = document.createElement('td');
        categoryCell.textContent = item.category;
        row.appendChild(categoryCell);
        
        // --- Quantity/Unit ---
        const quantityCell = document.createElement('td');
        quantityCell.textContent = item.quantity;
        row.appendChild(quantityCell);

        // --- In Stock Status ---
        const stockCell = document.createElement('td');
        const stockStatusText = item.inStock ? 'Yes' : 'No';
        
        // Add a class for styling (from the CSS file)
        stockCell.classList.add(item.inStock ? 'in-stock-true' : 'in-stock-false');
        
        stockCell.textContent = stockStatusText;
        row.appendChild(stockCell);

        // Add the completed row to the table body
        tableBody.appendChild(row);
    });
}

// 3. Call the function when the script loads to display the table
renderInventoryTable();