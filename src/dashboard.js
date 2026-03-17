// Dashboard logic

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No tienes permiso para acceder a esta pagina');
        window.location.href = '/';
        return;
    }
    loadVehicles();
});

async function loadVehicles() {
    try {
        const response = await fetch('http://localhost:3000/api/vehicles');
        const jsonResponse = await response.json();
        const vehicles = jsonResponse.data;

        document.getElementById('resultsCount').innerText = `Mostrando ${vehicles.length} vehiculos disponibles`;

        const gridBox = document.getElementById('vehiclesGrid');
        gridBox.innerHTML = '';

        if (vehicles.length === 0) {
            gridBox.innerHTML = '<h3>Aun no se ha publicado ningun vehiculo. Se el primero!</h3>';
            return;
        }

        vehicles.forEach((car) => {
            const cardHtml = `
                <a href="detalle.html?id=${car._id}" class="vehicle-card">
                    <div class="vehicle-image" style="background-image: url('https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=500');">
                    </div>
                    <div class="vehicle-info">
                        <div class="vehicle-price">$${car.price.toLocaleString()}</div>
                        <h3 class="vehicle-title">${car.brand} ${car.model}</h3>
                        <div class="vehicle-specs">
                            <span class="spec-item">Ano: ${car.year}</span>
                            <span class="spec-item">${car.status === 'available' ? 'Disponible' : 'Vendido'}</span>
                        </div>
                    </div>
                </a>
            `;
            gridBox.innerHTML += cardHtml;
        });
    } catch (error) {
        console.error("Error requesting vehicles:", error);
        alert("El Backend no responde. Asegurate de que el servidor este corriendo.");
    }
}
