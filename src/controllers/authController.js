const { registerUser, loginUser } = require('../services/authService');

async function register(req, res) {
  try {
    const { firstName, lastName, email, password, category } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const { user, token } = await registerUser({
      firstName,
      lastName,
      email,
      password,
      category
    });
    return res.status(201).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        category: user.category
      },
      token
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || 'Internal server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }
    const { user, token } = await loginUser({ email, password });
    return res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        category: user.category
      },
      token
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || 'Internal server error' });
  }
}

module.exports = {
  register,
  login
};


