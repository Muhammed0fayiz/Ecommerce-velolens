// session handling middleware
const CheckSession = (req, res, next) => {
    if (req.session.admin) {
      next();
    } else {
      res.redirect("/admin/adminlogin");
    }
  };

  module.exports=CheckSession;