const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SALT_ROUNDS = 10;

async function registerUser({ firstName, lastName, email, password, category }) {
  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      const error = new Error('Email already registered');
      error.statusCode = 400;
      throw error;
    }
  
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const existingFullName = await User.findOne({ fullName });
    if (existingFullName) {
      const error = new Error('User with this fullName already exists');
      error.statusCode = 400;
      throw error;
    }
  
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  
    const user = await User.create({
      firstName,
      lastName,
      fullName,
      email,
      password: hashedPassword,
      category
    });
  
    const token = generateToken(user);
    return { user, token };
  } catch (error) {
    throw error;
  }
}


// async function test(params) {
//   await registerUser({
//     firstName: "ashish",
//     lastName: "garg",
//     email: "ashish@snabbtech.com",
//     password: "123456",
//     category: "admin"
//   })
// }
// test()

async function loginUser({ email, password }) {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }
  
    const token = generateToken(user);
    return { user, token };
  } catch (error) {
    throw error;
  }
}

function generateToken(user) {
  const payload = { id: user._id, email: user.email };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

module.exports = {
  registerUser,
  loginUser
};


