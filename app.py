import os
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
import database

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "super-secret-key-change-in-production")

# Ensure database is initialized on startup
database.init_db()

# In-memory store for mock emails so they are easily displayed in the dashboard
MOCK_EMAILS = []

def send_verification_email(recipient, code):
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = os.getenv("SMTP_PORT", "587")
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    # Store in mock emails list for visual preview in dev mode
    mock_entry = {
        "to": recipient,
        "code": code,
        "subject": "Verifica tu cuenta - Blog Tecnológico",
        "body": f"Tu código de verificación de 6 dígitos es: {code}",
        "timestamp": "Recién enviado"
    }
    MOCK_EMAILS.append(mock_entry)
    
    # Keep only the latest 10 mock emails
    if len(MOCK_EMAILS) > 10:
        MOCK_EMAILS.pop(0)

    if not smtp_user or not smtp_password:
        print(f"[SIMULATION] Verification email for {recipient} with code: {code}")
        return False  # Simulated
        
    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = recipient
        msg['Subject'] = "Verifica tu cuenta - Blog Tecnológico"
        
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #0f0c1b; color: #ffffff; padding: 25px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #1a162e; padding: 30px; border-radius: 10px; border: 1px solid #7c3aed; box-shadow: 0 4px 20px rgba(124, 58, 237, 0.15);">
                    <h2 style="color: #c084fc; text-align: center; margin-bottom: 20px;">¡Bienvenido a Blog Tecnológico!</h2>
                    <p style="font-size: 16px; line-height: 1.5; color: #e2e8f0;">Para completar tu registro, ingresa el siguiente código de verificación de 6 dígitos en la aplicación:</p>
                    <div style="background-color: #2e1065; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0; border: 1px solid #c084fc;">
                        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #f43f5e; font-family: monospace;">{code}</span>
                    </div>
                    <p style="font-size: 14px; color: #94a3b8; text-align: center;">Este código es de un solo uso. Si no solicitaste este registro, puedes ignorar este correo de forma segura.</p>
                </div>
            </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))
        
        server = smtplib.SMTP(smtp_server, int(smtp_port))
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, recipient, msg.as_string())
        server.quit()
        print(f"Real verification email sent to {recipient}")
        return True
    except Exception as e:
        print(f"Error sending real email via SMTP: {e}")
        return False

# Middleware: check user role helper
def check_role(allowed_roles):
    if 'user_id' not in session:
        return False
    return session.get('role') in allowed_roles

@app.context_processor
def inject_user():
    return dict(
        logged_in=('user_id' in session),
        user_email=session.get('email'),
        user_role=session.get('role'),
        user_verified=session.get('is_verified')
    )

# --- Routes ---

# 1. Main blog page
@app.route('/')
def index():
    query = request.args.get('q', '').strip()
    category = request.args.get('category', '').strip()
    
    conn = database.get_db_connection()
    
    sql = """
        SELECT a.*, u.email as author_email, u.photo_url as author_photo 
        FROM articles a 
        JOIN users u ON a.author_id = u.id
    """
    params = []
    conditions = []
    
    if query:
        conditions.append("(a.title LIKE ? OR a.content LIKE ? OR a.summary LIKE ?)")
        params.extend([f"%{query}%", f"%{query}%", f"%{query}%"])
    if category:
        conditions.append("a.category = ?")
        params.append(category)
        
    if conditions:
        sql += " WHERE " + " AND ".join(conditions)
        
    sql += " ORDER BY a.created_at DESC"
    
    articles = conn.execute(sql, params).fetchall()
    conn.close()
    
    return render_template('index.html', articles=articles, query=query, category=category)

# 2. View article
@app.route('/article/<int:id>')
def view_article(id):
    conn = database.get_db_connection()
    article = conn.execute("""
        SELECT a.*, u.email as author_email 
        FROM articles a 
        JOIN users u ON a.author_id = u.id 
        WHERE a.id = ?
    """, (id,)).fetchone()
    conn.close()
    
    if not article:
        flash("El artículo solicitado no existe.", "error")
        return redirect(url_for('index'))
        
    return render_template('article.html', article=article)

# 3. Login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'user_id' in session:
        return redirect(url_for('index'))
        
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        
        if not email or not password:
            flash("Por favor rellene todos los campos.", "error")
            return render_template('login.html')
            
        conn = database.get_db_connection()
        user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        conn.close()
        
        if user and check_password_hash(user['password_hash'], password):
            if not user['is_verified']:
                session['temp_user_id'] = user['id']
                session['temp_email'] = user['email']
                flash("Tu cuenta aún no está verificada. Por favor introduce tu código de verificación.", "warning")
                return redirect(url_for('verify'))
                
            session['user_id'] = user['id']
            session['email'] = user['email']
            session['role'] = user['role']
            session['is_verified'] = user['is_verified']
            
            flash(f"¡Bienvenido de nuevo, {email}!", "success")
            if user['role'] in ['Admin', 'Editor']:
                return redirect(url_for('admin_panel'))
            return redirect(url_for('index'))
        else:
            flash("Credenciales incorrectas.", "error")
            
    return render_template('login.html')

