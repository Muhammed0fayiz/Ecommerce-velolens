const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const session = require('express-session');
const multer = require('multer')
const path = require('path')
const CheckSession = require('../middleware/adminmiddleware')
const AuthMiddleware=require('../middleware/authmiddleware')
const Admincontroller = require('../controller/admincontroller')
const Productcontroller = require('../controller/productcontroller')
const Categorycontroller = require('../controller/categorycontroller')
const Ordercontroller = require('../controller/ordercontroller')
const Couponcontroller = require('../controller/couponcontroller')

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }))





//session handling
router.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);



//multer for store image
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage }).array('img');


// admin login get
router.get('/adminlogin', Admincontroller.AdminLogin)
// admin login post
router.post('/loginpost', Admincontroller.LoginPost)
//dashboard
router.get('/dashboard',AuthMiddleware, Admincontroller.Dashboard)
//usermanagement
router.get('/userManagement',AuthMiddleware,CheckSession, Admincontroller.UserManagement)
//block user
router.get('/blockuser/:id',AuthMiddleware,CheckSession, Admincontroller.BlockUser)


// //productlist
router.get('/productlist',AuthMiddleware, CheckSession, Productcontroller.ProductPage)
// //addproduct get
router.get('/productlist/addProduct',AuthMiddleware,CheckSession, Productcontroller.AddProduct)
// //addproduct post
router.post('/addProduct', upload, Productcontroller.AddProductPost)
// //update  product get
router.get('/updateProduct/:id',AuthMiddleware, CheckSession, Productcontroller.UpdateProduct)
// //update product post
router.post('/updateProductpost/:id', upload, Productcontroller.UpdateProductPost)
//update product image post
router.post('/remove-image', Productcontroller.Deleteimg)
// //delect product get
router.get('/deleteProduct/:id',AuthMiddleware,CheckSession, Productcontroller.DeleteProduct)
//listed product
router.get('/productlisted/:id',AuthMiddleware,Productcontroller.ProductListed)


//catagory 
router.get('/category',AuthMiddleware,CheckSession, Categorycontroller.Category)
//add category get
router.get('/addcategory',AuthMiddleware,CheckSession, Categorycontroller.AddCategory)
//add category post
router.post('/addcategory', Categorycontroller.NewCategory)
// updateCategory get
router.get('/categoryUpdate/:id', CheckSession, Categorycontroller.UpdateCategory);
// updatecategory Post
router.post('/updateCategorypost/:id', Categorycontroller.UpdateCategoryPost)
// updatecategory Post
router.post('/updateCategorypost/:id', Categorycontroller.UpdateCategoryPost)
// delete category get
router.get('/categoryDelete/:id',AuthMiddleware,CheckSession, Categorycontroller.DeleteCategory)


//orderpage render
router.get('/orderpage',AuthMiddleware,CheckSession, Ordercontroller.Orderpage)
// admin change status
router.post('/orderstatuspost/:id/:userid', Ordercontroller.OrderStatusPost)
//order filter 
router.post('/orderfilter',Ordercontroller.OrderFilter)


//sales report
router.get('/salesreport',AuthMiddleware,CheckSession, Admincontroller.SalesReport)
router.post('/salesreportfilter',Admincontroller.SalesReportFilter)

// coupenpage get admin
router.get('/coupon',AuthMiddleware,CheckSession, Couponcontroller.CouponPage)
//add coupon get admin
router.get('/addcoupon',AuthMiddleware,CheckSession, Couponcontroller.AddCoupon)
//delete coupon
router.get('/deletecoupon/:id',AuthMiddleware,CheckSession, Couponcontroller.DeleteCoupon)
//add coupon post admin
router.post('/addcouponpost', Couponcontroller.AddCouponPost)
//excel and pdf
router.get('/excelReport',Admincontroller.excelReport)
router.get('/salesgeneratepdf',Admincontroller.salesPdf)

// logout
router.get('/logout', Admincontroller.Logout)
module.exports = router;