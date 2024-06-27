

const nodemailer = require("nodemailer");

async function sendVerificationEmail(email, otp) {
  console.log("email",email)
  console.log("token",process.env.Email)

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "gmail",
      port: 465,
      secure: true,
      auth: {
        user: process.env.Email,
        pass: process.env.pass,
      },
    });

    const verificationLink = `http://localhost:443/api/auth/user/verify/${otp}`;

    const mailOptions = {
      from: `${process.env.Email}`,
      to: email,
      subject: `Account Verification`,
      html: `
        <h1>Welcome to pricewards</h1>
        <p>Dear User,</p>
        <p>Please click the OTP below to verify your account:</p>
        <p>Your OTP is ${otp}. Please use this OTP to Set your Account.</p>
        <p>If you have any questions, feel free to reply to this email. We're here to help!</p>
        <p>Best,</p>
        <p>The pricewards Team</p>
      `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    ////console.log("Email sent successfully:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}



async function sendEmailWithAttachment(email ,linkPath) {


    try {
      
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        service: "gmail",
        port: 465,
        secure: true,
        auth: {
          user: process.env.Email,
          pass: process.env.pass,
        },
      });
      ////console.log(email)
  
      const mailOptions = {
        from: `${process.env.Email} `,
        to: email,
        subject: `Project Initation`,
        text: `Hi Dear,\n click the below link to join the pricewards \n ${linkPath}`,
      };
  
      // Send the email
      const info = await transporter.sendMail(mailOptions);
      ////console.log("Email sent successfully:", info.response);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  async function sendForgotPasswordEmail(email, otp) {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        service: "gmail",
        port: 465,
        secure: true,
        auth: {
          user: process.env.Email,
          pass: process.env.pass,
        },
      });
  
      const mailOptions = {
        from: `${process.env.Email} `,
        to: email,
        subject: `Password Reset OTP`,
        html: `
        <h1>Password Reset OTP</h1>
        <p>Dear User,</p>
        <p>Your OTP for password reset is ${otp}. Please use this OTP to reset your password.</p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have any concerns.</p>
        <p>Best,</p>
        <p>The pricewards Team</p>
      `,
      };

  
      // Send the email
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.response);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }


  async function sendContactEmail(contact,agentEmail) {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        service: "gmail",
        port: 465,
        secure: true,
        auth: {
          user: process.env.Email,
          pass: process.env.pass,
        },
      });
  
      // Email to the user
      //    <p>Message: ${contact.message}</p>
      const userMailOptions = {
        from: `${process.env.Email}`,
        to: contact.email,
        subject: `Thank you for contacting us!`,
        html: `
          <h1>Thank you for contacting us!</h1>
          <p>Dear ${contact.name},</p>
          <p>We have received your message and will get back to you soon.</p>
      
          <p>If you have any questions, feel free to reply to this email. We're here to help!</p>
          <p>Best,</p>
          <p>The pricewards Team</p>
        `,
      };
  
      // Email to the admin
      const receverEmail=agentEmail?agentEmail:process.env.ADMIN_EMAIL;
      const adminMailOptions = {
        from: `${process.env.Email}`,
        to: receverEmail,  // Admin email address stored in environment variable
        subject: `New Contact Message from ${contact.name}`,
        html: `
          <h1>New Contact Message</h1>
          <p><strong>Name:</strong> ${contact.name}</p>
          <p><strong>Email:</strong> ${contact.email}</p>
          <p><strong>Mobile Number:</strong> ${contact.mobileNumber}</p>
          <p><strong>Message:</strong> ${contact.message}</p>
          <p><strong>Interest:</strong> ${contact.interest}</p>
          
        `,
      };
  
      // Send the email to the user
      await transporter.sendMail(userMailOptions);
      console.log("User email sent successfully");
  
      // Send the email to the admin
      await transporter.sendMail(adminMailOptions);
      console.log("Admin email sent successfully");
  
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }
  module.exports = { sendEmailWithAttachment, sendForgotPasswordEmail, sendVerificationEmail ,sendContactEmail};