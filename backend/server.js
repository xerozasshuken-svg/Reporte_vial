const express = require('express');
const pool = require('./db');
const authRoutes = require('./routes/authRoutes');
const bcrypt = require('bcrypt'); // <-- Importamos bcrypt para la prueba rápida

const app = express();
const PORT = 5000;

app.use(express.json());

// Ruta de prueba de la base de datos
app.get('/api/prueba-bd', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ mensaje: "¡Conexión exitosa al Backend y a PostgreSQL!", horaServidor: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error conectando a la base de datos");
  }
});

// Enlazar las rutas de autenticación
app.use('/api/auth', authRoutes);

// ==========================================
//  FUNCION DE PRUEBA RÁPIDA (AUTOMÁTICA V2)
// ==========================================
const ejecutarPruebaCompleta = async () => {
  try {
    console.log("... Ejecutando pruebas automáticas de Autenticación ...");
    
    const nombrePrueba = "Usuario Test";
    const correoPrueba = "test@vialnl.com";
    const passwordPrueba = "password123";

    // 1. Simulación o verificación de Registro
    const existe = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correoPrueba]);
    let usuarioBD;

    if (existe.rows.length === 0) {
      const saltRounds = 10;
      const hash = await bcrypt.hash(passwordPrueba, saltRounds);
      const resultado = await pool.query(
        'INSERT INTO usuarios (nombre, correo, password) VALUES ($1, $2, $3) RETURNING id, nombre, correo',
        [nombrePrueba, correoPrueba, hash]
      );
      usuarioBD = resultado.rows[0];
      console.log("   [REGISTRO] Nuevo usuario de prueba creado.");
    } else {
      usuarioBD = existe.rows[0];
      console.log("   [REGISTRO] El usuario de prueba ya existía.");
    }

    // 2. Simulación de LOGIN e inicio de sesión con JWT
    console.log("... Iniciando simulación de Login con JWT ...");
    
    // Buscamos las credenciales del usuario de prueba
    const passwordCorrecta = await bcrypt.compare(passwordPrueba, usuarioBD.password);
    
    if (passwordCorrecta) {
      // Generamos el token tal como lo hace el controlador
      const jwt = require('jsonwebtoken');
      const tokenPrueba = jwt.sign(
        { id: usuarioBD.id, nombre: usuarioBD.nombre }, 
        'mi_clave_secreta_super_segura_123', 
        { expiresIn: '2h' }
      );

      console.log("   [LOGIN ÉXITO] ¡Contraseña validada correctamente con Bcrypt!");
      console.log("   [JWT GENERADO] Aquí tienes tu Token de acceso de prueba:\n\n", tokenPrueba, "\n");
      console.log("   [INFO] Este string largo es el que el Frontend guardará para hacer reportes.");
    } else {
      console.log("   [LOGIN ERROR] No se pudo validar la contraseña.");
    }

  } catch (error) {
    console.error("   [ERROR EN LA PRUEBA]:", error.message);
  }
};
// ==========================================

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  ejecutarPruebaCompleta(); // <-- Ejecuta la prueba de login y JWT
});