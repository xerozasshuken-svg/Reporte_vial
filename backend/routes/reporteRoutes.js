const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

// Ruta para crear reporte: POST http://localhost:5000/api/reportes
router.post('/', reporteController.crearReporte);

// Ruta para ver todos los reportes: GET http://localhos:5000/api/reportes
router.get('/', reporteController.obtenerTodosLosReportes);

module.exports = router;