// Inventory Data
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

//Render the Table
function renderInventoryTable() {
    const tableBody = document.querySelector('#inventoryTable tbody');
    

    tableBody.innerHTML = ''; 

    inventory.forEach(item => {
        const row = document.createElement('tr');

        
        const nameCell = document.createElement('td');
        nameCell.textContent = item.name;
        row.appendChild(nameCell);

        const categoryCell = document.createElement('td');
        categoryCell.textContent = item.category;
        row.appendChild(categoryCell);
        
        const quantityCell = document.createElement('td');
        quantityCell.textContent = item.quantity;
        row.appendChild(quantityCell);

        const stockCell = document.createElement('td');
        const stockStatusText = item.inStock ? 'Yes' : 'No';
        
        stockCell.classList.add(item.inStock ? 'in-stock-true' : 'in-stock-false');
        
        stockCell.textContent = stockStatusText;
        row.appendChild(stockCell);

        tableBody.appendChild(row);
    });
}

renderInventoryTable();