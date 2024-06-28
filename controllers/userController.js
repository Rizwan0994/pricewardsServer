const asyncHandler = require("express-async-handler");
const  User = require("../models/user");
const bcrypt = require("bcrypt");

// Reset password from Profile settings
const resetProfilePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.loginUser.id;

  if (!userId || !oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'Data Missing!' });
  }
  // Find the user by userId
  const user = await User.findById(userId);
  if (!user) {
    return res.status(400).json({ success: false, message: 'User not found' });
  }

  // Compare old password with the stored password
  const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordMatch) {
    return res.status(400).json({ success: false, message: 'Old password is incorrect' });
  }

  // Check if new password and confirm password match
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'New password and confirm password do not match' });
  }

  // Update the password with the new password
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.status(200).json({ success: true, message: 'Password reset successfully' });
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const data = req.body;
  const userId = req.loginUser.id;

  // Find the user by userId
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  try {
    // Update and save the changes to the database
    user.name = data.name || user.name;
    user.phoneNumber = data.phoneNumber || user.phoneNumber;
    user.image = data.image || user.image;
    user.address = data.address || user.address;
    user.country = data.country || user.country;
    user.city = data.city || user.city;
    user.whatsappNumber = data.whatsappNumber || user.whatsappNumber;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user: {
        name: user.name,
        phoneNumber: user.phoneNumber,
        email: user.email,
        image: user.image,
        address: user.address,
        country: user.country,
        city: user.city,
        whatsappNumber: user.whatsappNumber
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update user profile" });
  }
});

const deleteUserProfile = asyncHandler(async (req, res) => {
  const userId = req.loginUser.id;

  try {
    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Delete the user
    await user.remove();

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete user profile" });
  }
});

// Find all users whose role is "designer"
const findAllDesigners = asyncHandler(async (req, res) => {
  try {
    const designers = await User.aggregate([
      { $match: { role: 'designer' } },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'userId',
          as: 'products'
        }
      },
      {
        $addFields: {
          totalSold: { $sum: '$products.sold' }
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          profileName: 1,
          email: 1,
          description: 1,
          phoneNumber: 1,
          address: 1,
          role: 1,
          image: 1,
          verified: 1,
          totalSold: 1
        }
      }
    ]);

    res.status(200).json({ success: true, designers, message: 'Designers fetched successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Failed to get designers' });
  }
});

module.exports = {
  resetProfilePassword,
  updateUserProfile,
  deleteUserProfile,
  findAllDesigners
};
