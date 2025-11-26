//  Grocery Cart Data with more details
const groceryCart = [
    {
        id: 1,
        name: "Milk",
        amount: 1,
        unit: "Gallon",
        priority: "high",
        note: "High Priority",
        purchased: false,
        addedDate: new Date()
    },
    {
        id: 2,
        name: "Eggs",
        amount: 1,
        unit: "Dozen",
        priority: "normal",
        note: "",
        purchased: false,
        addedDate: new Date()
    },
    {
        id: 3,
        name: "Fresh Basil",
        amount: 0.5,
        unit: "lb",
        priority: "normal",
        note: "For Pesto",
        purchased: false,
        addedDate: new Date()
    },
    {
        id: 4,
        name: "Onions",
        amount: 2,
        unit: "Large",
        priority: "normal",
        note: "",
        purchased: false,
        addedDate: new Date()
    }
];

let nextId = 5;

// Render Grocery List 
function renderGroceryList() {
    const listContainer = document.querySelector('.list-group');
    const itemCountBadge = document.querySelector('h1 .badge');
    
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    const totalItems = groceryCart.length;
    const purchasedItems = groceryCart.filter(item => item.purchased).length;
    itemCountBadge.textContent = `${totalItems} Items`;
    
    updateStats();
    
    if (groceryCart.length === 0) {
        listContainer.innerHTML = `
            <li class="list-group-item">
                <div class="empty-state">
                    <i class="bi bi-cart-x"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add items above to start building your grocery list</p>
                </div>
            </li>
        `;
        return;
    }
    
    const sortedCart = [...groceryCart].sort((a, b) => {
        if (a.purchased !== b.purchased) return a.purchased ? 1 : -1;
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (a.priority !== 'high' && b.priority === 'high') return 1;
        return 0;
    });
    
    sortedCart.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = `list-group-item d-flex justify-content-between align-items-center ${item.purchased ? 'purchased' : ''} slide-in`;
        li.style.animationDelay = `${index * 0.05}s`;
        
        // Priority indicator
        if (item.priority !== 'normal') {
            const priorityDiv = document.createElement('div');
            priorityDiv.className = `priority-indicator priority-${item.priority}`;
            li.appendChild(priorityDiv);
        }
        
        // Main content container
        const itemDiv = document.createElement('div');
        itemDiv.className = 'd-flex align-items-center flex-grow-1';
        
        const checkbox = document.createElement('input');
        checkbox.className = 'form-check-input me-3';
        checkbox.type = 'checkbox';
        checkbox.id = `item${item.id}`;
        checkbox.checked = item.purchased;
        checkbox.addEventListener('change', () => togglePurchased(item.id));
        
        const label = document.createElement('label');
        label.className = 'form-check-label flex-grow-1';
        label.htmlFor = `item${item.id}`;
        
        const itemText = document.createElement('span');
        itemText.className = 'fw-bold me-2';
        itemText.textContent = `${item.name} (${item.amount} ${item.unit})`;
        
        label.appendChild(itemText);
        
        // Add priority badge
        if (item.priority === 'high') {
            const priorityBadge = document.createElement('span');
            priorityBadge.className = 'badge bg-danger me-2';
            priorityBadge.innerHTML = '<i class="bi bi-exclamation-circle me-1"></i>High Priority';
            label.appendChild(priorityBadge);
        }
        
        // Add note badge
        if (item.note && item.priority !== 'high') {
            const noteBadge = document.createElement('span');
            noteBadge.className = 'badge bg-light text-secondary';
            noteBadge.innerHTML = `<i class="bi bi-tag me-1"></i>${item.note}`;
            label.appendChild(noteBadge);
        }
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'd-flex gap-2 align-items-center';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-outline-secondary';
        editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
        editBtn.title = 'Edit item';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            editItem(item.id);
        };
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger';
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
        deleteBtn.title = 'Delete item';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteItem(item.id);
        };
        
        itemDiv.appendChild(checkbox);
        itemDiv.appendChild(label);
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        li.appendChild(itemDiv);
        li.appendChild(actionsDiv);
        
        listContainer.appendChild(li);
    });
}

