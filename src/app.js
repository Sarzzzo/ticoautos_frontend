// simple function to switch between login and register forms
function switchTab(tab) {

    // remove the active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    // remove the active class from all form sections
    document.querySelectorAll('.form-section').forEach(sec => {
        sec.classList.remove('active');
    });

    // add the active class to the selected tab button
    if (tab === 'login') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active'); // login tab
        document.getElementById('login-section').classList.add('active'); // login section
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active'); // register tab
        document.getElementById('register-section').classList.add('active'); // register section
    }
    // clean the message area
    document.getElementById('status-message').innerHTML = '';
}

// ==========================================
// REGISTER LOGIC
// ==========================================
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // prevent page reload

    // btain the values from the inputs
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const messageDiv = document.getElementById('status-message');
    try {
        // we do the fetch request to the backend
        const response = await fetch('http://localhost:3000/api/auth/register', {
            // http://localhost:3000 is the backend URL
            // /api/auth/register is the endpoint
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // we send the data in JSON format
            body: JSON.stringify({ username, email, password }) // convert data to JSON
        });
        const data = await response.json();
        if (response.ok) {
            messageDiv.innerHTML = `<span class="success">¡Registro exitoso! Ya puedes iniciar sesión.</span>`;
            document.getElementById('register-form').reset(); // clean form
            setTimeout(() => switchTab('login'), 2000); // change to login after 2 seconds
        } else {
            // if the backend send an error
            messageDiv.innerHTML = `<span class="error">${data.message || data.error}</span>`;
        }
    } catch (error) {
        messageDiv.innerHTML = `<span class="error">Error al conectar con el servidor. Verifica que el backend esté corriendo.</span>`;
    }
});
// ==========================================
// LOGIN LOGIC
// ==========================================
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // prevent page reload

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const messageDiv = document.getElementById('status-message');
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            // The backend gave us the Token! We save it in the browser's localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);

            messageDiv.innerHTML = `<span class="success">¡Sesión iniciada! Redirigiendo...</span>`;

            // Redirects to the real dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000); // 1.0 seconds wait to read the success message

        } else {
            messageDiv.innerHTML = `<span class="error">${data.message || 'Credenciales inválidas'}</span>`;
        }
    } catch (error) {
        messageDiv.innerHTML = `<span class="error">Error de conexión.</span>`;
    }
});