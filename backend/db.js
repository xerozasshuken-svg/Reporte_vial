const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',              // Cámbialo si tu usuario de Postgres es diferente
  host: 'localhost',
  database: 'reportes_viales_db', // El nombre exacto de la base de datos que creaste en pgAdmin
  password: '......', // Pon aquí la contraseña real de tu PostgreSQL
  port: 5432,
});

module.exports = pool;
