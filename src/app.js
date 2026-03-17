function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.form-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById('status-message').innerHTML = '';

    if (tab === 'login') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('login-section').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('register-section').classList.add('active');
    }
}

// REGISTER SECURE
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const messageDiv = document.getElementById('status-message');

    messageDiv.innerHTML = '<span style="color: gray;">Creando cuenta...</span>';

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await response.json();
        if (response.ok) {
            messageDiv.innerHTML = `<span style="color: #10b981;">¡Registro exitoso! Ya puedes iniciar sesión.</span>`;
            document.getElementById('register-form').reset();
            setTimeout(() => switchTab('login'), 2000);
        } else {
            messageDiv.innerHTML = `<span style="color: red;">${data.message || 'Error'}</span>`;
        }
    } catch (error) {
        messageDiv.innerHTML = `<span style="color: red;">Error en el servidor.</span>`;
    }
});

// LOGIN SECURE
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const messageDiv = document.getElementById('status-message');

    // Auto-login con username O email gracias al backend que hicimos
    const loginData = username.includes('@') ? { email: username, password } : { username, password };

    messageDiv.innerHTML = '<span style="color: gray;">Verificando credenciales...</span>';

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            messageDiv.innerHTML = `<span style="color: #10b981;">¡Aprobado! Entrando...</span>`;
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
        } else {
            messageDiv.innerHTML = `<span style="color: red;">Credenciales incorrectas.</span>`;
        }
    } catch (error) {
        messageDiv.innerHTML = `<span style="color: red;">Error crítico de servidor.</span>`;
    }
});
