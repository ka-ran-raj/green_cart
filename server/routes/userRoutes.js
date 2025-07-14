const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, email, address, mobile, password } = req.body;

  try {
    // Check for each field separately
    const [existingUsername, existingEmail, existingMobile] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ email }),
      User.findOne({ mobile })
    ]);

    if (existingUsername) {
      return res.status(409).json({ message: 'Username already exists. Please choose another.' });
    }
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already exists. Try logging in or use another email.' });
    }
    if (existingMobile) {
      return res.status(409).json({ message: 'Mobile number already registered. Use a different one.' });
    }

    const newUser = new User({ username, email, address, mobile, password });
    await newUser.save();
    res.status(201).json({ message: 'Signup successful' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const userToSend = {
      _id: user._id,
      username: user.username, 
      email: user.email,
      address: user.address,
      mobile: user.mobile,
      isAdmin: user.isAdmin 
    };
    
    res.status(200).json({ message: 'Login successful', user: userToSend });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // exclude passwords
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;