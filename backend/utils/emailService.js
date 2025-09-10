import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
// Create a transporter using Gmail (you'll need to configure this with your email)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port:465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || 'arpitcloud11@gmail.com',
    pass: process.env.EMAIL_PASS || 'tniyshautewwrllv'
  }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Email transporter verification failed:', error);
  } else {
    console.log('✅ Email transporter is ready to send emails');
    console.log('📧 Email configuration:', {
      user: process.env.EMAIL_USER || '',
      service: 'gmail'
    });
  }
});


function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
}

export const sendOTPEmail = async (email, userName) => {
  try {
    console.log(`📧 Attempting to send OTP email to: ${email}`);
    
    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email configuration missing: EMAIL_USER or EMAIL_PASS not set');
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    }
    
    const otp = generateOTP();
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">📚 InfoBeans Library</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">Email Verification</p>
          </div>
          
          <div style="border-left: 4px solid #3498db; padding-left: 20px; margin-bottom: 25px;">
            <h2 style="color: #2c3e50; margin: 0 0 10px 0;">Hello ${userName},</h2>
            <p style="color: #34495e; margin: 0; font-size: 16px; line-height: 1.6;">
              Thank you for registering with InfoBeans Library. Please use the OTP below to verify your email address.
            </p>
          </div>
          
          <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border: 1px solid #2196f3; padding: 30px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <h3 style="color: #1565c0; margin: 0 0 20px 0; font-size: 24px;">Your Verification Code</h3>
            <div style="background-color: white; padding: 20px; border-radius: 8px; display: inline-block; border: 2px dashed #2196f3;">
              <span style="font-size: 32px; font-weight: bold; color: #1565c0; letter-spacing: 8px;">${otp}</span>
            </div>
            <p style="margin: 20px 0 0 0; color: #1565c0; font-size: 14px;">
              This code will expire in 5 minutes
            </p>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">⚠️ Important:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #856404;">
              <li>This OTP is valid for 5 minutes only</li>
              <li>Do not share this code with anyone</li>
              <li>If you didn't request this code, please ignore this email</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #6c757d; margin: 0; font-size: 14px;">
              Thank you for choosing InfoBeans Library! 📚✨
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #6c757d; font-size: 12px; margin: 0;">
            This is an automated message from the InfoBeans Library Management System.<br>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: '🔐 Email Verification - InfoBeans Library',
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully:', result.messageId);
    console.log(`   To: ${email}`);
    console.log(`   Subject: 🔐 Email Verification - InfoBeans Library`);
    console.log(`   Message ID: ${result.messageId}`);
    
    return otp;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    console.error(`   To: ${email}`);
    console.error(`   Error Details:`, error.message);
    throw error;
  }
};

