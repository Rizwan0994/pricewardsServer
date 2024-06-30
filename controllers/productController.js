const asyncHandler = require("express-async-handler");
const Product = require("../models/product");
const User = require("../models/user");

// Create a new product
const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description, imageUrl, code, stock, length, width, discount, freeShipping, seasonalCategory, fabricCategory, productGender,sold,category,size } = req.body;
   
  const userId = req.loginUser._id; 
  let isApproved = false; 
        //find user role using userId id admin
        const user = await User.findById(userId);
        if (user.role === 'admin') {
          isApproved = true;
        }


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
      userId,
      size,
      isApproved: isApproved 
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
// const getAllProducts = asyncHandler(async (req, res) => {
//   const {name, isAdminApproval, minPrice, maxPrice, bestFilter, page = 1, limit = 10 } = req.query;
// let {category} = req.query;
//   let filter = { isApproved: true};

//   if (minPrice || maxPrice) {
//     filter.price = {};
//     if (minPrice) filter.price.$gte = parseFloat(minPrice);
//     if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
//   }

//   // if (category) {
//   //   const categoryRegex = new RegExp(category, 'i'); // 'i' for case-insensitive
//   //   filter.category = categoryRegex;
//   // }
//   if (category) {
//     category = category.replace(/^\[|\]$/g, '').split(',');

//     // Since category is already an array, we can directly use it for filtering.
//     filter.category = { $in: category };
// }
  
//   if (name) {
//     const nameRegex = new RegExp(name, 'i'); // 'i' for case-insensitive
//     filter.name = nameRegex;
//   }
//   if (bestFilter) {
//     filter.rating = { $gte: 4 }; // Assuming `rating` field exists in your schema
//   }

//   try {
//     const offset = (page - 1) * limit;
//     const totalCount = await Product.countDocuments(filter);
//     const products = await Product.find(filter).populate('userId');
//       // .skip(offset)
//       // .limit(parseInt(limit));

//     const totalPages = Math.ceil(totalCount / limit);

//     res.status(200).json({
//       success: true,
//       products,
//       // page: parseInt(page),
//       // limit: parseInt(limit),
//       totalCount: totalCount,
//       // totalPages: totalPages,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });


// Get all products
const getAllProducts = asyncHandler(async (req, res) => {
  const { name, isAdminApproval, minPrice, maxPrice, bestFilter, page = 1, limit = 10 } = req.query;
  let { category } = req.query;
  let filter = {};

if (isAdminApproval !== 'true') {
  filter.isApproved = true;
}
if (isAdminApproval === 'true') {
  filter.isApproved = false;
}

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  if (category) {
    try {
      // Attempt to parse the category as JSON
      category = JSON.parse(category);
    } catch (error) {
      // If parsing fails, assume it's a single category string and wrap it in an array
      category = [category];
    }
  
    // Convert each category to a regex for case-insensitive matching
    const categoryRegexes = category.map(cat => new RegExp(cat, 'i'));
  
    filter.category = { $in: categoryRegexes };
  }

  if (name) {
    const nameRegex = new RegExp(name, 'i');
    filter.name = nameRegex;
  }

  if (bestFilter) {
    filter.rating = { $gte: 4 }; 
  }

  try {
    const offset = (page - 1) * limit;

    // Find admin users
    const adminUsers = await User.find({ role: 'admin' });
    // console.log(adminUsers);

    // Extract admin user IDs
    const adminUserIds = adminUsers.map(user => user._id);
    console.log(adminUserIds);
    // Add admin user IDs to filter
    if (isAdminApproval !== 'true') {
      console.log('filtering by admin user IDs');
    filter.userId = { $in: adminUserIds };
    }

    const totalCount = await Product.countDocuments(filter);
    const products = await Product.find(filter).populate('userId')
      // .skip(offset)
      // .limit(parseInt(limit));

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      products,
      // page: parseInt(page),
      // limit: parseInt(limit),
      totalCount,
      // totalPages,
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
    const filter = { userId: userId, isApproved: true};
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
  const { name, price, description, imageUrl, code, stock, length, width, discount, freeShipping, seasonalCategory, fabricCategory, productGender,category,size } = req.body;
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
    product.size = size || product.size;
  
    await product.save();

    res.status(200).json({ success: true, product , message: 'Product updated successfully'});
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
    const products = await Product.find({isApproved: true})
      .sort({ sold: -1 }) // Sort in descending order of 'sold' field
      .limit(8) // Limit to top 8 products
      .populate('userId'); // Populate 'userId' field

    res.status(200).json({ success: true, products, message: 'Top 8 best-selling products'});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const getUserBestSellingProducts = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from request parameters
 //find userinfo
 const user = await User.findById(userId);
    const products = await Product.find({ userId ,isApproved: true}) // Filter by userId
      .sort({ sold: -1 }) // Sort in descending order of 'sold' field
      // .populate('userId'); // Populate 'userId' field

    res.status(200).json({ success: true, products,user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//create controller where we can approve product
const approveProduct = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  try {
    const product = await Product
      .findByIdAndUpdate(productId, { isApproved: true }, { new: true })
      .populate('userId');
    res.status(200).json({ success: true, product, message: 'Product approved successfully'});
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
  getUserBestSellingProducts,
  approveProduct
};