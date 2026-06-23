const express = require('express');
const pool = require('./db');
// Direcciones de controladores de rutas
const authRoutes = require('./routes/authRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const comentarioRoutes = require('./routes/comentarioRoutes');

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
app.use('/api/comentarios',comentarioRoutes);

// ==========================================
//  FUNCION DE PRUEBA RÁPIDA (AUTOMÁTICA V4)  - Flujo completo -validacion middleware 
// ==========================================
const ejecutarPruebaCompleta = async () => {
  try {
    console.log("\n Ejecutando pruebas automaticas: Flujo completo");
    
    const nombrePrueba = "Usuario Test";
    const correoPrueba = "test@vialnl.com";
    const passwordPrueba = "password123";

    // 1. Registro / verificacion de usuario
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
      console.log("   [REGISTRO] El usuario de prueba ya existía en la BD.");
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
    
    let reporteID;
      try{
        const datosDescifrados = jwt.verify(tokenReal, 'mi_clave_secreta_super_segura_123');
        const nuevoReporteSeguro = await pool.query(
          'INSERT INTO reportes (usuario_id, tipo, ubicacion, descripcion, imagen_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [
            datosDescifrados.id,
            'Trafico pesado',
            'Avenida constitucion',
            'Trafico detenido por obras en la via principal',
            'http://imagen-ejemplo.com/accidente1.jpg'
          ]
        );
        reporteID = nuevoReporteSeguro.rows[0].id;// Guardamos el ID para usarlo en el comentario
        console.log(`   [REPORTE] Creado con exito. ID asignado: ${reporteID}`);
      }
      catch (err) {
        console.log(" [REPORTE ERROR] Fallo la creacion", err.message);
      }

      // NUEVA PRUEBA: instertar un comentario al reporte creado
    
      console.log("... Simulando envio de un comentario protegido por Middleware...");

      try{
        const datosDescifrados = jwt.verify(tokenReal, 'mi_clave_secreta_super_segura_123');
        
        const nuevoComentario = await pool.query(
          'INSERT INTO comentarios (reporte_id, usuario_id, texto) VALUES ($1, $2, $3) RETURNING *',
          [
            reporteID,            //Atado al reporte creado
            datosDescifrados.id,  //Extraido del token
            'Confirmo el reporte, llevo 20 minuts varado aqui. Tomen rutas alternas'
          ]
        );
        console.log(" [COMENTARIO EXITO] Comentario guardado fisicamente:");
        console.log(`     ID: ${nuevoComentario.rows[0].id} | Contenido: "${nuevoComentario.rows[0].texto}"`);
      }
      catch (err) {
        console.log("[COMENTARIO ERROR] El Middleware o la BD rebotaron el comentario Motivo: ",err.message);
      }

    // NUEVA PRUEBA: Leer comentarios de un reporte (simulacion de feed publico)
    console.log(`...Consultando la BD para traer comentarios del Reporte ID: ${reporteID}...`);
    try{
      const consultaComentarios = await pool.query(
        `SELECT c.*, u.nombre AS autor FROM comentarios c INNER JOIN usuarios u ON c.usuario_id = u.id WHERE c.reporte_id = $1`,
        [reporteID]
      );
      console.log(`   [FEED COMENTARIOS] Se encontraron ${consultaComentarios.rows.length} comentarios para este reporte:`);
      console.log(consultaComentarios.rows);
    }
    catch (err){
      console.log("   [FEED COMENTARIOS ERROR] No se pudieron leer: ",error.message);
    }

    console.log(" FIN DE LAS PRUEBAS DE SEGURIDAD Y FLUJO COMPLETO\n");
  }
  catch (error) {
    console.error(" [ERROR GENERAL EN LA PRUEBA]: ", error.message);
  }
};
// ==========================================

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  ejecutarPruebaCompleta(); // <-- Ejecuta la prueba de login y JWT
});