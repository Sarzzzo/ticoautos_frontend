// Publish logic

// Execute when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    
    // Get the form element by its ID
    const publishForm = document.getElementById('publish-form');

    // Make sure the form exists on this page before adding the listener
    if (publishForm) {
        publishForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent page reload

            // Obtain the values from the inputs
            const brand = document.getElementById('brand').value;
            const model = document.getElementById('model').value;
            const year = parseInt(document.getElementById('year').value);
            const price = parseFloat(document.getElementById('price').value);
            const description = document.getElementById('description').value;

            // Target the message container to inform the user
            const messageDiv = document.getElementById('publish-message');
            messageDiv.innerHTML = '<span style="color: #6b7280;">Publicando anuncio...</span>';

            // IMPORTANT: Get the JWT token because publishing is a protected route
            const token = localStorage.getItem('token');
            
            // Security check
            if (!token) {
                messageDiv.innerHTML = '<span class="error" style="color: #dc2626;">Error: No estás autenticado.</span>';
                setTimeout(() => window.location.href = '/', 2000);
                return;
            }

            try {
                // Fetch request to the backend protected POST route
                const response = await fetch('http://localhost:3000/api/vehicles', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        // We send the token in the Headers just like Postman
                        'Authorization': `Bearer ${token}` 
                    },
                    // Send all the form data in JSON format
                    body: JSON.stringify({ brand, model, year, price, description })
                });

                // Read the response from the server
                const data = await response.json();

                if (response.ok) {
                    // Success! 
                    messageDiv.innerHTML = `<span class="success" style="color: #10b981;">¡Vehículo publicado con éxito!</span>`;
                    
                    // Clean the form fields
                    document.getElementById('publish-form').reset();
                    
                    // Redirect back to dashboard to see the new car alive
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);

                } else {
                    // Server responded with 400 or 500 error messages
                    messageDiv.innerHTML = `<span class="error" style="color: #dc2626;">${data.message || data.error || 'Error al publicar'}</span>`;
                }
            } catch (error) {
                console.error("Connection error:", error);
                messageDiv.innerHTML = `<span class="error" style="color: #dc2626;">Error de conexión con el servidor.</span>`;
            }
        });
    }
});