export const sendBookRequestNotification = async (userEmail, userName, bookTitle, status, adminComments = '') => {
  try {
    console.log(`📧 Attempting to send ${status} notification email to: ${userEmail}`);
    
    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email configuration missing: EMAIL_USER or EMAIL_PASS not set');
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    }
    
    const subject = status === 'approved' 
      ? '🎉 Book Request Approved - Library Management System'
      : '📚 Book Request Update - Library Management System';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">📚 InfoBeans Library</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">Your Gateway to Knowledge</p>
          </div>
          
          <div style="border-left: 4px solid #3498db; padding-left: 20px; margin-bottom: 25px;">
            <h2 style="color: #2c3e50; margin: 0 0 10px 0;">Dear ${userName},</h2>
            <p style="color: #34495e; margin: 0; font-size: 16px; line-height: 1.6;">
              Your book request for <strong style="color: #e74c3c;">"${bookTitle}"</strong> has been 
              <strong style="color: ${status === 'approved' ? '#27ae60' : '#e74c3c'};">${status.toUpperCase()}</strong>.
            </p>
          </div>
          
          ${status === 'approved' ? `
            <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); border: 1px solid #27ae60; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <h3 style="color: #155724; margin: 0 0 15px 0; font-size: 22px;">🎉 Request Approved!</h3>
              <p style="margin: 0; color: #155724; font-size: 16px; line-height: 1.6;">
                Congratulations! Your book request has been approved. You can now collect your book from the library.
              </p>
            </div>
            
            <div style="background-color: #e8f5e8; border: 1px solid #27ae60; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">📋 Pickup Instructions:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #155724;">
                <li>Please bring a valid photo ID (Student ID, Driver's License, or Passport)</li>
                <li>Visit the library during operating hours</li>
                <li>Present your ID at the circulation desk</li>
                <li>Mention your request ID for quick processing</li>
              </ul>
            </div>
          ` : `
            <div style="background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); border: 1px solid #e74c3c; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <h3 style="color: #721c24; margin: 0 0 15px 0; font-size: 22px;">❌ Request Not Approved</h3>
              <p style="margin: 0; color: #721c24; font-size: 16px; line-height: 1.6;">
                Unfortunately, your request could not be approved at this time. Please check the admin comments below for more details.
              </p>
            </div>
          `}
          
          ${adminComments ? `
            <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="margin: 0 0 15px 0; color: #495057; font-size: 18px;">💬 Admin Comments:</h4>
              <div style="background-color: white; padding: 15px; border-radius: 6px; border-left: 4px solid #6c757d;">
                <p style="margin: 0; color: #495057; font-style: italic; line-height: 1.6;">"${adminComments}"</p>
              </div>
            </div>
          ` : ''}
          
          <div style="background-color: #e3f2fd; border: 1px solid #2196f3; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #1565c0; margin: 0 0 15px 0; font-size: 18px;">ℹ️ Need Help?</h4>
            <p style="margin: 0 0 10px 0; color: #1565c0;">
              If you have any questions or need assistance, please contact our library staff:
            </p>
            <ul style="margin: 0; padding-left: 20px; color: #1565c0;">
              <li><strong>Email:</strong> library@infobeans.com</li>
              <li><strong>Phone:</strong> +1 (555) 123-4567</li>
              <li><strong>Hours:</strong> Monday-Friday: 9:00 AM - 6:00 PM</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #6c757d; margin: 0; font-size: 14px;">
              Thank you for using our library management system! 📚✨
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #6c757d; font-size: 12px; margin: 0;">
            This is an automated message from the InfoBeans Library Management System.<br>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: userEmail,
      subject: subject,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    console.log(`   To: ${userEmail}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.error(`   To: ${userEmail}`);
    console.error(`   Subject: ${subject}`);
    console.error(`   Error Details:`, error.message);
    
    // Check for specific error types
    if (error.code === 'EAUTH') {
      console.error('   🔐 Authentication failed. Check EMAIL_USER and EMAIL_PASS');
    } else if (error.code === 'ECONNECTION') {
      console.error('   🌐 Connection failed. Check internet connection');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   ⏰ Connection timed out');
    }
    
    throw error; // Re-throw to let caller handle it
  }
};

// Send welcome email to new users
export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    console.log(`📧 Attempting to send welcome email to: ${userEmail}`);
    
    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email configuration missing: EMAIL_USER or EMAIL_PASS not set');
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    }
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">📚 InfoBeans Library</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">Your Gateway to Knowledge</p>
          </div>
          
          <div style="border-left: 4px solid #3498db; padding-left: 20px; margin-bottom: 25px;">
            <h2 style="color: #2c3e50; margin: 0 0 10px 0;">Welcome to InfoBeans Library, ${userName}! 🎉</h2>
            <p style="color: #34495e; margin: 0; font-size: 16px; line-height: 1.6;">
              We're excited to have you as a member of our library community. You now have access to thousands of books, journals, and digital resources.
            </p>
          </div>
          
          <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border: 1px solid #2196f3; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #1565c0; margin: 0 0 15px 0; font-size: 22px;">🚀 Getting Started</h3>
            <p style="margin: 0; color: #1565c0; font-size: 16px; line-height: 1.6;">
              Here's how you can start exploring our library:
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #495057; margin: 0 0 15px 0; font-size: 18px;">📖 How to Request Books:</h4>
            <ol style="margin: 0; padding-left: 20px; color: #495057;">
              <li>Browse our book collection online</li>
              <li>Click "Request Book" on any available book</li>
              <li>Wait for admin approval (usually within 24 hours)</li>
              <li>Receive email notification when approved</li>
              <li>Visit the library to collect your book</li>
            </ol>
          </div>
          
          <div style="background-color: #e8f5e8; border: 1px solid #27ae60; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">📋 Library Policies:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #155724;">
              <li>Books can be borrowed for up to 15 days</li>
              <li>Late returns incur a fine of ₹5 per day</li>
              <li>Maximum 3 books can be borrowed at once</li>
              <li>Books must be returned in good condition</li>
            </ul>
          </div>
          
          <div style="background-color: #e3f2fd; border: 1px solid #2196f3; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #1565c0; margin: 0 0 15px 0; font-size: 18px;">📞 Need Help?</h4>
            <p style="margin: 0 0 10px 0; color: #1565c0;">
              Our friendly library staff is here to help you:
            </p>
            <ul style="margin: 0; padding-left: 20px; color: #1565c0;">
              <li><strong>Email:</strong> library@infobeans.com</li>
              <li><strong>Phone:</strong> +1 (555) 123-4567</li>
              <li><strong>Hours:</strong> Monday-Friday: 9:00 AM - 6:00 PM</li>
              <li><strong>Location:</strong> 2nd Floor, InfoBeans Tower</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #6c757d; margin: 0; font-size: 14px;">
              Happy reading and welcome to the InfoBeans family! 📚✨
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #6c757d; font-size: 12px; margin: 0;">
            This is an automated message from the InfoBeans Library Management System.<br>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: userEmail,
      subject: '🎉 Welcome to InfoBeans Library!',
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', result.messageId);
    console.log(`   To: ${userEmail}`);
    console.log(`   Subject: 🎉 Welcome to InfoBeans Library!`);
    console.log(`   Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    console.error(`   To: ${userEmail}`);
    console.error(`   Subject: 🎉 Welcome to InfoBeans Library!`);
    console.error(`   Error Details:`, error.message);
    
    // Check for specific error types
    if (error.code === 'EAUTH') {
      console.error('   🔐 Authentication failed. Check EMAIL_USER and EMAIL_PASS');
    } else if (error.code === 'ECONNECTION') {
      console.error('   🌐 Connection failed. Check internet connection');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   ⏰ Connection timed out');
    }
    
    throw error; // Re-throw to let caller handle it
  }
};

