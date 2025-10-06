import nodemailer from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const emailEnabled = process.env.EMAIL_ENABLED === 'true';

    if (!emailEnabled) {
      console.log('Email service is disabled. Set EMAIL_ENABLED=true in .env to enable.');
      return;
    }

    const config: EmailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
      }
    };

    if (!config.auth.user || !config.auth.pass) {
      console.warn('Email credentials not configured. Email sending will be disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport(config);
  }

  async sendNewUserCredentials(
    to: string,
    username: string,
    password: string,
    firstName: string
  ): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email service not configured. User credentials not sent.');
      return false;
    }

    try {
      const appUrl = process.env.APP_URL || 'http://localhost:3000';

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject: 'Welcome to PrismFlow - Your Account Credentials',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .credentials { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
              .credential-item { margin: 10px 0; }
              .credential-label { font-weight: bold; color: #667eea; }
              .credential-value { font-family: 'Courier New', monospace; background: #f0f0f0; padding: 5px 10px; border-radius: 3px; display: inline-block; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Welcome to PrismFlow!</h1>
              </div>
              <div class="content">
                <p>Hello ${firstName},</p>
                <p>An account has been created for you on PrismFlow. Here are your login credentials:</p>

                <div class="credentials">
                  <div class="credential-item">
                    <span class="credential-label">Username:</span><br>
                    <span class="credential-value">${username}</span>
                  </div>
                  <div class="credential-item">
                    <span class="credential-label">Temporary Password:</span><br>
                    <span class="credential-value">${password}</span>
                  </div>
                </div>

                <div class="warning">
                  <strong>⚠️ Security Notice:</strong><br>
                  Please change your password after your first login. This temporary password should not be shared with anyone.
                </div>

                <div style="text-align: center;">
                  <a href="${appUrl}" class="button">Login to PrismFlow</a>
                </div>

                <p>If you have any questions or need assistance, please contact your administrator.</p>
              </div>
              <div class="footer">
                <p>This is an automated message from PrismFlow. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Welcome to PrismFlow!

Hello ${firstName},

An account has been created for you on PrismFlow. Here are your login credentials:

Username: ${username}
Temporary Password: ${password}

SECURITY NOTICE:
Please change your password after your first login. This temporary password should not be shared with anyone.

Login at: ${appUrl}

If you have any questions or need assistance, please contact your administrator.

This is an automated message from PrismFlow.
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Credentials email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const emailService = new EmailService();