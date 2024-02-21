const usercollection = require('../models/users')
const isAdminAuthenticated = async (req, res, next) => {
    try { 
      const user = await usercollection.findById(req.session.user)
      if (!user || !user.
        isAdmin) {
        return res.status(403).redirect("/error");
      }
      // If authenticated and isAdmin is true, proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error('Error in isAdminAuthenticated middleware:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  
  module.exports = isAdminAuthenticated;
