const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log("🔍 Token received:", token);

    try {
      const decoded = jwt.verify(token, process.env.SEC_KEY); // use your secret key

      console.log("✅ Decoded:", decoded);

      // DIRECTLY attach user from decoded token without DB query
      req.user = {
        id: decoded.uid,
        role: decoded.role,
        name: decoded.name,
      };

      console.log("User authenticated:", req.user);
      next();
    } catch (error) {
      console.error("❌ Token verify error:", error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