export const sendBookIssuedNotification = async (userEmail, userName, bookTitle, issueDate, returnDate) => {
  try {
    console.log(`📧 Attempting to send book issued notification email to: ${userEmail}`);
    
    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email configuration missing: EMAIL_USER or EMAIL_PASS not set');
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    }
    
    const htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
    <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">📚 InfoBeans Library</h1>
        <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">Your Gateway to Knowledge</p>
      </div>
      
      <div style="border-left: 4px solid #007bff; padding-left: 20px; margin-bottom: 25px;">
        <h2 style="color: #2c3e50; margin: 0 0 10px 0;">Dear ${userName},</h2>
        <p style="color: #34495e; margin: 0; font-size: 16px; line-height: 1.6;">
          Your book request for <strong style="color: #e74c3c;">"${bookTitle}"</strong> has been successfully created.
        </p>
      </div>
      
      <div style="background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%); border: 1px solid #0c5460; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
        <h3 style="color: #0c5460; margin: 0 0 15px 0; font-size: 22px;">⏳ Awaiting Admin Approval</h3>
        <p style="margin: 0; color: #0c5460; font-size: 16px; line-height: 1.6;">
          Your request will be reviewed by the library admin. You will receive another email once the request is approved.
        </p>
      </div>
      
      <div style="background-color: #e8f5e8; border: 1px solid #27ae60; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h4 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">📋 Request Details:</h4>
        <div style="background-color: white; padding: 15px; border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-weight: bold; color: #495057;">Book Title:</span>
            <span style="color: #495057;">${bookTitle}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-weight: bold; color: #495057;">Request Date:</span>
            <span style="color: #495057;">${issueDate}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0;">
            <span style="font-weight: bold; color: #495057;">Status:</span>
            <span style="color: #495057; font-weight: bold; color: #007bff;">Pending Admin Approval</span>
          </div>
        </div>
      </div>
      
      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h4 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">⚠️ What Happens Next:</h4>
        <ul style="margin: 0; padding-left: 20px; color: #856404;">
          <li>The admin will review your request shortly</li>
          <li>You will receive an email update after approval</li>
          <li>Do not collect the book until you receive the approval email</li>
        </ul>
      </div>
      
      <div style="background-color: #e3f2fd; border: 1px solid #2196f3; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h4 style="color: #1565c0; margin: 0 0 15px 0; font-size: 18px;">📞 Need Help?</h4>
        <p style="margin: 0 0 10px 0; color: #1565c0;">
          If you have any questions or need assistance, please contact our library staff:
        </p>
        <ul style="margin: 0; padding-left: 20px; color: #1565c0;">
          <li><strong>Email:</strong> library@infobeans.com</li>
          <li><strong>Phone:</strong> +1 (555) 123-4567</li>
          <li><strong>Hours:</strong> Monday-Friday: 9:00 AM - 6:00 PM</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
        <p style="color: #6c757d; margin: 0; font-size: 14px;">
          Thank you for using InfoBeans Library! 📚✨
        </p>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 20px;">
      <p style="color: #6c757d; font-size: 12px; margin: 0;">
        This is an automated message from the InfoBeans Library Management System.<br>
        Please do not reply to this email.
      </p>
    </div>
  </div>
`;


    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: userEmail,
      subject: 'Book Issue Request sent, Wait for admin approval- Library Management System',
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Book issue email sent successfully:', result.messageId);
    console.log(`   To: ${userEmail}`);
    console.log(`   Subject: Book Successfully Issued - Library Management System`);
    console.log(`   Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending book issued email:', error);
    console.error(`   To: ${userEmail}`);
    console.error(`   Subject: Book Successfully Issued - Library Management System`);
    console.error(`   Error Details:`, error.message);
    
    // Check for specific error types
    if (error.code === 'EAUTH') {
      console.error('   🔐 Authentication failed. Check EMAIL_USER and EMAIL_PASS');
    } else if (error.code === 'ECONNECTION') {
      console.error('   🌐 Connection failed. Check internet connection');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   ⏰ Connection timed out');
    }
    
    throw error; // Re-throw to let caller handle it
  }
};

