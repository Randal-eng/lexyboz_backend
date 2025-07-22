const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',  // Configura según tu proveedor de email
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendResetEmail = async (email, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Restablecimiento de Contraseña - Lexyboz',
        html: `
            <h1>Restablecimiento de Contraseña</h1>
            <p>Has solicitado restablecer tu contraseña.</p>
            <p>Haz clic en el siguiente enlace para continuar (el enlace expira en 1 hora):</p>
            <a href="${resetUrl}">Restablecer Contraseña</a>
            <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error('Error al enviar el correo de restablecimiento');
    }
};

module.exports = {
    sendResetEmail
};
