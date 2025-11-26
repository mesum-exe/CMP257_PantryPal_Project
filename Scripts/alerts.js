/* 🔔 PantryPal Global Alert Manager */

export function getInventoryAlerts(inventoryItems) {
  const alerts = [];
  const today = new Date();

  inventoryItems.forEach((item) => {
    const expDate = new Date(item.expiry);
    const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

    const lowStock = item.quantity <= 3;
    const expiringSoon = diffDays <= 4;

    if (lowStock || expiringSoon) {
      alerts.push({
        name: item.name,
        quantity: item.quantity,
        expiry: item.expiry,
        type: lowStock ? "Low Stock" : "Expiring Soon"
      });
    }
  });

  return alerts;
}
