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

      this.transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
          user: config.smtp.auth.user,
          pass: config.smtp.auth.pass
        },
        tls: { rejectUnauthorized: false }
      });

      this.verifyConnection();
    }
  }

  async verifyConnection() {
    if (!this.transporter) return;
    try {
      await this.transporter.verify();
      console.log('✅ SMTP Server is ready to send emails');
    } catch (error) {
      console.log('❌ SMTP Error:', error.message);
      console.log('📧 Please configure your email settings:');
      console.log('   1. Create server/.env file');
      console.log('   2. Add your SMTP credentials');
      console.log('   3. See EMAIL_SETUP.md for details');
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

  async sendOTP(email, otp) {
    const subject = 'Your OTP for AgroAnalytics Login';
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
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">AgroAnalytics</h1>
              <p style="color: white; margin: 5px 0 0 0;">Smart Agriculture Platform</p>
            </div>
            
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Your One-Time Password</h2>
              
              <p style="color: #6b7280; margin-bottom: 20px;">
                Use the following code to complete your login to AgroAnalytics:
              </p>
              
              <div style="background: white; border: 2px solid #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #10b981; font-size: 32px; letter-spacing: 5px; margin: 0; font-family: monospace;">
                  ${otp}
                </h1>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">
                This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
              </p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  © 2024 AgroAnalytics. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('OTP email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending OTP email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendRegistrationOTP(email, name, otp) {
    const subject = 'Verify Your Email - AgroAnalytics Account';
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
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">AgroAnalytics</h1>
              <p style="color: white; margin: 5px 0 0 0;">Smart Agriculture Platform</p>
            </div>
            
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome ${name}!</h2>
              
              <p style="color: #6b7280; margin-bottom: 20px;">
                Thank you for signing up for AgroAnalytics! To complete your account creation, please verify your email address using the code below:
              </p>
              
              <div style="background: white; border: 2px solid #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #10b981; font-size: 32px; letter-spacing: 5px; margin: 0; font-family: monospace;">
                  ${otp}
                </h1>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">
                This verification code will expire in 10 minutes. If you didn't create an account with AgroAnalytics, please ignore this email.
              </p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  © 2024 AgroAnalytics. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Registration OTP email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending registration OTP email:', error);
      return { success: false, error: error.message };
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
