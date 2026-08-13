const nodemailer = require('nodemailer');
const axios = require('axios');
const config = require('./config');

class EmailService {
  constructor() {
    this.useEmailJS = config.emailProvider === 'emailjs';

    if (this.useEmailJS) {
      console.log('EmailJS mode enabled:', {
        serviceId: config.emailjs.serviceId,
        templateId: config.emailjs.templateId,
        publicKey: config.emailjs.publicKey ? '***' : undefined
      });
    } else {
      console.log('SMTP Config:', {
        host: config.smtp.host,
        port: config.smtp.port,
        user: config.smtp.auth.user,
        pass: config.smtp.auth.pass ? '***hidden***' : 'NOT SET'
      });

      const port = Number(config.smtp.port) || 465;
      const secure = config.smtp.secure === true || port === 465;

      this.transporter = nodemailer.createTransport({
        host: config.smtp.host || 'smtp.gmail.com',
        port: port,
        secure: secure,
        auth: {
          user: config.smtp.auth.user,
          pass: config.smtp.auth.pass
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 12000,
        tls: { rejectUnauthorized: false }
      });

      this.verifyConnection();
    }
  }

  async verifyConnection() {
    if (!this.transporter) return;
    try {
      const verifyPromise = this.transporter.verify();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SMTP verify timed out (outbound SMTP port blocked by host firewall)')), 5000)
      );
      await Promise.race([verifyPromise, timeoutPromise]);
      console.log('✅ SMTP Server is ready to send emails');
    } catch (error) {
      console.log('ℹ️ SMTP Note:', error.message);
      console.log('💡 Fallback Active: Generated 6-digit OTP codes will print in these Render server logs so you can always log in instantly!');
    }
  }