# 4. Register
@app.route('/register', methods=['GET', 'POST'])
def register():
    if 'user_id' in session:
        return redirect(url_for('index'))
        
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        
        if not email or not password:
            flash("Por favor rellene todos los campos.", "error")
            return render_template('register.html')
            
        # Verify length/strength (basic)
        if len(password) < 6:
            flash("La contraseña debe tener al menos 6 caracteres.", "error")
            return render_template('register.html')
            
        conn = database.get_db_connection()
        user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        
        if user:
            conn.close()
            flash("Este correo electrónico ya está registrado.", "error")
            return render_template('register.html')
            
        # Generate verification code
        code = str(random.randint(100000, 999999))
        password_hash = generate_password_hash(password)
        
        try:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO users (email, password_hash, role, is_verified, verification_code)
                VALUES (?, ?, 'Reader', 0, ?)
            ''', (email, password_hash, code))
            user_id = cursor.lastrowid
            conn.commit()
            
            # Send verification email
            is_real = send_verification_email(email, code)
            
            session['temp_user_id'] = user_id
            session['temp_email'] = email
            
            if is_real:
                flash("Se ha enviado un correo con tu código de verificación a Gmail.", "success")
            else:
                flash(f"[Simulación] Código generado: {code}. Ingrésalo para verificar.", "success")
                
            conn.close()
            return redirect(url_for('verify'))
        except Exception as e:
            conn.close()
            flash(f"Error al registrar la cuenta: {e}", "error")
            
    return render_template('register.html')

# 5. Verify email code
@app.route('/verify', methods=['GET', 'POST'])
def verify():
    if 'user_id' in session:
        return redirect(url_for('index'))
        
    temp_user_id = session.get('temp_user_id')
    temp_email = session.get('temp_email')
    
    if not temp_user_id:
        flash("Acceso no autorizado.", "error")
        return redirect(url_for('login'))
        
    if request.method == 'POST':
        code = request.form.get('code', '').strip()
        
        conn = database.get_db_connection()
        user = conn.execute("SELECT * FROM users WHERE id = ?", (temp_user_id,)).fetchone()
        
        if user and user['verification_code'] == code:
            conn.execute("UPDATE users SET is_verified = 1, verification_code = NULL WHERE id = ?", (temp_user_id,))
            conn.commit()
            
            # Log the user in
            session['user_id'] = user['id']
            session['email'] = user['email']
            session['role'] = user['role']
            session['is_verified'] = 1
            
            # Clear temporary session vars
            session.pop('temp_user_id', None)
            session.pop('temp_email', None)
            
            conn.close()
            flash("¡Cuenta verificada exitosamente! Bienvenido.", "success")
            return redirect(url_for('index'))
        else:
            conn.close()
            flash("Código de verificación incorrecto.", "error")
            
    return render_template('verify.html', temp_email=temp_email)

# 6. Logout
@app.route('/logout')
def logout():
    session.clear()
    flash("Sesión cerrada.", "success")
    return redirect(url_for('index'))

# 7. Admin Panel
@app.route('/admin')
def admin_panel():
    if not check_role(['Admin', 'Editor']):
        flash("Acceso denegado. No tienes permisos suficientes.", "error")
        return redirect(url_for('index'))
        
    conn = database.get_db_connection()
    
    # Get all articles
    articles = conn.execute("""
        SELECT a.*, u.email as author_email 
        FROM articles a 
        JOIN users u ON a.author_id = u.id 
        ORDER BY a.created_at DESC
    """).fetchall()
    
    # Get all users (for Admin role management)
    users = []
    if session.get('role') == 'Admin':
        users = conn.execute("SELECT id, email, role, is_verified, created_at FROM users ORDER BY created_at DESC").fetchall()
        
    conn.close()
    
    # Find pre-existing mock email if any
    return render_template('admin.html', articles=articles, users=users, mock_emails=MOCK_EMAILS)

# 8. Create Article
@app.route('/admin/article/create', methods=['POST'])
def create_article():
    if not check_role(['Admin', 'Editor']):
        return jsonify({"success": False, "message": "No autorizado"}), 403
        
    title = request.form.get('title', '').strip()
    summary = request.form.get('summary', '').strip()
    category = request.form.get('category', '').strip()
    content = request.form.get('content', '').strip()
    image_url = request.form.get('image_url', '').strip()
    
    if not title or not summary or not category or not content:
        return jsonify({"success": False, "message": "Por favor, completa todos los campos requeridos."}), 400
        
    if not image_url:
        # Default fallback technology images
        cat_images = {
            "IA": "https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600&auto=format&fit=crop",
            "Software": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop",
            "Hardware": "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop",
            "Ciberseguridad": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop"
        }
        image_url = cat_images.get(category, "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop")
        
    conn = database.get_db_connection()
    try:
        conn.execute("""
            INSERT INTO articles (title, summary, category, content, image_url, author_id)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (title, summary, category, content, image_url, session['user_id']))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Artículo creado con éxito."})
    except Exception as e:
        conn.close()
        return jsonify({"success": False, "message": f"Error en la base de datos: {e}"}), 500

# 9. Get Article details for editing
@app.route('/admin/article/<int:id>', methods=['GET'])
def get_article(id):
    if not check_role(['Admin', 'Editor']):
        return jsonify({"success": False, "message": "No autorizado"}), 403
        
    conn = database.get_db_connection()
    article = conn.execute("SELECT * FROM articles WHERE id = ?", (id,)).fetchone()
    conn.close()
    
    if not article:
        return jsonify({"success": False, "message": "Artículo no encontrado."}), 404
        
    return jsonify({
        "success": True,
        "article": {
            "id": article['id'],
            "title": article['title'],
            "summary": article['summary'],
            "category": article['category'],
            "content": article['content'],
            "image_url": article['image_url']
        }
    })

# 10. Edit Article
@app.route('/admin/article/edit/<int:id>', methods=['POST'])
def edit_article(id):
    if not check_role(['Admin', 'Editor']):
        return jsonify({"success": False, "message": "No autorizado"}), 403
        
    title = request.form.get('title', '').strip()
    summary = request.form.get('summary', '').strip()
    category = request.form.get('category', '').strip()
    content = request.form.get('content', '').strip()
    image_url = request.form.get('image_url', '').strip()
    
    if not title or not summary or not category or not content:
        return jsonify({"success": False, "message": "Por favor, completa todos los campos requeridos."}), 400
        
    conn = database.get_db_connection()
    
    # Check if article exists and if current user is Admin OR the author of the post (optional, standard says admins/editors can edit)
    article = conn.execute("SELECT * FROM articles WHERE id = ?", (id,)).fetchone()
    if not article:
        conn.close()
        return jsonify({"success": False, "message": "Artículo no encontrado."}), 404
        
    try:
        conn.execute("""
            UPDATE articles 
            SET title = ?, summary = ?, category = ?, content = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (title, summary, category, content, image_url, id))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Artículo actualizado con éxito."})
    except Exception as e:
        conn.close()
        return jsonify({"success": False, "message": f"Error en la base de datos: {e}"}), 500

# 11. Delete Article
@app.route('/admin/article/delete/<int:id>', methods=['POST'])
def delete_article(id):
    if not check_role(['Admin', 'Editor']):
        return jsonify({"success": False, "message": "No autorizado"}), 403
        
    conn = database.get_db_connection()
    article = conn.execute("SELECT * FROM articles WHERE id = ?", (id,)).fetchone()
    if not article:
        conn.close()
        return jsonify({"success": False, "message": "Artículo no encontrado."}), 404
        
    try:
        conn.execute("DELETE FROM articles WHERE id = ?", (id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Artículo eliminado con éxito."})
    except Exception as e:
        conn.close()
        return jsonify({"success": False, "message": f"Error al eliminar: {e}"}), 500

# 12. Modify User Role (Admin only)
@app.route('/admin/users/role', methods=['POST'])
def change_role_route():
    if not check_role(['Admin']):
        return jsonify({"success": False, "message": "No autorizado. Solo los administradores pueden cambiar roles."}), 403
        
    user_id = request.form.get('user_id')
    new_role = request.form.get('role')
    
    if not user_id or new_role not in ['Reader', 'Editor', 'Admin']:
        return jsonify({"success": False, "message": "Parámetros inválidos."}), 400
        
    # Prevent admin from changing their own role (safeguard)
    if int(user_id) == session['user_id']:
        return jsonify({"success": False, "message": "No puedes cambiar tu propio rol por seguridad."}), 400
        
    conn = database.get_db_connection()
    try:
        conn.execute("UPDATE users SET role = ? WHERE id = ?", (new_role, user_id))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Rol actualizado correctamente."})
    except Exception as e:
        conn.close()
        return jsonify({"success": False, "message": f"Error al actualizar el rol: {e}"}), 500

# API to get all mock verification emails (for interactive GUI purposes)
@app.route('/api/mock-emails')
def get_mock_emails():
    return jsonify(MOCK_EMAILS)

if __name__ == '__main__':
    port = int(os.getenv("FLASK_PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    app.run(host='0.0.0.0', port=port, debug=debug)
