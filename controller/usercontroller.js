const express = require('express');
const router = express.Router();
const usercollection = require('../models/users')
const productcollection = require('../models/product')
const categorycollection = require('../models/category')
const crypto = require('crypto')
const nodemailer = require('nodemailer');




// guestpage render
const UserGuest = (req, res) => {
  try {
    if (req.session.user) {
      res.redirect('/userhome')
    } else {
      res.render('user/userguest')
    }
  } catch (error) {
    console.log(error)
    return res.status(500).send("Internal Server Error");
  }
}

// userlogin page 
const UserLogin = (req, res) => {
  if (req.session.user) {
    res.redirect('/userhome')
  } else { res.render('user/userlogin'); }
};

//userlogin post
const UserLoginPost = async (req, res) => {
  try {
    const data = await usercollection.findOne({ email: req.body.email })
    if (data === null) {
      return res.render('user/userlogin', { message: 'Create account' })
    }
    if (data.isblocked == true) {
      return res.render('user/userlogin', { message: 'Blocked account' })
    }

    else {
      if (data && data.email === req.body.email && data.password === req.body.password) {
        req.session.user = data._id
        res.redirect('/userhome')
      } else {
        res.render('user/userlogin', { message: 'invalid entry' })
      }
    }

  } catch (error) {
    console.log(error)
    return res.status(500).send("Internal Server Error");
  }
}


// signup page render
const UserSignup = (req, res) => {
  res.render('user/usersignup')
}
//global variable
let email
let otp
let signupdata
//  signup post
const SignupPost = async (req, res) => {
  try {

    const existingUser = await usercollection.findOne({ email: req.body.email });

    if (existingUser) {

      return res.render('user/usersignup', { errorMessage: 'Email already exists' });
    }
    // If the email is unique, proceed with creating a new user
    signupdata = {
      username: req.body.name,
      email: req.body.email,
      password: req.body.password
    };

    email = req.body.email;
    otp = generateRandomString(6);
    // req.session.Otp = otp
    console.log('OTP generated', otp);

    // Assuming sendOtpEmail and generateRandomString are defined elsewhere
    await sendOtpEmail(email, otp);

    // Redirect to the OTP verification page
    return res.redirect('/usersignup/signupOtp');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};




//node mailer
const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS, //  email address
        pass: process.env.EMAIL_PASSWORD
      }
    });
    const mailOptions = {
      from: '',
      to: email,
      subject: 'One-Time Password (OTP) for Authentication',
      text: `Your Authentication OTP is: ${otp}`
    };
    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        return console.error('Error:', error);
      }
      console.log('Email sent:', info.response);
    });

  } catch (error) {
    console.log(error)
    return res.status(500).send("Internal Server Error");

  }
};
//otp ganarate
const generateRandomString = (length) => {
  const digits = "0123456789";
  let OTP = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    OTP += digits[randomIndex];
  }
  return OTP;
};
//  otppage render
const SignupOtp = (req, res) => {
  setTimeout(() => {
    otp = null;
  }, 60000);
  res.render('user/signupOtp')
}

//resend otp
const ResendOtp = async (req, res) => {
  try {
    otp = generateRandomString(6);
    console.log('otp generated', otp);
    await sendOtpEmail(email, otp);

    res.redirect('/usersignup/signupOtp')
  } catch (error) {
    console.log(error)
    return res.status(500).send("Internal Server Error");
  }
}
// otp post

const OtpPost = async (req, res) => {
  try {
    const credential = {
      email:'admin@gmail.com',
    };
    const digit = req.body.otp;
    const otpnumber = digit;
    console.log("Number is " + otpnumber);
    if (otp === otpnumber) {
      const newUser = new usercollection(signupdata);


if(newUser.email==credential.email){
  newUser.isAdmin=true;
}

      await newUser.save();
      res.status(200).json({ success: true, redirect: '/userlogin' });
    } else {
      res.status(400).json({ success: false, message: "Invalid entry" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }


}

// user home page
const UserHome = async (req, res) => {
  try {
    if (req.session.user) {
      const product = await productcollection.find({ islisted: true }).limit(4)
      const category = await categorycollection.find()
      res.render('user/userhome', { product, category });
    } else {
      res.redirect('/')
    }
  } catch (error) {
    console.log(error)
    return res.status(500).send("Internal Server Error");
  }
};
// productView

const ProductView = async (req, res) => {

  try {
    const id = req.params.id
    const data = await productcollection.findById(id).populate('Category')
    const category = await categorycollection.find()

    res.render('user/userproductView', { data, category })
  } catch (error) {
    console.log(error)
    return res.status(500).send("Internal Server Error");

  }
}

//shop page

const ShopPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6; // Set the number of products per page
    const skip = (page - 1) * limit;
    const totalProducts = await productcollection.countDocuments({});
    const product = await productcollection.find({ islisted: true, Stock: { $gt: 0 } }).skip(skip).limit(limit).populate('Category');
    const category = await categorycollection.find();
    const totalPages = Math.ceil(totalProducts / limit);
    const currentPage = Math.min(page, totalPages);
    res.render('user/usershop', { product, category, totalPages, currentPage });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};



// logout
const Logout = (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.error(err);
      res.status(500).send("Error");

    } else {

      res.redirect('/')
    }
  });

}


module.exports = {
  UserGuest,
  UserLogin,
  UserHome,
  UserSignup,
  SignupOtp,
  SignupPost,
  UserLoginPost,
  OtpPost,
  Logout,
  ProductView,
  ShopPage,
  ResendOtp,


};




