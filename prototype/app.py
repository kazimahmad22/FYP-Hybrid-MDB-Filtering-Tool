from flask import Flask, render_template, request, redirect, url_for, session, flash
from models import db, User
import os

app = Flask(__name__)

# Database Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + \
    os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'dev-secret-key'

db.init_app(app)


@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            if user.status == 'blocked':
                flash(
                    'Your account is blocked. Please contact the administrator.', 'danger')
                return render_template('login.html')

            session['user_id'] = user.id
            session['user_role'] = user.role
            return redirect(url_for('dashboard'))

        flash('Invalid email or password.', 'danger')
    return render_template('login.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        role = request.form.get('role')

        if User.query.filter_by(email=email).first():
            flash('Email already registered.', 'danger')
            return render_template('register.html')

        user = User(name=name, email=email, role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html')


@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    user = User.query.get(session['user_id'])
    users = []
    if user.role == 'admin':
        users = User.query.all()

    return render_template('dashboard.html', user=user, users=users)


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

# Admin specific actions


@app.route('/admin/toggle-status/<int:user_id>')
def toggle_status(user_id):
    if session.get('user_role') != 'admin':
        return redirect(url_for('dashboard'))

    user = User.query.get(user_id)
    if user:
        user.status = 'blocked' if user.status == 'active' else 'active'
        db.session.commit()
    return redirect(url_for('dashboard'))


@app.route('/admin/update-role/<int:user_id>', methods=['POST'])
def update_role(user_id):
    if session.get('user_role') != 'admin':
        return redirect(url_for('dashboard'))

    user = User.query.get(user_id)
    if user:
        user.role = request.form.get('role')
        db.session.commit()
    return redirect(url_for('dashboard'))


@app.route('/admin/delete-user/<int:user_id>')
def delete_user(user_id):
    if session.get('user_role') != 'admin':
        return redirect(url_for('dashboard'))

    user = User.query.get(user_id)
    if user and user.role != 'admin':
        db.session.delete(user)
        db.session.commit()
    return redirect(url_for('dashboard'))


@app.route('/admin/create-user', methods=['POST'])
def admin_create_user():
    if session.get('user_role') != 'admin':
        return redirect(url_for('dashboard'))

    name = request.form.get('name')
    email = request.form.get('email')
    password = request.form.get('password')
    role = request.form.get('role')

    if User.query.filter_by(email=email).first():
        flash('Email already exists.', 'danger')
    else:
        user = User(name=name, email=email, role=role, status='active')
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        flash('User created successfully.', 'success')

    return redirect(url_for('dashboard'))


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if not User.query.filter_by(role='admin').first():
            admin = User(name='Admin User',
                         email='admin@vu.edu.pk', role='admin')
            admin.set_password('password123')
            db.session.add(admin)
            db.session.commit()
            print("Admin created: admin@vu.edu.pk / password123")

    app.run(port=5000, debug=True)
