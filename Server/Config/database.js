// Importar el módulo mysql
const mysql = require('mysql');

// Configurar la conexión a la base de datos
// const db = mysql.createConnection({
//     host: 'localhost',          
//     user: 'root',              
//     password: '',              
//     database: 'chat-app'        
// });


const db = mysql.createConnection({
    host: 'srv960.hstgr.io',          
    user: 'u211881118_chat_app',              
    password: 'Vibradigital2023.',              
    database: 'u211881118_chat_app'        
});

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
