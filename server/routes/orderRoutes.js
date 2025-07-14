const express = require('express');
const Order = require('../models/Order');
const router = express.Router(); // ✅ This was missing in your error version

// Get next order ID
router.get('/next-id', async (req, res) => {
  try {
    const lastOrder = await Order.findOne().sort({ orderId: -1 });
    const nextOrderId = lastOrder ? lastOrder.orderId + 1 : 1;
    res.status(200).json({ nextOrderId });
  } catch (err) {
    res.status(500).json({
      message: 'Error generating order ID',
      error: err.message,
    });
  }
});

// Create new order
router.post('/create', async (req, res) => {
  try {
    const {
      username,
      phone,
      address,
      plantName,
      quantity,
      totalAmount,
      orderDate,
      paymentMethod,
      paymentId,
      status,
    } = req.body;

    const lastOrder = await Order.findOne().sort({ orderId: -1 });
    const newOrderId = lastOrder ? lastOrder.orderId + 1 : 1;

    const newOrder = new Order({
      orderId: newOrderId,
      username,
      phone,
      address,
      plantName,
      quantity,
      totalAmount,
      createdAt: orderDate,
      paymentMethod,
      paymentId,
      status,
    });

    await newOrder.save();

    res.status(201).json({
      message: 'Order placed successfully',
      order: newOrder,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Error placing order',
      error: err.message,
    });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderId: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching orders',
      error: err.message,
    });
  }
});

// Get orders by username
router.get('/user/:username', async (req, res) => {
  try {
    const orders = await Order.find({ username: req.params.username }).sort({
      orderId: -1,
    });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching user orders',
      error: err.message,
    });
  }
});

// Update order status
router.put('/update-status/:orderId', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      message: 'Order status updated successfully',
      order: updatedOrder,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error updating order status',
      error: err.message,
    });
  }
});


// In your order creation route
router.post('/create', async (req, res) => {
  try {
    const { cartItems, ...orderData } = req.body;
    
    // Create the order
    const newOrder = new Order(orderData);
    await newOrder.save();
    
    // Update stock for each plant
    for (const item of cartItems) {
      const plant = await Plant.findById(item.plantId);
      if (plant) {
        plant.stock = Math.max(0, plant.stock - item.quantity);
        await plant.save();
      }
    }
    
    // Clear the user's cart
    await Cart.deleteMany({ userId: orderData.userId });
    
    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

module.exports = router;
