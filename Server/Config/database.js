// Cargar las variables de entorno desde el archivo .env
require('dotenv').config();

// Importar el módulo mysql
const mysql = require('mysql');

// Configurar la conexión a la base de datos dependiendo del entorno
const isProduction = process.env.NODE_ENV === 'production';

const dbConfig = {
    host: isProduction ? process.env.DB_HOST_SERVER : process.env.DB_HOST_LOCAL,
    user: isProduction ? process.env.DB_USER_SERVER : process.env.DB_USER_LOCAL,
    password: isProduction ? process.env.DB_PASS_SERVER : process.env.DB_PASS_LOCAL,
    database: isProduction ? process.env.DB_NAME_SERVER : process.env.DB_NAME_LOCAL
};

const db = mysql.createConnection(dbConfig);

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
    } else {
        console.log('Conexión exitosa a la base de datos');
    }
});

// Exportar la conexión para poder utilizarla en otros archivos
module.exports = db;
