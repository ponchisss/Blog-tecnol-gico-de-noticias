/*
   =========================================
   FRONTEND JAVASCRIPT: SUPABASE CLIENT INTEGRATION WITH SAFESTORAGE
   Author: Antigravity IDE Agent
   =========================================
*/

document.addEventListener('DOMContentLoaded', async () => {
    // --- SAFESTORAGE WRAPPER FOR FILE:// COMPATIBILITY ---
    const memoryStorage = {};
    const safeStorage = {
        getItem: (key) => {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                return memoryStorage[key] || null;
            }
        },
        setItem: (key, value) => {
            try {
                localStorage.setItem(key, value);
            } catch (e) {
                memoryStorage[key] = String(value);
            }
        },
        removeItem: (key) => {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                delete memoryStorage[key];
            }
        }
    };

    // --- SUPABASE CLIENT INITIALIZATION ---
    const SUPABASE_URL = "https://mohqmwtvxarvuukfeyan.supabase.co";
    const SUPABASE_KEY = "sb_publishable_Qshjrg4XARQ0W8v8U11r7A_GMZSzDF7";
    const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            storage: safeStorage,
            persistSession: true,
            autoRefreshToken: true
        }
    });

    // --- LOCAL SESSION CACHE HELPERS ---
    const getCurrentUser = () => JSON.parse(safeStorage.getItem('techlog_current_user')) || null;
    const setCurrentUser = (user) => safeStorage.setItem('techlog_current_user', JSON.stringify(user));

    // --- SYNCHRONIZE ACTIVE SESSION WITH SUPABASE ---
    async function syncSession() {
        try {
            const { data: { session } } = await _supabase.auth.getSession();
            if (session && session.user) {
                const { data: profile, error } = await _supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (profile) {
                    setCurrentUser({
                        id: profile.id,
                        email: profile.email,
                        role: profile.role,
                        is_verified: true,
                        nickname: profile.nickname || profile.email.split('@')[0],
                        photo_url: profile.photo_url || null
                    });
                } else {
                    // Trigger fallback if public profile not inserted yet
                    setCurrentUser({
                        id: session.user.id,
                        email: session.user.email,
                        role: 'Reader',
                        is_verified: true,
                        nickname: session.user.email.split('@')[0],
                        photo_url: null
                    });
                }
            } else {
                safeStorage.removeItem('techlog_current_user');
            }
        } catch (err) {
            console.error("Error synchronizing session:", err);
            safeStorage.removeItem('techlog_current_user');
        }
        updateNavbar();
    }

    // --- TOAST NOTIFICATIONS SYSTEM ---
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

    // --- DYNAMIC NAVBAR LOGIC ---
    function updateNavbar() {
        const currentUser = getCurrentUser();
        const navAuthContainer = document.getElementById('nav-auth-container');
        const navAdminLi = document.getElementById('nav-admin-li');
        const footerLoginLi = document.getElementById('footer-login-li');

        if (currentUser) {
            if (navAuthContainer) {
                const displayName = currentUser.nickname || currentUser.email.split('@')[0];
                const avatarUrl = currentUser.photo_url || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                
                navAuthContainer.innerHTML = `
                    <div class="user-badge" id="nav-user-badge" style="display: flex; align-items: center; gap: 0.75rem;">
                        <a href="profile.html" class="nav-profile-link" style="display: flex; align-items: center; gap: 0.5rem; text-decoration: none; color: inherit;" title="Editar mi Perfil">
                            <img src="${avatarUrl}" alt="${displayName}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--accent-purple); background: rgba(255,255,255,0.05);">
                            <span style="font-weight: 600; color: #fff; font-size: 0.9rem;">${displayName}</span>
                        </a>
                        <span class="user-role role-${currentUser.role.toLowerCase()}" id="nav-user-role-lbl">${currentUser.role}</span>
                        <button class="btn-outline btn-sm" style="border-radius: 6px; cursor: pointer; border: 1px solid rgba(255,255,255,0.15);" id="nav-logout-btn">Salir</button>
                    </div>
                `;
                
                document.getElementById('nav-logout-btn').addEventListener('click', handleLogout);
            }

            if (navAdminLi) {
                if (currentUser.role === 'Admin' || currentUser.role === 'Editor') {
                    navAdminLi.style.display = 'block';
                } else {
                    navAdminLi.style.display = 'none';
                }
            }

            if (footerLoginLi) {
                footerLoginLi.innerHTML = `<button id="footer-logout-btn" style="background:none; border:none; color:inherit; font:inherit; cursor:pointer;">Cerrar Sesión</button>`;
                document.getElementById('footer-logout-btn').addEventListener('click', handleLogout);
            }
        } else {
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

    async function handleLogout() {
        const { error } = await _supabase.auth.signOut();
        if (error) {
            showToast(`Error al cerrar sesión: ${error.message}`, "error");
            return;
        }
        safeStorage.removeItem('techlog_current_user');
        showToast("Sesión cerrada exitosamente.", "success");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);
    }

    // Run session synchronization on boot
    await syncSession();

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

    // --- PASSWORD VISIBILITY TOGGLE ---
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
        });
    }

    // --- PROFILE PAGE LOGIC ---
    const profileForm = document.getElementById('profile-submit-form');
    if (profileForm) {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            window.location.href = "login.html";
            return;
        }

        const emailInput = document.getElementById('profile-email');
        const nicknameInput = document.getElementById('profile-nickname');
        const fullnameInput = document.getElementById('profile-fullname');
        const phoneInput = document.getElementById('profile-phone');
        const photoUrlInput = document.getElementById('profile-photourl');
        const bioInput = document.getElementById('profile-bio');
        const avatarPreview = document.getElementById('profile-avatar-preview');
        const avatarFallback = document.getElementById('profile-avatar-fallback');
        const roleBadge = document.getElementById('profile-role-badge');

        // Fetch latest profile details from Supabase
        const loadProfile = async () => {
            const { data: profile, error } = await _supabase
                .from('users')
                .select('*')
                .eq('id', currentUser.id)
                .maybeSingle();

            if (error) {
                showToast("Error al cargar datos del perfil.", "error");
                return;
            }

            if (profile) {
                emailInput.value = profile.email;
                nicknameInput.value = profile.nickname || profile.email.split('@')[0];
                fullnameInput.value = profile.fullname || "";
                phoneInput.value = profile.phone || "";
                photoUrlInput.value = profile.photo_url || "";
                bioInput.value = profile.bio || "";
                
                roleBadge.textContent = profile.role;
                roleBadge.className = `user-role role-${profile.role.toLowerCase()}`;
                updateAvatarPreview(profile.photo_url);
            }
        };

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

        photoUrlInput.addEventListener('input', (e) => {
            updateAvatarPreview(e.target.value.trim());
        });

        profileForm.addEventListener('submit', async (e) => {
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

            const { error } = await _supabase
                .from('users')
                .update({
                    nickname,
                    fullname,
                    phone,
                    photo_url: photoUrl,
                    bio
                })
                .eq('id', currentUser.id);

            if (error) {
                showToast(`Error al guardar: ${error.message}`, "error");
                return;
            }

            // Sync changes with local storage
            await syncSession();
            showToast("Perfil actualizado correctamente.", "success");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        });

        await loadProfile();
    }

    // --- INDEX PAGE LOGIC ---
    const articlesShowcaseGrid = document.getElementById('articles-showcase-grid');
    if (articlesShowcaseGrid) {
        let currentFilterCategory = "";
        let currentSearchQuery = "";

        const renderIndexArticles = async () => {
            articlesShowcaseGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 3rem;"><span style="font-size: 2rem; animation: spin 1s infinite linear;">⏳</span><p style="margin-top: 1rem; color:var(--text-muted)">Cargando noticias desde Supabase...</p></div>`;
            
            const { data: dbArticles, error } = await _supabase
                .from('articles')
                .select('*, users(email)');

            if (error) {
                articlesShowcaseGrid.innerHTML = `<div class="no-results" style="grid-column: 1 / -1;"><span style="font-size: 3rem;">❌</span><h3>Error al conectar con Supabase</h3><p>${error.message}</p></div>`;
                return;
            }

            const articles = dbArticles.map(art => ({
                ...art,
                author_email: art.users ? art.users.email : 'desconocido'
            }));

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

        // Event chips
        const categoryChips = document.querySelectorAll('.category-chip');
        categoryChips.forEach(chip => {
            chip.addEventListener('click', () => {
                categoryChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                currentFilterCategory = chip.getAttribute('data-category') || "";
                renderIndexArticles();
            });
        });

        // Search input
        const searchBox = document.getElementById('search-box');
        if (searchBox) {
            searchBox.addEventListener('input', (e) => {
                currentSearchQuery = e.target.value.trim();
                renderIndexArticles();
            });
        }

        await renderIndexArticles();
    }

    // --- ARTICLE DETAIL PAGE LOGIC ---
    const articleDetailView = document.getElementById('article-detail-view');
    if (articleDetailView) {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = parseInt(urlParams.get('id'));
        const notFoundDiv = document.getElementById('article-not-found');

        if (articleId) {
            const loadArticle = async () => {
                const { data: article, error } = await _supabase
                    .from('articles')
                    .select('*, users(email)')
                    .eq('id', articleId)
                    .maybeSingle();

                if (error || !article) {
                    notFoundDiv.style.display = 'block';
                    return;
                }

                document.title = `${article.title} - TECHLOG`;
                document.getElementById('detail-image').src = article.image_url;
                document.getElementById('detail-image').alt = article.title;
                document.getElementById('detail-category').textContent = article.category;
                document.getElementById('detail-date').textContent = article.created_at.substring(0, 16).replace('T', ' ');
                document.getElementById('detail-author').textContent = `Por ${article.users ? article.users.email : 'desconocido'}`;
                document.getElementById('article-detail-title').textContent = article.title;
                
                const contentBody = document.getElementById('article-detail-content');
                contentBody.innerHTML = parseMarkdown(article.content);
                
                articleDetailView.style.display = 'block';
            };

            await loadArticle();
        } else {
            notFoundDiv.style.display = 'block';
        }
    }

    // --- LOGIN PAGE LOGIC ---
    const loginForm = document.getElementById('login-submit-form');
    if (loginForm) {
        if (getCurrentUser()) {
            window.location.href = "index.html";
            return;
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim().toLowerCase();
            const password = document.getElementById('password').value;

            if (!email || !password) {
                showToast("Por favor rellene todos los campos.", "error");
                return;
            }

            const { data, error } = await _supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                if (error.message.includes("Email not confirmed") || error.message.includes("confirm your email")) {
                    safeStorage.setItem('techlog_temp_email', email);
                    await _supabase.auth.resend({
                        type: 'signup',
                        email: email
                    });
                    showToast("Tu cuenta aún no está verificada. Se ha enviado un nuevo código.", "warning");
                    setTimeout(() => {
                        window.location.href = "verify.html";
                    }, 1500);
                } else {
                    showToast(`Error al iniciar sesión: ${error.message}`, "error");
                }
                return;
            }

            await syncSession();
            showToast("¡Sesión iniciada con éxito!", "success");
            
            setTimeout(() => {
                const user = getCurrentUser();
                if (user && (user.role === 'Admin' || user.role === 'Editor')) {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "index.html";
                }
            }, 1500);
        });
    }

    // --- REGISTER PAGE LOGIC ---
    const registerForm = document.getElementById('register-submit-form');
    if (registerForm) {
        if (getCurrentUser()) {
            window.location.href = "index.html";
            return;
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

            const { data, error } = await _supabase.auth.signUp({
                email: email,
                password: password
            });

            if (error) {
                showToast(`Error al registrarse: ${error.message}`, "error");
                return;
            }

            safeStorage.setItem('techlog_temp_email', email);
            showToast("¡Registro exitoso! Se ha enviado un código de confirmación a tu email.", "success");
            
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
            return;
        }

        const tempEmail = safeStorage.getItem('techlog_temp_email');
        if (!tempEmail) {
            showToast("Acceso no autorizado.", "error");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);
            return;
        }

        document.getElementById('verify-email-lbl').textContent = tempEmail;

        const codeInput = document.getElementById('verification-code-input');
        if (codeInput) {
            codeInput.focus();
            codeInput.addEventListener('input', () => {
                codeInput.value = codeInput.value.replace(/[^0-9]/g, '');
            });
        }

        verifyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const code = codeInput.value.trim();

            const { data, error } = await _supabase.auth.verifyOtp({
                email: tempEmail,
                token: code,
                type: 'signup'
            });

            if (error) {
                showToast(`Error de verificación: ${error.message}`, "error");
                return;
            }

            await syncSession();
            safeStorage.removeItem('techlog_temp_email');

            showToast("¡Cuenta verificada exitosamente! Bienvenido.", "success");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        });
    }

    // --- ADMIN PANEL LOGIC ---
    const adminPanelGrid = document.getElementById('admin-panel-grid');
    if (adminPanelGrid) {
        const currentUser = getCurrentUser();
        
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

        // Sidebar tabs switching
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
            });
        });

        // WYSIWYG live preview
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
        const renderAdminArticles = async () => {
            const tbody = document.getElementById('admin-articles-tbody');
            if (!tbody) return;

            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem 0;">⏳ Cargando noticias desde Supabase...</td></tr>`;

            const { data: dbArticles, error } = await _supabase
                .from('articles')
                .select('*, users(email)');

            if (error) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--accent-pink); padding: 3rem 0;">❌ Error al conectar con Supabase: ${error.message}</td></tr>`;
                return;
            }

            const articles = dbArticles.map(art => ({
                ...art,
                author_email: art.users ? art.users.email : 'desconocido'
            }));

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

        // Render user roles table (Admin only)
        const renderAdminUsers = async () => {
            const tbody = document.getElementById('admin-users-tbody');
            if (!tbody) return;

            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 3rem 0;">⏳ Cargando usuarios desde Supabase...</td></tr>`;

            const { data: users, error } = await _supabase
                .from('users')
                .select('*');

            if (error) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--accent-pink); padding: 3rem 0;">❌ Error al conectar con Supabase: ${error.message}</td></tr>`;
                return;
            }

            users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            if (users.length > 0) {
                tbody.innerHTML = users.map(u => `
                    <tr>
                        <td style="font-size: 0.75rem; font-family: monospace;">${u.id.substring(0, 8)}...</td>
                        <td style="font-weight: 700;">${u.email}</td>
                        <td>
                            <select class="role-select" data-user-id="${u.id}" id="role-select-${u.id}">
                                <option value="Reader" ${u.role === 'Reader' ? 'selected' : ''}>Reader (Lector)</option>
                                <option value="Editor" ${u.role === 'Editor' ? 'selected' : ''}>Editor (Escritor)</option>
                                <option value="Admin" ${u.role === 'Admin' ? 'selected' : ''}>Admin (Administrador)</option>
                            </select>
                        </td>
                        <td>
                            <span class="user-role role-reader" style="font-size:0.75rem;">Verificado</span>
                        </td>
                        <td>${u.created_at.substring(0, 10)}</td>
                    </tr>
                `).join('');

                // Attach change listeners
                const roleSelects = document.querySelectorAll('.role-select');
                roleSelects.forEach(select => {
                    select.addEventListener('change', async () => {
                        const userId = select.getAttribute('data-user-id');
                        const newRole = select.value;
                        
                        if (userId === currentUser.id) {
                            showToast("No puedes cambiar tu propio rol por seguridad.", "error");
                            await renderAdminUsers();
                            return;
                        }

                        const { error } = await _supabase
                            .from('users')
                            .update({ role: newRole })
                            .eq('id', userId);

                        if (error) {
                            showToast(`Error al actualizar rol: ${error.message}`, "error");
                            await renderAdminUsers();
                            return;
                        }

                        showToast("Rol actualizado correctamente.", "success");
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

        // Mailbox Pane update
        const refreshMockMailbox = () => {
            const mailList = document.getElementById('mailbox-list-container');
            if (!mailList) return;

            mailList.innerHTML = `
                <div style="text-align:center; padding:3rem; color:var(--text-muted); border: 1px dashed rgba(255,255,255,0.1); border-radius: 10px;">
                    <span style="font-size: 3rem;">📧</span>
                    <h3 style="margin-top: 1rem; color: var(--accent-teal);">Verificación en Tiempo Real Activa</h3>
                    <p style="margin-top: 0.5rem; max-width: 500px; margin-left: auto; margin-right: auto; line-height: 1.5;">
                        La aplicación ahora está conectada directamente a <strong>Supabase Auth</strong>. El sistema enviará un código de verificación real a la bandeja de entrada del correo del usuario registrado. ¡Ya no se requiere un buzón simulado en local!
                    </p>
                </div>
            `;
        };

        // Settings Form (Optional configurations for EmailJS)
        const settingsForm = document.getElementById('settings-emailjs-form');
        if (settingsForm) {
            const enabledInput = document.getElementById('settings-emailjs-enabled');
            const serviceInput = document.getElementById('settings-emailjs-service');
            const templateInput = document.getElementById('settings-emailjs-template');
            const publicKeyInput = document.getElementById('settings-emailjs-publickey');

            enabledInput.checked = safeStorage.getItem('techlog_emailjs_enabled') === 'true';
            serviceInput.value = safeStorage.getItem('techlog_emailjs_service') || "";
            templateInput.value = safeStorage.getItem('techlog_emailjs_template') || "";
            publicKeyInput.value = safeStorage.getItem('techlog_emailjs_publickey') || "";

            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                safeStorage.setItem('techlog_emailjs_enabled', enabledInput.checked);
                safeStorage.setItem('techlog_emailjs_service', serviceInput.value.trim());
                safeStorage.setItem('techlog_emailjs_template', templateInput.value.trim());
                safeStorage.setItem('techlog_emailjs_publickey', publicKeyInput.value.trim());

                showToast("Configuración opcional de EmailJS guardada.", "success");
            });
        }

        // CRUD article submit
        const articleForm = document.getElementById('article-form');
        let editingArticleId = null;

        if (articleForm) {
            articleForm.addEventListener('submit', async (e) => {
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

                if (editingArticleId) {
                    const { error } = await _supabase
                        .from('articles')
                        .update({
                            title,
                            summary,
                            category,
                            content,
                            image_url: imageUrl,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', editingArticleId);

                    if (error) {
                        showToast(`Error al actualizar noticia: ${error.message}`, "error");
                        return;
                    }
                    showToast("Artículo actualizado con éxito.", "success");
                } else {
                    const newArt = {
                        title,
                        summary,
                        category,
                        content,
                        image_url: imageUrl,
                        author_id: currentUser.id
                    };
                    
                    const { error } = await _supabase
                        .from('articles')
                        .insert([newArt]);

                    if (error) {
                        showToast(`Error al publicar noticia: ${error.message}`, "error");
                        return;
                    }
                    showToast("Artículo creado con éxito.", "success");
                }

                articleForm.reset();
                if (editorPreview) editorPreview.innerHTML = '<p style="color:#64748b;font-style:italic;">La previsualización en tiempo real aparecerá aquí...</p>';
                editingArticleId = null;
                document.getElementById('editor-submit-btn').textContent = 'Publicar Artículo';
                document.getElementById('editor-pane-title').textContent = 'Redactar Nueva Noticia';

                document.getElementById('tab-articles').click();
                await renderAdminArticles();
            });
        }

        window.editArticle = async function(id) {
            const { data: art, error } = await _supabase
                .from('articles')
                .select('*')
                .eq('id', id)
                .maybeSingle();

            if (error || !art) {
                showToast("Artículo no encontrado.", "error");
                return;
            }

            editingArticleId = art.id;
            document.getElementById('article-title').value = art.title;
            document.getElementById('article-summary').value = art.summary;
            document.getElementById('article-category').value = art.category;
            document.getElementById('editor-content').value = art.content;
            document.getElementById('article-image-url').value = art.image_url || "";

            document.getElementById('editor-submit-btn').textContent = 'Guardar Cambios';
            document.getElementById('editor-pane-title').textContent = 'Editar Noticia';

            if (editorTextarea) {
                editorTextarea.dispatchEvent(new Event('input'));
            }

            document.getElementById('tab-write').click();
            showToast("Artículo cargado en el editor.", "success");
        };

        window.deleteArticle = async function(id) {
            if (!confirm("¿Está seguro de que desea eliminar permanentemente este artículo?")) return;

            const { error } = await _supabase
                .from('articles')
                .delete()
                .eq('id', id);

            if (error) {
                showToast(`Error al eliminar: ${error.message}`, "error");
                return;
            }

            showToast("Artículo eliminado con éxito.", "success");

            const row = document.getElementById(`article-row-${id}`);
            if (row) {
                row.style.transition = 'all 0.4s ease';
                row.style.opacity = '0';
                row.style.transform = 'scale(0.9)';
                setTimeout(async () => {
                    row.remove();
                    await renderAdminArticles();
                }, 400);
            }
        };

        const mailboxRefreshBtn = document.getElementById('mailbox-refresh-btn');
        if (mailboxRefreshBtn) {
            mailboxRefreshBtn.addEventListener('click', () => {
                refreshMockMailbox();
                showToast("Buzón virtual actualizado.", "success");
            });
        }

        // Init admin tables
        await renderAdminArticles();
        await renderAdminUsers();
        refreshMockMailbox();
    }
});
