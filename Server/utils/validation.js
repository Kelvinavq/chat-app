// Función para validar un correo electrónico
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Función para validar una contraseña
const validatePassword = (password) => {
};

module.exports = { validateEmail, validatePassword };
