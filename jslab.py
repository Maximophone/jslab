# all the imports
import sqlite3
from flask import Flask, request, session, g, redirect, url_for, \
     abort, render_template, flash
from contextlib import closing

# configuration
DATABASE = '.\\tmp\\jslab.db'
DEBUG = True
SECRET_KEY = 'development key'
USERNAME = 'admin'
PASSWORD = 'default'

# create our little application :)
app = Flask(__name__)
app.config.from_object(__name__)

def connect_db():
    return sqlite3.connect(app.config['DATABASE'])

def init_db():
    with closing(connect_db()) as db:
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

@app.before_request
def before_request():
    g.db = connect_db()

@app.teardown_request
def teardown_request(exception):
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()

@app.route('/')
def index_page():
    return render_template('generic_page.html', experiment='')

@app.route('/ants')
def ants():
    return render_template('generic_page.html', experiment='js/ants.js')

@app.route('/lightengine')
def lightengine():
    return render_template('generic_page.html', experiment='js/lightengine.js')

@app.route('/physics2d')
def physics2d():
    return render_template('generic_page.html', experiment='js/2dphysics.js')

@app.route('/sphere')
def sphere():
    return render_template('generic_page.html', experiment='js/pixels.js')

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form['username'] != app.config['USERNAME']:
            error = 'Invalid username'
        elif request.form['password'] != app.config['PASSWORD']:
            error = 'Invalid password'
        else:
            session['logged_in'] = True
            flash('You were logged in')
            return redirect(url_for('show_entries'))
    return render_template('login.html', error=error)

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    flash('You were logged out')
    return redirect(url_for('show_entries'))

# @app.route('/users/<username>')
# @app.login_required
# def user(username):
# 	pass

if __name__ == '__main__':
    app.run()