// Create and inject the button
function injectButton() {
    // Only show button for .html files that don't end with .se
    if (!window.location.pathname.endsWith('.html') || window.location.pathname.endsWith('.html.se')) {
        return;
    }

    // Remove any existing button first
    const existingButton = document.getElementById('view-button');
    if (existingButton) {
        existingButton.remove();
    }

    const button = document.createElement('button');
    button.id = 'view-button';
    button.textContent = 'view';
    button.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        padding: 8px 16px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        z-index: 1000;
        font-family: 'EB Garamond', serif;
    `;
    
    button.addEventListener('click', function() {
        // Add .se to the current URL and redirect
        const currentUrl = window.location.href;
        const seUrl = currentUrl + '.se';
        window.location.href = seUrl;
    });
    
    // Insert button as the first element in the body
    const body = document.body;
    if (body.firstChild) {
        body.insertBefore(button, body.firstChild);
    } else {
        body.appendChild(button);
    }
}

// Initialize when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectButton);
} else {
    injectButton();
}
