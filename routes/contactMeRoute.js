const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

router.post("/contact", contactController.createMessage);
router.get("/contacts", contactController.getAllMessages);
router.get("/contact/:id", contactController.getMessageById);
router.delete("/contact/:id", contactController.deleteMessage);

module.exports = router;
