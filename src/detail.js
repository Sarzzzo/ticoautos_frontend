// Detail functionality for a single vehicle and Q&A

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. We must find the Vehicle ID from the URL (e.g. detalle.html?id=12345)
    const urlParams = new URLSearchParams(window.location.search);
    const vehicleId = urlParams.get('id');

    if (!vehicleId) {
        alert('Vehículo no especificado.');
        window.location.href = 'dashboard.html';
        return;
    }

    // Prepare HTML Elements
    const loadingDiv = document.getElementById('loading');
    const vehicleContainer = document.getElementById('vehicle-container');
    const askSection = document.getElementById('ask-section');
    const askForm = document.getElementById('ask-form');
    let currentVehicleOwnerId = null;

    // We will need the token to post questions or answers, and to know our own User ID
    const token = localStorage.getItem('token');
    
    // We decode the token payload manually just to know who is the current logged in user
    let currentUserId = null;
    if (token) {
        try {
            // JWT is structured as Header.Payload.Signature. We extract Payload (index 1)
            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));
            currentUserId = decodedPayload.user.id;
        } catch (e) {
            console.error('Error decoding local token:', e);
        }
    }

    // 2. Fetch the vehicle data from our newly created backend route /api/vehicles/:id
    try {
        const response = await fetch(`http://localhost:3000/api/vehicles/${vehicleId}`);
        const vehicle = await response.json();

        if (!response.ok) {
            alert(vehicle.message || 'Error al cargar el vehículo');
            window.location.href = 'dashboard.html';
            return;
        }

        // 3. Inject the vehicle data into the HTML
        document.getElementById('vehicle-title').innerText = `${vehicle.brand} ${vehicle.model}`;
        document.getElementById('vehicle-price').innerText = `$${vehicle.price.toLocaleString()}`;
        document.getElementById('vehicle-year').innerHTML = `📅 ${vehicle.year}`;
        document.getElementById('vehicle-status').innerHTML = vehicle.status === 'available' ? 'Disponible' : 'Vendido';
        document.getElementById('vehicle-owner').innerHTML = `👤 En venta por: ${vehicle.ownerId.username}`;
        document.getElementById('vehicle-description').innerText = vehicle.description || 'Sin descripción detallada.';
        
        currentVehicleOwnerId = vehicle.ownerId._id.toString();

        // 4. Show the Ask Section ONLY if the user is logged in AND is NOT the owner
        if (token && currentUserId && currentUserId !== currentVehicleOwnerId) {
            askSection.style.display = 'block';
        }

        // 5. Render existing Questions and Answers
        renderQuestions(vehicle.questions, currentUserId, currentVehicleOwnerId, vehicleId, token);

        // Hide loading, show content
        loadingDiv.style.display = 'none';
        vehicleContainer.style.display = 'flex';

    } catch (error) {
        console.error('Error fetching vehicle', error);
        alert('Error de conexión al cargar la información del vehículo.');
    }

    // 6. Handle Ask Question submission
    if (askForm) {
        askForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = document.getElementById('question-text').value;
            const askMsg = document.getElementById('ask-message');

            askMsg.innerHTML = '<span style="color: gray;">Enviando...</span>';

            try {
                const qResponse = await fetch('http://localhost:3000/api/qa/questions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ vehicleId, content })
                });

                const qData = await qResponse.json();

                if (qResponse.ok) {
                    askMsg.innerHTML = '<span class="success" style="color: #10b981;">¡Pregunta enviada! Actualizando...</span>';
                    document.getElementById('question-text').value = '';
                    setTimeout(() => window.location.reload(), 1500); // Reload to show new question
                } else {
                    askMsg.innerHTML = `<span class="error" style="color: #dc2626;">${qData.message || 'Error'}</span>`;
                }
            } catch (err) {
                console.error(err);
                askMsg.innerHTML = '<span class="error" style="color: #dc2626;">Error de red</span>';
            }
        });
    }

});

// Function to render the list of questions and their answers
function renderQuestions(questions, currentUserId, vehicleOwnerId, vehicleId, token) {
    const listDiv = document.getElementById('questions-list');
    
    if (!questions || questions.length === 0) {
        listDiv.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">Nadie ha preguntado aún. ¡Sé el primero!</p>';
        return;
    }

    let html = '';

    questions.forEach(q => {
        const authorName = q.authorId ? q.authorId.username : 'Usuario';
        
        html += `
            <div style="background: #f9fafb; border: 1px solid var(--border-color); border-radius: 10px; padding: 20px; margin-bottom: 15px;">
                <div style="margin-bottom: 10px;">
                    <strong style="color: var(--text-main);">💬 ${authorName} pregunta:</strong>
                    <p style="margin: 5px 0 0 0; color: #4b5563;">${q.content}</p>
                </div>
        `;

        if (q.answerId) {
            // If there's an answer, show it
            const answerAuthorName = q.answerId.authorId ? q.answerId.authorId.username : 'Vendedor';
            html += `
                <div style="background: rgba(16, 185, 129, 0.05); border-left: 4px solid var(--primary); padding: 15px; margin-top: 15px; border-radius: 4px;">
                    <strong style="color: var(--primary);">✓ Respuesta de ${answerAuthorName}:</strong>
                    <p style="margin: 5px 0 0 0; color: #4b5563;">${q.answerId.content}</p>
                </div>
            `;
        } else if (currentUserId === vehicleOwnerId) {
            // No answer yet, AND the logged user is the owner: Show a form to reply
            html += `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                    <form onsubmit="submitAnswer(event, '${q._id}', '${token}')">
                        <textarea id="reply-text-${q._id}" rows="2" placeholder="Escribe tu respuesta como vendedor..." required style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; resize: none;"></textarea>
                        <button type="submit" class="btn-primary" style="margin-top: 10px; padding: 8px 16px; font-size: 14px;">Responder</button>
                    </form>
                    <div id="reply-msg-${q._id}" style="margin-top: 5px;"></div>
                </div>
            `;
        }

        html += `</div>`;
    });

    listDiv.innerHTML = html;
}

// Function attached to individual reply forms inside renderQuestions
async function submitAnswer(e, questionId, token) {
    e.preventDefault();
    const content = document.getElementById(`reply-text-${questionId}`).value;
    const msgDiv = document.getElementById(`reply-msg-${questionId}`);

    msgDiv.innerHTML = '<span style="color: gray;">Respondiendo...</span>';

    try {
        const response = await fetch('http://localhost:3000/api/qa/answers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ questionId, content })
        });

        const data = await response.json();

        if (response.ok) {
            msgDiv.innerHTML = '<span class="success" style="color: #10b981;">¡Respuesta exitosa!</span>';
            setTimeout(() => window.location.reload(), 1000);
        } else {
            msgDiv.innerHTML = `<span class="error" style="color: #dc2626;">${data.message || 'Error'}</span>`;
        }
    } catch (err) {
        msgDiv.innerHTML = '<span class="error" style="color: #dc2626;">Error de red</span>';
    }
}