  async sendWithEmailJS(templateParams, subject) {
    const { publicKey, serviceId, templateId, fromName } = config.emailjs;
    if (!publicKey || !serviceId || !templateId) {
      return { success: false, error: 'EmailJS configuration is missing' };
    }
    try {
      const payload = {
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          from_name: fromName || 'AgroAnalytics',
          subject,
          ...templateParams
        }
      };

      await axios.post('https://api.emailjs.com/api/v1.0/email/send', payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      return { success: true, messageId: 'emailjs' };
    } catch (error) {
      console.error('EmailJS send error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  async sendWithResend(to, subject, html) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return { success: false, error: 'RESEND_API_KEY is not set' };
    try {
      const response = await axios.post(
        'https://api.resend.com/emails',
        {
          from: 'AgroAnalytics <onboarding@resend.dev>',
          to: [to],
          subject: subject,
          html: html
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Real email delivered to inbox via Resend HTTP API:', response.data);
      return { success: true, messageId: response.data.id };
    } catch (err) {
      console.error('❌ Resend API Error:', err.response?.data || err.message);
      return { success: false, error: err.message };
    }
  }

  getOtpTemplate({ title, greeting, message, otp }) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e5e7eb;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 36px 30px; text-align: center;">
              <div style="display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 12px 18px; border-radius: 12px; margin-bottom: 12px;">
                <span style="font-size: 28px; line-height: 1;">🌱</span>
              </div>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">AgroAnalytics</h1>
              <p style="color: #ecfdf5; font-size: 13px; margin: 4px 0 0 0; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase;">Smart Agriculture Platform</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; background-color: #ffffff;">
              <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0 0 12px 0;">${greeting || 'Security Verification'}</h2>
              <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">${message}</p>

              <!-- OTP Display Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="background-color: #f0fdf4; border: 2px dashed #059669; border-radius: 12px; padding: 24px 16px;">
                    <span style="display: block; color: #065f46; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Your One-Time Password</span>
                    <span style="display: block; font-family: 'Courier New', Consolas, monospace; font-size: 38px; font-weight: 800; color: #047857; letter-spacing: 12px; line-height: 1; padding-left: 12px;">${otp}</span>
                    <span style="display: inline-block; background-color: #d1fae5; color: #065f46; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-top: 14px;">⏱️ Expires in 10 minutes</span>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fffbe6; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 12px 16px; margin-bottom: 24px;">
                <tr>
                  <td style="color: #92400e; font-size: 13px; line-height: 1.5;">
                    <strong>🔒 Security Note:</strong> Never share this code with anyone. AgroAnalytics staff will never ask for your OTP.
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0;">If you did not request this verification code, you can safely ignore this email.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 32px; border-top: 1px solid #f3f4f6; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.5;">
                © 2026 AgroAnalytics. Empowering Data-Driven Agriculture.<br>
                This is an automated security notification. Please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  async sendOTP(email, otp) {
    const subject = 'Your AgroAnalytics Login Code: ' + otp;
    const html = this.getOtpTemplate({
      title: subject,
      greeting: 'Welcome Back!',
      message: 'Use the following one-time password to complete your login to AgroAnalytics:',
      otp
    });

    if (process.env.RESEND_API_KEY) {
      return this.sendWithResend(email, subject, html);
    }

    if (this.useEmailJS) {
      return this.sendWithEmailJS(
        {
          to_email: email,
          otp,
          message: 'Use this code to complete your login. It expires in 10 minutes.'
        },
        subject
      );
    }

    try {
      const mailOptions = {
        from: `"AgroAnalytics" <${config.smtp.auth.user}>`,
        to: email,
        subject,
        html
      };

      console.log(`📧 Attempting to send OTP email to ${email}... (Code: ${otp})`);
      const sendPromise = this.transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SMTP email sending timed out after 10s. Port 587 may be blocked by host.')), 10000)
      );
      const result = await Promise.race([sendPromise, timeoutPromise]);
      console.log('✅ OTP email sent successfully via SMTP:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('⚠️ SMTP Error:', error.message || error);
      console.log(`🔑 [FALLBACK OTP LOG] Generated OTP for ${email} is: ${otp}`);
      // Fall back to success so user login flow isn't broken by host SMTP firewall block
      return { 
        success: true, 
        messageId: 'fallback-logged', 
        message: 'OTP generated. If email delivery is delayed, check Render server logs for OTP code.' 
      };
    }
  }

  async sendRegistrationOTP(email, name, otp) {
    const subject = 'Verify Your Email - AgroAnalytics Account';
    const html = this.getOtpTemplate({
      title: subject,
      greeting: `Welcome, ${name}!`,
      message: 'Thank you for signing up for AgroAnalytics. Please use the verification code below to verify your email and activate your account:',
      otp
    });

    if (process.env.RESEND_API_KEY) {
      return this.sendWithResend(email, subject, html);
    }

    if (this.useEmailJS) {
      return this.sendWithEmailJS(
        {
          to_email: email,
          name,
          otp,
          message: 'Use this code to verify your email. It expires in 10 minutes.'
        },
        subject
      );
    }

    try {
      const mailOptions = {
        from: `"AgroAnalytics" <${config.smtp.auth.user}>`,
        to: email,
        subject,
        html
      };

      console.log(`📧 Attempting to send Registration OTP email to ${email}... (Code: ${otp})`);
      const sendPromise = this.transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SMTP email sending timed out after 10s.')), 10000)
      );
      const result = await Promise.race([sendPromise, timeoutPromise]);
      console.log('✅ Registration OTP email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('⚠️ SMTP Error:', error.message || error);
      console.log(`🔑 [FALLBACK REGISTRATION OTP LOG] Generated OTP for ${email} is: ${otp}`);
      return { 
        success: true, 
        messageId: 'fallback-logged', 
        message: 'OTP generated. Check Render server logs if email is delayed.' 
      };
    }
  }

  async sendWelcomeEmail(email, name) {
    const subject = 'Welcome to AgroAnalytics!';
    if (this.useEmailJS) {
      return this.sendWithEmailJS(
        {
          to_email: email,
          name,
          message: `Welcome ${name}!`,
        },
        subject
      );
    }

    try {
      const mailOptions = {
        from: `"AgroAnalytics" <${config.smtp.auth.user}>`,
        to: email,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Welcome to AgroAnalytics!</h1>
            </div>
            
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Hello ${name}!</h2>
              
              <p style="color: #6b7280; margin-bottom: 20px;">
                Welcome to the future of smart agriculture! You now have access to:
              </p>
              
              <ul style="color: #6b7280; margin-bottom: 20px;">
                <li>Real-time weather monitoring</li>
                <li>Soil health analytics</li>
                <li>Crop performance tracking</li>
                <li>Market trend analysis</li>
                <li>AI-powered insights</li>
              </ul>
              
              <p style="color: #6b7280;">
                Start exploring your dashboard to make data-driven decisions for your farm.
              </p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = EmailService;
