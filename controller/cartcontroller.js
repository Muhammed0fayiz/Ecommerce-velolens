const express = require('express');
const router = express.Router();
const usercollection = require('../models/users')
const productcollection = require('../models/product')
const categorycollection = require('../models/category')
const cartcollection = require('../models/cart');
const addresscollection = require('../models/address')


// cart page render
const CartPage = async (req, res) => {
  try {
    const userId = req.session.user;
    const cart = await cartcollection.find({ userid: userId });


    const calculateTotalSum = async function (userId) {
      try {
        const cartItems = await cartcollection.find({ userid: userId });


        let totalSum = 0;

        for (const cartItem of cartItems) {
          totalSum += cartItem.price * cartItem.quantity;

          const productId = cartItem.productid
          const products = await productcollection.findById(productId).populate('Category')

        }

        return totalSum;
      } catch (error) {
        console.error('Error calculating total sum:', error);
        throw error;
      }
    }

    const sum = await calculateTotalSum(userId);
    console.log("sum:", sum);

    res.render('user/usercart', { cart, sum});

  } catch (error) {
    console.log(error)

  }
}


// add to cart
const  AddTOCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.session.user;
    const product = await productcollection.findById(productId).populate('Category')
    const existingCartItem = await cartcollection.findOne({ userid: userId, productid: productId });

    if (existingCartItem) {
      await cartcollection.updateOne({ _id: existingCartItem._id }, { $inc: { quantity: 1 } });
      console.log('Quantity incremented');
    } else {
      const data = {
        userid: userId,
        productid: product._id,
        productname: product.productName,
        Category: product.Category.category,
        price: product.Price,
        quantity: 1,
        image: product.image[0]
      };

      await cartcollection.create(data);
    }

    res.redirect('/shop');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};



//delete item from cart
const DeleteCartItem = async (req, res) => {
  try {
    const id = req.params.id
    await cartcollection.findByIdAndDelete({ _id: id })
      .then(() => {
        res.redirect('/cart/cartpage')
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send("internal server error")
      })
  } catch (error) {
    console.log(error);
    res.status(500).send("internal server error")
  }
}
// update quantity
const UpdateQuantity = async (req, res) => {
  try {
    const productid = req.params.id;
    const action = req.query.action;
  
    const cartItem = await cartcollection.findOne({ _id: productid });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Fetch the corresponding product to get the stock
    const product = await productcollection.findById(cartItem.productid);
   

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (action === 'increase') {
      // Check if increasing quantity exceeds the stock
      if (cartItem.quantity + 1 > product.Stock) {
        return res.status(400).json({ message: 'out of stock' });
      }

      // Increase cart quantity
      await cartcollection.updateOne({ _id: cartItem._id }, { $inc: { quantity: 1 } });

      // Decrease product stock (if needed)

    } else if (action === 'decrease' && cartItem.quantity > 1) {
      // Decrease cart quantity
      await cartcollection.updateOne({ _id: cartItem._id }, { $inc: { quantity: -1 } });

      // Increase product stock (if needed)

    }

    res.json({ message: 'Quantity updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



// checkout page
const CheckOut = async (req, res) => {
  try {
    const userId = req.session.user;
    const user = await addresscollection.find({ userid: userId })
    const products = await cartcollection.find({ userid: userId })
    const wallet = await usercollection.findById(userId)
    const walletamount = wallet.wallet

    // Calculate total sum
    let totalSum = 0;
    for (const product of products) {
      totalSum += product.price * product.quantity;
    }
    let totalProductCount = 0;
    for (const product of products) {
      totalProductCount += product.quantity;
    }
    if (products.length > 0) { res.render('user/checkout', { user, products, totalSum, totalProductCount, walletamount }); }
    else {
      res.redirect('/cart/cartpage')
    }
  } catch (error) {
    console.log(error)
  }
}
//checkout add address page
const AddAddress = (req, res) => {
  res.render('user/usercheakoutaddaddress')
}



//checkout addaddress post
const AddAddressPost = async (req, res) => {
  try {
    const address = {
      userid: req.session.user,
      firstname: req.body.firstname,
      secondname: req.body.secondname,
      housename: req.body.housename,
      phonenumber: req.body.phonenumber,
      pincode: req.body.pincode,
      city: req.body.city,
      state: req.body.state
    };
    console.log(address)
    await addresscollection.insertMany([address])


    res.redirect('/cart/checkoutpage');
  } catch (error) {
    console.log(error);
  }
};



module.exports = {
  CartPage,
  AddTOCart,
  DeleteCartItem,
  UpdateQuantity,
  CheckOut,
  AddAddress,
  AddAddressPost

}
