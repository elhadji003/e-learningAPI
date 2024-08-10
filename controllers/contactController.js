// controllers/contactController.js
const ContactMe = require("../models/ContatctMe");

// Créer un nouveau message de contact
exports.createMessage = async (req, res) => {
    try {
        const { fullName, email, message } = req.body;

        const newMessage = new ContactMe({
            fullName,
            email,
            message,
        });

        await newMessage.save();

        res.status(201).json({ message: "Message envoyé avec succès!" });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de l'envoi du message." });
    }
};

exports.getAllMessages = async (req, res) => {
    try {
        const messages = await ContactMe.find();
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des messages." });
    }
};

exports.getMessageById = async (req, res) => {
    try {
        const message = await ContactMe.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ error: "Message non trouvé." });
        }

        res.status(200).json(message);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération du message." });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const message = await ContactMe.findByIdAndDelete(req.params.id);

        if (!message) {
            return res.status(404).json({ error: "Message non trouvé." });
        }

        res.status(200).json({ message: "Message supprimé avec succès!" });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la suppression du message." });
    }
};