// Send donation submission confirmation email
export const sendDonationSubmissionEmail = async (donorEmail, donorName, bookTitle) => {
  try {
    console.log(`📧 Attempting to send donation submission email to: ${donorEmail}`);
    
    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email configuration missing: EMAIL_USER or EMAIL_PASS not set');
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    }
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">📚 InfoBeans Library</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">Book Donation Request</p>
          </div>
          
          <div style="border-left: 4px solid #3498db; padding-left: 20px; margin-bottom: 25px;">
            <h2 style="color: #2c3e50; margin: 0 0 10px 0;">Dear ${donorName},</h2>
            <p style="color: #34495e; margin: 0; font-size: 16px; line-height: 1.6;">
              Thank you for your generous book donation offer! We have received your request to donate 
              <strong style="color: #e74c3c;">"${bookTitle}"</strong> to our library.
            </p>
          </div>
          
          <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border: 1px solid #2196f3; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <h3 style="color: #1565c0; margin: 0 0 15px 0; font-size: 22px;">📖 Request Received</h3>
            <p style="margin: 0; color: #1565c0; font-size: 16px; line-height: 1.6;">
              Our library team will review your donation request and get back to you as soon as possible.
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #495057; margin: 0 0 15px 0; font-size: 18px;">📋 What Happens Next:</h4>
            <ol style="margin: 0; padding-left: 20px; color: #495057;">
              <li>Our library staff will review your donation request</li>
              <li>We will contact you via email or phone within 2-3 business days</li>
              <li>If approved, we'll arrange a convenient time for book collection</li>
              <li>Once collected, your books will be added to our library collection</li>
            </ol>
          </div>
          
          <div style="background-color: #e8f5e8; border: 1px solid #27ae60; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">📞 Contact Information:</h4>
            <p style="margin: 0 0 10px 0; color: #155724;">
              If you have any questions or need to update your donation details, please contact us:
            </p>
            <ul style="margin: 0; padding-left: 20px; color: #155724;">
              <li><strong>Email:</strong> library@infobeans.com</li>
              <li><strong>Phone:</strong> +1 (555) 123-4567</li>
              <li><strong>Hours:</strong> Monday-Friday: 9:00 AM - 6:00 PM</li>
              <li><strong>Location:</strong> 2nd Floor, InfoBeans Tower</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #6c757d; margin: 0; font-size: 14px;">
              Thank you for supporting our library community! 📚✨
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #6c757d; font-size: 12px; margin: 0;">
            This is an automated message from the InfoBeans Library Management System.<br>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: donorEmail,
      subject: '📚 Book Donation Request Received - InfoBeans Library',
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Donation submission email sent successfully:', result.messageId);
    console.log(`   To: ${donorEmail}`);
    console.log(`   Subject: 📚 Book Donation Request Received - InfoBeans Library`);
    console.log(`   Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending donation submission email:', error);
    console.error(`   To: ${donorEmail}`);
    console.error(`   Error Details:`, error.message);
    throw error;
  }
};

// Send donation approval email
export const sendDonationApprovalEmail = async (donorEmail, donorName, bookTitle, adminComments = '') => {
  try {
    console.log(`📧 Attempting to send donation approval email to: ${donorEmail}`);
    
    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email configuration missing: EMAIL_USER or EMAIL_PASS not set');
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    }
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">📚 InfoBeans Library</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">Donation Request Approved</p>
          </div>
          
          <div style="border-left: 4px solid #27ae60; padding-left: 20px; margin-bottom: 25px;">
            <h2 style="color: #2c3e50; margin: 0 0 10px 0;">Dear ${donorName},</h2>
            <p style="color: #34495e; margin: 0; font-size: 16px; line-height: 1.6;">
              Great news! Your donation request for <strong style="color: #e74c3c;">"${bookTitle}"</strong> has been 
              <strong style="color: #27ae60;">APPROVED</strong> by our library team.
            </p>
          </div>
          
          <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); border: 1px solid #27ae60; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <h3 style="color: #155724; margin: 0 0 15px 0; font-size: 22px;">🎉 Donation Approved!</h3>
            <p style="margin: 0; color: #155724; font-size: 16px; line-height: 1.6;">
              We are interested in adding your book to our library collection. Our team will contact you soon to arrange collection.
            </p>
          </div>
          
          ${adminComments ? `
            <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="margin: 0 0 15px 0; color: #495057; font-size: 18px;">💬 Library Comments:</h4>
              <div style="background-color: white; padding: 15px; border-radius: 6px; border-left: 4px solid #6c757d;">
                <p style="margin: 0; color: #495057; font-style: italic; line-height: 1.6;">"${adminComments}"</p>
              </div>
            </div>
          ` : ''}
          
          <div style="background-color: #e8f5e8; border: 1px solid #27ae60; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">📋 Next Steps:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #155724;">
              <li>Our library staff will contact you within 24-48 hours</li>
              <li>We'll arrange a convenient time for book collection</li>
              <li>You can also visit our library during operating hours</li>
              <li>Please bring the books in good condition as described</li>
            </ul>
          </div>
          
          <div style="background-color: #e3f2fd; border: 1px solid #2196f3; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #1565c0; margin: 0 0 15px 0; font-size: 18px;">📞 Contact Information:</h4>
            <p style="margin: 0 0 10px 0; color: #1565c0;">
              If you have any questions or need to reschedule, please contact us:
            </p>
            <ul style="margin: 0; padding-left: 20px; color: #1565c0;">
              <li><strong>Email:</strong> library@infobeans.com</li>
              <li><strong>Phone:</strong> +1 (555) 123-4567</li>
              <li><strong>Hours:</strong> Monday-Friday: 9:00 AM - 6:00 PM</li>
              <li><strong>Location:</strong> 2nd Floor, InfoBeans Tower</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #6c757d; margin: 0; font-size: 14px;">
              Thank you for contributing to our library! 📚✨
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #6c757d; font-size: 12px; margin: 0;">
            This is an automated message from the InfoBeans Library Management System.<br>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: donorEmail,
      subject: '🎉 Book Donation Approved - InfoBeans Library',
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Donation approval email sent successfully:', result.messageId);
    console.log(`   To: ${donorEmail}`);
    console.log(`   Subject: 🎉 Book Donation Approved - InfoBeans Library`);
    console.log(`   Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending donation approval email:', error);
    console.error(`   To: ${donorEmail}`);
    console.error(`   Error Details:`, error.message);
    throw error;
  }
};

