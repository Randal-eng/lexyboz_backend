const nodemailer = require('nodemailer');

// Configuración del transportador de correo
const getTransporter = () => {
    // Verificar variables de entorno requeridas
    const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS', 'FRONTEND_ORIGIN'];
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

    const resetUrl = `${process.env.FRONTEND_ORIGIN}/reset-password/${resetToken}`;
    
    try {
        if (isProduction) {
            // Usar SendGrid en producción (Railway)
            console.log('Enviando con SendGrid (producción)...');
            
            const msg = {
                to: email,
                from: {
                    email: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER,
                    name: 'Lexyboz'
                },
                subject: 'Restablecer contraseña - Lexyboz',
                html: `
                    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #ffffff;">
                        <div style="background-color: #4a90e2; color: white; padding: 25px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px;">Lexyboz</h1>
                            <p style="margin: 5px 0 0 0; opacity: 0.9;">Plataforma de Evaluación</p>
                        </div>
                        <div style="padding: 30px; background-color: #f9f9f9;">
                            <p style="margin: 0 0 15px 0;">Hola,</p>
                            <p style="margin: 0 0 15px 0;">Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
                            <p style="text-align: center; margin: 25px 0;">
                                <a href="${resetUrl}" 
                                   style="display: inline-block; padding: 12px 25px; background-color: #4a90e2; 
                                          color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
                                    Restablecer Contraseña
                                </a>
                            </p>
                            <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">
                                Este enlace expira en 1 hora por seguridad.
                            </p>
                            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                            <p style="margin: 0; font-size: 14px; color: #666;">
                                <strong>¿No solicitaste este cambio?</strong><br>
                                Puedes ignorar este correo de forma segura.
                            </p>
                        </div>
                        <div style="background: #e9e9e9; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                            <p style="margin: 0 0 5px 0;">Lexyboz - Sistema de Evaluación Psicológica</p>
                            <p style="margin: 0;">Este es un correo automático, no responder.</p>
                        </div>
                    </div>
                `,
                text: `
Lexyboz - Restablecer Contraseña

Recibimos una solicitud para restablecer la contraseña de tu cuenta.

Visita este enlace para crear una nueva contraseña:
${resetUrl}

Este enlace expira en 1 hora por seguridad.

¿No solicitaste este cambio?
Puedes ignorar este correo de forma segura.

---
Lexyboz - Sistema de Evaluación Psicológica
Este es un correo automático, no responder.
                `,
                // Configuraciones anti-spam críticas
                tracking_settings: {
                    click_tracking: { enable: false },
                    open_tracking: { enable: false },
                    subscription_tracking: { enable: false }
                },
                mail_settings: {
                    spam_check: { enable: true, threshold: 1 }
                },
                categories: ['password-reset']
            };

            const response = await sgMail.send(msg);
            console.log('Email enviado con SendGrid:', {
                messageId: response[0].headers['x-message-id'],
                to: email
            });
            return { messageId: response[0].headers['x-message-id'], provider: 'sendgrid' };
            
        } else {
            // Usar Gmail en desarrollo local
            console.log('Enviando con Gmail (local)...');
            
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

            const info = await gmailTransporter.sendMail(mailOptions);
            console.log('Email enviado con Gmail:', info.messageId);
            return { messageId: info.messageId, provider: 'gmail' };
        }
        
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
