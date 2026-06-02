/*
   =========================================
   FRONTEND JAVASCRIPT: INTERACTIVE CONTROLS
   Author: Antigravity IDE Agent
   =========================================
*/

document.addEventListener('DOMContentLoaded', () => {
    // --- Global Notifications / Toast helper ---
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
        
        // Remove after 4 seconds smoothly
        setTimeout(() => {
            toast.style.transition = 'all 0.5s ease-out';
            toast.style.transform = 'translateX(120%)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    };

    // --- Admin Panel Pane Switching ---
    const adminTabs = document.querySelectorAll('.sidebar-item');
    const adminPanes = document.querySelectorAll('.admin-pane');

    if (adminTabs.length > 0) {
        adminTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetPaneId = tab.getAttribute('data-pane');
                
                // Set active class on sidebar items
                adminTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show corresponding pane
                adminPanes.forEach(pane => {
                    if (pane.id === targetPaneId) {
                        pane.classList.add('active');
                    } else {
                        pane.classList.remove('active');
                    }
                });
                
                // If switching to Inbox, poll emails immediately
                if (targetPaneId === 'pane-mailbox') {
                    refreshMockMailbox();
                }
            });
        });
    }

    // --- Simple Visual Editor Utilities ---
    const editorTextarea = document.getElementById('editor-content');
    const editorPreview = document.getElementById('editor-preview-content');
    const toolbarButtons = document.querySelectorAll('.toolbar-btn');
    
    // Live preview update
    if (editorTextarea && editorPreview) {
        const updatePreview = () => {
            let content = editorTextarea.value;
            // Simple markdown/HTML translation helper for live preview
            content = content
                .replace(/\n/g, '<br>')
                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                .replace(/##\s*([^\n<]+)/g, '<h2>$1</h2>')
                .replace(/#\s*([^\n<]+)/g, '<h1>$1</h1>')
                .replace(/>\s*([^\n<]+)/g, '<blockquote>$1</blockquote>')
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:#a78bfa;text-decoration:underline;">$1</a>');
            
            editorPreview.innerHTML = content || '<p style="color:#64748b;font-style:italic;">La previsualización en tiempo real aparecerá aquí...</p>';
        };
        
        editorTextarea.addEventListener('input', updatePreview);
        
        // Toolbar actions
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

    // --- AJAX Article CRUD operations ---
    const articleForm = document.getElementById('article-form');
    let editingArticleId = null;

    if (articleForm) {
        articleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(articleForm);
            const title = formData.get('title');
            const summary = formData.get('summary');
            const category = formData.get('category');
            const content = formData.get('content');
            const imageUrl = formData.get('image_url');
            
            let url = '/admin/article/create';
            if (editingArticleId) {
                url = `/admin/article/edit/${editingArticleId}`;
            }
            
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showToast(result.message, 'success');
                    articleForm.reset();
                    if (editorPreview) editorPreview.innerHTML = '';
                    
                    // Reset editing state
                    editingArticleId = null;
                    document.getElementById('editor-submit-btn').textContent = 'Publicar Artículo';
                    document.getElementById('editor-pane-title').textContent = 'Redactar Nueva Noticia';
                    
                    // Refresh parent window / table smoothly after 1.5s
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    showToast(result.message || 'Ocurrió un error inesperado.', 'error');
                }
            } catch (err) {
                showToast('Error de conexión con el servidor.', 'error');
                console.error(err);
            }
        });
    }

    // Edit Article Trigger (Load to editor)
    window.editArticle = async function(id) {
        try {
            const response = await fetch(`/admin/article/${id}`);
            const result = await response.json();
            
            if (result.success) {
                const art = result.article;
                editingArticleId = art.id;
                
                // Populate form fields
                document.getElementById('article-title').value = art.title;
                document.getElementById('article-summary').value = art.summary;
                document.getElementById('article-category').value = art.category;
                document.getElementById('editor-content').value = art.content;
                document.getElementById('article-image-url').value = art.image_url;
                
                // Update UI text to edit mode
                document.getElementById('editor-submit-btn').textContent = 'Guardar Cambios';
                document.getElementById('editor-pane-title').textContent = 'Editar Noticia';
                
                // Trigger live preview update
                if (editorTextarea) {
                    editorTextarea.dispatchEvent(new Event('input'));
                }
                
                // Switch tab to write article pane
                const writeTab = document.querySelector('[data-pane="pane-write"]');
                if (writeTab) writeTab.click();
                
                showToast("Artículo cargado en el editor.", "success");
            } else {
                showToast(result.message, 'error');
            }
        } catch (err) {
            showToast("No se pudo cargar el artículo.", "error");
            console.error(err);
        }
    };

    // Delete Article Trigger
    window.deleteArticle = async function(id) {
        if (!confirm("¿Está seguro de que desea eliminar permanentemente este artículo?")) return;
        
        try {
            const response = await fetch(`/admin/article/delete/${id}`, {
                method: 'POST'
            });
            const result = await response.json();
            
            if (result.success) {
                showToast(result.message, 'success');
                // Remove row from table smoothly
                const row = document.getElementById(`article-row-${id}`);
                if (row) {
                    row.style.transition = 'all 0.4s ease';
                    row.style.opacity = '0';
                    row.style.transform = 'scale(0.9)';
                    setTimeout(() => row.remove(), 400);
                }
            } else {
                showToast(result.message, 'error');
            }
        } catch (err) {
            showToast("Error al intentar eliminar el artículo.", "error");
            console.error(err);
        }
    };

    // --- User Roles Live Change handler ---
    const roleSelects = document.querySelectorAll('.role-select');
    
    roleSelects.forEach(select => {
        select.addEventListener('change', async () => {
            const userId = select.getAttribute('data-user-id');
            const newRole = select.value;
            
            const formData = new FormData();
            formData.append('user_id', userId);
            formData.append('role', newRole);
            
            try {
                const response = await fetch('/admin/users/role', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                
                if (result.success) {
                    showToast(result.message, 'success');
                } else {
                    showToast(result.message, 'error');
                    // Reset to previous value on failure
                    window.location.reload();
                }
            } catch (err) {
                showToast("Error al actualizar el rol de usuario.", "error");
                console.error(err);
            }
        });
    });

    // --- Simulated Mailbox dynamic update ---
    async function refreshMockMailbox() {
        const mailList = document.getElementById('mailbox-list-container');
        if (!mailList) return;
        
        try {
            const response = await fetch('/api/mock-emails');
            const emails = await response.json();
            
            if (emails.length === 0) {
                mailList.innerHTML = `<div style="text-align:center;padding:2rem;color:#64748b;font-style:italic;">No hay correos en el buzón virtual de Gmail en este momento.</div>`;
                return;
            }
            
            mailList.innerHTML = emails.reverse().map(mail => `
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
            
        } catch (err) {
            console.error("Error fetching mock mailbox", err);
        }
    }
    
    // Auto-update mailbox if it exists every 10 seconds
    if (document.getElementById('mailbox-list-container')) {
        setInterval(refreshMockMailbox, 10000);
    }
});
