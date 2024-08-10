const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const router = express.Router();

function sendResetPasswordEmail(user, token) {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "piodlords03@gmail.com",
            pass: "venm kcil svmm adzt",
        },
    });

    const mailOptions = {
        from: "piodlords03@gmail.com",
        to: user.email,
        subject: "Réinitialisation de mot de passe",
        text: `Bonjour ${user.username},

    Vous avez demandé une réinitialisation de mot de passe. Veuillez cliquer sur le lien ci-dessous pour réinitialiser votre mot de passe :
    
    http://localhost:5173/reset-password/${token}
    
    Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.

    Cordialement,
    Sen~Leaning`,
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
        const { email } = req.body.email;

        if (typeof email !== 'string') {
            return res.status(400).json({ error: "Format de l'email invalide !" });
        }

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé !" });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.RESET_PASSWORD_SECRET,
            {
                expiresIn: "1h",
            }
        );

        sendResetPasswordEmail(user, token);

        res.status(200).json({
            message: "Un e-mail de réinitialisation de mot de passe a été envoyé.",
        });
    } catch (error) {
        console.error("Error during forgot password:", error);
        res.status(500).json({
            error:
                "Une erreur s'est produite lors de la demande de réinitialisation de mot de passe.",
        });
    }
});

// Contrôleur pour la réinitialisation de mot de passe
router.post("/resetPassword/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
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
        console.error("Error during reset password:", error);
        res.status(500).json({
            error:
                "Une erreur s'est produite lors de la réinitialisation du mot de passe.",
        });
    }
});

module.exports = router;
