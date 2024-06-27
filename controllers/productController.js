const asyncHandler = require("express-async-handler");
const Product = require("../models/product");

// Create a new product
const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description, imageUrl, code, stock, length, width, discount, freeShipping, seasonalCategory, fabricCategory, productGender,sold,category } = req.body;
  console.log(req.body);     
  const userId = req.loginUser._id;               

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
      category:category,
      productGender,
      sold,
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
    const product = await Product.findById(id).populate('userId');
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
  const {name, minPrice, maxPrice, category, bestFilter, page = 1, limit = 10 } = req.query;

  let filter = {};

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  // if (category) {
  //   const categoryRegex = new RegExp(category, 'i'); // 'i' for case-insensitive
  //   filter.category = categoryRegex;
  // }
  if (category) {
    const categories = Array.isArray(category) ? category : [category];
    filter.category = { $in: categories.map(cat => new RegExp(cat, 'i')) };
  }
  
  if (name) {
    const nameRegex = new RegExp(name, 'i'); // 'i' for case-insensitive
    filter.name = nameRegex;
  }
  if (bestFilter) {
    filter.rating = { $gte: 4 }; // Assuming `rating` field exists in your schema
  }

  try {
    const offset = (page - 1) * limit;
    const totalCount = await Product.countDocuments(filter);
    const products = await Product.find(filter).populate('userId');
      // .skip(offset)
      // .limit(parseInt(limit));

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      products,
      // page: parseInt(page),
      // limit: parseInt(limit),
      totalCount: totalCount,
      // totalPages: totalPages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Find all products of a specific user
const getUserProducts = asyncHandler(async (req, res) => {
  const userId = req.loginUser._id; // Get userId from the logged-in user context
  const { page = 1, limit = 10 } = req.query;

  try {
    const filter = { userId: userId };
    const offset = (page - 1) * limit;
    const totalCount = await Product.countDocuments(filter);
    const products = await Product.find(filter).populate('userId');
    
      // .skip(offset)
      // .limit(parseInt(limit));

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      products,
      // page: parseInt(page),
      // limit: parseInt(limit),
      totalCount: totalCount,
      // totalPages: totalPages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update a product by ID
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, price, description, imageUrl, code, stock, length, width, discount, freeShipping, seasonalCategory, fabricCategory, productGender,category } = req.body;
  const userId = req.loginUser._id; 
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
    product.category = category || product.category;
  
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


const getBestSellingProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({})
      .sort({ sold: -1 }) // Sort in descending order of 'sold' field
      .limit(8) // Limit to top 8 products
      .populate('userId'); // Populate 'userId' field

    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const getUserBestSellingProducts = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from request parameters

    const products = await Product.find({ userId }) // Filter by userId
      .sort({ sold: -1 }) // Sort in descending order of 'sold' field
      .populate('userId'); // Populate 'userId' field

    res.status(200).json({ success: true, products });
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
  getUserProducts,
  getBestSellingProducts,
  getUserBestSellingProducts
};