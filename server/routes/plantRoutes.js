const express = require('express');
const router = express.Router();
const Plant = require('../models/Plant');
const Cart = require('../models/Cart');

// GET all plants
router.get('/', async (req, res) => {
  try {
    const plants = await Plant.find();
    res.json(plants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new plant
router.post('/', async (req, res) => {
  try {
    const newPlant = new Plant(req.body);
    await newPlant.save();
    res.status(201).json(newPlant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE plant
router.put('/:id', async (req, res) => {
  try {
    const updatedPlant = await Plant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPlant) return res.status(404).json({ message: 'Plant not found' });
    res.status(200).json(updatedPlant);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE plant and its cart items
router.delete('/:id', async (req, res) => {
  const plantId = req.params.id;

  try {
    const plant = await Plant.findById(plantId);
    if (!plant) return res.status(404).json({ message: 'Plant not found' });

    // Delete cart entries referencing this plant
    await Cart.deleteMany({ plantId });

    // Now delete the plant
    await Plant.findByIdAndDelete(plantId);

    res.status(200).json({ message: 'Plant and related cart items deleted successfully' });
  } catch (err) {
    console.error('Error deleting plant:', err);
    res.status(500).json({ message: 'Failed to delete plant', error: err.message });
  }
});

module.exports = router;
