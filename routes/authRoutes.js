const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  getAllUsers,
  deleteUser,
  getUserById,
  updateUser,
  refreshToken,
  updatePassword,
  deleteMeAccount,
} = require("../controllers/authController");
const { verifyToken, isAdmin } = require("../middlewares/authMidlleware");

// Routes publiques
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);  // Route pour rafraîchir le token

// Routes protégées par l'authentification
router.get("/me", verifyToken, getMe);
router.delete("/deleteMeAccount", verifyToken, deleteMeAccount);
router.get("/users", getAllUsers);
router.put("/update/:id", updateUser);
router.put('/updatePwd', verifyToken, updatePassword);



// Routes protégées par l'authentification et nécessitant un rôle admin
router.get("/users/:id", verifyToken, isAdmin, getUserById);
router.delete("/delete/:id", verifyToken, isAdmin, deleteUser);
module.exports = router;
