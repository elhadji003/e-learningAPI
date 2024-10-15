const Course = require('../models/Cours');

// Créer un nouveau cours
exports.createCourse = async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).json(course);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Récupérer tous les cours
exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour un cours
exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!course) {
            return res.status(404).json({ message: 'Cours non trouvé' });
        }
        res.status(200).json(course);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Marquer un cours comme terminé par un utilisateur
exports.completeCourse = async (req, res) => {
    try {
        const { userId } = req.body; // Récupérer l'ID de l'utilisateur depuis le corps de la requête
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Cours non trouvé' });
        }

        // Ajouter l'utilisateur à la liste des utilisateurs ayant terminé le cours
        if (!course.completedBy.includes(userId)) {
            course.completedBy.push(userId);
            await course.save();
        }

        res.status(200).json(course);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deteCourse = async (req, res) => {

    try {
        const course = await Course.findByIdAndDelete(req.params.id);

        if (!course) {
            return res.status(404).json({ error: "cours non trouvé" })
        }

        res.status(200).json({ message: "cours supprime avec succes" })
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression du cours" })
    }


}
