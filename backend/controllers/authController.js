import jwt from "jsonwebtoken";
import User from "../models/User.js";

function publicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function createSession(user, statusCode, res) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(statusCode).json({ user: publicUser(user) });
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Compila tutti i campi" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "La password deve avere almeno 8 caratteri" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email gia registrata" });
    }

    const user = await User.create({ name, email, password });
    createSession(user, 201, res);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Inserisci email e password" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    const passwordIsCorrect = user && (await user.checkPassword(password));

    if (!passwordIsCorrect) {
      return res.status(401).json({ message: "Credenziali non corrette" });
    }

    createSession(user, 200, res);
  } catch (error) {
    next(error);
  }
}

export function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ message: "Logout effettuato" });
}

export function getMe(req, res) {
  res.json({ user: publicUser(req.user) });
}