// Send donation rejection email
export const sendDonationRejectionEmail = async (donorEmail, donorName, bookTitle, adminComments = '') => {
  try {
    console.log(`📧 Attempting to send donation rejection email to: ${donorEmail}`);
    
    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email configuration missing: EMAIL_USER or EMAIL_PASS not set');
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    }
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">📚 InfoBeans Library</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">Donation Request Update</p>
          </div>
          
          <div style="border-left: 4px solid #e74c3c; padding-left: 20px; margin-bottom: 25px;">
            <h2 style="color: #2c3e50; margin: 0 0 10px 0;">Dear ${donorName},</h2>
            <p style="color: #34495e; margin: 0; font-size: 16px; line-height: 1.6;">
              Thank you for your generous offer to donate <strong style="color: #e74c3c;">"${bookTitle}"</strong> to our library. 
              After careful review, we regret to inform you that we are unable to accept this donation at this time.
            </p>
          </div>
          
          <div style="background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); border: 1px solid #e74c3c; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <h3 style="color: #721c24; margin: 0 0 15px 0; font-size: 22px;">📖 Donation Not Accepted</h3>
            <p style="margin: 0; color: #721c24; font-size: 16px; line-height: 1.6;">
              We appreciate your generosity and hope you understand that this decision is based on our current collection needs and space constraints.
            </p>
          </div>
          
          ${adminComments ? `
            <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="margin: 0 0 15px 0; color: #495057; font-size: 18px;">💬 Library Comments:</h4>
              <div style="background-color: white; padding: 15px; border-radius: 6px; border-left: 4px solid #6c757d;">
                <p style="margin: 0; color: #495057; font-style: italic; line-height: 1.6;">"${adminComments}"</p>
              </div>
            </div>
          ` : ''}
          
          <div style="background-color: #e8f5e8; border: 1px solid #27ae60; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">🌟 Alternative Ways to Support:</h4>
            <p style="margin: 0 0 15px 0; color: #155724;">
              While we cannot accept this particular donation, there are other ways you can support our library:
            </p>
            <ul style="margin: 0; padding-left: 20px; color: #155724;">
              <li>Consider donating other books that may be more suitable for our collection</li>
              <li>Volunteer your time to help with library programs</li>
              <li>Spread the word about our library services</li>
              <li>Participate in our community reading events</li>
            </ul>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">📋 What We Accept:</h4>
            <p style="margin: 0 0 10px 0; color: #856404;">
              We typically accept donations of:
            </p>
            <ul style="margin: 0; padding-left: 20px; color: #856404;">
              <li>Recent publications (within 5 years)</li>
              <li>Books in excellent or good condition</li>
              <li>Educational and reference materials</li>
              <li>Popular fiction and non-fiction</li>
              <li>Children's books in good condition</li>
            </ul>
          </div>
          
          <div style="background-color: #e3f2fd; border: 1px solid #2196f3; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #1565c0; margin: 0 0 15px 0; font-size: 18px;">📞 Contact Information:</h4>
            <p style="margin: 0 0 10px 0; color: #1565c0;">
              If you have any questions or would like to discuss other donation opportunities, please contact us:
            </p>
            <ul style="margin: 0; padding-left: 20px; color: #1565c0;">
              <li><strong>Email:</strong> library@infobeans.com</li>
              <li><strong>Phone:</strong> +1 (555) 123-4567</li>
              <li><strong>Hours:</strong> Monday-Friday: 9:00 AM - 6:00 PM</li>
              <li><strong>Location:</strong> 2nd Floor, InfoBeans Tower</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #6c757d; margin: 0; font-size: 14px;">
              Thank you for thinking of our library! We hope to work with you in the future. 📚✨
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #6c757d; font-size: 12px; margin: 0;">
            This is an automated message from the InfoBeans Library Management System.<br>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: donorEmail,
      subject: '📚 Book Donation Update - InfoBeans Library',
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Donation rejection email sent successfully:', result.messageId);
    console.log(`   To: ${donorEmail}`);
    console.log(`   Subject: 📚 Book Donation Update - InfoBeans Library`);
    console.log(`   Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending donation rejection email:', error);
    console.error(`   To: ${donorEmail}`);
    console.error(`   Error Details:`, error.message);
    throw error;
  }
};

// Send fine notification emails for overdue books
export const sendOverdueFineNotification = async (userEmail, userName, bookTitle, overdueDays, fineAmount, returnDate) => {
  try {
    console.log(`📧 Attempting to send overdue fine notification email to: ${userEmail}`);
    
    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email configuration missing: EMAIL_USER or EMAIL_PASS not set');
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    }
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">📚 InfoBeans Library</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">Overdue Book Notice</p>
          </div>
          
          <div style="border-left: 4px solid #e74c3c; padding-left: 20px; margin-bottom: 25px;">
            <h2 style="color: #2c3e50; margin: 0 0 10px 0;">Dear ${userName},</h2>
            <p style="color: #34495e; margin: 0; font-size: 16px; line-height: 1.6;">
              This is a notice that your book <strong style="color: #e74c3c;">"${bookTitle}"</strong> is overdue and has incurred fines.
            </p>
          </div>
          
          <div style="background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); border: 1px solid #e74c3c; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <h3 style="color: #721c24; margin: 0 0 15px 0; font-size: 22px;">⚠️ Book Overdue</h3>
            <p style="margin: 0; color: #721c24; font-size: 16px; line-height: 1.6;">
              Your book was due on <strong>${new Date(returnDate).toLocaleDateString()}</strong> and is now <strong>${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue</strong>.
            </p>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">💰 Fine Details:</h4>
            <div style="background-color: white; padding: 15px; border-radius: 6px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold; color: #495057;">Overdue Days:</span>
                <span style="color: #e74c3c; font-weight: bold;">${overdueDays} day${overdueDays > 1 ? 's' : ''}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold; color: #495057;">Fine Rate:</span>
                <span style="color: #495057;">₹5 per day</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0; border-top: 1px solid #dee2e6; padding-top: 10px;">
                <span style="font-weight: bold; color: #495057;">Total Fine:</span>
                <span style="color: #e74c3c; font-weight: bold; font-size: 18px;">₹${fineAmount}</span>
              </div>
            </div>
          </div>
          
          <div style="background-color: #e8f5e8; border: 1px solid #27ae60; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">📋 What You Need to Do:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #155724;">
              <li>Return the book as soon as possible to stop additional fines</li>
              <li>Pay the fine amount when returning the book</li>
              <li>Fines continue to accumulate at ₹5 per day until returned</li>
              <li>Contact us if you need to extend the due date</li>
            </ul>
          </div>
          
          <div style="background-color: #e3f2fd; border: 1px solid #2196f3; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #1565c0; margin: 0 0 15px 0; font-size: 18px;">📞 Need Help?</h4>
            <p style="margin: 0 0 10px 0; color: #1565c0;">
              If you have any questions or need assistance, please contact us:
            </p>
            <ul style="margin: 0; padding-left: 20px; color: #1565c0;">
              <li><strong>Email:</strong> library@infobeans.com</li>
              <li><strong>Phone:</strong> +1 (555) 123-4567</li>
              <li><strong>Hours:</strong> Monday-Friday: 9:00 AM - 6:00 PM</li>
              <li><strong>Location:</strong> 2nd Floor, InfoBeans Tower</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #6c757d; margin: 0; font-size: 14px;">
              Thank you for your prompt attention to this matter. 📚✨
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #6c757d; font-size: 12px; margin: 0;">
            This is an automated message from the InfoBeans Library Management System.<br>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: userEmail,
      subject: `⚠️ Book Overdue - Fine Amount: ₹${fineAmount} - InfoBeans Library`,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Overdue fine notification email sent successfully:', result.messageId);
    console.log(`   To: ${userEmail}`);
    console.log(`   Subject: ⚠️ Book Overdue - Fine Amount: ₹${fineAmount} - InfoBeans Library`);
    console.log(`   Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending overdue fine notification email:', error);
    console.error(`   To: ${userEmail}`);
    console.error(`   Error Details:`, error.message);
    throw error;
  }
};

