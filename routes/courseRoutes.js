const express = require('express');
const router = express.Router();
const courseController = require('../controllers/coursController');

// Route pour créer un cours
router.post('/cour', courseController.createCourse);

// Route pour récupérer tous les cours
router.get('/cours', courseController.getCourses);

// Route pour mettre à jour un cours par ID
router.put('/cour/:id', courseController.updateCourse);

// Route pour marquer un cours comme terminé
router.put('cours/:id/complete', courseController.completeCourse);

//suppression du cour
router.delete('/cours/:id', courseController.deteCourse)

module.exports = router;
