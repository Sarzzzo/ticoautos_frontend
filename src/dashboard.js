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

// this function is scientific, it means that is not the final code
// it is just a test to see if the code works
// the final code will be different
async function loadVehicles() {
    try {
        // Request cars to the public endpoint programmed in vehicleRoutes.js
        const response = await fetch('http://localhost:3000/api/vehicles');

        // Convert the "computer language" that Node.js responds to JSON
        const jsonResponse = await response.json();

        // Exact array of vehicles coming from Mongo
        const vehicles = jsonResponse.data;
        
        // Update the visual counter on the screen
        document.getElementById('resultsCount').innerText = `Mostrando ${vehicles.length} vehículos disponibles`;
        
        // Select the EMPTY HTML container (Grid) where we will insert the cards
        const gridBox = document.getElementById('vehiclesGrid');

        // Clear the "fake" cars (static Hyundai and Yaris we used for testing)
        gridBox.innerHTML = '';
        
        // If the database does not have a single car...
        if (vehicles.length === 0) {
            gridBox.innerHTML = `<h3>Aún no se ha publicado ningún vehículo. ¡Sé el primero!</h3>`;
            return;
        }
        
        // If there ARE cars, we use a loop (forEach) to create an HTML Card for each car
        vehicles.forEach((car) => {
            // We create a hyperlink <a> for each car
            const cardHtml = `
                <a href="#" class="vehicle-card">
                    <!-- If it has a photo we put it, otherwise we put a gray background one -->
                    <div class="vehicle-image" style="background-image: url('https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=500');">
                    </div>
                    
                    <!-- Information surgically extracted from the JSON -->
                    <div class="vehicle-info">
                        <div class="vehicle-price">$${car.price.toLocaleString()}</div>
                        <h3 class="vehicle-title">${car.brand} ${car.model}</h3>
                        
                        <div class="vehicle-specs">
                            <span class="spec-item">📅 ${car.year}</span>
                            <span class="spec-item">📋 ${car.status === 'available' ? 'Disponible' : 'Vendido'}</span>
                        </div>
                    </div>
                </a>
            `;
            // We inject it forcefully into the real HTML box
            gridBox.innerHTML += cardHtml;
        });
    } catch (error) {
        console.error("Catastrophic error requesting cars:", error);
        alert("El Backend no responde. ¿Asegúrate de que 'node index.js' esté corriendo?");
    }
}