// Send reminder email for books due soon (1 day left)
export const sendDueSoonReminder = async (userEmail, userName, bookTitle, returnDate) => {
  try {
    console.log(`📧 Attempting to send due soon reminder email to: ${userEmail}`);
    
    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email configuration missing: EMAIL_USER or EMAIL_PASS not set');
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    }
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">📚 InfoBeans Library</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">Book Return Reminder</p>
          </div>
          
          <div style="border-left: 4px solid #ffc107; padding-left: 20px; margin-bottom: 25px;">
            <h2 style="color: #2c3e50; margin: 0 0 10px 0;">Dear ${userName},</h2>
            <p style="color: #34495e; margin: 0; font-size: 16px; line-height: 1.6;">
              This is a friendly reminder that your book <strong style="color: #e74c3c;">"${bookTitle}"</strong> is due for return soon.
            </p>
          </div>
          
          <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); border: 1px solid #ffc107; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 22px;">⏰ Return Date Approaching</h3>
            <p style="margin: 0; color: #856404; font-size: 16px; line-height: 1.6;">
              Your book is due for return on <strong>${new Date(returnDate).toLocaleDateString()}</strong>.
            </p>
          </div>
          
          <div style="background-color: #e8f5e8; border: 1px solid #27ae60; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">📋 Your Options:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #155724;">
              <li><strong>Return the book</strong> on or before the due date to avoid fines</li>
              <li><strong>Request an extension</strong> if you need more time (subject to approval)</li>
              <li><strong>Reissue the book</strong> if no one else has requested it</li>
            </ul>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">⚠️ Important Reminders:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #856404;">
              <li>Late returns incur a fine of ₹5 per day</li>
              <li>Books must be returned in good condition</li>
              <li>Damage to books may result in additional charges</li>
              <li>Contact us immediately if the book is lost or damaged</li>
            </ul>
          </div>
          
          <div style="background-color: #e3f2fd; border: 1px solid #2196f3; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #1565c0; margin: 0 0 15px 0; font-size: 18px;">📞 Need Help?</h4>
            <p style="margin: 0 0 10px 0; color: #1565c0;">
              If you need to extend the due date or have any questions, please contact us:
            </p>
            <ul style="margin: 0; padding-left: 20px; color: #1565c0;">
              <li><strong>Email:</strong> library@infobeans.com</li>
              <li><strong>Phone:</strong> +1 (555) 123-4567</li>
              <li><strong>Hours:</strong> Monday-Friday: 9:00 AM - 6:00 PM</li>
              <li><strong>Location:</strong> 2nd Floor, InfoBeans Tower</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #6c757d; margin: 0; font-size: 14px;">
              Thank you for using our library! 📚✨
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #6c757d; font-size: 12px; margin: 0;">
            This is an automated message from the InfoBeans Library Management System.<br>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: userEmail,
      subject: `⏰ Book Return Reminder - Due: ${new Date(returnDate).toLocaleDateString()} - InfoBeans Library`,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Due soon reminder email sent successfully:', result.messageId);
    console.log(`   To: ${userEmail}`);
    console.log(`   Subject: ⏰ Book Return Reminder - Due: ${new Date(returnDate).toLocaleDateString()} - InfoBeans Library`);
    console.log(`   Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending due soon reminder email:', error);
    console.error(`   To: ${userEmail}`);
    console.error(`   Error Details:`, error.message);
    throw error;
  }
};

// Send book issue confirmation with care instructions
export const sendBookIssueConfirmation = async (userEmail, userName, bookTitle, issueDate, returnDate) => {
  try {
    console.log(`📧 Attempting to send book issue confirmation email to: ${userEmail}`);
    
    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email configuration missing: EMAIL_USER or EMAIL_PASS not set');
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    }
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">📚 InfoBeans Library</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">Book Successfully Issued</p>
          </div>
          
          <div style="border-left: 4px solid #27ae60; padding-left: 20px; margin-bottom: 25px;">
            <h2 style="color: #2c3e50; margin: 0 0 10px 0;">Dear ${userName},</h2>
            <p style="color: #34495e; margin: 0; font-size: 16px; line-height: 1.6;">
              Your book <strong style="color: #e74c3c;">"${bookTitle}"</strong> has been successfully issued from our library.
            </p>
          </div>
          
          <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); border: 1px solid #27ae60; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <h3 style="color: #155724; margin: 0 0 15px 0; font-size: 22px;">📖 Book Issued Successfully</h3>
            <p style="margin: 0; color: #155724; font-size: 16px; line-height: 1.6;">
              Please take good care of the book and return it on time to avoid fines.
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #495057; margin: 0 0 15px 0; font-size: 18px;">📋 Issue Details:</h4>
            <div style="background-color: white; padding: 15px; border-radius: 6px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold; color: #495057;">Book Title:</span>
                <span style="color: #495057;">${bookTitle}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold; color: #495057;">Issue Date:</span>
                <span style="color: #495057;">${new Date(issueDate).toLocaleDateString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0;">
                <span style="font-weight: bold; color: #495057;">Return Date:</span>
                <span style="color: #e74c3c; font-weight: bold;">${new Date(returnDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">⚠️ Important Care Instructions:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #856404;">
              <li><strong>Handle with care:</strong> Keep the book clean and dry</li>
              <li><strong>No writing or marking:</strong> Do not write, highlight, or mark in the book</li>
              <li><strong>Protect from damage:</strong> Keep away from food, drinks, and pets</li>
              <li><strong>Return on time:</strong> Late returns incur ₹5 per day fine</li>
              <li><strong>Report damage:</strong> Contact us immediately if book gets damaged</li>
            </ul>
          </div>
          
          <div style="background-color: #e8f5e8; border: 1px solid #27ae60; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">💰 Fine Policy:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #155724;">
              <li><strong>Overdue fines:</strong> ₹5 per day after due date</li>
              <li><strong>Damage fines:</strong> Variable based on damage severity</li>
              <li><strong>Lost books:</strong> Replacement cost + processing fee</li>
              <li><strong>Payment:</strong> Fines must be paid when returning books</li>
            </ul>
          </div>
          
          <div style="background-color: #e3f2fd; border: 1px solid #2196f3; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #1565c0; margin: 0 0 15px 0; font-size: 18px;">📞 Need Help?</h4>
            <p style="margin: 0 0 10px 0; color: #1565c0;">
              If you have any questions or need assistance, please contact us:
            </p>
            <ul style="margin: 0; padding-left: 20px; color: #1565c0;">
              <li><strong>Email:</strong> library@infobeans.com</li>
              <li><strong>Phone:</strong> +1 (555) 123-4567</li>
              <li><strong>Hours:</strong> Monday-Friday: 9:00 AM - 6:00 PM</li>
              <li><strong>Location:</strong> 2nd Floor, InfoBeans Tower</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #6c757d; margin: 0; font-size: 14px;">
              Happy reading! 📚✨
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #6c757d; font-size: 12px; margin: 0;">
            This is an automated message from the InfoBeans Library Management System.<br>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: userEmail,
      subject: `📖 Book Issued: "${bookTitle}" - Due: ${new Date(returnDate).toLocaleDateString()} - InfoBeans Library`,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Book issue confirmation email sent successfully:', result.messageId);
    console.log(`   To: ${userEmail}`);
    console.log(`   Subject: 📖 Book Issued: "${bookTitle}" - Due: ${new Date(returnDate).toLocaleDateString()} - InfoBeans Library`);
    console.log(`   Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending book issue confirmation email:', error);
    console.error(`   To: ${userEmail}`);
    console.error(`   Error Details:`, error.message);
    throw error;
  }
};

// Contact Us: Confirmation to user
export const sendContactConfirmationEmail = async (userEmail, userName, subject = 'Contact Inquiry', message = '') => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: userEmail,
      subject: `We received your message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color:#b30000">InfoBeans Foundation Library</h2>
          <p>Hi ${userName},</p>
          <p>Thanks for reaching out. We have received your message and will get back to you shortly.</p>
          <blockquote style="background:#fff5f5;border-left:4px solid #b30000;padding:12px 16px;">${message}</blockquote>
          <p>Regards,<br/>InfoBeans Library Team</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (e) {
    console.error('Error sending contact confirmation:', e.message);
    return false;
  }
};

// Contact Us: Forward to admin
export const sendContactForwardEmail = async (name, email, subject = 'Contact Inquiry', message = '') => {
  try {
    const adminEmail = process.env.CONTACT_RECEIVER || process.env.EMAIL_USER;
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: adminEmail,
      subject: `New Contact Message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color:#b30000">New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="background:#fff5f5;border-left:4px solid #b30000;padding:12px 16px;">${message}</blockquote>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (e) {
    console.error('Error forwarding contact message:', e.message);
    return false;
  }
};