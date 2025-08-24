const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

// Configurar SendGrid (si está disponible) o usar Gmail como fallback
const initializeEmailService = () => {
    if (process.env.SENDGRID_API_KEY) {
        console.log('Inicializando SendGrid...');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        return 'sendgrid';
    } else {
        console.log('Usando Gmail SMTP como fallback...');
        return 'gmail';
    }
};

const emailProvider = initializeEmailService();

// Configuración del transportador de Gmail (fallback)
const getGmailTransporter = () => {
    // Verificar variables de entorno requeridas para Gmail
    const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS', 'FRONTEND_ORIGIN'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        throw new Error(`Variables de entorno faltantes para Gmail: ${missingVars.join(', ')}`);
    }

    // Configuración base para desarrollo y producción
    const config = {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,  // Puerto SSL para Railway
        secure: true,  // SSL para Railway
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: true,
            minVersion: 'TLSv1.2'
        },
        // Configuraciones específicas para Railway
        connectionTimeout: 60000,  // 60 segundos
        greetingTimeout: 30000,    // 30 segundos
        socketTimeout: 60000,      // 60 segundos
        pool: true,
        maxConnections: 5,
        maxMessages: 100
    };

    // Ajustes específicos para desarrollo
    if (process.env.NODE_ENV === 'development') {
        config.port = 587;
        config.secure = false;
        config.tls.rejectUnauthorized = false;
        config.debug = true;
    }

    return nodemailer.createTransport(config);
};

// Crear el transportador de Gmail (solo si no usamos SendGrid)
let gmailTransporter = null;
if (emailProvider === 'gmail') {
    gmailTransporter = getGmailTransporter();
}

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

    const resetUrl = `${process.env.FRONTEND_ORIGIN}/reset-password/${resetToken}`;
    
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
        console.log(`Enviando email usando: ${emailProvider}`);
        
        if (emailProvider === 'sendgrid') {
            // Usar SendGrid
            const msg = {
                to: email,
                from: {
                    email: 'lexyvoz.inc@gmail.com',  // Cambiar por un email que controles
                    name: 'Lexyboz Support'
                },
                subject: mailOptions.subject,
                html: mailOptions.html
            };

            console.log('Enviando con SendGrid:', {
                to: msg.to,
                from: msg.from,
                subject: msg.subject
            });

            const response = await sgMail.send(msg);
            console.log('Email enviado exitosamente con SendGrid:', {
                messageId: response[0].headers['x-message-id'],
                statusCode: response[0].statusCode,
                recipient: email
            });
            
            return { messageId: response[0].headers['x-message-id'], provider: 'sendgrid' };
            
        } else {
            // Usar Gmail como fallback
            console.log('Configuración del correo Gmail:', {
                from: mailOptions.from,
                to: mailOptions.to,
                subject: mailOptions.subject,
                emailUser: process.env.EMAIL_USER,
                hasPassword: !!process.env.EMAIL_PASS,
                frontendUrl: process.env.FRONTEND_ORIGIN
            });

            console.log('Intentando enviar correo Gmail a:', email);
            
            // Verificar que el transportador está bien configurado
            const verify = await gmailTransporter.verify();
            console.log('Verificación del transportador Gmail:', verify);
            
            const info = await gmailTransporter.sendMail(mailOptions);
            console.log('Correo enviado exitosamente con Gmail:', {
                messageId: info.messageId,
                response: info.response,
                recipient: email,
                accepted: info.accepted,
                rejected: info.rejected,
                envelope: info.envelope
            });
            return { ...info, provider: 'gmail' };
        }
        
    } catch (error) {
        console.error(`Error detallado al enviar correo con ${emailProvider}:`, {
            error: error.message,
            errorName: error.name,
            stack: error.stack,
            recipient: email,
            provider: emailProvider
        });
        throw new Error(`Error al enviar el correo de restablecimiento con ${emailProvider}: ` + error.message);
    }
};

module.exports = {
    sendResetEmail,
    emailProvider // Exportar para debugging
};
