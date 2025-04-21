// server.js – Paso 3: Implementar roles admin/usuario

const express = require('express');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

dotenv.config();
const app = express();

// Correo quemado del admin
const ADMIN_EMAIL = 'ositojiatas@gmail.com';

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesión
app.use(session({
  secret: 'supersecreto',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Estrategia de Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Ruta de inicio (login)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar OAuth con Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback de Google y redirección por rol
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const userEmail = req.user.emails[0].value;
    if (userEmail === ADMIN_EMAIL) {
      res.redirect('/admin');
    } else {
      res.redirect('/dashboard');
    }
  }
);

// Panel Admin
app.get('/admin', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Panel Usuario
app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Logout
app.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
