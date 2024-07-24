const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");


// Fonction pour envoyer un email de réinitialisation de mot de passe
function sendResetPasswordEmail(user, token) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Réinitialisation de mot de passe",
        text: `Bonjour ${user.username},

        Vous avez demandé une réinitialisation de mot de passe. Veuillez cliquer sur le lien ci-dessous pour réinitialiser votre mot de passe :

        ${process.env.CLIENT_URL}/reset-password/${token}

        Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.

        Cordialement,
        Votre équipe`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email envoyé: " + info.response);
        }
    });
}

// Contrôleur pour la demande de réinitialisation de mot de passe
router.post("/forgotPassword", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé !" });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.RESET_PASSWORD_SECRET,
            { expiresIn: "1h" } // Durée de validité du token de réinitialisation
        );

        sendResetPasswordEmail(user, token);

        res.status(200).json({
            message: "Un e-mail de réinitialisation de mot de passe a été envoyé.",
        });
    } catch (error) {
        console.error("Erreur lors de la demande de réinitialisation de mot de passe:", error);
        res.status(500).json({
            error: "Une erreur s'est produite lors de la demande de réinitialisation de mot de passe.",
        });
    }
});

// Contrôleur pour la réinitialisation du mot de passe
router.post("/resetPassword", async (req, res) => {
    try {
        const { token, password } = req.body;
        const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé !" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
    } catch (error) {
        console.error("Erreur lors de la réinitialisation du mot de passe:", error);
        res.status(500).json({
            error: "Une erreur s'est produite lors de la réinitialisation du mot de passe.",
        });
    }
});

module.exports = router;
