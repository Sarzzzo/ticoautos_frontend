// Detail functionality for a single vehicle and Q&A

document.addEventListener('DOMContentLoaded', async () => {

    const urlParams = new URLSearchParams(window.location.search);
    const vehicleId = urlParams.get('id');

    if (!vehicleId) {
        alert('Vehiculo no especificado.');
        window.location.href = 'dashboard.html';
        return;
    }

    const loadingDiv = document.getElementById('loading');
    const vehicleContainer = document.getElementById('vehicle-container');
    const askSection = document.getElementById('ask-section');
    const askForm = document.getElementById('ask-form');
    let currentVehicleOwnerId = null;

    const token = localStorage.getItem('token');

    let currentUserId = null;
    if (token) {
        try {
            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));
            currentUserId = decodedPayload.user.id;
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

        document.getElementById('vehicle-title').innerText = `${vehicle.brand} ${vehicle.model}`;
        document.getElementById('vehicle-price').innerText = `$${vehicle.price.toLocaleString()}`;
        document.getElementById('vehicle-year').innerText = `Ano: ${vehicle.year}`;
        document.getElementById('vehicle-status').innerText = vehicle.status === 'available' ? 'Disponible' : 'Vendido';
        document.getElementById('vehicle-owner').innerText = `Vendedor: ${vehicle.ownerId.username}`;
        document.getElementById('vehicle-description').innerText = vehicle.description || 'Sin descripcion detallada.';

        currentVehicleOwnerId = vehicle.ownerId._id.toString();

        // Show ask section only if: logged in, not the owner, and hasn't asked already
        if (token && currentUserId && currentUserId !== currentVehicleOwnerId) {
            const alreadyAsked = vehicle.questions && vehicle.questions.some(
                q => q.authorId && q.authorId._id === currentUserId
            );
            if (!alreadyAsked) {
                askSection.style.display = 'block';
            }
        }

        renderQuestions(vehicle.questions, currentUserId, currentVehicleOwnerId, vehicleId, token);

        loadingDiv.style.display = 'none';
        vehicleContainer.style.display = 'block';

    } catch (error) {
        console.error('Error fetching vehicle', error);
        alert('Error de conexion al cargar el vehiculo.');
    }

    if (askForm) {
        askForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = document.getElementById('question-text').value;
            const askMsg = document.getElementById('ask-message');

            askMsg.innerHTML = '<span style="color: var(--text-muted);">Enviando...</span>';

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
                    askMsg.innerHTML = '<span style="color: var(--accent);">Pregunta enviada! Actualizando...</span>';
                    document.getElementById('question-text').value = '';
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    askMsg.innerHTML = `<span style="color: #ef4444;">${qData.message || 'Error'}</span>`;
                }
            } catch (err) {
                console.error(err);
                askMsg.innerHTML = '<span style="color: #ef4444;">Error de red</span>';
            }
        });
    }

});

function renderQuestions(questions, currentUserId, vehicleOwnerId, vehicleId, token) {
    const listDiv = document.getElementById('questions-list');

    if (!questions || questions.length === 0) {
        listDiv.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">Nadie ha preguntado aun.</p>';
        return;
    }

    let html = '';

    questions.forEach(q => {
        const authorName = q.authorId ? q.authorId.username : 'Usuario';

        html += `<div class="question-block">`;
        html += `<div class="question-author">${authorName} pregunta:</div>`;
        html += `<div class="question-text">${q.content}</div>`;

        if (q.answerId) {
            const answerAuthor = q.answerId.authorId ? q.answerId.authorId.username : 'Vendedor';
            html += `
                <div class="answer-block">
                    <div class="answer-author">Respuesta de ${answerAuthor}:</div>
                    <div class="answer-text">${q.answerId.content}</div>
                </div>
            `;
        } else if (currentUserId === vehicleOwnerId) {
            html += `
                <div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border-color);">
                    <form onsubmit="submitAnswer(event, '${q._id}', '${token}')">
                        <textarea id="reply-text-${q._id}" rows="2" placeholder="Escribe tu respuesta..." required
                            style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; resize: none; background: var(--bg-surface); color: var(--text-white); font-family: inherit; box-sizing: border-box;"></textarea>
                        <button type="submit" class="btn-primary" style="margin-top: 8px; padding: 8px 16px; font-size: 13px;">Responder</button>
                    </form>
                    <div id="reply-msg-${q._id}" style="margin-top: 6px; font-size: 13px;"></div>
                </div>
            `;
        }

        html += `</div>`;
    });

    listDiv.innerHTML = html;
}

async function submitAnswer(e, questionId, token) {
    e.preventDefault();
    const content = document.getElementById(`reply-text-${questionId}`).value;
    const msgDiv = document.getElementById(`reply-msg-${questionId}`);

    msgDiv.innerHTML = '<span style="color: var(--text-muted);">Respondiendo...</span>';

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
            msgDiv.innerHTML = '<span style="color: var(--accent);">Respuesta enviada!</span>';
            setTimeout(() => window.location.reload(), 1000);
        } else {
            msgDiv.innerHTML = `<span style="color: #ef4444;">${data.message || 'Error'}</span>`;
        }
    } catch (err) {
        msgDiv.innerHTML = '<span style="color: #ef4444;">Error de red</span>';
    }
}
