// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const upload = require("../middlewares/multer");
const { verifyToken } = require("../middlewares/authMidlleware");

// Upload de l'image de profil
router.post("/profileImage", verifyToken, upload.single("profileImage"), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        console.log("userID", user);

        if (!user) {
            return res.status(404).send("Utilisateur non trouvé");
        }

        if (!req.file) {
            return res.status(400).send("Aucun fichier téléchargé");
        }

        user.profileImageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        await user.save();

        res.send({ profileImageUrl: user.profileImageUrl });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erreur du serveur");
    }
});

// Afficher le profil de l'utilisateur par ID
router.get("/profile/:id", async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId).select("profileImageUrl");

        if (!user) {
            return res.status(404).json({ msg: "Utilisateur non trouvé" });
        }

        res.json({ profileImageUrl: user.profileImageUrl });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erreur du serveur");
    }
});

module.exports = router;
