// Messages page logic
// Shows all questions on vehicles owned by the current user

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debes iniciar sesion.');
        window.location.href = '/';
        return;
    }

    // Decode user id from token
    let currentUserId = null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUserId = payload.user.id;
    } catch (e) {
        alert('Token invalido.');
        window.location.href = '/';
        return;
    }

    const listDiv = document.getElementById('messages-list');

    try {
        // Fetch all vehicles to find the ones owned by this user
        const response = await fetch('http://localhost:3000/api/vehicles?limit=100');
        const json = await response.json();
        const allVehicles = json.data;

        // Filter only vehicles owned by the current user
        const myVehicles = allVehicles.filter(v => v.ownerId === currentUserId || (v.ownerId && v.ownerId._id === currentUserId));

        if (myVehicles.length === 0) {
            listDiv.innerHTML = `
                <div class="empty-state">
                    <h3>No tienes vehiculos publicados</h3>
                    <p>Publica un vehiculo para empezar a recibir preguntas.</p>
                </div>
            `;
            return;
        }

        // Fetch details for each vehicle (to get questions)
        let html = '';
        let totalQuestions = 0;

        for (const v of myVehicles) {
            const detailRes = await fetch(`http://localhost:3000/api/vehicles/${v._id}`);
            const vehicle = await detailRes.json();

            if (vehicle.questions && vehicle.questions.length > 0) {
                vehicle.questions.forEach(q => {
                    totalQuestions++;
                    const authorName = q.authorId ? q.authorId.username : 'Usuario';
                    const hasAnswer = !!q.answerId;

                    html += `
                        <a href="detalle.html?id=${vehicle._id}" class="message-item" style="display: block; text-decoration: none;">
                            <div class="msg-vehicle">${vehicle.brand} ${vehicle.model} ${vehicle.year}</div>
                            <div class="msg-preview">${authorName} pregunta: "${q.content}"</div>
                            <div class="msg-date">${hasAnswer ? 'Respondido' : 'Sin responder - Haz clic para responder'}</div>
                        </a>
                    `;
                });
            }
        }

        if (totalQuestions === 0) {
            listDiv.innerHTML = `
                <div class="empty-state">
                    <h3>No tienes preguntas pendientes</h3>
                    <p>Cuando alguien pregunte sobre tus vehiculos, aparecera aqui.</p>
                </div>
            `;
        } else {
            listDiv.innerHTML = html;
        }

    } catch (error) {
        console.error('Error loading messages:', error);
        listDiv.innerHTML = `
            <div class="empty-state">
                <h3>Error de conexion</h3>
                <p>No se pudieron cargar los mensajes.</p>
            </div>
        `;
    }
});
