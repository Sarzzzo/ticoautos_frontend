// Dashboard logic

// it executes when the page loads
document.addEventListener('DOMContentLoaded', () => {

    // firts of all, check the user by his token
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No tienes permiso para acceder a esta página');
        window.location.href = '/'; // again to the login page
        return;
    }

    // if the user is valid, get the cars from the database
    loadVehicles();
});

// this function is cientifical, it means that is not the final code
// it is just a test to see if the code works
// the final code will be different
async function loadVehicles() {
    try {
        // Pedimos los carros al Endpoint Público que programamos en vehicleRoutes.js
        const response = await fetch('http://localhost:3000/api/vehicles');

        // Convertimos el "lenguaje de computadora" que responde Node.js a un "JSON" (texto legible)
        const jsonResponse = await response.json();

        // Array exacto de vehículos que vino de Mongo
        const vehiculos = jsonResponse.data;
        // Actualizamos el contador visual en pantalla (Ej: Mostrando 2 vehículos)
        document.getElementById('resultsCount').innerText = `Mostrando ${vehiculos.length} vehículos disponibles`;
        // Atrapamos la CAJA VACÍA del HTML (Grid) donde vamos a insertar las tarjetas
        const gridBox = document.getElementById('vehiclesGrid');

        // Limpiamos los carros "de mentira" (El Hyundai y el Yaris estáticos que usamos de prueba)
        gridBox.innerHTML = '';
        // Si la base de datos no tiene ni un solo carro...
        if (vehiculos.length === 0) {
            gridBox.innerHTML = `<h3>Aún no se ha publicado ningún vehículo. ¡Sé el primero!</h3>`;
            return;
        }
        // Si SÍ hay carros, usamos un CILO (forEach) para crear una Tarjeta HTML por cada carro
        vehiculos.forEach((carro) => {
            // Creamos un hipervínculo <a> por cada carro
            const tarjetaHtml = `
                <a href="#" class="vehicle-card">
                    <!-- Si tiene una foto la ponemos, sino ponemos una de fondo gris -->
                    <div class="vehicle-image" style="background-image: url('https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=500');">
                    </div>
                    
                    <!-- Información extraída quirúrgicamente del JSON -->
                    <div class="vehicle-info">
                        <div class="vehicle-price">$${carro.price.toLocaleString()}</div>
                        <h3 class="vehicle-title">${carro.brand} ${carro.model}</h3>
                        
                        <div class="vehicle-specs">
                            <span class="spec-item">📅 ${carro.year}</span>
                            <span class="spec-item">📋 ${carro.status === 'available' ? 'Disponible' : 'Vendido'}</span>
                        </div>
                    </div>
                </a>
            `;
            // Se lo inyectamos a la fuerza a la caja real de HTML
            gridBox.innerHTML += tarjetaHtml;
        });
    } catch (error) {
        console.error("Error catastrofico pidiendo carros:", error);
        alert("El Backend no responde. ¿Asegúrate de que 'node index.js' esté corriendo?");
    }
}
