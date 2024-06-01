const mysql = require('mysql');

const dbConfig = {
    host: 'srv960.hstgr.io',
    user: 'u211881118_chat_app',
    password: 'Vibradigital2023.',
    database: 'u211881118_chat_app'
};

let connection;

function handleDisconnect() {
    connection = mysql.createConnection(dbConfig);

    connection.connect(err => {
        if (err) {
            console.error('Error al conectar a la base de datos:', err);
            setTimeout(handleDisconnect, 2000); // Intentar reconectar después de 2 segundos
        } else {
            console.log('Conexión exitosa a la base de datos');
        }
    });

    connection.on('error', err => {
        console.error('Error en la conexión a la base de datos:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
            handleDisconnect(); // Reconectar en caso de pérdida de conexión
        } else {
            throw err;
        }
    });
}

handleDisconnect();

module.exports = connection;
