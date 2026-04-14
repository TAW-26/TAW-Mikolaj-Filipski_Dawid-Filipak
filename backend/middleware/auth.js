const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Brak tokenu, autoryzacja odmówiona" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_tajne_haslo');
    
    req.user = decoded;
    
    next();
  } catch (err) {
    res.status(401).json({ message: "Token jest nieprawidłowy" });
  }
};

module.exports = auth;