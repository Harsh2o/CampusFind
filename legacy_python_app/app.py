from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify, send_from_directory
import os
import pandas as pd
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import uuid
import datetime
import json
from flask_mail import Mail, Message

app = Flask(__name__)
app.secret_key = os.urandom(24)

# Configuration
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create upload directory if it doesn't exist
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Initialize CSV files if they don't exist
def init_csv_files():
    # Users CSV
    if not os.path.exists('data/users.csv'):
        if not os.path.exists('data'):
            os.makedirs('data')
        pd.DataFrame({
            'id': [],
            'username': [],
            'email': [],
            'password': [],
            'is_admin': []
        }).to_csv('data/users.csv', index=False)
    
    # Lost Items CSV
    if not os.path.exists('data/lost_items.csv'):
        pd.DataFrame({
            'id': [],
            'name': [],
            'category': [],
            'date_lost': [],
            'location': [],
            'description': [],
            'contact_info': [],
            'image_path': [],
            'report_date': [],
            'user_id': []
        }).to_csv('data/lost_items.csv', index=False)
    
    # Found Items CSV
    if not os.path.exists('data/found_items.csv'):
        pd.DataFrame({
            'id': [],
            'name': [],
            'category': [],
            'date_found': [],
            'location': [],
            'description': [],
            'contact_info': [],
            'image_path': [],
            'report_date': [],
            'item_status': [],
            'user_id': []
        }).to_csv('data/found_items.csv', index=False)

# Initialize database on startup
init_csv_files()

# Add an admin user if no users exist
def create_admin_if_needed():
    users_df = pd.read_csv('data/users.csv')
    if len(users_df) == 0:
        # Create default admin user
        admin_user = {
            'id': str(uuid.uuid4()),
            'username': 'admin',
            'email': 'admin@campusfind.com',
            'password': generate_password_hash('admin123'),
            'is_admin': True
        }
        users_df = pd.concat([users_df, pd.DataFrame([admin_user])], ignore_index=True)
        users_df.to_csv('data/users.csv', index=False)
        print("Created default admin user. Username: admin, Password: admin123")

create_admin_if_needed()

# Helper functions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file):
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Add timestamp to ensure unique filenames
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        unique_filename = f"{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        return filepath.replace("\\", "/").strip()
    return None

# Decorators for authentication
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page', 'error')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page', 'error')
            return redirect(url_for('login'))
        
        users_df = pd.read_csv('data/users.csv')
        user = users_df[users_df['id'] == session['user_id']]
        
        if len(user) == 0 or not user.iloc[0]['is_admin']:
            flash('You do not have permission to access this page', 'error')
            return redirect(url_for('index'))
            
        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        users_df = pd.read_csv('data/users.csv')
        user = users_df[users_df['username'] == username]
        
        if len(user) > 0 and check_password_hash(user.iloc[0]['password'], password):
            session['user_id'] = user.iloc[0]['id']
            session['username'] = username
            session['is_admin'] = bool(user.iloc[0]['is_admin'])
            flash('Login successful!', 'success')
            return redirect(url_for('index'))
        
        flash('Invalid username or password', 'error')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        users_df = pd.read_csv('data/users.csv')
        
        # Check if username already exists
        if len(users_df[users_df['username'] == username]) > 0:
            flash('Username already exists', 'error')
            return render_template('register.html')
        
        # Create new user
        new_user = {
            'id': str(uuid.uuid4()),
            'username': username,
            'email': email,
            'password': generate_password_hash(password),
            'is_admin': False
        }
        
        users_df = pd.concat([users_df, pd.DataFrame([new_user])], ignore_index=True)
        users_df.to_csv('data/users.csv', index=False)
        
        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out', 'info')
    return redirect(url_for('index'))

@app.route('/report_lost', methods=['GET', 'POST'])
@login_required
def report_lost():
    if request.method == 'POST':
        item_name = request.form.get('item-name')
        category = request.form.get('item-category')
        lost_date = request.form.get('lost-date')
        location = request.form.get('lost-location')
        description = request.form.get('item-description')
        contact_info = request.form.get('contact-info')
        
        # Handle file upload
        image_path = None
        if 'item-photo' in request.files:
            file = request.files['item-photo']
            image_path = save_file(file)
        
        lost_items_df = pd.read_csv('data/lost_items.csv')
        
        # Create new lost item entry
        new_item = {
            'id': str(uuid.uuid4()),
            'name': item_name,
            'category': category,
            'date_lost': lost_date,
            'location': location,
            'description': description,
            'contact_info': contact_info,
            'image_path': image_path,
            'report_date': datetime.datetime.now().strftime("%Y-%m-%d"),
            'user_id': session['user_id']
        }
        
        lost_items_df = pd.concat([lost_items_df, pd.DataFrame([new_item])], ignore_index=True)
        lost_items_df.to_csv('data/lost_items.csv', index=False)
        
        flash('Your lost item report has been successfully submitted!', 'success')
        return redirect(url_for('index'))
    
    return render_template('report_lost.html')

