const API_BASE_URL = 'http://localhost:8080/PantryPal';
const GROCERY_ENDPOINT = '/api/grocery';

// let groceryCart = [
//     {
//         id: 1,
//         name: "Milk",
//         amount: 1,
//         unit: "Gallon",
//         priority: "high",
//         note: "High Priority",
//         purchased: false,
//         addedDate: new Date()
//     },
//     {
//         id: 2,
//         name: "Eggs",
//         amount: 1,
//         unit: "Dozen",
//         priority: "normal",
//         note: "",
//         purchased: false,
//         addedDate: new Date()
//     },
//     {
//         id: 3,
//         name: "Fresh Basil",
//         amount: 0.5,
//         unit: "lb",
//         priority: "normal",
//         note: "For Pesto",
//         purchased: false,
//         addedDate: new Date()
//     },
//     {
//         id: 4,
//         name: "Onions",
//         amount: 2,
//         unit: "Large",
//         priority: "normal",
//         note: "",
//         purchased: false,
//         addedDate: new Date()
//     }
// ];

let groceryCart = [];

let nextId = 5;

async function fetchGroceryList() {
    try {
        const response = await fetch(API_BASE_URL + GROCERY_ENDPOINT);
        if (!response.ok) throw new Error("Server error");
        groceryCart = await response.json();
        renderGroceryList();
    } catch (error) {
        console.error("Error fetching grocery list:", error);
        showNotification("Failed to load items from server", "danger");
    }
}

function renderGroceryList() {
    const listContainer = document.getElementById('grocery-list');
    const itemCountBadge = document.getElementById('item-count-badge');
    
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    const totalItems = groceryCart.length;
    const purchasedItems = groceryCart.filter(item => item.purchased).length;
    
    if (itemCountBadge) itemCountBadge.textContent = `${totalItems} Items`;
    
    updateStats();
    
    if (groceryCart.length === 0) {
        listContainer.innerHTML = `
            <li class="list-group-item">
                <div class="empty-state text-center py-5 text-muted">
                    <i class="bi bi-cart-x display-4"></i>
                    <h3 class="mt-3">Your cart is empty</h3>
                    <p>Add items above to start building your grocery list</p>
                </div>
            </li>
        `;
        return;
    }
    
    const sortedCart = [...groceryCart].sort((a, b) => {
        if (a.purchased !== b.purchased) return a.purchased ? 1 : -1;
        const pA = (a.priority || 'normal').toLowerCase();
        const pB = (b.priority || 'normal').toLowerCase();
        if (pA === 'high' && pB !== 'high') return -1;
        if (pA !== 'high' && pB === 'high') return 1;
        return 0;
    });
    
    sortedCart.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = `list-group-item d-flex justify-content-between align-items-center ${item.purchased ? 'list-group-item-success' : ''} slide-in`;
        li.style.animationDelay = `${index * 0.05}s`;
        
        const priority = (item.priority || 'normal').toLowerCase();
        if (priority === 'high') {
            const priorityDiv = document.createElement('div');
            priorityDiv.className = `priority-indicator priority-${priority}`;
            li.appendChild(priorityDiv);
        }
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'd-flex align-items-center flex-grow-1 ps-2';
        
        const checkbox = document.createElement('input');
        checkbox.className = 'form-check-input me-3';
        checkbox.type = 'checkbox';
        checkbox.id = `item${item.id}`;
        checkbox.checked = item.purchased;
        checkbox.onchange = () => togglePurchased(item.id);
        
        const label = document.createElement('label');
        label.className = 'form-check-label flex-grow-1';
        label.htmlFor = `item${item.id}`;
        if (item.purchased) label.classList.add('text-decoration-line-through');
        
        const itemText = document.createElement('span');
        itemText.className = 'fw-bold me-2';
        itemText.textContent = `${item.name} (${item.quantity || ''})`;
        
        label.appendChild(itemText);
        
        if (priority === 'high') {
            const priorityBadge = document.createElement('span');
            priorityBadge.className = 'badge bg-danger me-2';
            priorityBadge.innerHTML = '<i class="bi bi-exclamation-circle me-1"></i>High Priority';
            label.appendChild(priorityBadge);
        }
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'd-flex gap-2 align-items-center';
        
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
        actionsDiv.appendChild(deleteBtn);
        li.appendChild(itemDiv);
        li.appendChild(actionsDiv);
        
        listContainer.appendChild(li);
    });
}

function updateStats() {
    const statsContainer = document.querySelector('.stats-summary');
    if (!statsContainer) return;
    
    const totalItems = groceryCart.length;
    const purchasedItems = groceryCart.filter(item => item.purchased).length;
    const remainingItems = totalItems - purchasedItems;
    
    statsContainer.innerHTML = `
        <div class="d-flex flex-column align-items-center">
            <span class="h4 mb-0 fw-bold">${totalItems}</span>
            <small class="text-muted">Total Items</small>
        </div>
        <div class="vr mx-3"></div>
        <div class="d-flex flex-column align-items-center">
            <span class="h4 mb-0 fw-bold text-success">${purchasedItems}</span>
            <small class="text-muted">Purchased</small>
        </div>
        <div class="vr mx-3"></div>
        <div class="d-flex flex-column align-items-center">
            <span class="h4 mb-0 fw-bold text-danger">${remainingItems}</span>
            <small class="text-muted">Remaining</small>
        </div>
    `;
}

