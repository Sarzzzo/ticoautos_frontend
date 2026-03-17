// Publish logic with image upload support

document.addEventListener('DOMContentLoaded', () => {

    const publishForm = document.getElementById('publish-form');
    const imageInput = document.getElementById('image-input');
    const imagePreview = document.getElementById('image-preview');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const uploadZone = document.getElementById('upload-zone');

    // Image preview when file is selected
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    imagePreview.src = ev.target.result;
                    imagePreview.style.display = 'block';
                    uploadPlaceholder.style.display = 'none';
                    uploadZone.classList.add('has-image');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (publishForm) {
        publishForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const brand = document.getElementById('brand').value;
            const model = document.getElementById('model').value;
            const year = parseInt(document.getElementById('year').value);
            const price = parseFloat(document.getElementById('price').value);
            const description = document.getElementById('description').value;
            // El precio se maneja en colones costarricenses (CRC)

            const messageDiv = document.getElementById('publish-message');
            messageDiv.innerHTML = '<span style="color: var(--text-muted);">Publicando anuncio...</span>';

            const token = localStorage.getItem('token');

            if (!token) {
                messageDiv.innerHTML = '<span style="color: #ef4444;">Error: No estas autenticado.</span>';
                setTimeout(() => window.location.href = '/', 2000);
                return;
            }

            // Use FormData to support file upload
            const formData = new FormData();
            formData.append('brand', brand);
            formData.append('model', model);
            formData.append('year', year);
            formData.append('price', price);
            formData.append('description', description);

            // Attach image if selected
            if (imageInput && imageInput.files[0]) {
                formData.append('image', imageInput.files[0]);
            }

            try {
                const response = await fetch('http://localhost:3000/api/vehicles', {
                    method: 'POST',
                    headers: {
                        // Do NOT set Content-Type - browser sets it automatically for FormData with boundary
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    messageDiv.innerHTML = '<span style="color: var(--accent);">Vehiculo publicado con exito!</span>';
                    publishForm.reset();
                    // Reset image preview
                    if (imagePreview) {
                        imagePreview.style.display = 'none';
                        uploadPlaceholder.style.display = 'flex';
                        uploadZone.classList.remove('has-image');
                    }
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                } else {
                    messageDiv.innerHTML = `<span style="color: #ef4444;">${data.message || data.error || 'Error al publicar'}</span>`;
                }
            } catch (error) {
                console.error("Connection error:", error);
                messageDiv.innerHTML = '<span style="color: #ef4444;">Error de conexion con el servidor.</span>';
            }
        });
    }
});
