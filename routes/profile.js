const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const session = require('express-session');
const multer = require('multer')
const path = require('path')
const CheckSession = require('../middleware/adminmiddleware')
const Admincontroller = require('../controller/admincontroller')
const Productcontroller = require('../controller/productcontroller')
const Categorycontroller = require('../controller/categorycontroller')
const Profilecontroller = require('../controller/profilecontroler')
const CheckSessionAndBlocked = require('../middleware/usermiddleware')
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }))


//multer for store image
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/profilepic')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage }).array('img');



// user profile
router.get('/profile', CheckSessionAndBlocked, Profilecontroller.UserProfile)
//update profile get
router.get('/updateprofile', CheckSessionAndBlocked, Profilecontroller.UpdateProfile)
//update profile post
router.post('/updateprofilePost', upload, Profilecontroller.UpdateProfilePost)
//change password
router.get('/chagepassword', CheckSessionAndBlocked, Profilecontroller.ChagePassword)
//change password post
router.post('/changepasswordpost', Profilecontroller.ChangePasswordPost)

//user address get
router.get('/useraddress', CheckSessionAndBlocked, Profilecontroller.UserAddress)
//add address get
router.get('/addaddress', CheckSessionAndBlocked, Profilecontroller.AddAddress)
//add address post
router.post('/addaddresspost', Profilecontroller.AddAddressPost);
//edit address
router.get('/editaddress/:id', CheckSessionAndBlocked, Profilecontroller.EditAddress)
//edit address post
router.post('/editaddresspost/:id', Profilecontroller.EditAddressPost)
//delete address 
router.get('/addressDelete/:id', CheckSessionAndBlocked, Profilecontroller.DeleteAddress)

//order show
router.get('/showorders', CheckSessionAndBlocked, Profilecontroller.UserOrders)




module.exports = router;