// Detail page: shows vehicle info + "Send Message" button (no Q&A here)

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const vehicleId = urlParams.get('id');

    if (!vehicleId) {
        alert('Vehiculo no especificado.');
        window.location.href = 'dashboard.html';
        return;
    }

    const token = localStorage.getItem('token');
    let currentUserId = null;

    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            currentUserId = payload.user.id;
        } catch (e) {
            console.error('Error decoding token:', e);
        }
    }

    try {
        const response = await fetch(`http://localhost:3000/api/vehicles/${vehicleId}`);
        const vehicle = await response.json();

        if (!response.ok) {
            alert(vehicle.message || 'Error al cargar el vehiculo');
            window.location.href = 'dashboard.html';
            return;
        }

        // Populate info
        document.getElementById('vehicle-title').innerText = `${vehicle.brand} ${vehicle.model}`;
        document.getElementById('vehicle-price').innerText = `$${vehicle.price.toLocaleString()}`;
        document.getElementById('vehicle-year').innerText = `Ano: ${vehicle.year}`;
        document.getElementById('vehicle-status').innerText = vehicle.status === 'available' ? 'Disponible' : 'Vendido';
        document.getElementById('vehicle-owner').innerText = `Vendedor: ${vehicle.ownerId.username}`;
        document.getElementById('vehicle-description').innerText = vehicle.description || 'Sin descripcion detallada.';

        // Show uploaded image or default
        const detailImg = document.getElementById('detail-image');
        if (vehicle.image) {
            detailImg.style.backgroundImage = `url('http://localhost:3000${vehicle.image}')`;
        } else {
            detailImg.style.backgroundImage = `url('https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800')`;
        }

        const ownerId = vehicle.ownerId._id.toString();

        // Show contact button only if logged in and NOT the owner
        if (token && currentUserId && currentUserId !== ownerId) {
            const contactSection = document.getElementById('contact-section');
            contactSection.style.display = 'block';

            document.getElementById('contact-btn').addEventListener('click', async () => {
                try {
                    // Create or get conversation, then redirect to messages
                    const chatRes = await fetch(`http://localhost:3000/api/chat/vehicle/${vehicleId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const conversation = await chatRes.json();

                    if (chatRes.ok) {
                        window.location.href = `mensajes.html?chat=${conversation._id}`;
                    } else {
                        alert(conversation.message || 'Error al iniciar conversacion');
                    }
                } catch (err) {
                    console.error(err);
                    alert('Error de conexion');
                }
            });
        }

        // Hide loading, show content
        document.getElementById('loading').style.display = 'none';
        document.getElementById('vehicle-container').style.display = 'block';

    } catch (error) {
        console.error('Error fetching vehicle:', error);
        alert('Error de conexion al cargar el vehiculo.');
    }
});
