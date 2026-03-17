// Detail page: vehicle info + owner actions + buyer actions

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

        // Fill vehicle info
        document.getElementById('vehicle-title').innerText = `${vehicle.brand} ${vehicle.model}`;
        document.getElementById('vehicle-price').innerText = `₡${vehicle.price.toLocaleString('es-CR')}`;
        document.getElementById('vehicle-year').innerText = `Año: ${vehicle.year}`;
        document.getElementById('vehicle-description').innerText = vehicle.description || 'Sin descripcion detallada.';

        // Status tag
        const statusTag = document.getElementById('vehicle-status');
        if (vehicle.status === 'sold') {
            statusTag.innerText = 'Vendido';
            statusTag.style.background = 'rgba(239, 68, 68, 0.1)';
            statusTag.style.color = '#ef4444';
            statusTag.style.borderColor = 'rgba(239, 68, 68, 0.2)';
        } else {
            statusTag.innerText = 'Disponible';
        }

        // Owner name
        document.getElementById('vehicle-owner').innerText = `Vendedor: ${vehicle.ownerId.username}`;

        // Image
        const detailImg = document.getElementById('detail-image');
        if (vehicle.image) {
            detailImg.style.backgroundImage = `url('http://localhost:3000${vehicle.image}')`;
        } else {
            detailImg.style.backgroundImage = `url('https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800')`;
        }

        const ownerId = vehicle.ownerId._id.toString();

        // OWNER: Show mark as sold button (only if vehicle is still available)
        if (token && currentUserId && currentUserId === ownerId && vehicle.status === 'available') {
            const ownerSection = document.getElementById('owner-section');
            ownerSection.style.display = 'block';

            document.getElementById('mark-sold-btn').addEventListener('click', async () => {
                if (!confirm('Seguro que quieres marcar este vehiculo como vendido? No se puede revertir.')) return;

                try {
                    const soldRes = await fetch(`http://localhost:3000/api/vehicles/${vehicleId}/sold`, {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const soldData = await soldRes.json();

                    if (soldRes.ok) {
                        alert('Vehiculo marcado como vendido!');
                        window.location.reload();
                    } else {
                        alert(soldData.message || 'Error al marcar como vendido');
                    }
                } catch (err) {
                    console.error(err);
                    alert('Error de conexion');
                }
            });
        }

        // BUYER: Show contact button (only if not owner and vehicle is available)
        if (token && currentUserId && currentUserId !== ownerId && vehicle.status === 'available') {
            const contactSection = document.getElementById('contact-section');
            contactSection.style.display = 'block';

            document.getElementById('contact-btn').addEventListener('click', async () => {
                try {
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

        // GUEST: Show prompt to login
        if (!token && vehicle.status === 'available') {
            document.getElementById('guest-section').style.display = 'block';
        }

        // Show content
        document.getElementById('loading').style.display = 'none';
        document.getElementById('vehicle-container').style.display = 'block';

    } catch (error) {
        console.error('Error fetching vehicle:', error);
        alert('Error de conexion al cargar el vehiculo.');
    }
});
