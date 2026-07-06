document.addEventListener("DOMContentLoaded", () => {
    
    // 1. LÓGICA DE NAVEGACIÓN (SPA)
    const menuItems = document.querySelectorAll('.menu-item');
    const views = document.querySelectorAll('.view');

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            // Quitar clase active a todos
            menuItems.forEach(i => i.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));
            // Agregar clase active al clickeado
            this.classList.add('active');
            const targetId = this.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 2. LÓGICA DEL MENÚ LATERAL (SIDEBAR)
    const hamburger = document.getElementById("hamburger-menu");
    const closeBtn = document.getElementById("close-sidebar");
    const sidebar = document.getElementById("sidebar");

    if (hamburger && sidebar) {
        hamburger.addEventListener("click", () => sidebar.classList.add("active"));
    }
    if (closeBtn && sidebar) {
        closeBtn.addEventListener("click", () => sidebar.classList.remove("active"));
    }

    // 3. LÓGICA DEL MODAL DE REGISTRO
    const btnAbrirModal = document.getElementById("btn-abrir-modal");
    const btnCerrarModal = document.getElementById("cerrar-modal");
    const modalRegistro = document.getElementById("modal-registro");
    const btnGuardar = document.getElementById("btn-guardar-simulado");

    if (btnAbrirModal && modalRegistro) {
        btnAbrirModal.addEventListener("click", () => {
            modalRegistro.style.display = "flex"; // Muestra el modal
        });
    }

    if (btnCerrarModal && modalRegistro) {
        btnCerrarModal.addEventListener("click", () => {
            modalRegistro.style.display = "none"; // Oculta el modal
        });
    }

    // Cerrar modal al hacer clic fuera del cuadro blanco
    window.addEventListener("click", (e) => {
        if (e.target === modalRegistro) {
            modalRegistro.style.display = "none";
        }
    });

    // Simular guardado para el video
    if (btnGuardar) {
        btnGuardar.addEventListener("click", () => {
            alert("Producto registrado correctamente en el sistema.");
            modalRegistro.style.display = "none";
        });
    }
});