// Function to update statistics
function updateStats() {
    const statsContainer = document.querySelector('.stats-summary');
    if (!statsContainer) return;
    
    const totalItems = groceryCart.length;
    const purchasedItems = groceryCart.filter(item => item.purchased).length;
    const remainingItems = totalItems - purchasedItems;
    
    statsContainer.innerHTML = `
        <div class="stat-item">
            <span class="stat-value">${totalItems}</span>
            <span class="stat-label">Total Items</span>
        </div>
        <div class="stat-item">
            <span class="stat-value" style="color: #bae673;">${purchasedItems}</span>
            <span class="stat-label">Purchased</span>
        </div>
        <div class="stat-item">
            <span class="stat-value" style="color: #dc3545;">${remainingItems}</span>
            <span class="stat-label">Remaining</span>
        </div>
    `;
}

// Function to Add New Item with validation
function addItem() {
    const nameInput = document.querySelector('input[placeholder*="Item Name"]');
    const amountInput = document.querySelector('input[type="number"]');
    const unitSelect = document.querySelector('select.form-select');
    
    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const unit = unitSelect.value !== 'Unit' ? unitSelect.value : 'pcs';
    
    if (!name) {
        showNotification('Please enter an item name', 'warning');
        nameInput.focus();
        nameInput.classList.add('is-invalid');
        setTimeout(() => nameInput.classList.remove('is-invalid'), 2000);
        return;
    }
    
    if (!amount || amount <= 0) {
        showNotification('Please enter a valid amount', 'warning');
        amountInput.focus();
        amountInput.classList.add('is-invalid');
        setTimeout(() => amountInput.classList.remove('is-invalid'), 2000);
        return;
    }
    
    // Check for duplicates
    const duplicate = groceryCart.find(item => 
        item.name.toLowerCase() === name.toLowerCase() && !item.purchased
    );
    
    if (duplicate) {
        if (confirm(`"${name}" is already in your cart. Do you want to update the quantity?`)) {
            duplicate.amount += amount;
            renderGroceryList();
            showNotification(`Updated ${name} quantity!`, 'success');
        }
        nameInput.value = '';
        amountInput.value = '';
        return;
    }
    
    // Create new item
    const newItem = {
        id: nextId++,
        name: name,
        amount: amount,
        unit: unit,
        priority: 'normal',
        note: '',
        purchased: false,
        addedDate: new Date()
    };
    
    groceryCart.push(newItem);
    
    nameInput.value = '';
    amountInput.value = '';
    unitSelect.value = 'Unit';
    
    const addButton = document.querySelector('.btn-primary');
    addButton.innerHTML = '<i class="bi bi-check-lg"></i> Added!';
    setTimeout(() => {
        addButton.innerHTML = '<i class="bi bi-plus-lg"></i> Add Item';
    }, 1000);
    
    renderGroceryList();
    
    showNotification(`${name} added to cart!`, 'success');
    
    setTimeout(() => {
        const listGroup = document.querySelector('.list-group');
        listGroup.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Function to Edit Item
function editItem(itemId) {
    const item = groceryCart.find(i => i.id === itemId);
    if (!item) return;
    
    const newName = prompt('Edit item name:', item.name);
    if (newName && newName.trim()) {
        item.name = newName.trim();
        renderGroceryList();
        showNotification('Item updated!', 'success');
    }
}

// Function to Toggle Purchased Status with animation
function togglePurchased(itemId) {
    const item = groceryCart.find(i => i.id === itemId);
    if (item) {
        item.purchased = !item.purchased;
        
        playCheckSound();
        
        renderGroceryList();
        
        if (item.purchased) {
            showNotification(`✓ ${item.name} marked as purchased`, 'success');
        }
    }
}

// Function to Delete Item with confirmation
function deleteItem(itemId) {
    const item = groceryCart.find(i => i.id === itemId);
    if (!item) return;
    
    const listItem = document.querySelector(`#item${itemId}`)?.closest('.list-group-item');
    if (listItem) {
        listItem.style.animation = 'shake 0.5s';
    }
    
    setTimeout(() => {
        const index = groceryCart.findIndex(i => i.id === itemId);
        if (index !== -1) {
            const itemName = groceryCart[index].name;
            groceryCart.splice(index, 1);
            renderGroceryList();
            showNotification(`${itemName} removed from cart`, 'info');
        }
    }, 500);
}

// Function to Transfer Purchased Items
// Transfer Purchased Items (UPDATED)
function transferPurchased() {
    const purchasedItems = groceryCart.filter(item => item.purchased);

    if (purchasedItems.length === 0) {
        showNotification('No items marked as purchased', 'warning');
        return;
    }

    const confirmMsg = `Transfer ${purchasedItems.length} item(s) to inventory?\n\nItems:\n${purchasedItems.map(i => `• ${i.name}`).join('\n')}`;

    if (confirm(confirmMsg)) {

        purchasedItems.forEach(item => {
            // ADD TO INVENTORY
            inventory.push({
                name: item.name,
                category: "Uncategorized",
                quantity: `${item.amount} ${item.unit}`,
                inStock: true
            });

            // REMOVE FROM CART
            const index = groceryCart.findIndex(i => i.id === item.id);
            if (index !== -1) groceryCart.splice(index, 1);
        });

        // SAVE DATA
        localStorage.setItem("inventoryData", JSON.stringify(inventory));
        localStorage.setItem("groceryData", JSON.stringify(groceryCart));

        if (typeof renderInventoryTable === "function") renderInventoryTable();
        renderGroceryList();

        showNotification(`${purchasedItems.length} item(s) transferred to inventory successfully!`, 'success');
    }
}



// Function to Clear All Items
function clearAll() {
    if (groceryCart.length === 0) {
        showNotification('Cart is already empty', 'info');
        return;
    }
    
    const confirmMsg = `Are you sure you want to clear all ${groceryCart.length} items from your cart?\n\nThis action cannot be undone.`;
    
    if (confirm(confirmMsg)) {
        groceryCart.length = 0;
        renderGroceryList();
        showNotification('Cart cleared successfully', 'info');
    }
}

// Enhanced notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    
    const icons = {
        success: 'check-circle-fill',
        warning: 'exclamation-triangle-fill',
        danger: 'x-circle-fill',
        info: 'info-circle-fill'
    };
    
    const colors = {
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545',
        info: '#17a2b8'
    };
    
    notification.className = `alert alert-${type} notification-toast d-flex align-items-center`;
    notification.innerHTML = `
        <i class="bi bi-${icons[type]} me-2" style="font-size: 1.2rem;"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        z-index: 9999;
        min-width: 320px;
        max-width: 400px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.25);
        animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 12px;
        font-weight: 600;
        border-left: 5px solid ${colors[type]};
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => notification.remove(), 400);
    }, 3500);
}

// Play check sound (subtle feedback)
function playCheckSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Initialize the page with all features
document.addEventListener('DOMContentLoaded', function() {
    const mainContainer = document.querySelector('main.container');
    if (mainContainer && !document.querySelector('.stats-summary')) {
        const statsDiv = document.createElement('div');
        statsDiv.className = 'stats-summary fade-in';
        mainContainer.insertBefore(statsDiv, mainContainer.children[1]);
    }
    

    
    renderGroceryList();
    
    const addButton = document.querySelector('.btn-primary');
    if (addButton) {
        addButton.addEventListener('click', addItem);
    }
    
    const transferButton = document.querySelector('button[value="transfer"]');
    if (transferButton) {
        transferButton.addEventListener('click', (e) => {
            e.preventDefault();
            transferPurchased();
        });
    }
    
    const clearButton = document.querySelector('button[value="clear"]');
    if (clearButton) {
        clearButton.addEventListener('click', (e) => {
            e.preventDefault();
            clearAll();
        });
    }
    
    const inputs = document.querySelectorAll('.add-item-container input, .add-item-container select');
    inputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addItem();
            }
        });
    });
    
    const nameInput = document.querySelector('input[placeholder*="Item Name"]');
    if (nameInput) {
        nameInput.focus();
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    
    .is-invalid {
        animation: shake 0.5s;
        border-color: #dc3545;
    }
`;
document.head.appendChild(style);