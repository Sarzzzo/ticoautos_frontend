// Dashboard logic

document.addEventListener('DOMContentLoaded', () => {
    loadVehicles();
});

const defaultImages = [
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600'
];

async function loadVehicles() {
    try {
        const params = new URLSearchParams();

        // Collect all filter values
        const brand = document.getElementById('filterBrand');
        const model = document.getElementById('filterModel');
        const minYear = document.getElementById('minYear');
        const maxYear = document.getElementById('maxYear');
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');
        const status = document.getElementById('statusFilter');

        if (brand && brand.value) params.append('brand', brand.value);
        if (model && model.value) params.append('model', model.value);
        if (minYear && minYear.value) params.append('minYear', minYear.value);
        if (maxYear && maxYear.value) params.append('maxYear', maxYear.value);
        if (minPrice && minPrice.value) params.append('minPrice', minPrice.value);
        if (maxPrice && maxPrice.value) params.append('maxPrice', maxPrice.value);
        if (status && status.value) params.append('status', status.value);

        const url = `http://localhost:3000/api/vehicles?${params.toString()}`;
        const response = await fetch(url);
        const jsonResponse = await response.json();
        const vehicles = jsonResponse.data;

        document.getElementById('resultsCount').innerText = `${vehicles.length} de ${jsonResponse.total} vehiculos`;

        const gridBox = document.getElementById('vehiclesGrid');
        gridBox.innerHTML = '';

        if (vehicles.length === 0) {
            gridBox.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <h3>No se encontraron vehiculos</h3>
                    <p>Intenta cambiar los filtros o publica el primero.</p>
                </div>
            `;
            return;
        }

        vehicles.forEach((car, index) => {
            const imgUrl = car.image
                ? `http://localhost:3000${car.image}`
                : defaultImages[index % defaultImages.length];

            const badgeClass = car.status === 'sold' ? 'card-badge sold' : 'card-badge';
            const badgeText = car.status === 'sold' ? 'Vendido' : 'Disponible';

            const cardHtml = `
                <a href="detalle.html?id=${car._id}" class="vehicle-card">
                    <div class="card-image" style="background-image: url('${imgUrl}');">
                        <span class="${badgeClass}">${badgeText}</span>
                    </div>
                    <div class="card-body">
                        <div class="card-price">₡${car.price.toLocaleString('es-CR')}</div>
                        <div class="card-title">${car.brand} ${car.model}</div>
                        <div class="card-meta">
                            <span>Año: ${car.year}</span>
                            <span>${car.description ? car.description.substring(0, 40) + '...' : 'Sin descripcion'}</span>
                        </div>
                    </div>
                </a>
            `;
            gridBox.innerHTML += cardHtml;
        });
    } catch (error) {
        console.error("Error requesting vehicles:", error);
        const gridBox = document.getElementById('vehiclesGrid');
        gridBox.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <h3>Error de conexion</h3>
                <p>Asegurate de que el servidor este corriendo.</p>
            </div>
        `;
    }
}
