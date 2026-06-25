// 1. Esperamos a que todo el HTML de la página cargue correctamente
document.addEventListener("DOMContentLoaded", () => {
    
    // 2. Buscamos el botón "Entrar al Sistema" usando su clase CSS
    const botonEntrar = document.querySelector(".btn-primary");

    // 3. Le agregamos el evento de "escuchar el clic"
    botonEntrar.addEventListener("click", () => {
        
        // Aquí puedes agregar validaciones más adelante (ej. si están vacíos los campos)
        const usuario = document.getElementById("usuario").value;
        const contrasena = document.getElementById("password").value;

        if(usuario === "" || contrasena === "") {
            alert("Por favor, llena todos los campos administrativos.");
        } else {
            // Mandamos al usuario a la pantalla del inventario logístico
            window.location.href = "inv.html";
        }
    });
});
// Asegúrate de poner esto dentro de tu DOMContentLoaded o al final del archivo
document.addEventListener("DOMContentLoaded", () => {
    
    // ... Aquí dejas tu código existente del botón entrar ...

    // CÓDIGO PARA EL MENÚ RESPONSIVO
    const hamburgerMenu = document.getElementById("hamburger-menu");
    const closeSidebar = document.getElementById("close-sidebar");
    const sidebar = document.getElementById("sidebar");

    // Si existen en la página actual (para que no marque error en el login)
    if (hamburgerMenu && sidebar && closeSidebar) {
        
        // Al dar clic al botón de hamburguesa, añade la clase que lo muestra
        hamburgerMenu.addEventListener("click", () => {
            sidebar.classList.add("active");
        });

        // Al dar clic a la 'X', remueve la clase para esconderlo
        closeSidebar.addEventListener("click", () => {
            sidebar.classList.remove("active");
        });
    }
});