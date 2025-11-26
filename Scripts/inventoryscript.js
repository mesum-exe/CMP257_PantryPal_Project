const API_BASE_URL = 'http://localhost:8080/PantryPal';
const INVENTORY_ENDPOINT = '/api/inventory';
const inventoryBody = document.getElementById('inventory-table-body');

// Form Elements
const itemForm = document.getElementById('add-item-form');
const idInput = document.getElementById('edit-item-id');
const submitBtn = document.getElementById('btn-submit');

// Helper: Format date
function formatDate(dateString) {
    if (!dateString || dateString === 'N/A') return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date)) return 'N/A';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Helper:QUick Stats
function updateStats(data) {
    // 1. Update Total Items
    document.getElementById('stat-total-items').textContent = data.length;

    // 2. Update Total Quantity (Simple Sum if numeric, or count items if string)
    let totalQty = 0;
    data.forEach(item => {
        const num = parseFloat(item.quantity);
        if (!isNaN(num)) totalQty += num;
    });
    // data.length if Parsing fails for most items
    document.getElementById('stat-total-qty').textContent = data.length; 

    // 3. Update Categories
    // Reset counts
    const categories = { 'Fruit': 0, 'Vegetable': 0, 'Grain': 0, 'Protein': 0, 'Other': 0 };
    
    data.forEach(item => {
        // Normalize category name from DB (Capitalized)
        let cat = item.category;
        // Matches our keys?
        if (categories.hasOwnProperty(cat)) {
            categories[cat]++;
        } else {
            categories['Other']++;
        }
    });

    // Render to HTML
    document.getElementById('count-Fruit').textContent = categories['Fruit'];
    document.getElementById('count-Vegetable').textContent = categories['Vegetable'];
    document.getElementById('count-Grain').textContent = categories['Grain'];
    document.getElementById('count-Protein').textContent = categories['Protein'];
    document.getElementById('count-Other').textContent = categories['Other'];
}

// 1. FETCH AND DISPLAY ITEMS 
async function fetchAndAppendInventory() {
    try {
        const response = await fetch(API_BASE_URL + INVENTORY_ENDPOINT);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        // Clear the table first so we do not duplicate on reload
        inventoryBody.innerHTML = '';

        // Loop through DB data
        data.forEach((item, index) => {
            const categoryClass = 'category-' + (item.category || 'other').toLowerCase().trim();
            
            // Parse the date strings
            const expiry = new Date(item.expiryDate);
            const today = new Date();

            // Reset time to midnight for both to ensure accurate day counting
            expiry.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);

            // Calculate difference in milliseconds -> convert to days
            const diffTime = expiry.getTime() - today.getTime();
            const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Default content is just the formatted date text
            let dateDisplay = formatDate(item.expiryDate);

            // --- YOUR CUSTOM EXPIRY EFFECTS RESTORED HERE ---
            if (daysUntil < 0) {
                // EXPIRED -> LINE-THROUGH
                dateDisplay = `<span class="text-decoration-line-through">${dateDisplay}</span>`;
            } else if (daysUntil === 0) {
                // EXPIRING TODAY -> RED
                dateDisplay = `<span class="text-danger fw-bold">${dateDisplay}</span>`;
                
            } else if (daysUntil < 10) {
                // EXPIRING SOON (< 10 days) -> ORANGE
                dateDisplay = `<span class="text-warning fw-bold">${dateDisplay}</span>`;
            } 
            // If > 10 days, display remains default black text
            
            const row = document.createElement('tr');
            row.classList.add('db-row'); // Mark as database row
            
            // VISUAL ID: We use (index + 1) so the list always looks like 1, 2, 3...
            // ACTUAL ID: We use item.id for the DELETE button logic
            row.innerHTML = `
                <td><strong>#${String(index + 1).padStart(3, '0')}</strong></td>
                <td>${item.name}</td>
                <td><span class="category-badge ${categoryClass}">${item.category}</span></td>
                <td><strong>${item.quantity}</strong></td>
                <td>${dateDisplay}</td>
                <td>
                    <button class="btn btn-warning btn-sm me-1" 
                        onclick="startEdit(${item.id}, '${item.name}', '${item.category}', '${item.quantity}', '${item.expiryDate}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteItem(${item.id}, this)">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            inventoryBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading backend inventory:", error);
    }
}

// 2. START EDIT (Fills the form)
window.startEdit = function(id, name, category, quantity, date) {
    // Fill the inputs
    idInput.value = id;
    document.getElementById('item-name').value = name;
    document.getElementById('item-type').value = category;
    document.getElementById('item-quantity').value = quantity;
    document.getElementById('expiry-date').value = date;

    // Change Button Look while Updating
    submitBtn.innerHTML = '<i class="bi bi-check-lg"></i> Update Item';
    submitBtn.classList.add('btn-warning'); 
    // Adds btn-warning, which overrides btn-primary, keeps the same styles.
    
    // Scroll up
    document.documentElement.scrollTop = 0;
};

// 3. HANDLE SUBMIT (ADD or UPDATE) 
itemForm.addEventListener('submit', async function(e) {
    e.preventDefault(); 

    const id = idInput.value; // Get the hidden ID
    const isUpdate = id !== ""; // If ID exists, we are updating

    const itemData = {
        name: document.getElementById('item-name').value,
        category: document.getElementById('item-type').value,
        quantity: document.getElementById('item-quantity').value,
        expiryDate: document.getElementById('expiry-date').value
    };

    try {
        let url = API_BASE_URL + INVENTORY_ENDPOINT;
        let method = 'POST';

        if (isUpdate) {
            url += `?id=${id}`; // Add ID to URL for Update
            method = 'PUT';     // Switch method to PUT
        }

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData)
        });

        if (response.ok) {
            alert(isUpdate ? "Item Updated!" : "Item Added!");
            
            // Reset Form & Button
            itemForm.reset();
            idInput.value = "";
            submitBtn.innerHTML = '<i class="bi bi-plus-lg"></i> Add Item';
            submitBtn.classList.remove('btn-warning'); // tur n it back to green

            fetchAndAppendInventory(); // Refresh table
        } else {
            const errorText = await response.text();
            alert("Failed: " + errorText);
        }
    } catch (error) {
        console.error("Error processing item:", error);
        alert("Error connecting to server.");
    }
});

// 4. DELETE ITEM (DELETE) 
window.deleteItem = async function(id, btnElement) {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
        // We use the REAL database ID to delete
        const response = await fetch(`${API_BASE_URL}${INVENTORY_ENDPOINT}?id=${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Reload the list so the numbers (1, 2, 3...) reset correctly
            fetchAndAppendInventory();
        } else {
            alert("Failed to delete item.");
        }
    } catch (error) {
        console.error("Error deleting item:", error);
    }
};

// 5. Search Bar - Allows searching up by Name and Category.
document.getElementById('search-input').addEventListener('keyup', function() {
    const searchTerm = this.value.toLowerCase();
    const rows = document.querySelectorAll('#inventory-table-body tr');

    rows.forEach(row => {
    	// Index 0 = ID
        // Column 1 = Name 
        const itemName = row.cells[1].textContent.toLowerCase();
        // Column 2 = Category
        const itemCategory = row.cells[2].textContent.toLowerCase();

        if (itemName.includes(searchTerm) || itemCategory.includes(searchTerm)) {
            row.style.display = ''; // Show
        } else {
            row.style.display = 'none'; // Hide
        }
    });
});

// Load data when page opens
window.addEventListener('DOMContentLoaded', fetchAndAppendInventory);