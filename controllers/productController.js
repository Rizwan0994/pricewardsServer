const asyncHandler = require("express-async-handler");
const Product = require("../models/product");

// Create a new product
const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description, imageUrl, code, stock, length, width, discount, freeShipping, seasonalCategory, fabricCategory, productGender, userId } = req.body;
  console.log(req.body);                        

  try {
    const product = new Product({
      name,
      price,
      description,
      imageUrl: Array.isArray(imageUrl) ? imageUrl : [imageUrl],
      code,
      stock,
      length,
      width,
      discount,
      freeShipping,
      seasonalCategory,
      fabricCategory,
      productGender,
      userId
    });

    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get a single product by ID
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all products
const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update a product by ID
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, price, description, imageUrl, code, stock, length, width, discount, freeShipping, seasonalCategory, fabricCategory, productGender, userId } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.imageUrl = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
    product.code = code || product.code;
    product.stock = stock || product.stock;
    product.length = length || product.length;
    product.width = width || product.width;
    product.discount = discount || product.discount;
    product.freeShipping = freeShipping || product.freeShipping;
    product.seasonalCategory = seasonalCategory || product.seasonalCategory;
    product.fabricCategory = fabricCategory || product.fabricCategory;
    product.productGender = productGender || product.productGender;
  
    await product.save();

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a product by ID
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.remove();
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
};