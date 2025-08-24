const nodemailer = require('nodemailer');

// Configuración simple de Gmail - lo que funcionaba antes
const gmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

const sendResetEmail = async (email, resetToken) => {
    if (!email || !email.includes('@')) {
        throw new Error('Correo electrónico inválido');
    }

    const resetUrl = `${process.env.FRONTEND_ORIGIN}/reset-password/${resetToken}`;
    
    const mailOptions = {
        from: `"Lexyboz Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Restablecimiento de Contraseña - Lexyboz',
        html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <div style="background-color: #4a90e2; color: white; padding: 20px; text-align: center;">
                    <h1>Restablecimiento de Contraseña</h1>
                </div>
                <div style="padding: 20px; background-color: #f9f9f9;">
                    <p>Has solicitado restablecer tu contraseña en Lexyboz.</p>
                    <p>Haz clic en el siguiente botón para crear una nueva contraseña (el enlace expira en 1 hora):</p>
                    <p style="text-align: center;">
                        <a href="${resetUrl}" 
                           style="display: inline-block; padding: 10px 20px; background-color: #4a90e2; 
                                  color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                            Restablecer Contraseña
                        </a>
                    </p>
                    <p><strong>¿No solicitaste este cambio?</strong></p>
                    <p>Si no solicitaste restablecer tu contraseña, ignora este correo. Tu cuenta está segura.</p>
                </div>
                <div style="text-align: center; font-size: 12px; color: #666; margin-top: 20px;">
                    <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                    <p>© ${new Date().getFullYear()} Lexyboz. Todos los derechos reservados.</p>
                </div>
            </div>
        `
    };

    try {
        console.log('Enviando correo con Gmail a:', email);
        const info = await gmailTransporter.sendMail(mailOptions);
        console.log('Correo enviado exitosamente:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error al enviar correo:', error.message);
        throw new Error('Error al enviar el correo: ' + error.message);
    }
};

module.exports = {
    sendResetEmail
};
