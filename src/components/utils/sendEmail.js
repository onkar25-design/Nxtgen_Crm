// src/utils/sendEmail.js
import emailjs from 'emailjs-com';

const sendEmail = (to, subject, message) => {
  const templateParams = {
    to_email: to, // This will now use the client email passed in
    subject: subject,
    message: message,
  };

  // Return the promise from the emailjs.send call
  return emailjs.send('service_84pzma9', 'template_4ymgh0h', templateParams, 'S_LFBpveBP0WqmWVg')
    .then((response) => {
      console.log('Email sent successfully!', response.status, response.text);
    })
    .catch((error) => {
      console.error('Error sending email:', error);
      throw error; // Rethrow the error to be caught in the calling function
    });
};

export default sendEmail;
