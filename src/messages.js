// Messages page: WhatsApp-style chat interface

let currentConversationId = null;
let currentUserId = null;
let token = null;

document.addEventListener('DOMContentLoaded', async () => {
    token = localStorage.getItem('token');
    if (!token) {
        alert('Debes iniciar sesion.');
        window.location.href = '/';
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUserId = payload.user.id;
    } catch (e) {
        alert('Token invalido.');
        window.location.href = '/';
        return;
    }

    await loadChatList();

    // Check if a specific chat was requested (from detail page)
    const urlParams = new URLSearchParams(window.location.search);
    const chatId = urlParams.get('chat');
    if (chatId) {
        openConversation(chatId);
    }
});

async function loadChatList() {
    const chatListDiv = document.getElementById('chat-list');

    try {
        const res = await fetch('http://localhost:3000/api/chat/my', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const conversations = await res.json();

        if (!res.ok || conversations.length === 0) {
            chatListDiv.innerHTML = `
                <div style="padding: 40px 24px; text-align: center; color: var(--text-muted);">
                    <p style="font-size: 15px;">No tienes conversaciones aun.</p>
                    <p style="font-size: 13px; margin-top: 8px;">Ve a un vehiculo y envia un mensaje al vendedor.</p>
                </div>
            `;
            return;
        }

        let html = '';
        conversations.forEach(conv => {
            const otherUser = conv.buyerId._id === currentUserId
                ? conv.sellerId.username
                : conv.buyerId.username;

            const vehicleName = conv.vehicleId
                ? `${conv.vehicleId.brand} ${conv.vehicleId.model} ${conv.vehicleId.year || ''}`
                : 'Vehiculo';

            const lastMsg = conv.messages.length > 0
                ? conv.messages[conv.messages.length - 1].content
                : 'Sin mensajes aun';

            const lastMsgPreview = lastMsg.length > 45 ? lastMsg.substring(0, 45) + '...' : lastMsg;

            const avatarBg = conv.vehicleId && conv.vehicleId.image
                ? `background-image: url('http://localhost:3000${conv.vehicleId.image}');`
                : `background: linear-gradient(135deg, var(--primary), var(--celeste));`;

            html += `
                <div class="chat-item" data-id="${conv._id}" onclick="openConversation('${conv._id}')">
                    <div class="chat-item-avatar" style="${avatarBg}"></div>
                    <div class="chat-item-info">
                        <div class="chat-item-name">${otherUser} - ${vehicleName}</div>
                        <div class="chat-item-preview">${lastMsgPreview}</div>
                    </div>
                </div>
            `;
        });

        chatListDiv.innerHTML = html;

    } catch (err) {
        console.error('Error loading chats:', err);
        chatListDiv.innerHTML = `
            <div style="padding: 40px 24px; text-align: center; color: var(--text-muted);">
                <p>Error al cargar los chats.</p>
            </div>
        `;
    }
}

async function openConversation(conversationId) {
    currentConversationId = conversationId;

    // Highlight active chat
    document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
    const activeItem = document.querySelector(`.chat-item[data-id="${conversationId}"]`);
    if (activeItem) activeItem.classList.add('active');

    const chatMain = document.getElementById('chat-main');

    try {
        const res = await fetch('http://localhost:3000/api/chat/my', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const conversations = await res.json();
        const conv = conversations.find(c => c._id === conversationId);

        if (!conv) {
            chatMain.innerHTML = '<div class="chat-empty"><h3>Conversacion no encontrada</h3></div>';
            return;
        }

        const otherUser = conv.buyerId._id === currentUserId
            ? conv.sellerId.username
            : conv.buyerId.username;

        const vehicleName = conv.vehicleId
            ? `${conv.vehicleId.brand} ${conv.vehicleId.model}`
            : 'Vehiculo';

        const avatarBg = conv.vehicleId && conv.vehicleId.image
            ? `background-image: url('http://localhost:3000${conv.vehicleId.image}'); background-size: cover; background-position: center;`
            : `background: linear-gradient(135deg, var(--primary), var(--celeste));`;

        // Check if user can send (alternating rule)
        let canSend = true;
        let inputPlaceholder = 'Escribe un mensaje...';
        if (conv.messages.length > 0) {
            const lastMsg = conv.messages[conv.messages.length - 1];
            if (lastMsg.senderId._id === currentUserId) {
                canSend = false;
                inputPlaceholder = 'Espera a que la otra persona responda...';
            }
        }

        // Build messages HTML
        let messagesHtml = '';
        if (conv.messages.length === 0) {
            messagesHtml = '<div style="text-align: center; color: var(--text-muted); margin-top: 40px;"><p>No hay mensajes. Inicia la conversacion!</p></div>';
        } else {
            conv.messages.forEach(msg => {
                const isMine = msg.senderId._id === currentUserId;
                const time = new Date(msg.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
                messagesHtml += `
                    <div class="chat-bubble ${isMine ? 'sent' : 'received'}">
                        ${msg.content}
                        <div class="bubble-time">${time}</div>
                    </div>
                `;
            });
        }

        chatMain.innerHTML = `
            <div class="chat-main-header">
                <div class="chat-header-avatar" style="${avatarBg}"></div>
                <div>
                    <div class="chat-header-name">${otherUser}</div>
                    <div class="chat-header-sub">${vehicleName}</div>
                </div>
            </div>
            <div class="chat-messages" id="chat-messages">
                ${messagesHtml}
            </div>
            <div class="chat-input-bar">
                <input type="text" id="msg-input" placeholder="${inputPlaceholder}" ${canSend ? '' : 'disabled'}>
                <button onclick="sendMessage()" ${canSend ? '' : 'disabled style="opacity: 0.5; cursor: not-allowed;"'}>Enviar</button>
            </div>
        `;

        // Scroll to bottom
        const messagesDiv = document.getElementById('chat-messages');
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        // Enter key to send
        const input = document.getElementById('msg-input');
        if (input && canSend) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') sendMessage();
            });
            input.focus();
        }

    } catch (err) {
        console.error('Error opening conversation:', err);
        chatMain.innerHTML = '<div class="chat-empty"><h3>Error de conexion</h3></div>';
    }
}

async function sendMessage() {
    const input = document.getElementById('msg-input');
    const content = input.value.trim();
    if (!content || !currentConversationId) return;

    input.value = '';
    input.disabled = true;

    try {
        const res = await fetch(`http://localhost:3000/api/chat/${currentConversationId}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });

        const data = await res.json();

        if (res.ok) {
            // Reload the conversation and chat list
            await openConversation(currentConversationId);
            await loadChatList();
        } else {
            alert(data.message || 'Error al enviar el mensaje');
            input.disabled = false;
        }
    } catch (err) {
        console.error('Error sending message:', err);
        alert('Error de conexion');
        input.disabled = false;
    }
}
