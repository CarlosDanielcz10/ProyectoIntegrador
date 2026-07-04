document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Lógica de Navegación (SPA)
    const menuItems = document.querySelectorAll('.menu-item');
    const views = document.querySelectorAll('.view');

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Quitar 'active' de todos los items y vistas
            menuItems.forEach(i => i.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));
            
            // Poner 'active' al presionado
            this.classList.add('active');
            
            // Mostrar la vista correspondiente
            const targetId = this.getAttribute('data-target');
            const targetView = document.getElementById(targetId);
            if (targetView) {
                targetView.classList.add('active');
            }
        });
    });

    // 2. Lógica del Menú Hamburguesa (Móvil)
    const hamburgerBtn = document.getElementById("hamburger-menu");
    const closeSidebarBtn = document.getElementById("close-sidebar");
    const sidebar = document.getElementById("sidebar");

    if (hamburgerBtn && sidebar) {
        hamburgerBtn.addEventListener("click", () => {
            sidebar.classList.add("active");
        });
    }

    if (closeSidebarBtn && sidebar) {
        closeSidebarBtn.addEventListener("click", () => {
            sidebar.classList.remove("active");
        });
    }
});