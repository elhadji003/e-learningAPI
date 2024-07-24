const express = require('express');
const User = require('../models/User');
const path = require('path');
const upload = require('../middlewares/multer');

const router = express.Router();

// Endpoint to upload an image
router.post('/upload/:id', upload.single('avatar'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Aucun fichier téléchargé' });
        }

        // Mettre à jour profileImageUrl dans le modèle User
        user.profileImageUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        await user.save();

        res.status(201).json({
            message: 'Image de profil mise à jour avec succès',
            profileImageUrl: user.profileImageUrl
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'image de profil:', error);
        res.status(500).json({ message: 'Échec de la mise à jour de l\'image de profil', error: error.message });
    }
});

// Endpoint pour récupérer toutes les images
router.get('/images', async (req, res) => {
    try {
        const files = await User.find().toArray();

        if (files.length === 0) {
            return res.status(404).json({ message: 'Aucune image trouvée' });
        }

        res.status(200).json({ files });
    } catch (error) {
        console.error('Erreur lors de la récupération des images:', error);
        res.status(500).json({ message: 'Échec de la récupération des images', error: error.message });
    }
});

// Endpoint pour télécharger une image par nom de fichier
router.get('/download/:filename', async (req, res) => {
    try {
        const downloadStream = User.openDownloadStreamByName(req.params.filename);

        downloadStream.on('file', () => {
            res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`);
        });

        downloadStream.on('error', () => {
            res.status(404).json({ message: 'Image non trouvée' });
        });

        downloadStream.pipe(res);
    } catch (error) {
        console.error('Erreur lors du téléchargement de l\'image:', error);
        res.status(500).json({ message: 'Échec du téléchargement de l\'image', error: error.message });
    }
});

module.exports = router;
