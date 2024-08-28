const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail', // Utilisez votre service d'email ici
    auth: {
        user: "piodlords03@gmail.com",
        pass: "venm kcil svmm adzt",
    },
});

const sendAccountDeletionEmail = (to, username) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Compte supprimé',
        text: `Bonjour ${username},\n\nVotre compte sur SEN~LEARNING a été supprimé avec succès.\n\nMerci.`
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendAccountDeletionEmail };
