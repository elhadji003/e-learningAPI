const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendAccountDeletionEmail } = require('../config/mailer');


const register = async (req, res) => {
  const { username, email, level, number, password, address, ville, code_postal, pays, role } = req.body;

  // console.log('Received data:', { username, email, level, number, password, address, ville, code_postal, pays, role });

  try {
    const userExists = await User.findOne({ email });
    console.log('User exists:', userExists);

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      level,
      number,
      password: hashedPassword,
      address,
      ville,
      code_postal,
      pays,
      role,
    });

    console.log('User created:', user);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        number: user.number,
        level: user.level,
        address: user.address,
        ville: user.ville,
        code_postal: user.code_postal,
        pays: user.pays,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: "Server error" });
  }
};


const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User n'existe pas" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        number: user.number,
        level: user.level,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteMeAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).send('User not found');

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(req.user.id);

    // Envoyer un email de confirmation
    await sendAccountDeletionEmail(user.email, user.username);

    res.status(200).send('Account deleted');
  } catch (error) {
    res.status(500).send('Server error');
  }
};

const getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    if (!userId) {
      return res.status(400).json({ message: "L'ID de l'utilisateur non trouvé" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { username, email, level, number, password, address, ville, code_postal, pays, role } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const updateData = { username, email, level, number, address, ville, code_postal, pays, role };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.status(200).json({ message: "L'utilisateur a été supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

const updatePassword = async (req, res) => {
  const userId = req.user.id; // ID de l'utilisateur connecté
  const { currentPassword, newPassword } = req.body;

  try {
    // Trouver l'utilisateur par ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier si le mot de passe actuel est correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe actuel incorrect" });
    }

    // Hacher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Enregistrer les modifications
    await user.save();

    res.status(200).json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};

module.exports = {
  register,
  login,
  getMe,
  deleteMeAccount,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  refreshToken,
  updatePassword
};
