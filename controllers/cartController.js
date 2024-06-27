// controllers/cartController.js

const asyncHandler = require('express-async-handler');
const Cart = require('../models/cart');
const Product = require('../models/product');

const Order = require('../models/order');
// Add an item to the cart
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.loginUser._id;

  try {

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.stock < quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
      }

    //   const  cart = await Cart.findOne({ userId });
    // if (cart) {
    //   const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    //   if (itemIndex > -1) {
    //     cart.items[itemIndex].quantity += quantity;
    //   } else {
    //     cart.items.push({ productId, quantity });
    //   }

    //   await cart.save();
    // } else {
    //   await Cart.create({ userId, items: [{ productId, quantity }] });
    // }
    let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }

  await cart.save();

  await cart.save();
    res.status(200).json({ success: true, message: 'Product added to cart',cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove an item from the cart
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.loginUser._id;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);

    await cart.save();

    res.status(200).json({ success: true, message: 'Product removed from cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// View the cart
const viewCart = asyncHandler(async (req, res) => {
  const userId = req.loginUser._id;

  try {
    // const cart = await Cart.findOne({ userId }).populate('items.productId');
    const cart = await Cart.findOne({ userId })
      .populate({
        path: 'items.productId',
        populate: { path: 'userId' } 
      });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update the quantity of an item in the cart
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.loginUser._id;

  try {
    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
    
      if (product.stock < quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
      }

    let cart = await Cart.findOne({ userId });

  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = quantity;
  } else {
    cart.items.push({ productId, quantity });
  }

    await cart.save();

    res.status(200).json({ success: true, message: 'Cart updated', cart});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// Checkout
const checkout = asyncHandler(async (req, res) => {
    const userId = req.loginUser._id;
    const { shippingAddress, paymentMethod } = req.body;
  
    try {
      const cart = await Cart.findOne({ userId }).populate('items.productId');
  
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty' });
      }
  
        // Check if all items have sufficient stock
  for (const item of cart.items) {
    if (item.productId.stock < item.quantity) {
      return res.status(400).json({ success: false, message: `Insufficient stock for product ${item.productId.name}` });
    }
  }

      // Calculate total price
      const totalPrice = cart.items.reduce((acc, item) => acc + item.productId.price * item.quantity, 0);
  
      // Create order
      const order = new Order({
        userId,
        items: cart.items,
        shippingAddress,
        paymentMethod,
        totalPrice
      });
  
      await order.save();

      // Reduce stock
  for (const item of cart.items) {
    const product = await Product.findById(item.productId._id);
    product.stock -= item.quantity;
    await product.save();
  }
  
      // Clear cart
      cart.items = [];
      await cart.save();
  
      res.status(201).json({ success: true, order });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
module.exports = {
  addToCart,
  removeFromCart,
  viewCart,
  updateCartItem,
  checkout
};
