/* 🌿 PantryPal Global Notification System (Top-Right + Soft Pop) */

export function notify(message, type = "info", duration = 3500) {
    const containerId = "pantrypal-toast-container";
    let container = document.getElementById(containerId);

    // Create container if not exists
    if (!container) {
        container = document.createElement("div");
        container.id = containerId;
        container.style.cssText = `
            position: fixed;
            top: 90px; 
            right: 20px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }

    // Limit to 5 notifications
    if (container.children.length >= 5) {
        container.removeChild(container.firstChild);
    }

    // Create toast
    const toast = document.createElement("div");
    toast.className = `pantrypal-toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        padding: 12px 18px;
        min-width: 260px;
        max-width: 360px;
        border-radius: 14px;
        font-size: 0.95rem;
        font-weight: 600;
        color: #0d1f17;
        box-shadow: 0 6px 18px rgba(0,0,0,0.18);
        display: flex;
        align-items: center;
        gap: 8px;
        animation: toast-slide-in 0.35s ease forwards;
        cursor: default;
        border: 2px solid transparent;
    `;

    // Icons + Colors
    const styles = {
        success: { icon: "bi-check-circle", bg: "#d9f7be", border: "#6abe3d" },
        warning: { icon: "bi-exclamation-circle", bg: "#fff6cc", border: "#ccab1b" },
        error:   { icon: "bi-x-circle", bg: "#ffd6d6", border: "#d64444" },
        info:    { icon: "bi-info-circle", bg: "#e0f4ff", border: "#339dcb" }
    };
    const selected = styles[type] || styles.info;
    toast.style.background = selected.bg;
    toast.style.borderColor = selected.border;

    // Add icon
    const iconEl = document.createElement("i");
    iconEl.className = `bi ${selected.icon}`;
    iconEl.style.fontSize = "1.1rem";
    toast.prepend(iconEl);

    // Add to container
    container.appendChild(toast);

    playSoftPop(); // 🔊 SOUND

    // Remove after duration
    setTimeout(() => {
        toast.style.animation = "toast-slide-out 0.35s ease forwards";
        setTimeout(() => toast.remove(), 350);
    }, duration);
}

/* 🔊 Soft Pop (Aesthetic Minimal) */
function playSoftPop() {
    const pop = new Audio(
      "data:audio/wav;base64,UklGRmYAAABXQVZFZm10IBAAAAABAAEAIlYAABErAAACABAAZGF0YQAAAAA=" // tiny silent workaround
    );

    // Real soft pop
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(660, ctx.currentTime);
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.15);
    o.connect(g).connect(ctx.destination);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.15);
}

/* 🎬 Animations */
const style = document.createElement("style");
style.textContent = `
@keyframes toast-slide-in {
  from { opacity: 0; transform: translateX(60px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes toast-slide-out {
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(60px); }
}
`;
document.head.appendChild(style);