async function addItem(e) {
    if(e) e.preventDefault();

    const nameInput = document.getElementById('g-name');
    const amountInput = document.getElementById('g-amount');
    const unitSelect = document.getElementById('g-unit');
    const priorityInput = document.getElementById('g-priority'); // Get Checkbox
    
    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const unit = unitSelect.value !== 'Unit' ? unitSelect.value : 'pcs';
    // Set Priority based on Checkbox
    const priority = priorityInput.checked ? 'High' : 'Normal';
    
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
    
    const newItem = {
        name: name,
        quantity: `${amount} ${unit}`,
        priority: priority, // Use the variable
        purchased: false
    };
    
    try {
        const response = await fetch(API_BASE_URL + GROCERY_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem)
        });

        if (response.ok) {
            showNotification(`${name} added to cart!`, 'success');
            nameInput.value = '';
            amountInput.value = '';
            unitSelect.value = 'Unit';
            priorityInput.checked = false; // Reset Checkbox
            fetchGroceryList();
        } else {
            showNotification("Failed to save item", "danger");
        }
    } catch (error) {
        console.error(error);
        showNotification("Connection Error", "danger");
    }
}

function editItem(itemId) {
    const item = groceryCart.find(i => i.id === itemId);
    if (!item) return;
    
    const newName = prompt('Edit item name:', item.name);
    if (newName && newName.trim()) {
        item.name = newName.trim();
        renderGroceryList();
        showNotification('Item updated (Local only)!', 'success');
    }
}

 // Persistent -> Changes purchased = true in database through Servlet (doPut)
async function togglePurchased(itemId) {
    const item = groceryCart.find(i => i.id === itemId);
    if (item) {
        // 1. Toggle local state immediately for UI responsiveness
        item.purchased = !item.purchased;
        
        // 2. Send update to Backend
        try {
            const response = await fetch(`${API_BASE_URL}${GROCERY_ENDPOINT}?id=${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item) // Send the updated item object
            });

            if (!response.ok) {
                throw new Error("Failed to update");
            }
            
            // Success UI updates
            playCheckSound();
            renderGroceryList(); 
            if (item.purchased) {
                showNotification(`✓ ${item.name} marked as purchased`, 'success');
            }

        } catch (error) {
            console.error("Toggle Error:", error);
            showNotification("Failed to save status", "danger");
            // Revert change if server failed
            item.purchased = !item.purchased;
            renderGroceryList();
        }
    }
}

async function deleteItem(itemId) {
    if (!confirm("Remove this item?")) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}${GROCERY_ENDPOINT}?id=${itemId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification("Item removed", "info");
            fetchGroceryList();
        } else {
            showNotification("Failed to delete", "danger");
        }
    } catch (error) {
        console.error("Delete Error:", error);
    }
}

// Working now
async function transferPurchased() {
    // 1. Filter locally first to show correct confirmation message
    const purchasedItems = groceryCart.filter(item => item.purchased);
    
    if (purchasedItems.length === 0) {
        showNotification('No items marked as purchased', 'warning');
        return;
    }
    
    const confirmMsg = `Transfer ${purchasedItems.length} item(s) to inventory?\n\nItems:\n${purchasedItems.map(i => `• ${i.name}`).join('\n')}`;
    
    if (confirm(confirmMsg)) {
        try {
            // 2. Send "Transfer" Action to Backend
            const response = await fetch(API_BASE_URL + GROCERY_ENDPOINT + "?action=transfer", {
                method: 'POST'
            });

            if (response.ok) {
                showNotification(`${purchasedItems.length} item(s) transferred successfully!`, 'success');
                fetchGroceryList(); // Reload list to clear the transferred items
            } else {
                showNotification("Transfer failed on server", "danger");
            }
        } catch (error) {
            console.error("Transfer Error:", error);
            showNotification("Connection Error", "danger");
        }
    }
}

async function clearAll() {
    if (groceryCart.length === 0) {
        showNotification('Cart is already empty', 'info');
        return;
    }
    
    const confirmMsg = `Are you sure you want to clear all ${groceryCart.length} items from your cart?\n\nThis action cannot be undone.`;
    
    if (confirm(confirmMsg)) {
        try {
            // Send "Clear" Action to Backend
            const response = await fetch(API_BASE_URL + GROCERY_ENDPOINT + "?action=clear", {
                method: 'POST'
            });

            if (response.ok) {
                showNotification('Cart cleared successfully', 'info');
                fetchGroceryList(); // Reload list (should be empty)
            } else {
                showNotification("Failed to clear cart", "danger");
            }
        } catch (error) {
            console.error("Clear Error:", error);
            showNotification("Connection Error", "danger");
        }
    }
}

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

function playCheckSound() {
    try {
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
    } catch (e) { }
}

document.addEventListener('DOMContentLoaded', function() {
    const mainContainer = document.querySelector('main.container');
    if (mainContainer && !document.querySelector('.stats-summary')) {
        const statsDiv = document.createElement('div');
        statsDiv.className = 'stats-summary fade-in';
        mainContainer.insertBefore(statsDiv, mainContainer.children[1]);
    }
    
    fetchGroceryList();
    
    const addForm = document.getElementById('add-grocery-form');
    if (addForm) {
        addForm.addEventListener('submit', addItem);
    }
    
	const transferButton = document.querySelector('button[value="transfer"]');
	    
	    if (transferButton) {
	        console.log("Transfer button found!"); // Debug log because button isnt working
	        transferButton.addEventListener('click', (e) => {
	            e.preventDefault();
	            console.log("Transfer button clicked!"); // Debug log
	            transferPurchased();
	        });
	    } else {
	        console.error("Transfer button NOT found in DOM");
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