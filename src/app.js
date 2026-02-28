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
    // Limpiamos mensajes al cambiar de pestaña
    document.getElementById('status-message').innerHTML = '';
}

}