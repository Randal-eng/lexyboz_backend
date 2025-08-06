const nodemailer = require('nodemailer');

// Configuración del transportador de correo
const getTransporter = () => {
    // Verificar variables de entorno requeridas
    const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS', 'FRONTEND_URL'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        throw new Error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
    }

    // Configuración base para desarrollo y producción
    const config = {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: true, // Más seguro en producción
            minVersion: 'TLSv1.2'     // Forzar TLS 1.2 o superior
        }
    };

    // Ajustes específicos para desarrollo
    if (process.env.NODE_ENV === 'development') {
        config.tls.rejectUnauthorized = false; // Más permisivo en desarrollo
        config.debug = true;                   // Habilitar logs
    }

    return nodemailer.createTransport(config);
};

// Crear el transportador
const transporter = getTransporter();

const sendResetEmail = async (email, resetToken) => {
    // Validar el email
    if (!email || !email.includes('@')) {
        throw new Error('Correo electrónico inválido');
    }

    // Validar el token
    if (!resetToken || typeof resetToken !== 'string' || resetToken.length < 32) {
        throw new Error('Token de restablecimiento inválido');
    }

    // En producción, verificar el dominio del correo si es necesario
    if (process.env.NODE_ENV === 'production') {
        const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS ? 
            process.env.ALLOWED_EMAIL_DOMAINS.split(',') : 
            ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
            
        const emailDomain = email.split('@')[1];
        if (!allowedDomains.includes(emailDomain)) {
            console.warn(`Intento de envío a dominio no permitido: ${emailDomain}`);
            throw new Error('Dominio de correo no permitido');
        }
    }

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
        from: `"Lexyboz Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Restablecimiento de Contraseña - Lexyboz',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #4a90e2; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .button { 
                        display: inline-block; 
                        padding: 10px 20px; 
                        background-color: #4a90e2; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        margin: 20px 0; 
                    }
                    .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Restablecimiento de Contraseña</h1>
                    </div>
                    <div class="content">
                        <p>Has solicitado restablecer tu contraseña en Lexyboz.</p>
                        <p>Haz clic en el siguiente botón para crear una nueva contraseña (el enlace expira en 1 hora):</p>
                        <p style="text-align: center;">
                            <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
                        </p>
                        <p><strong>¿No solicitaste este cambio?</strong></p>
                        <p>Si no solicitaste restablecer tu contraseña, ignora este correo. Tu cuenta está segura.</p>
                    </div>
                    <div class="footer">
                        <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                        <p>© ${new Date().getFullYear()} Lexyboz. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        console.log('Configuración del correo:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject,
            emailUser: process.env.EMAIL_USER,
            hasPassword: !!process.env.EMAIL_PASS,
            frontendUrl: process.env.FRONTEND_URL
        });

        console.log('Intentando enviar correo a:', email);
        
        // Verificar que el transportador está bien configurado
        const verify = await transporter.verify();
        console.log('Verificación del transportador:', verify);
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado exitosamente:', {
            messageId: info.messageId,
            response: info.response,
            recipient: email,
            accepted: info.accepted,
            rejected: info.rejected,
            envelope: info.envelope
        });
        return info;
    } catch (error) {
        console.error('Error detallado al enviar correo:', {
            error: error.message,
            errorName: error.name,
            stack: error.stack,
            recipient: email,
            transporterSettings: {
                service: transporter.options.service,
                host: transporter.options.host,
                port: transporter.options.port,
                secure: transporter.options.secure,
                authUser: process.env.EMAIL_USER?.substring(0, 5) + '...',
                hasAuth: !!transporter.options.auth
            }
        });
        throw new Error('Error al enviar el correo de restablecimiento: ' + error.message);
    }
};

module.exports = {
    sendResetEmail
};