@app.route('/report_found', methods=['GET', 'POST'])
@login_required
def report_found():
    if request.method == 'POST':
        item_name = request.form.get('found-item-name')
        category = request.form.get('found-item-category')
        found_date = request.form.get('found-date')
        location = request.form.get('found-location')
        description = request.form.get('found-item-description')
        contact_info = request.form.get('finder-contact-info')
        item_status = request.form.get('item-status')
        
        # Handle file upload
        image_path = None
        if 'found-item-photo' in request.files:
            file = request.files['found-item-photo']
            image_path = save_file(file)
        
        found_items_df = pd.read_csv('data/found_items.csv')
        
        # Create new found item entry
        new_item = {
            'id': str(uuid.uuid4()),
            'name': item_name,
            'category': category,
            'date_found': found_date,
            'location': location,
            'description': description,
            'contact_info': contact_info,
            'image_path': image_path,
            'report_date': datetime.datetime.now().strftime("%Y-%m-%d"),
            'item_status': item_status,
            'user_id': session['user_id']
        }
        
        found_items_df = pd.concat([found_items_df, pd.DataFrame([new_item])], ignore_index=True)
        found_items_df.to_csv('data/found_items.csv', index=False)
        
        flash('Your found item report has been successfully submitted!', 'success')
        return redirect(url_for('index'))
    
    return render_template('report_found.html')

@app.route('/browse')
def browse():
    # Get items data
    lost_items_df = pd.read_csv('data/lost_items.csv')
    found_items_df = pd.read_csv('data/found_items.csv')
    
    # Convert to dictionaries for easy serialization
    lost_items = lost_items_df.to_dict(orient='records')
    found_items = found_items_df.to_dict(orient='records')
    
    return render_template('browse.html', lost_items=lost_items, found_items=found_items)

@app.route('/admin')
@admin_required
def admin():
    # Get all items data
    lost_items_df = pd.read_csv('data/lost_items.csv')
    found_items_df = pd.read_csv('data/found_items.csv')
    users_df = pd.read_csv('data/users.csv')
    
    # Convert to dictionaries
    lost_items = lost_items_df.to_dict(orient='records')
    found_items = found_items_df.to_dict(orient='records')
    users = users_df.to_dict(orient='records')
    
    return render_template('admin.html', lost_items=lost_items, found_items=found_items, users=users)

@app.route('/admin/delete/lost/<item_id>', methods=['POST'])
@admin_required
def delete_lost_item(item_id):
    lost_items_df = pd.read_csv('data/lost_items.csv')
    
    # Get the item for image deletion
    item_to_delete = lost_items_df[lost_items_df['id'] == item_id]
    
    # Delete image file if exists
    if len(item_to_delete) > 0 and pd.notna(item_to_delete.iloc[0]['image_path']):
        try:
            image_path = item_to_delete.iloc[0]['image_path']
            if os.path.exists(image_path):
                os.remove(image_path)
        except Exception as e:
            print(f"Error deleting image: {e}")
    
    # Filter out the item to delete
    lost_items_df = lost_items_df[lost_items_df['id'] != item_id]
    lost_items_df.to_csv('data/lost_items.csv', index=False)
    
    flash('Lost item deleted successfully', 'success')
    return redirect(url_for('admin'))

@app.route('/admin/delete/found/<item_id>', methods=['POST'])
@admin_required
def delete_found_item(item_id):
    found_items_df = pd.read_csv('data/found_items.csv')
    
    # Get the item for image deletion
    item_to_delete = found_items_df[found_items_df['id'] == item_id]
    
    # Delete image file if exists
    if len(item_to_delete) > 0 and pd.notna(item_to_delete.iloc[0]['image_path']):
        try:
            image_path = item_to_delete.iloc[0]['image_path']
            if os.path.exists(image_path):
                os.remove(image_path)
        except Exception as e:
            print(f"Error deleting image: {e}")
    
    # Filter out the item to delete
    found_items_df = found_items_df[found_items_df['id'] != item_id]
    found_items_df.to_csv('data/found_items.csv', index=False)
    
    flash('Found item deleted successfully', 'success')
    return redirect(url_for('admin'))

@app.route('/api/items/lost')
def api_lost_items():
    lost_items_df = pd.read_csv('data/lost_items.csv')
    lost_items = lost_items_df.to_dict(orient='records')
    return jsonify(lost_items)

@app.route('/api/items/found')
def api_found_items():
    found_items_df = pd.read_csv('data/found_items.csv')
    found_items = found_items_df.to_dict(orient='records')
    return jsonify(found_items)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Email configuration (Gmail example)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'aniketsinghal876@gmail.com'
app.config['MAIL_PASSWORD'] = 'kavsvnxumausqjie'  # Use App password if using Gmail
app.config['MAIL_DEFAULT_SENDER'] = 'aniketsinghal876@gmail.com'

mail = Mail(app)

@app.route('/send-email', methods=['POST'])
def send_email():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'success': False, 'message': 'Email is required'}), 400

    try:
        msg = Message('Item Found Notification',
                      recipients=[email],
                      body='Your item has been found! Please collect it from the Lost and Found Desk.')
        mail.send(msg)
        return jsonify({'success': True, 'message': 'Email sent successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 