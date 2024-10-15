const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, enum: ["troisieme", "seconde", "premier", "terminal"] },
    lessons: [{
        title: String,
        content: String,
        videoUrl: String,
    }],
    completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Course', courseSchema);
