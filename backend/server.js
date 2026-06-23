const express = require('express');
const pool = require('./db');
// Direcciones de controladores de rutas
const authRoutes = require('./routes/authRoutes');
const reporteRoutes = require('./routes/reporteRoutes');

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
app.use('/api/reportes', reporteRoutes);

// ==========================================
//  FUNCION DE PRUEBA RÁPIDA (AUTOMÁTICA V3) - validacion middleware
// ==========================================
const ejecutarPruebaCompleta = async () => {
  try {
    console.log("\n Ejecutando pruebas automáticas de Autenticación , Middleware ...");
    
    const nombrePrueba = "Usuario Test";
    const correoPrueba = "test@vialnl.com";
    const passwordPrueba = "password123";

    // 1. Simulación de registro / verificacion de usuario
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
    } 
    else {
      usuarioBD = existe.rows[0];
      console.log("   [REGISTRO] El usuario de prueba ya existía.");
    }

    // 2. Simulación de LOGIN para obtener el Token JWT real
    console.log("... Iniciando simulación para obtener Token JWT ...");
    
    // Buscamos las credenciales del usuario de prueba
    const passwordCorrecta = await bcrypt.compare(passwordPrueba, usuarioBD.password);
    
    if (!passwordCorrecta) {
      console.log(" [LOGIN ERROR] Contrasela incorrecta");
        return;
    }
    //Creacion de token identico a como lo ahce el controlador de login
      const jwt = require('jsonwebtoken');
      const tokenReal = jwt.sign(
        { id: usuarioBD.id, nombre: usuarioBD.nombre }, 
        'mi_clave_secreta_super_segura_123', 
        { expiresIn: '2h' }
      );

    console.log("   [LOGIN ÉXITO] Token JWT generado correctamente.");

    // Prueba del Middleware
    console.log("...Enviando reporte simulando el Middleware...");

  //Simulacion A: que pasa si enviamos los datos con el token correcto
    
    //Simulamos lo que hace el middleware internamente
    try{
      //Middleware descifra el token
      const datosDescifrados = jwt.verify(tokenReal, 'mi_clave_secreta_super_segura_123');
      
      // Si pasa, el controlador ejecuta el INSERT de forma segura (sin pedir usario_id al cliente)
      const nuevoReporteSeguro = await pool.query(
        'INSERT INTO reportes (usuario_id, tipo, ubicacion, descripcion, imagen_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [
          datosDescifrados.id,
          'Trafico pesado',
          'Estacionamiento de la UT',
          'Chocaron w coches de estudiantes debido a la lluvia',
          'http://imagen-ejemplo.com/accidente1.jpg'
        ]
      );
      console.log("[TEST A EXITO] El Middleware valido el token. Reporte creado");
      console.log("     Reporte ID: ", nuevoReporteSeguro.rows[0].id, "| Creado por usuario ID: ", nuevoReporteSeguro.rows[0].usuario_id);
    }
    catch (err) {
      console.log(" [TEST A ERROR] El Middleware reboto un token que debia ser valido:", err.message);
    }

  // Simulacion B: que pasa si alguien intenta hackear o enviar un Token falso/vacio
    
    console.log("... Probando intento de hackeo (Token Falso)...");

    const tokenFalso = "un_token_inventado_malicioso_xyz";
    try{
      //El Midleware intenta verificar el token falso
      jwt.verify(tokenFalso, 'mi_clave_secreta_super_segura_123');
      console.log(" [TEST B FALLA] ALERTA, el sistema dejo pasar un token falso");
    }
    catch (err) {
      console.log("[PRUEBA B EXITO] El Middleware bloqueo el acceso correctamente. Motivo: ",err.message);
    }

    console.log("FIN DE LAS PRUEBAS DE SEGURIDAD");

  }
  catch (error){
    console.error("   [ERROR GENERAL EN LA PRUEBA]: ",error.message);
  }
};
// ==========================================

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  ejecutarPruebaCompleta(); // <-- Ejecuta la prueba de login y JWT
});