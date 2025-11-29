document.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash;
    if (!hash || !hash.startsWith('#item-')) {
        return;
    }

    const targetId = hash.substring(1); 
    const targetRow = document.getElementById(targetId);

    if (targetRow) {
        targetRow.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        targetRow.classList.add('highlight-alert');

        setTimeout(() => {
            targetRow.classList.remove('highlight-alert');
            history.replaceState(null, null, ' ');
        }, 3000); 
    }
});