document.addEventListener('DOMContentLoaded', () => {

    // ================= DATOS GLOBALES =================
    let marcas = ["MAC", "The Ordinary", "L'Oréal", "CeraVe", "NARS"];
    let categorias = ["Maquillaje", "Skincare", "Fragancias"];

    let productos = [
        { id: 1, sku: "401255", nombre: "Base Líquida Matte", marca: "MAC", categoria: "Maquillaje", caducidad: "2027-12-01", precio: 350.00, stock: 12, min: 5 },
        { id: 2, sku: "309411", nombre: "Sérum Vitamina C", marca: "The Ordinary", categoria: "Skincare", caducidad: "2026-08-15", precio: 420.00, stock: 3, min: 8 },
        { id: 3, sku: "110293", nombre: "Máscara de Pestañas", marca: "L'Oréal", categoria: "Maquillaje", caducidad: "2025-12-20", precio: 280.00, stock: 15, min: 10 },
        { id: 4, sku: "789102", nombre: "Crema Hidratante SPF30", marca: "CeraVe", categoria: "Skincare", caducidad: "2027-03-15", precio: 520.00, stock: 0, min: 6 } 
    ];

    let movimientos = [
        { id: 1, tipo: "Entrada", productoId: 1, nombre: "Base Líquida Matte", cantidad: 10, fecha: "08/07/2026", usuario: "Carlos Daniel" },
        { id: 2, tipo: "Salida", productoId: 2, nombre: "Sérum Vitamina C", cantidad: 2, fecha: "07/07/2026", usuario: "Ana Pérez" }
    ];

    let usuarios = [
        { email: "admin@glowstock.com", pass: "12345", name: "Carlos Daniel", role: "Administrador", avatar: "", initials: "CD", permissions: [true,true] },
        { email: "empleado@glowstock.com", pass: "12345", name: "Ana Pérez", role: "Empleado", avatar: "", initials: "AP", permissions: [true] }
    ];

    let currentUser = null;
    let productoEditandoId = null;

    // ================= HELPER CADUCIDAD =================
    // Retorna los días exactos para ser usado en la interfaz
    function evaluarCaducidad(caducidadDate) {
        if(!caducidadDate) return { isVencido: false, isProximo: false, text: "N/A", days: 999, dateStr: "" };
        const hoy = new Date("2026-07-13T00:00:00"); 
        const cad = new Date(caducidadDate + "T00:00:00");
        const diffTime = cad - hoy;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let isVencido = diffDays < 0;
        let isProximo = diffDays >= 0 && diffDays <= 90;
        
        let text = "";
        if (isVencido) text = "Vencido";
        else if (isProximo) {
            if (diffDays === 0) text = "Vence hoy";
            else if (diffDays <= 7) text = `Vence en ${diffDays} días`;
            else text = "Próx. a vencer";
        }
        else text = cad.toLocaleDateString('es-ES');
        
        return { isVencido, isProximo, text, days: diffDays, dateStr: cad.toLocaleDateString('es-ES') };
    }

    // ================= LOGIN / REGISTRO / ROLES =================
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');

    document.getElementById('btn-show-register').addEventListener('click', () => { document.getElementById('card-login').classList.add('hidden'); document.getElementById('card-register').classList.remove('hidden'); });
    document.getElementById('btn-show-login').addEventListener('click', () => { document.getElementById('card-register').classList.add('hidden'); document.getElementById('card-login').classList.remove('hidden'); });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;
        
        try {
            const respuesta = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Correo: email, Password: pass })
            });

            if (respuesta.ok) {
                const usuarioBD = await respuesta.json();
                
                // Generar iniciales a partir del nombre recibido
                usuarioBD.initials = usuarioBD.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
                
                currentUser = usuarioBD;
                entrarAlSistema();
            } else {
                alert("Correo o contraseña incorrectos.");
            }
        } catch (error) {
            alert("Error al conectar con el servidor backend.");
            console.error(error);
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const pass = document.getElementById('reg-pass').value;
        const role = document.getElementById('reg-role').value;
        
        try {
            const respuesta = await fetch('http://localhost:5000/api/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Nombre: name, Correo: email, Password: pass, Rol: role })
            });

            if (respuesta.ok) {
                alert("Cuenta creada con éxito en la base de datos.");
                document.getElementById('modal-usuarios').classList.add('hidden');
                
                if(!loginView.classList.contains('hidden')) {
                    // Si se registró desde el login, simula click para volver a Iniciar Sesión
                    document.getElementById('btn-show-login').click();
                } else {
                    // Si el Admin lo registró desde adentro, recarga la tabla
                    renderUsuariosAdmin();
                }
            } else {
                const error = await respuesta.text();
                alert(error); // Mostrará "El correo ya está registrado en el sistema."
            }
        } catch (error) {
            alert("Error al conectar con el servidor backend.");
            console.error(error);
        }
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
        currentUser = null;
        dashboardView.classList.add('hidden');
        loginView.classList.remove('hidden');
        loginForm.reset(); registerForm.reset();
    });

    function entrarAlSistema() {
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        actualizarUIUsuario();
        inicializarDashboard();
    }

    // ================= FUNCIONALIDAD DE TOGGLES =================
    function configurarToggles() {
        const adminToggles = ['perm-admin-0', 'perm-admin-1'];
        adminToggles.forEach((id, idx) => {
            const el = document.getElementById(id);
            if(el) {
                el.addEventListener('change', (e) => {
                    if(currentUser && currentUser.role === 'Administrador') {
                        currentUser.permissions[idx] = e.target.checked;
                        el.parentElement.previousElementSibling.style.opacity = e.target.checked ? '1' : '0.4';
                        el.parentElement.previousElementSibling.style.textDecoration = e.target.checked ? 'none' : 'line-through';
                    }
                });
            }
        });

        const empToggles = ['perm-emp-0'];
        empToggles.forEach((id, idx) => {
            const el = document.getElementById(id);
            if(el) {
                el.addEventListener('change', (e) => {
                    if(currentUser && currentUser.role === 'Empleado') {
                        currentUser.permissions[idx] = e.target.checked;
                        el.parentElement.previousElementSibling.style.opacity = e.target.checked ? '1' : '0.4';
                        el.parentElement.previousElementSibling.style.textDecoration = e.target.checked ? 'none' : 'line-through';
                    }
                });
            }
        });
    }

    function actualizarUIUsuario() {
        document.getElementById('topbar-name').textContent = currentUser.name;
        document.getElementById('topbar-role').textContent = currentUser.role;
        document.getElementById('cuenta-name').textContent = currentUser.name;
        document.getElementById('cuenta-email').textContent = currentUser.email;
        document.getElementById('cuenta-role').textContent = currentUser.role;

        setAvatarUI(currentUser.avatar, currentUser.initials);

        const adminEls = document.querySelectorAll('.admin-only');
        const adminToggles = ['perm-admin-0', 'perm-admin-1'];
        const empToggles = ['perm-emp-0'];

        if(currentUser.role === 'Administrador') {
            adminEls.forEach(el => el.classList.remove('hidden'));
            document.getElementById('settings-admin').classList.remove('hidden');
            document.getElementById('settings-empleado').classList.add('hidden');
            
            adminToggles.forEach((id, idx) => {
                const el = document.getElementById(id);
                if(el) {
                    el.checked = currentUser.permissions[idx];
                    el.parentElement.previousElementSibling.style.opacity = currentUser.permissions[idx] ? '1' : '0.4';
                    el.parentElement.previousElementSibling.style.textDecoration = currentUser.permissions[idx] ? 'none' : 'line-through';
                }
            });
        } else {
            adminEls.forEach(el => el.classList.add('hidden'));
            document.getElementById('settings-admin').classList.add('hidden');
            document.getElementById('settings-empleado').classList.remove('hidden');
            
            empToggles.forEach((id, idx) => {
                const el = document.getElementById(id);
                if(el) {
                    el.checked = currentUser.permissions[idx];
                    el.parentElement.previousElementSibling.style.opacity = currentUser.permissions[idx] ? '1' : '0.4';
                    el.parentElement.previousElementSibling.style.textDecoration = currentUser.permissions[idx] ? 'none' : 'line-through';
                }
            });
        }
    }
    configurarToggles(); 

    // ================= EDITAR PERFIL (EL LAPIZ) =================
    const modalEditarPerfil = document.getElementById('modal-editar-perfil');
    const formEditarPerfil = document.getElementById('form-editar-perfil');
    
    document.getElementById('btn-edit-profile').addEventListener('click', () => {
        document.getElementById('edit-perfil-name').value = currentUser.name;
        document.getElementById('edit-perfil-email').value = currentUser.email;
        document.getElementById('edit-perfil-pass').value = "";
        modalEditarPerfil.classList.remove('hidden');
    });

    formEditarPerfil.addEventListener('submit', (e) => {
        e.preventDefault();
        const newName = document.getElementById('edit-perfil-name').value;
        const newEmail = document.getElementById('edit-perfil-email').value;
        const newPass = document.getElementById('edit-perfil-pass').value;

        currentUser.name = newName;
        currentUser.email = newEmail;
        if(newPass.trim() !== "") currentUser.pass = newPass;
        currentUser.initials = newName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

        modalEditarPerfil.classList.add('hidden');
        actualizarUIUsuario(); 
    });


    // ================= AVATAR UPLOAD =================
    const avatarInput = document.getElementById('avatar-upload');
    const perfilBtn = document.getElementById('perfil-avatar-btn');

    perfilBtn.addEventListener('click', () => avatarInput.click());
    
    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                currentUser.avatar = event.target.result;
                setAvatarUI(currentUser.avatar, currentUser.initials);
            };
            reader.readAsDataURL(file);
        }
    });

    function setAvatarUI(imgSrc, initials) {
        const textNodes = [document.getElementById('topbar-avatar-text'), document.getElementById('perfil-avatar-text')];
        const imgNodes = [document.getElementById('topbar-avatar-img'), document.getElementById('perfil-avatar-img')];
        
        if (imgSrc) {
            textNodes.forEach(n => n.classList.add('hidden'));
            imgNodes.forEach(img => { img.src = imgSrc; img.classList.remove('hidden'); });
        } else {
            textNodes.forEach(n => { n.textContent = initials; n.classList.remove('hidden'); });
            imgNodes.forEach(img => img.classList.add('hidden'));
        }
    }

    // ================= BUSCADOR GLOBAL Y NAVEGACIÓN =================
    const globalSearch = document.getElementById('global-search');
    globalSearch.addEventListener('keyup', (e) => {
        if(e.key === 'Enter') {
            const val = e.target.value.trim().toLowerCase();
            if(!val) return;
            
            let prod = productos.find(p => p.sku === val);
            if(prod) {
                abrirModalProducto(prod.id);
                globalSearch.value = "";
                return;
            }

            let usr = usuarios.find(u => u.name.toLowerCase().includes(val));
            if(usr) {
                document.querySelector('[data-target="view-movimientos"]').click();
                document.getElementById('search-movimientos').value = usr.name;
                renderMovimientos();
                globalSearch.value = "";
                return;
            }
            alert("No se encontró ningún SKU exacto ni empleado con ese nombre.");
        }
    });

    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const navItems = document.querySelectorAll('.nav-item');
    const sectionViews = document.querySelectorAll('.section-view');

    function toggleMenu() {
        if (window.innerWidth <= 768) { sidebar.classList.toggle('active'); mobileOverlay.classList.toggle('active'); } 
        else { sidebar.classList.toggle('collapsed'); }
    }
    if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
    if (mobileOverlay) mobileOverlay.addEventListener('click', () => { sidebar.classList.remove('active'); mobileOverlay.classList.remove('active'); });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            sectionViews.forEach(view => view.classList.add('hidden'));
            item.classList.add('active');
            document.getElementById(item.getAttribute('data-target')).classList.remove('hidden');
            if (window.innerWidth <= 768) { sidebar.classList.remove('active'); mobileOverlay.classList.remove('active'); }
        });
    });

    const dateElement = document.getElementById('current-date-text');
    if (dateElement) {
        let dateString = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
        dateElement.textContent = dateString.charAt(0).toUpperCase() + dateString.slice(1);
    }

    // ================= RENDERIZADO INVENTARIO Y ALERTAS =================
    const tbodyInventario = document.getElementById('tbody-inventario');
    const searchInventario = document.getElementById('search-inventario');
    const filterCategoria = document.getElementById('filter-categoria');

    function renderFiltros() {
        filterCategoria.innerHTML = `<option value="Todas">Todas las categorías</option>`;
        categorias.forEach(c => filterCategoria.innerHTML += `<option value="${c}">${c}</option>`);
    }

    function renderInventario() {
        const term = searchInventario.value.toLowerCase();
        const cat = filterCategoria.value;
        tbodyInventario.innerHTML = "";
        let agotados = 0, bajos = 0;

        let filtrados = productos.filter(p => {
            const matchText = p.nombre.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
            const matchCat = cat === "Todas" || p.categoria === cat;
            return matchText && matchCat;
        });

        filtrados.forEach(p => {
            let cad = evaluarCaducidad(p.caducidad);
            let isOut = p.stock === 0; // Agotado anula todo lo demás visualmente
            let isLow = (!isOut) && (p.stock < p.min || cad.isProximo || cad.isVencido);

            if (isOut) agotados++; else if (isLow) bajos++;

            let badgeState = "";
            if(p.stock === 0) {
                badgeState = `<span class="badge status-out">Agotado</span>`;
            } else {
                if(cad.isVencido) badgeState += `<span class="badge status-out">Vencido</span> `;
                if(p.stock > 0 && p.stock < p.min) badgeState += `<span class="badge status-warn">Stock bajo</span> `;
                if(!cad.isVencido && cad.isProximo) badgeState += `<span class="badge status-warn">${cad.text}</span> `;
                if(!cad.isVencido && !cad.isProximo && p.stock >= p.min) badgeState = `<span class="badge status-ok">OK</span>`;
            }
            
            let actionHtml = currentUser && currentUser.role === 'Administrador' 
                ? `<i class="fa-solid fa-pen text-pink btn-editar" data-id="${p.id}"></i><i class="fa-solid fa-trash-can text-red btn-eliminar" data-id="${p.id}"></i>` 
                : `<i class="fa-solid fa-lock text-muted" title="Sin permisos"></i>`;

            tbodyInventario.innerHTML += `
                <tr>
                    <td><strong>${p.nombre}</strong><span>SKU: ${p.sku}</span></td>
                    <td>${p.marca}</td>
                    <td><span class="badge cat-badge">${p.categoria}</span></td>
                    <td>${cad.text}</td>
                    <td>$${parseFloat(p.precio).toFixed(2)}</td>
                    <td><strong>${p.stock}</strong> <span class="stock-min">/ mín ${p.min}</span></td>
                    <td>${badgeState}</td>
                    <td class="actions">${actionHtml}</td>
                </tr>
            `;
        });

        document.getElementById('inventario-count').textContent = `${productos.length} productos registrados`;
        document.getElementById('dash-total-prod').textContent = productos.length;
        document.getElementById('dash-alertas').textContent = agotados + bajos;
        document.getElementById('alert-agotados').textContent = agotados;
        document.getElementById('alert-bajos').textContent = bajos;
        renderAlertasDetalle();

        if(currentUser && currentUser.role === 'Administrador'){
            document.querySelectorAll('.btn-editar').forEach(btn => btn.addEventListener('click', (e) => abrirModalProducto(parseInt(e.target.dataset.id))));
            document.querySelectorAll('.btn-eliminar').forEach(btn => btn.addEventListener('click', (e) => eliminarProducto(parseInt(e.target.dataset.id))));
        }
    }

    // Regla de ocultar vencidos si el stock es cero aplicada al centro de alertas
    function renderAlertasDetalle() {
        const lists = [document.getElementById('widget-alertas-inicio'), document.getElementById('widget-alertas-centro')];
        lists.forEach(container => {
            if(!container) return;
            container.innerHTML = '';
            productos.forEach(p => {
                let cad = evaluarCaducidad(p.caducidad);
                
                if (p.stock === 0) {
                    container.innerHTML += `<div class="list-item item-red"><i class="fa-solid fa-xmark"></i><div><strong>${p.nombre}</strong><span>Urgente: Agotado</span></div></div>`;
                } else {
                    if (cad.isVencido) {
                        container.innerHTML += `<div class="list-item item-red"><i class="fa-solid fa-skull-crossbones"></i><div><strong>${p.nombre}</strong><span>Urgente: Vencido</span></div></div>`;
                    }
                    if (p.stock > 0 && p.stock < p.min) {
                        container.innerHTML += `<div class="list-item item-orange"><i class="fa-solid fa-box"></i><div><strong>${p.nombre}</strong><span>Stock bajo: ${p.stock} pz</span></div></div>`;
                    }
                    if (!cad.isVencido && cad.isProximo) {
                        let txtFinal = cad.days <= 7 ? cad.text : `Próximo a vencer (${cad.dateStr})`;
                        container.innerHTML += `<div class="list-item item-orange"><i class="fa-solid fa-calendar-day"></i><div><strong>${p.nombre}</strong><span>${txtFinal}</span></div></div>`;
                    }
                }
            });
            if(container.innerHTML === '') container.innerHTML = `<p style="font-size:13px; color:#718096; text-align:center;">Todo está en orden ✨</p>`;
        });
    }

    if(searchInventario) searchInventario.addEventListener('input', renderInventario);
    if(filterCategoria) filterCategoria.addEventListener('change', renderInventario);

    // ================= MOVIMIENTOS =================
    const tbodyMov = document.getElementById('tbody-movimientos');
    const searchMov = document.getElementById('search-movimientos');
    
    function renderMovimientos() {
        const term = searchMov.value.toLowerCase();
        tbodyMov.innerHTML = "";
        let ent = 0, sal = 0;

        let filtrados = movimientos.filter(m => m.nombre.toLowerCase().includes(term) || m.usuario.toLowerCase().includes(term));
        filtrados.forEach(m => {
            if(m.tipo === "Entrada") ent++; else sal++;
            let badgeHtml = m.tipo === "Entrada" ? `<span class="badge status-ok"><i class="fa-solid fa-arrow-up"></i> Entrada</span>` : `<span class="badge status-out"><i class="fa-solid fa-arrow-down"></i> Salida</span>`;
            let colorCls = m.tipo === "Entrada" ? "text-green" : "text-red";
            let sign = m.tipo === "Entrada" ? "+" : "-";

            tbodyMov.innerHTML += `<tr><td>${badgeHtml}</td><td>${m.nombre}</td><td class="${colorCls}"><strong>${sign}${m.cantidad}</strong></td><td>${m.fecha}</td><td>${m.usuario}</td></tr>`;
        });
        document.getElementById('stat-entradas').textContent = ent;
        document.getElementById('stat-salidas').textContent = sal;
        document.getElementById('dash-movimientos').textContent = movimientos.length;
    }
    if(searchMov) searchMov.addEventListener('input', renderMovimientos);


    // ================= MODALES Y FUNCIONALIDADES =================
    const modalProd = document.getElementById('modal-producto');
    const formProd = document.getElementById('form-producto');
    const modalMov = document.getElementById('modal-movimiento');
    const formMov = document.getElementById('form-movimiento');

    document.getElementById('btn-nuevo-producto')?.addEventListener('click', () => abrirModalProducto(null));
    document.getElementById('btn-registrar-mov')?.addEventListener('click', abrirModalMovimiento);
    
    function actualizarSelectsProducto() {
        const sMarca = document.getElementById('prod-marca');
        const sCat = document.getElementById('prod-categoria');
        sMarca.innerHTML = ""; sCat.innerHTML = "";
        marcas.forEach(m => sMarca.innerHTML += `<option value="${m}">${m}</option>`);
        categorias.forEach(c => sCat.innerHTML += `<option value="${c}">${c}</option>`);
    }

    function abrirModalProducto(id) {
        if(currentUser.role === 'Administrador' && !currentUser.permissions[1]) {
            return alert("Permiso denegado: No tienes habilitado añadir, editar y borrar registros de stock.");
        } else if (currentUser.role === 'Empleado') {
            return alert("Solo un Administrador puede crear o editar productos.");
        }

        productoEditandoId = id;
        actualizarSelectsProducto();
        if (id) {
            document.getElementById('modal-prod-title').textContent = "Editar Producto";
            let p = productos.find(x => x.id === id);
            document.getElementById('prod-nombre').value = p.nombre; document.getElementById('prod-sku').value = p.sku;
            document.getElementById('prod-marca').value = p.marca; document.getElementById('prod-categoria').value = p.categoria;
            document.getElementById('prod-precio').value = p.precio; document.getElementById('prod-stock').value = p.stock;
            document.getElementById('prod-min').value = p.min;
            if(p.caducidad) document.getElementById('prod-caducidad').value = p.caducidad;
        } else {
            document.getElementById('modal-prod-title').textContent = "Nuevo Producto";
            formProd.reset();
        }
        modalProd.classList.remove('hidden');
    }

    function eliminarProducto(id) {
        if(currentUser.role === 'Administrador' && !currentUser.permissions[1]) {
            return alert("Permiso denegado: No tienes habilitado añadir, editar y borrar registros de stock.");
        }
        if(confirm("¿Eliminar este producto?")) { productos = productos.filter(p => p.id !== id); renderInventario(); }
    }

    if(formProd) {
        formProd.addEventListener('submit', (e) => {
            e.preventDefault();
            const p = {
                nombre: document.getElementById('prod-nombre').value, 
                sku: document.getElementById('prod-sku').value,
                marca: document.getElementById('prod-marca').value, 
                categoria: document.getElementById('prod-categoria').value,
                caducidad: document.getElementById('prod-caducidad').value,
                precio: parseFloat(document.getElementById('prod-precio').value), 
                stock: parseInt(document.getElementById('prod-stock').value), 
                min: parseInt(document.getElementById('prod-min').value)
            };
            if (productoEditandoId) { let i = productos.findIndex(x => x.id === productoEditandoId); productos[i] = { ...productos[i], ...p }; } 
            else { p.id = Date.now(); productos.push(p); }
            modalProd.classList.add('hidden'); renderInventario();
        });
    }

    function abrirModalMovimiento() {
        if(currentUser.role === 'Empleado' && !currentUser.permissions[0]) {
            return alert("Permiso denegado: No tienes habilitado actualizar el inventario cuando llega o se vende mercancía.");
        }

        const selectProd = document.getElementById('mov-producto');
        selectProd.innerHTML = "";
        productos.forEach(p => selectProd.innerHTML += `<option value="${p.id}">${p.nombre} (Stock: ${p.stock})</option>`);
        formMov.reset(); modalMov.classList.remove('hidden');
    }

    // Validación limitante agregada a las entradas de producto
    if(formMov) {
        formMov.addEventListener('submit', (e) => {
            e.preventDefault();
            const tipo = document.getElementById('mov-tipo').value, prodId = parseInt(document.getElementById('mov-producto').value), cant = parseInt(document.getElementById('mov-cantidad').value);
            let prod = productos.find(p => p.id === prodId);
            
            if (tipo === "Salida" && cant > prod.stock) return alert("No hay suficiente stock.");
            if (tipo === "Entrada" && (prod.stock + cant > 5000)) return alert(`Advertencia: El límite de producto es de 5000 pz. Este movimiento haría que tu stock final sea de ${prod.stock + cant}.`);
            
            if (tipo === "Entrada") prod.stock += cant; else prod.stock -= cant;
            movimientos.unshift({ id: Date.now(), tipo: tipo, productoId: prod.id, nombre: prod.nombre, cantidad: cant, fecha: new Date().toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'}), usuario: currentUser.name });
            modalMov.classList.add('hidden'); renderInventario(); renderMovimientos();
        });
    }

    // Funciones Extra de ADMIN conectadas a SQL Server
    let usuariosBD = []; // Variable temporal para la tabla

    window.abrirModalUsuarios = async function() {
        if(currentUser.role === 'Administrador' && !currentUser.permissions[0]) {
            return alert("Permiso denegado: No tienes habilitado crear, modificar y eliminar usuarios.");
        }
        
        // Petición a la base de datos para obtener a todos
        try {
            const respuesta = await fetch('http://localhost:5000/api/usuarios');
            if (respuesta.ok) {
                usuariosBD = await respuesta.json();
                renderUsuariosAdmin();
                document.getElementById('modal-usuarios').classList.remove('hidden');
            }
        } catch (error) {
            alert("Error al cargar la lista de usuarios.");
        }
    };

    function renderUsuariosAdmin() {
        const tbody = document.getElementById('tbody-usuarios');
        tbody.innerHTML = "";
        // Renderizamos los datos reales de SQL
        usuariosBD.forEach((u) => {
            tbody.innerHTML += `<tr>
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td><span class="badge ${u.role==='Administrador'?'cat-badge':'status-ok'}">${u.role}</span></td>
                <td><i class="fa-solid fa-trash-can text-red" onclick="borrarUsuario('${u.email}')" style="cursor:pointer;"></i></td>
            </tr>`;
        });
    }

    window.borrarUsuario = async function(emailAEliminar) {
        if(emailAEliminar === currentUser.email) return alert("No puedes borrarte a ti mismo.");
        
        if(confirm(`¿Estás seguro de eliminar el acceso de ${emailAEliminar}?`)) {
            try {
                // Le decimos a C# que borre a este usuario
                const respuesta = await fetch(`http://localhost:5000/api/usuarios/${emailAEliminar}`, {
                    method: 'DELETE'
                });

                if (respuesta.ok) {
                    // Refrescamos la tabla volviendo a llamar a abrirModalUsuarios
                    alert("Usuario eliminado de la base de datos.");
                    abrirModalUsuarios(); 
                } else {
                    alert("No se pudo eliminar el usuario.");
                }
            } catch (error) {
                alert("Error de conexión al intentar eliminar.");
            }
        }
    };

    window.abrirRegistroDesdeAdmin = function() {
        document.getElementById('card-login').classList.add('hidden');
        document.getElementById('card-register').classList.remove('hidden');
        document.getElementById('btn-logout').click(); 
    };

    window.abrirModalCategorias = function() { 
        document.getElementById('modal-categorias').classList.remove('hidden'); 
    };
    
    document.getElementById('form-add-marca').addEventListener('submit', (e) => {
        e.preventDefault(); marcas.push(document.getElementById('nueva-marca').value); 
        document.getElementById('nueva-marca').value = ""; alert("Marca añadida.");
    });
    document.getElementById('form-add-cat').addEventListener('submit', (e) => {
        e.preventDefault(); categorias.push(document.getElementById('nueva-cat').value); 
        document.getElementById('nueva-cat').value = ""; renderFiltros(); alert("Categoría añadida.");
    });

    // Inicializador Maestro
    function inicializarDashboard() {
        renderFiltros();
        renderInventario();
        renderMovimientos();
    }

});