/*
   =========================================
   FRONTEND JAVASCRIPT: LOCAL STORAGE STORE & CONTROLS
   Author: Antigravity IDE Agent
   =========================================
*/

document.addEventListener('DOMContentLoaded', () => {
    // --- DATABASE BOOTSTRAPPING & SEED DATA ---
    
    // Default seed articles
    const defaultArticles = [
        {
            id: 1,
            title: "El impacto de GPT-5 en la industria del software",
            summary: "Analizamos cómo el próximo modelo lingüístico de OpenAI promete redefinir el rol de los ingenieros de software y la automatización de código.",
            category: "IA",
            content: "## Introducción\n\nEl desarrollo de la Inteligencia Artificial está avanzando a pasos agigantados. Con la inminente llegada de GPT-5, el ecosistema del desarrollo de software se encuentra al borde de una transformación sin precedentes.\n\n## ¿Qué podemos esperar?\n\n* **Generación de código multi-archivo**: Capacidad de diseñar arquitecturas completas desde un prompt.\n* **Razonamiento avanzado**: Menos alucinaciones y mayor comprensión del contexto del negocio.\n* **Agentes autónomos**: Sistemas capaces de depurar, probar y desplegar software sin intervención humana constante.\n\n> \"La IA no reemplazará a los programadores, pero los programadores que usan IA reemplazarán a los que no la usan.\"\n\n## Conclusión\n\nAdaptarse a estas nuevas herramientas es fundamental para seguir siendo relevantes en una industria hiper-competitiva.",
            image_url: "https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600&auto=format&fit=crop",
            author_id: 100,
            author_email: "admin@techblog.com",
            created_at: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
        },
        {
            id: 2,
            title: "Por qué Rust es el futuro del desarrollo de sistemas",
            summary: "Un repaso profundo de la seguridad de memoria, rendimiento crudo y concurrencia sin miedos que ofrece el lenguaje favorito de los desarrolladores.",
            category: "Software",
            content: "## Seguridad sin Recolector de Basura\n\nRust ha ganado popularidad gracias a su enfoque innovador en la gestión de memoria. A diferencia de lenguajes como Java o Go, Rust no tiene un recolector de basura (garbage collector). En su lugar, utiliza un sistema de **propiedad (ownership)** y préstamo de variables que el compilador valida en tiempo de compilación.\n\n## Ventajas Clave:\n\n1. **Rendimiento crudo**: Equivalente a C y C++.\n2. **Seguridad de memoria garantizada**: Previene errores comunes como desbordamientos de buffer o referencias nulas.\n3. **Excelente soporte para concurrencia**: Elimina las condiciones de carrera de datos.\n\n## Conclusión\n\nGrandes tecnológicas como Microsoft, Google y AWS están reescribiendo componentes críticos de su infraestructura en Rust. Es hora de prestarle atención.",
            image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop",
            author_id: 100,
            author_email: "admin@techblog.com",
            created_at: new Date(Date.now() - 3600000 * 48).toISOString() // 2 days ago
        },
        {
            id: 3,
            title: "La revolución de los procesadores cuánticos",
            summary: "Exploramos los hitos más recientes en computación cuántica y cómo amenazan la criptografía moderna en el corto plazo.",
            category: "Hardware",
            content: "## La carrera por los Qubits\n\nLa computación tradicional se basa en bits (0 o 1). La computación cuántica, en cambio, utiliza qubits que aprovechan los principios de superposición y entrelazamiento. Esto permite procesar volúmenes masivos de información de forma paralela.\n\n## Desafíos actuales:\n\n* **Decoherencia cuántica**: Mantener los qubits estables requiere temperaturas cercanas al cero absoluto (-273°C).\n* **Corrección de errores**: Se necesitan miles de qubits físicos para crear un solo qubit lógico corregido.\n\n## Impacto en la Criptografía\n\nLos algoritmos cuánticos como el de Shor son capaces de romper los sistemas criptográficos de clave pública más comunes (RSA y ECC). La transición hacia la **criptografía post-cuántica** ya ha comenzado.",
            image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop",
            author_id: 100,
            author_email: "admin@techblog.com",
            created_at: new Date(Date.now() - 3600000 * 72).toISOString() // 3 days ago
        },
        {
            id: 4,
            title: "Cómo proteger tus aplicaciones contra inyecciones SQL",
            summary: "Guía práctica con ejemplos reales para blindar tus bases de datos contra una de las vulnerabilidades más antiguas y destructivas de la web.",
            category: "Ciberseguridad",
            content: "## ¿Qué es la Inyección SQL?\n\nLa inyección SQL (SQLi) ocurre cuando un atacante logra insertar código SQL malicioso dentro de una consulta realizada por la aplicación a la base de datos. Esto puede resultar en la filtración de contraseñas, robo de datos o incluso destrucción de la base de datos.\n\n## Medidas preventivas:\n\n1. **Usar siempre Parametrización**: Nunca concatenar strings en queries.\n2. **Validación de entradas**: Filtrar caracteres sospechosos.\n3. **Principio de menor privilegio**: Que la conexión de la app solo tenga los permisos estrictamente necesarios.",
            image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop",
            author_id: 100,
            author_email: "admin@techblog.com",
            created_at: new Date(Date.now() - 3600000 * 96).toISOString() // 4 days ago
        }
    ];

    // Default seed users
    const defaultUsers = [
        {
            id: 100,
            email: "admin@techblog.com",
            password: "AdminPass123!",
            role: "Admin",
            is_verified: true,
            verification_code: null,
            nickname: "Administrador",
            fullname: "Administrador TECHLOG",
            phone: "+34 600 000 000",
            photo_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
            bio: "Cuenta de administrador principal de TECHLOG. Encargado de la gestión de roles y noticias.",
            created_at: new Date().toISOString()
        }
    ];

    // Helper functions to get/set local state
    const getArticles = () => JSON.parse(localStorage.getItem('techlog_articles')) || [];
    const setArticles = (articles) => localStorage.setItem('techlog_articles', JSON.stringify(articles));
    
    const getUsers = () => JSON.parse(localStorage.getItem('techlog_users')) || [];
    const setUsers = (users) => localStorage.setItem('techlog_users', JSON.stringify(users));

    const getCurrentUser = () => JSON.parse(localStorage.getItem('techlog_current_user')) || null;
    const setCurrentUser = (user) => localStorage.setItem('techlog_current_user', JSON.stringify(user));

    const getMockEmails = () => JSON.parse(localStorage.getItem('techlog_mock_emails')) || [];
    const setMockEmails = (emails) => localStorage.setItem('techlog_mock_emails', JSON.stringify(emails));

    // Bootstrap data if empty
    if (!localStorage.getItem('techlog_articles')) {
        setArticles(defaultArticles);
    }
    if (!localStorage.getItem('techlog_users')) {
        setUsers(defaultUsers);
    }

    // --- TOAST NOTIFICATIONS HELPER ---
    window.showToast = function(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = '⚡';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '❌';
        if (type === 'warning') icon = '⚠️';
        
        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transition = 'all 0.5s ease-out';
            toast.style.transform = 'translateX(120%)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    };

    // --- DYNAMIC NAVBAR & SESSION CONTROLS ---
    function updateNavbar() {
        const currentUser = getCurrentUser();
        const navAuthContainer = document.getElementById('nav-auth-container');
        const navAdminLi = document.getElementById('nav-admin-li');
        const footerLoginLi = document.getElementById('footer-login-li');

        if (currentUser) {
            // Find current user's profile details in database
            const users = getUsers();
            const dbUser = users.find(u => u.id === currentUser.id) || currentUser;

            // Update auth actions in navbar to show nickname and circular avatar
            if (navAuthContainer) {
                const displayName = dbUser.nickname || dbUser.email.split('@')[0];
                const avatarUrl = dbUser.photo_url || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                
                navAuthContainer.innerHTML = `
                    <div class="user-badge" id="nav-user-badge" style="display: flex; align-items: center; gap: 0.75rem;">
                        <a href="profile.html" class="nav-profile-link" style="display: flex; align-items: center; gap: 0.5rem; text-decoration: none; color: inherit;" title="Editar mi Perfil">
                            <img src="${avatarUrl}" alt="${displayName}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--accent-purple); background: rgba(255,255,255,0.05);">
                            <span style="font-weight: 600; color: #fff; font-size: 0.9rem;">${displayName}</span>
                        </a>
                        <span class="user-role role-${dbUser.role.toLowerCase()}" id="nav-user-role-lbl">${dbUser.role}</span>
                        <button class="btn-outline btn-sm" style="border-radius: 6px; cursor: pointer; border: 1px solid rgba(255,255,255,0.15);" id="nav-logout-btn">Salir</button>
                    </div>
                `;
                
                // Add event listener to dynamically created logout button
                document.getElementById('nav-logout-btn').addEventListener('click', handleLogout);
            }

            // Show Admin Panel link if Role is Admin or Editor
            if (navAdminLi) {
                if (dbUser.role === 'Admin' || dbUser.role === 'Editor') {
                    navAdminLi.style.display = 'block';
                } else {
                    navAdminLi.style.display = 'none';
                }
            }

            // Update footer link to cerrar sesión
            if (footerLoginLi) {
                footerLoginLi.innerHTML = `<button id="footer-logout-btn" style="background:none; border:none; color:inherit; font:inherit; cursor:pointer;">Cerrar Sesión</button>`;
                document.getElementById('footer-logout-btn').addEventListener('click', handleLogout);
            }
        } else {
            // Reset navbar for guests
            if (navAuthContainer) {
                navAuthContainer.innerHTML = `
                    <div style="display: flex; gap: 1rem;">
                        <a href="login.html" class="btn-outline nav-btn" id="nav-login-btn">Iniciar Sesión</a>
                        <a href="register.html" class="btn-primary nav-btn" id="nav-register-btn">Registrarse</a>
                    </div>
                `;
            }
            if (navAdminLi) {
                navAdminLi.style.display = 'none';
            }
            if (footerLoginLi) {
                footerLoginLi.innerHTML = `<a href="login.html">Acceso Admin</a>`;
            }
        }
    }

    function handleLogout() {
        localStorage.removeItem('techlog_current_user');
        showToast("Sesión cerrada exitosamente.", "success");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);
    }

    // Always run navbar layout refresh
    updateNavbar();

    // --- Markdown/HTML Translation helper ---
    function parseMarkdown(text) {
        if (!text) return "";
        return text
            .replace(/\r\n/g, '\n')
            .replace(/\n/g, '<br>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/##\s*([^\n<]+)/g, '<h2>$1</h2>')
            .replace(/#\s*([^\n<]+)/g, '<h1>$1</h1>')
            .replace(/>\s*([^\n<]+)/g, '<blockquote>$1</blockquote>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:#a78bfa;text-decoration:underline;">$1</a>');
    }

    // --- PASSWORD VISIBILITY TOGGLE ENGINE ---
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
        });
    }

    // --- EMAILJS INTEGRATION HELPER ---
    async function sendVerificationEmail(recipientEmail, code) {
        const enabled = localStorage.getItem('techlog_emailjs_enabled') === 'true';
        const serviceId = localStorage.getItem('techlog_emailjs_service');
        const templateId = localStorage.getItem('techlog_emailjs_template');
        const publicKey = localStorage.getItem('techlog_emailjs_publickey');

        // Always save mock mailbox entry locally so it remains inspectable in dashboard
        const mockEntry = {
            to: recipientEmail,
            code: code,
            subject: "Verifica tu cuenta - Blog Tecnológico",
            body: `Tu código de verificación de 6 dígitos es: `,
            timestamp: new Date().toLocaleTimeString()
        };
        const emails = getMockEmails();
        emails.push(mockEntry);
        if (emails.length > 10) emails.shift();
        setMockEmails(emails);

        if (enabled && serviceId && templateId && publicKey) {
            try {
                const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        service_id: serviceId,
                        template_id: templateId,
                        user_id: publicKey,
                        template_params: {
                            to_email: recipientEmail,
                            code: code
                        }
                    })
                });

                if (response.ok) {
                    console.log(`[EmailJS] Verification code sent to ${recipientEmail}`);
                    return true;
                } else {
                    const errText = await response.text();
                    console.error("[EmailJS Error]", errText);
                    return false;
                }
            } catch (err) {
                console.error("[EmailJS Fetch Error]", err);
                return false;
            }
        }
        
        console.log(`[Simulation Mode] Code for ${recipientEmail}: ${code}`);
        return null; // Simulated
    }

    // --- PROFILE MANAGEMENT LOGIC ---
    const profileForm = document.getElementById('profile-submit-form');
    if (profileForm) {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            window.location.href = "login.html";
            return;
        }

        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);

        if (userIndex === -1) {
            window.location.href = "login.html";
            return;
        }

        const user = users[userIndex];
        const emailInput = document.getElementById('profile-email');
        const nicknameInput = document.getElementById('profile-nickname');
        const fullnameInput = document.getElementById('profile-fullname');
        const phoneInput = document.getElementById('profile-phone');
        const photoUrlInput = document.getElementById('profile-photourl');
        const bioInput = document.getElementById('profile-bio');
        const avatarPreview = document.getElementById('profile-avatar-preview');
        const avatarFallback = document.getElementById('profile-avatar-fallback');
        const roleBadge = document.getElementById('profile-role-badge');

        // Populate fields
        emailInput.value = user.email;
        nicknameInput.value = user.nickname || user.email.split('@')[0];
        fullnameInput.value = user.fullname || "";
        phoneInput.value = user.phone || "";
        photoUrlInput.value = user.photo_url || "";
        bioInput.value = user.bio || "";
        
        roleBadge.textContent = user.role;
        roleBadge.className = `user-role role-${user.role.toLowerCase()}`;

        // Preview helper
        const updateAvatarPreview = (url) => {
            if (url && url.startsWith('http')) {
                avatarPreview.src = url;
                avatarPreview.style.display = 'block';
                avatarFallback.style.display = 'none';
            } else {
                avatarPreview.style.display = 'none';
                avatarFallback.style.display = 'block';
            }
        };

        // Initialize preview
        updateAvatarPreview(user.photo_url);

        // Update preview dynamically on typing
        photoUrlInput.addEventListener('input', (e) => {
            updateAvatarPreview(e.target.value.trim());
        });

        // Submit form handler
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nickname = nicknameInput.value.trim();
            const fullname = fullnameInput.value.trim();
            const phone = phoneInput.value.trim();
            const photoUrl = photoUrlInput.value.trim();
            const bio = bioInput.value.trim();

            if (!nickname) {
                showToast("El apodo es requerido.", "error");
                return;
            }

            // Save details in local user record
            users[userIndex].nickname = nickname;
            users[userIndex].fullname = fullname;
            users[userIndex].phone = phone;
            users[userIndex].photo_url = photoUrl;
            users[userIndex].bio = bio;
            setUsers(users);

            // Also update active session
            currentUser.nickname = nickname;
            currentUser.photo_url = photoUrl;
            setCurrentUser(currentUser);

            updateNavbar();
            showToast("Perfil actualizado correctamente.", "success");
            
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        });
    }

    // --- INDEX PAGE LOGIC ---
    const articlesShowcaseGrid = document.getElementById('articles-showcase-grid');
    if (articlesShowcaseGrid) {
        let currentFilterCategory = "";
        let currentSearchQuery = "";

        const renderIndexArticles = () => {
            const articles = getArticles();
            
            // Filter
            const filtered = articles.filter(art => {
                const matchesCategory = !currentFilterCategory || art.category === currentFilterCategory;
                const matchesSearch = !currentSearchQuery || 
                    art.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
                    art.summary.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
                    art.content.toLowerCase().includes(currentSearchQuery.toLowerCase());
                return matchesCategory && matchesSearch;
            });

            // Sort by creation date descending
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            if (filtered.length > 0) {
                articlesShowcaseGrid.innerHTML = filtered.map(art => `
                    <article class="article-card" id="article-card-${art.id}">
                        <div class="card-img-wrapper">
                            <img src="${art.image_url}" alt="${art.title}" class="card-img" loading="lazy">
                            <span class="card-category">${art.category}</span>
                        </div>
                        <div class="card-content">
                            <span class="card-date">${art.created_at.substring(0, 10)}</span>
                            <h3 class="card-title">${art.title}</h3>
                            <p class="card-summary">${art.summary}</p>
                            <div class="card-footer">
                                <span class="card-author">${art.author_email.split('@')[0]}</span>
                                <a href="article.html?id=${art.id}" class="card-more" id="read-more-${art.id}">Leer más</a>
                            </div>
                        </div>
                    </article>
                `).join('');
            } else {
                articlesShowcaseGrid.innerHTML = `
                    <div class="no-results" id="no-results-alert" style="grid-column: 1 / -1; width: 100%;">
                        <span style="font-size: 3rem;">🛰️</span>
                        <h3 style="margin-top: 1rem; font-family: var(--font-header);">No se encontraron noticias</h3>
                        <p style="color: var(--text-muted); margin-top: 0.5rem;">Intenta con otra búsqueda o selecciona una categoría diferente.</p>
                        ${currentSearchQuery || currentFilterCategory ? `
                            <button id="reset-filters-btn" class="btn-primary btn-sm" style="display:inline-block; margin-top: 1.5rem; border:none; cursor:pointer;">Ver Todos los Artículos</button>
                        ` : ''}
                    </div>
                `;
                
                const resetBtn = document.getElementById('reset-filters-btn');
                if (resetBtn) {
                    resetBtn.addEventListener('click', () => {
                        currentFilterCategory = "";
                        currentSearchQuery = "";
                        document.getElementById('search-box').value = "";
                        document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
                        document.querySelector('.category-chip[data-category=""]').classList.add('active');
                        renderIndexArticles();
                    });
                }
            }
        };

        // Event listeners for category filter
        const categoryChips = document.querySelectorAll('.category-chip');
        categoryChips.forEach(chip => {
            chip.addEventListener('click', () => {
                categoryChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                currentFilterCategory = chip.getAttribute('data-category');
                renderIndexArticles();
            });
        });

        // Event listener for search box
        const searchBox = document.getElementById('search-box');
        if (searchBox) {
            searchBox.addEventListener('input', (e) => {
                currentSearchQuery = e.target.value.trim();
                renderIndexArticles();
            });
        }

        // Render articles on initial load
        renderIndexArticles();
    }

    // --- ARTICLE DETAIL PAGE LOGIC ---
    const articleDetailView = document.getElementById('article-detail-view');
    if (articleDetailView) {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = parseInt(urlParams.get('id'));
        const notFoundDiv = document.getElementById('article-not-found');

        if (articleId) {
            const articles = getArticles();
            const article = articles.find(art => art.id === articleId);

            if (article) {
                document.title = `${article.title} - TECHLOG`;
                document.getElementById('detail-image').src = article.image_url;
                document.getElementById('detail-image').alt = article.title;
                document.getElementById('detail-category').textContent = article.category;
                document.getElementById('detail-date').textContent = article.created_at.substring(0, 16).replace('T', ' ');
                document.getElementById('detail-author').textContent = `Por ${article.author_email}`;
                document.getElementById('article-detail-title').textContent = article.title;
                
                const contentBody = document.getElementById('article-detail-content');
                contentBody.innerHTML = parseMarkdown(article.content);
                
                articleDetailView.style.display = 'block';
            } else {
                notFoundDiv.style.display = 'block';
            }
        } else {
            notFoundDiv.style.display = 'block';
        }
    }

    // --- LOGIN PAGE LOGIC ---
    const loginForm = document.getElementById('login-submit-form');
    if (loginForm) {
        // Redirect if already logged in
        if (getCurrentUser()) {
            window.location.href = "index.html";
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim().toLowerCase();
            const password = document.getElementById('password').value;

            if (!email || !password) {
                showToast("Por favor rellene todos los campos.", "error");
                return;
            }

            const users = getUsers();
            const user = users.find(u => u.email === email);

            if (user && user.password === password) {
                if (!user.is_verified) {
                    // Generate new code and send email
                    const code = String(Math.floor(100000 + Math.random() * 900000));
                    user.verification_code = code;
                    setUsers(users);

                    localStorage.setItem('techlog_temp_user', JSON.stringify({ id: user.id, email: user.email }));
                    showToast("Tu cuenta aún no está verificada. Se ha enviado un nuevo código.", "warning");
                    
                    // Trigger real email or mock
                    await sendVerificationEmail(user.email, code);

                    setTimeout(() => {
                        window.location.href = "verify.html";
                    }, 1500);
                    return;
                }

                // Log the user in
                setCurrentUser({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    is_verified: user.is_verified,
                    nickname: user.nickname || null,
                    photo_url: user.photo_url || null
                });

                showToast(`¡Bienvenido de nuevo, ${user.email}!`, "success");
                setTimeout(() => {
                    if (user.role === 'Admin' || user.role === 'Editor') {
                        window.location.href = "admin.html";
                    } else {
                        window.location.href = "index.html";
                    }
                }, 1500);
            } else {
                showToast("Credenciales incorrectas.", "error");
            }
        });
    }

    // --- REGISTER PAGE LOGIC ---
    const registerForm = document.getElementById('register-submit-form');
    if (registerForm) {
        // Redirect if already logged in
        if (getCurrentUser()) {
            window.location.href = "index.html";
        }

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim().toLowerCase();
            const password = document.getElementById('password').value;

            if (!email || !password) {
                showToast("Por favor rellene todos los campos.", "error");
                return;
            }

            if (password.length < 6) {
                showToast("La contraseña debe tener al menos 6 caracteres.", "error");
                return;
            }

            const users = getUsers();
            const userExists = users.some(u => u.email === email);

            if (userExists) {
                showToast("Este correo electrónico ya está registrado.", "error");
                return;
            }

            // Generate verification code
            const code = String(Math.floor(100000 + Math.random() * 900000));
            const newUser = {
                id: Date.now(),
                email: email,
                password: password,
                role: 'Reader',
                is_verified: false,
                verification_code: code,
                nickname: "",
                fullname: "",
                phone: "",
                photo_url: "",
                bio: "",
                created_at: new Date().toISOString()
            };

            users.push(newUser);
            setUsers(users);

            // Save temp user context
            localStorage.setItem('techlog_temp_user', JSON.stringify({ id: newUser.id, email: newUser.email }));

            // Dispatch EmailJS or Local Mailbox
            const sentReal = await sendVerificationEmail(email, code);

            if (sentReal === true) {
                showToast("Se ha enviado un código de verificación real a tu Gmail.", "success");
            } else if (sentReal === false) {
                showToast("Error en EmailJS. Revisa las llaves o el buzón virtual.", "error");
            } else {
                showToast(`[Simulación] Código generado: ${code}. Ingrésalo para verificar.`, "success");
            }

            setTimeout(() => {
                window.location.href = "verify.html";
            }, 1500);
        });
    }

    // --- VERIFY PAGE LOGIC ---
    const verifyForm = document.getElementById('verify-submit-form');
    if (verifyForm) {
        if (getCurrentUser()) {
            window.location.href = "index.html";
        }

        const tempUser = JSON.parse(localStorage.getItem('techlog_temp_user'));
        if (!tempUser) {
            showToast("Acceso no autorizado.", "error");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);
            return;
        }

        document.getElementById('verify-email-lbl').textContent = tempUser.email;

        // Auto focus and digit limit
        const codeInput = document.getElementById('verification-code-input');
        if (codeInput) {
            codeInput.focus();
            codeInput.addEventListener('input', () => {
                codeInput.value = codeInput.value.replace(/[^0-9]/g, '');
            });
        }

        verifyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const code = codeInput.value.trim();

            const users = getUsers();
            const userIndex = users.findIndex(u => u.id === tempUser.id);

            if (userIndex !== -1 && users[userIndex].verification_code === code) {
                users[userIndex].is_verified = true;
                users[userIndex].verification_code = null;
                setUsers(users);

                // Log user in
                setCurrentUser({
                    id: users[userIndex].id,
                    email: users[userIndex].email,
                    role: users[userIndex].role,
                    is_verified: true,
                    nickname: users[userIndex].nickname || null,
                    photo_url: users[userIndex].photo_url || null
                });

                localStorage.removeItem('techlog_temp_user');

                showToast("¡Cuenta verificada exitosamente! Bienvenido.", "success");
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1500);
            } else {
                showToast("Código de verificación incorrecto.", "error");
            }
        });
    }

    // --- ADMIN DASHBOARD PAGE LOGIC ---
    const adminPanelGrid = document.getElementById('admin-panel-grid');
    if (adminPanelGrid) {
        const currentUser = getCurrentUser();
        
        // Security check
        if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Editor')) {
            showToast("Acceso denegado. No tienes permisos suficientes.", "error");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
            return;
        }

        // Setup role visibility
        const tabRoles = document.getElementById('tab-roles');
        if (tabRoles && currentUser.role === 'Admin') {
            tabRoles.style.display = 'block';
        }

        // Sidebar tabs switching logic
        const adminTabs = document.querySelectorAll('.sidebar-item');
        const adminPanes = document.querySelectorAll('.admin-pane');

        adminTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetPaneId = tab.getAttribute('data-pane');
                
                adminTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                adminPanes.forEach(pane => {
                    if (pane.id === targetPaneId) {
                        pane.classList.add('active');
                    } else {
                        pane.classList.remove('active');
                    }
                });
                
                if (targetPaneId === 'pane-mailbox') {
                    refreshMockMailbox();
                }
            });
        });

        // WYSIWYG live preview engine
        const editorTextarea = document.getElementById('editor-content');
        const editorPreview = document.getElementById('editor-preview-content');
        const toolbarButtons = document.querySelectorAll('.toolbar-btn');
        
        if (editorTextarea && editorPreview) {
            const updatePreview = () => {
                let content = editorTextarea.value;
                editorPreview.innerHTML = parseMarkdown(content) || '<p style="color:#64748b;font-style:italic;">La previsualización en tiempo real aparecerá aquí...</p>';
            };
            
            editorTextarea.addEventListener('input', updatePreview);
            
            toolbarButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const action = btn.getAttribute('data-action');
                    const start = editorTextarea.selectionStart;
                    const end = editorTextarea.selectionEnd;
                    const text = editorTextarea.value;
                    const selectedText = text.substring(start, end);
                    
                    let replacement = '';
                    
                    switch (action) {
                        case 'bold':
                            replacement = `**${selectedText || 'Texto en negrita'}**`;
                            break;
                        case 'italic':
                            replacement = `*${selectedText || 'Texto en cursiva'}*`;
                            break;
                        case 'h2':
                            replacement = `\n## ${selectedText || 'Título Secundario'}\n`;
                            break;
                        case 'link':
                            const url = prompt('Ingrese la URL del enlace:', 'https://');
                            if (url) {
                                replacement = `[${selectedText || 'Texto del enlace'}](${url})`;
                            } else {
                                return;
                            }
                            break;
                        case 'quote':
                            replacement = `\n> ${selectedText || 'Cita o bloque importante'}\n`;
                            break;
                        case 'image':
                            const imgUrl = prompt('Ingrese la URL de la imagen:', 'https://');
                            if (imgUrl) {
                                replacement = `\n![Descripción de la imagen](${imgUrl})\n`;
                            } else {
                                return;
                            }
                            break;
                    }
                    
                    editorTextarea.value = text.substring(0, start) + replacement + text.substring(end);
                    updatePreview();
                    editorTextarea.focus();
                });
            });
        }

        // Render articles management table
        const renderAdminArticles = () => {
            const articles = getArticles();
            const tbody = document.getElementById('admin-articles-tbody');
            if (!tbody) return;

            // Sort newest first
            articles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            if (articles.length > 0) {
                tbody.innerHTML = articles.map(art => `
                    <tr id="article-row-${art.id}">
                        <td>
                            <img src="${art.image_url}" alt="" class="table-img">
                        </td>
                        <td>
                            <div style="font-weight: 700;">${art.title}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${art.summary.substring(0, 60)}...</div>
                        </td>
                        <td>
                            <span class="user-role role-reader" style="font-size: 0.75rem;">${art.category}</span>
                        </td>
                        <td>${art.author_email.split('@')[0]}</td>
                        <td>${art.created_at.substring(0, 10)}</td>
                        <td>
                            <div class="action-btns">
                                <button class="btn-sm btn-edit" onclick="editArticle(${art.id})" id="edit-art-btn-${art.id}">Editar</button>
                                <button class="btn-sm btn-delete" onclick="deleteArticle(${art.id})" id="del-art-btn-${art.id}">Eliminar</button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem 0;">
                            No hay artículos publicados en el blog. ¡Crea el primero!
                        </td>
                    </tr>
                `;
            }
        };

        // Render user roles table
        const renderAdminUsers = () => {
            const users = getUsers();
            const tbody = document.getElementById('admin-users-tbody');
            if (!tbody) return;

            users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            if (users.length > 0) {
                tbody.innerHTML = users.map(u => `
                    <tr>
                        <td>${u.id}</td>
                        <td style="font-weight: 700;">${u.email}</td>
                        <td>
                            <select class="role-select" data-user-id="${u.id}" id="role-select-${u.id}">
                                <option value="Reader" ${u.role === 'Reader' ? 'selected' : ''}>Reader (Lector)</option>
                                <option value="Editor" ${u.role === 'Editor' ? 'selected' : ''}>Editor (Escritor)</option>
                                <option value="Admin" ${u.role === 'Admin' ? 'selected' : ''}>Admin (Administrador)</option>
                            </select>
                        </td>
                        <td>
                            ${u.is_verified ? `
                                <span class="user-role role-reader" style="font-size:0.75rem;">Verificado</span>
                            ` : `
                                <span class="user-role role-admin" style="font-size:0.75rem;">Pendiente</span>
                            `}
                        </td>
                        <td>${u.created_at.substring(0, 10)}</td>
                    </tr>
                `).join('');

                // Attach change listeners to select drops
                const roleSelects = document.querySelectorAll('.role-select');
                roleSelects.forEach(select => {
                    select.addEventListener('change', () => {
                        const userId = parseInt(select.getAttribute('data-user-id'));
                        const newRole = select.value;
                        
                        if (userId === currentUser.id) {
                            showToast("No puedes cambiar tu propio rol por seguridad.", "error");
                            renderAdminUsers();
                            return;
                        }

                        const uList = getUsers();
                        const uIdx = uList.findIndex(x => x.id === userId);
                        if (uIdx !== -1) {
                            uList[uIdx].role = newRole;
                            setUsers(uList);
                            showToast("Rol actualizado correctamente.", "success");
                        }
                    });
                });
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 3rem 0;">
                            No hay usuarios registrados en el sistema.
                        </td>
                    </tr>
                `;
            }
        };

        // Render mock mailbox list
        const refreshMockMailbox = () => {
            const mailList = document.getElementById('mailbox-list-container');
            if (!mailList) return;

            const emails = getMockEmails();

            if (emails.length === 0) {
                mailList.innerHTML = `<div style="text-align:center;padding:2rem;color:#64748b;font-style:italic;">No hay correos en el buzón virtual de Gmail en este momento.</div>`;
                return;
            }

            mailList.innerHTML = emails.slice().reverse().map(mail => `
                <div class="mail-item">
                    <div class="mail-item-header">
                        <span class="mail-to">Para: ${mail.to}</span>
                        <span class="mail-time">${mail.timestamp}</span>
                    </div>
                    <div class="mail-subj">Asunto: ${mail.subject}</div>
                    <div class="mail-body">
                        ${mail.body} 
                        <span class="mail-code-badge">${mail.code}</span>
                    </div>
                </div>
            `).join('');
        };

        // --- EMAILJS CONFIGURATION TAB LOGIC ---
        const settingsForm = document.getElementById('settings-emailjs-form');
        if (settingsForm) {
            const enabledInput = document.getElementById('settings-emailjs-enabled');
            const serviceInput = document.getElementById('settings-emailjs-service');
            const templateInput = document.getElementById('settings-emailjs-template');
            const publicKeyInput = document.getElementById('settings-emailjs-publickey');

            // Load saved settings
            enabledInput.checked = localStorage.getItem('techlog_emailjs_enabled') === 'true';
            serviceInput.value = localStorage.getItem('techlog_emailjs_service') || "";
            templateInput.value = localStorage.getItem('techlog_emailjs_template') || "";
            publicKeyInput.value = localStorage.getItem('techlog_emailjs_publickey') || "";

            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                localStorage.setItem('techlog_emailjs_enabled', enabledInput.checked);
                localStorage.setItem('techlog_emailjs_service', serviceInput.value.trim());
                localStorage.setItem('techlog_emailjs_template', templateInput.value.trim());
                localStorage.setItem('techlog_emailjs_publickey', publicKeyInput.value.trim());

                showToast("Configuración de EmailJS guardada con éxito.", "success");
            });
        }

        // CRUD article submit logic (Create / Edit)
        const articleForm = document.getElementById('article-form');
        let editingArticleId = null;

        if (articleForm) {
            articleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const title = document.getElementById('article-title').value.trim();
                const summary = document.getElementById('article-summary').value.trim();
                const category = document.getElementById('article-category').value;
                const content = document.getElementById('editor-content').value.trim();
                let imageUrl = document.getElementById('article-image-url').value.trim();

                if (!title || !summary || !category || !content) {
                    showToast("Por favor, completa todos los campos requeridos.", "error");
                    return;
                }

                if (!imageUrl) {
                    const catImages = {
                        "IA": "https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600&auto=format&fit=crop",
                        "Software": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop",
                        "Hardware": "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop",
                        "Ciberseguridad": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop"
                    };
                    imageUrl = catImages[category] || "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop";
                }

                const articles = getArticles();

                if (editingArticleId) {
                    const artIndex = articles.findIndex(a => a.id === editingArticleId);
                    if (artIndex !== -1) {
                        articles[artIndex].title = title;
                        articles[artIndex].summary = summary;
                        articles[artIndex].category = category;
                        articles[artIndex].content = content;
                        articles[artIndex].image_url = imageUrl;
                        
                        setArticles(articles);
                        showToast("Artículo actualizado con éxito.", "success");
                    }
                } else {
                    const newArt = {
                        id: Date.now(),
                        title: title,
                        summary: summary,
                        category: category,
                        content: content,
                        image_url: imageUrl,
                        author_id: currentUser.id,
                        author_email: currentUser.email,
                        created_at: new Date().toISOString()
                    };
                    articles.push(newArt);
                    setArticles(articles);
                    showToast("Artículo creado con éxito.", "success");
                }

                // Reset forms
                articleForm.reset();
                if (editorPreview) editorPreview.innerHTML = '<p style="color:#64748b;font-style:italic;">La previsualización en tiempo real aparecerá aquí...</p>';
                editingArticleId = null;
                document.getElementById('editor-submit-btn').textContent = 'Publicar Artículo';
                document.getElementById('editor-pane-title').textContent = 'Redactar Nueva Noticia';

                // Return to list pane
                document.getElementById('tab-articles').click();
                renderAdminArticles();
            });
        }

        // Global functions tied to edit/delete clicks
        window.editArticle = function(id) {
            const articles = getArticles();
            const art = articles.find(a => a.id === id);

            if (art) {
                editingArticleId = art.id;
                document.getElementById('article-title').value = art.title;
                document.getElementById('article-summary').value = art.summary;
                document.getElementById('article-category').value = art.category;
                document.getElementById('editor-content').value = art.content;
                document.getElementById('article-image-url').value = art.image_url;

                document.getElementById('editor-submit-btn').textContent = 'Guardar Cambios';
                document.getElementById('editor-pane-title').textContent = 'Editar Noticia';

                if (editorTextarea) {
                    editorTextarea.dispatchEvent(new Event('input'));
                }

                // Switch to write tab
                document.getElementById('tab-write').click();
                showToast("Artículo cargado en el editor.", "success");
            } else {
                showToast("Artículo no encontrado.", "error");
            }
        };

        window.deleteArticle = function(id) {
            if (!confirm("¿Está seguro de que desea eliminar permanentemente este artículo?")) return;

            const articles = getArticles();
            const filtered = articles.filter(a => a.id !== id);

            setArticles(filtered);
            showToast("Artículo eliminado con éxito.", "success");

            // Animate row removal
            const row = document.getElementById(`article-row-${id}`);
            if (row) {
                row.style.transition = 'all 0.4s ease';
                row.style.opacity = '0';
                row.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    row.remove();
                    renderAdminArticles(); // fallbacks
                }, 400);
            }
        };

        // Mailbox manual refresh
        const mailboxRefreshBtn = document.getElementById('mailbox-refresh-btn');
        if (mailboxRefreshBtn) {
            mailboxRefreshBtn.addEventListener('click', () => {
                refreshMockMailbox();
                showToast("Buzón virtual actualizado.", "success");
            });
        }

        // Init views
        renderAdminArticles();
        renderAdminUsers();
        refreshMockMailbox();
        
        // Auto refresh mailbox if visible
        setInterval(refreshMockMailbox, 10000);
    }
});
