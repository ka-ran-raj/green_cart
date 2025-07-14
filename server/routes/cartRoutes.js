const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

router.post('/', async (req, res) => {
  const { userId, plantId } = req.body;

  try {
    const existingCart = await Cart.findOne({ userId, plantId });

    if (existingCart) {
      existingCart.quantity += 1;
      await existingCart.save();
      return res.status(200).json({ message: 'Quantity updated in cart' });
    }

    const cartItem = new Cart({ userId, plantId });
    await cartItem.save();

    res.status(201).json({ message: 'Added to cart successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.params.userId }).populate('plantId');
    const formattedCart = cartItems.map(item => ({
      _id: item._id,
      quantity: item.quantity,
      plant: item.plantId
    }));
    res.json(formattedCart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Item removed from Divya' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to remove from cart' });
  }
});



// POST to cart
router.post('/', async (req, res) => {
  try {
    const { userId, plantId } = req.body;

    // Check if plant exists and has stock
    const plant = await Plant.findById(plantId);
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }
    
    if (plant.stock <= 0) {
      return res.status(400).json({ message: 'Plant is out of stock' });
    }

    // Check if item already in cart
    const existingCartItem = await Cart.findOne({ userId, plantId });
    
    if (existingCartItem) {
      // Increment quantity if already in cart
      existingCartItem.quantity += 1;
      
      // Check if requested quantity is available
      if (existingCartItem.quantity > plant.stock) {
        return res.status(400).json({ message: 'Not enough stock available' });
      }
      
      await existingCartItem.save();
      return res.status(200).json(existingCartItem);
    } else {
      // Create new cart item
      const cartItem = new Cart({
        userId,
        plantId,
        quantity: 1
      });
      
      await cartItem.save();
      return res.status(201).json(cartItem);
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;