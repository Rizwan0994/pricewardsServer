const UserModel = require("../models/user");
  const { JWT_SECRET_KEY} = require("../constants/auth.constant");
    const jwt = require("jsonwebtoken");

    
exports.jwtValidation = async (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, JWT_SECRET_KEY, async function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    message: err.message
                });
            } else {
                const findUser = await UserModel.findOne({ 
                    where: { id: decoded.userId }
                });
                if (findUser) {
                    req.loginUser = findUser.dataValues;
                    next();
                } else {
                    return res.status(401).json({
                        message: 'Unauthorized access'
                    });
                }
            }
        });
    } else {
        return res.status(401).json({
            message: 'Unauthorized access'
        });
    }
}


exports.decodeToken = (token) => { return jwt.verify(token, JWT_SECRET_KEY); }
