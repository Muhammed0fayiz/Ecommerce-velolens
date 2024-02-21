const usercollection=require('../models/users')

const CheckSessionAndBlocked = async (req, res, next) => {
    if (req.session.user) {
      const userDetials = await usercollection.findOne({ _id: req.session.user });
      if (!userDetials.isblocked) {
        // User is not blocked, proceed to the next middleware or route handler
        next();
      } else {
        // User is blocked, destroy the session and redirect
        req.session.destroy((err) => {
          if (err) {
            console.log("Error destroying session: ", err);
            res.redirect("/");
          } else {
            res.redirect("/");
          }
        });
      }
    } else {
      // No userId in session, redirect to the default page
      res.redirect("/");
    }
  };

module.exports=CheckSessionAndBlocked;