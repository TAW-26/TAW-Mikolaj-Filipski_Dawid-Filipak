const admin = (req, res, next) => {

    if (req.user && req.user.rola === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            message: "Dostęp zabroniony: Brak uprawnień administratora." 
        });
    }
};

module.exports = admin;