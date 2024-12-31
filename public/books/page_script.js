document.addEventListener('DOMContentLoaded', function() {
    // Create button
    const button = document.createElement('button');
    button.textContent = 'abc';
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
    `;
    
    // Add click event
    button.addEventListener('click', function() {
        // Add your button click functionality here
        console.log('Button clicked!');
    });
    
    // Add button to body
    document.body.appendChild(button);
});
