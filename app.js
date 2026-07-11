document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. LÓGICA DE LOGIN ---
    const loginForm = document.getElementById('login-form');
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const btnLogout = document.getElementById('btn-logout');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            loginView.classList.add('hidden');
            dashboardView.classList.remove('hidden');
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            dashboardView.classList.add('hidden');
            loginView.classList.remove('hidden');
            loginForm.reset();
        });
    }

    // --- 2. MENÚ DESPLEGABLE TIPO HAMBURGUESA ---
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    // --- 3. NAVEGACIÓN DE PESTAÑAS ---
    const navItems = document.querySelectorAll('.nav-item');
    const sectionViews = document.querySelectorAll('.section-view');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remover estado activo de todos los enlaces
            navItems.forEach(nav => nav.classList.remove('active'));
            // Ocultar todas las secciones del contenido principal
            sectionViews.forEach(view => view.classList.add('hidden'));

            // Activar botón pulsado
            item.classList.add('active');

            // Mostrar vista enlazada (data-target)
            const targetId = item.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.remove('hidden');
            }
        });
    });

    // --- 4. FECHA DINÁMICA (Pestaña Inicio) ---
    const dateElement = document.getElementById('current-date-text');
    if (dateElement) {
        const options = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
        const today = new Date(); 
        let dateString = today.toLocaleDateString('es-ES', options);
        dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
        dateElement.textContent = dateString;
    }

    // --- 5. LÓGICA DE LA MODAL DE REGISTRO ---
    const modalRegistro = document.getElementById('modal-registro');
    const btnAbrirModal = document.getElementById('btn-abrir-modal');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const btnGuardarModal = document.getElementById('btn-guardar-modal');

    // Abrir Modal
    if (btnAbrirModal && modalRegistro) {
        btnAbrirModal.addEventListener('click', () => {
            modalRegistro.classList.remove('hidden');
        });
    }

    // Cerrar Modal (X)
    if (btnCerrarModal && modalRegistro) {
        btnCerrarModal.addEventListener('click', () => {
            modalRegistro.classList.add('hidden');
        });
    }

    // Cerrar Modal (Botón Guardar)
    if (btnGuardarModal && modalRegistro) {
        btnGuardarModal.addEventListener('click', () => {
            modalRegistro.classList.add('hidden');
            // Aquí en un sistema real iría la lógica de guardar los datos
        });
    }

    // Cerrar Modal haciendo clic fuera del contenido
    window.addEventListener('click', (e) => {
        if (e.target === modalRegistro) {
            modalRegistro.classList.add('hidden');
        }
    });
});