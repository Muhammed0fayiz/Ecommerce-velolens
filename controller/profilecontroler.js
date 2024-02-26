const express = require('express');
const router = express.Router();
const usercollection = require('../models/users')
const productcollection = require('../models/product')
const categorycollection = require('../models/category')
const addresscollection = require('../models/address')
const ordercollection = require('../models/order');
const PDFDocument = require('pdfkit');
// const { ProductFilterBrand } = require('./productcontroller');

// profile page render
const UserProfile = async (req, res) => {
  try {
    const userid = req.session.user
    const user = await usercollection.findById(userid)
    console.log(user)
    res.render('user/userprofile', { user })
  } catch (error) {
    console.log(error)
  }
}
// show address page
const UserAddress = async (req, res) => {
  try {
    const userid = req.session.user
  const data = await addresscollection.find({ userid: userid })

  res.render('user/useraddress', { data })
  } catch (error) {
    
  }

}
// add address get
const AddAddress = (req, res) => {
  res.render('user/useraddaddress')
}
// edit address get
const EditAddress = async (req, res) => {
  const id = req.params.id
  const data = await addresscollection.findById(id)

  res.render('user/usereditaddress', { data })
}
// addaddress post
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


    res.redirect('/profile/useraddress');
  } catch (error) {
    console.log(error);
  }
};

// edit addresspost
const EditAddressPost = async (req, res) => {
  try {
    const id = req.params.id
    await addresscollection.findByIdAndUpdate(id, {
      firstname: req.body.firstname,
      secondname: req.body.secondname,
      housename: req.body.housename,
      phonenumber: req.body.phonenumber,
      pincode: req.body.pincode,
      city: req.body.city,
      state: req.body.state
    }).then(() => {
      res.redirect('/profile/useraddress');
    })
  } catch (error) {
    console.log(error);
  }
}


//delect address
const DeleteAddress = async (req, res) => {
  try {
    const id = req.params.id
    await addresscollection.findByIdAndDelete({ _id: id })
      .then(() => {
        res.redirect('/profile/useraddress')
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

//updateprofile get
const UpdateProfile = async (req, res) => {
  try {
    const userid = req.session.user
    const user = await usercollection.findById(userid)
    res.render('user/userupdateprofile', { user })
  } catch (error) {
    console.log(error)
  }
}
//updateprofile post
const UpdateProfilePost = async (req, res) => {
  try {
    const userid = req.session.user
    const user = await usercollection.findByIdAndUpdate(userid)
    user.username = req.body.username
    if (req.files && req.files.length > 0) {
      user.image = req.files.map(file => file.path.substring(6))
    } else {
      const user = await usercollection.findByIdAndUpdate(userid)
      user.image = user.image;
    }

    //    instead update
    await user.save()

    res.redirect('/profile/profile')
  } catch (error) {
    console.log(error)

  }
}

//change password get
const ChagePassword = (req, res) => {

  res.render('user/changepassword')
}





const ChangePasswordPost = async (req, res) => {
  const newpassword = req.body.newpassword;
  const oldpassword = req.body.oldpassword;
  const userid = req.session.user;
  console.log(newpassword)
  console.log('old', oldpassword)
  const user = await usercollection.findById(userid);
  if (oldpassword !== user.password) {
    res.status(400).json({ success: false, message: "Old password is incorrect." });
  } else {
    user.password = newpassword;
    await user.save();
    res.json({ success: true, message: "Password changed successfully." });
  }
};

const UserOrders = async (req, res) => {
  const userid = req.session.user


  const order = await ordercollection.find({ userid: userid }).sort({_id: -1});


  // console.log(order);
  res.render('user/userorders', { order })
  
}

//user order cancel
const OrderCancel = async (req, res) => {
  try {
    const userId = req.session.user;
    const productid = req.params.id;
    const orderid = req.params.orderid;
    const newstatus = "cancelled";

    const order = await ordercollection.findOneAndUpdate(
      { userid: userId, 'productcollection.productid': productid, _id: orderid },
      { $set: { 'productcollection.$.status': newstatus } },
      { new: true }
    );

    const orders = await ordercollection.findOne(
      { userid: userId, 'productcollection.productid': productid, _id: orderid }
    );

    if (orders) {
      const product = order.productcollection.find(product => product.productid.toString() === productid);

      // Increase stock by the canceled quantity
      await productcollection.updateOne(
        { _id: productid },
        { $inc: { Stock: +product.quantity } }
      );

      if (orders.paymentmode === 'WalletPayment' || orders.paymentmode === 'OnlinePayment') {
        const data = {
          amount: (product.price * product.quantity) - order.invdiscount
        };

        const user = await usercollection.findById(userId);
        user.wallet += data.amount;
        user.Wallethistory.push({
          amount: data.amount,
          Date: new Date(),
          Status: "Refund for cancelled order"
        });
        await user.save();
      }
    } else {
      console.log("Order not found");
      return res.status(404).send('Order not found');
    }

    if (order) {
      res.redirect('/profile/showorders');
    } else {
      console.log("Order not found");
      res.status(404).send('Order not found');
    }
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).send('Internal Server Error');
  }
};

const OrderReturn = async (req, res) => {
  try {
    const userId = req.session.user;
    const productid = req.params.id;
    const orderid = req.params.orderid;
    const newstatus = "Returned";

    const order = await ordercollection.findOneAndUpdate(
      { userid: userId, 'productcollection.productid': productid, _id: orderid },
      { $set: { 'productcollection.$.status': newstatus } },
      { new: true }
    );

    const orders = await ordercollection.findOne({ userid: userId, _id: orderid });

    if (orders) {
      const returnedItem = orders.productcollection.find(item => item.productid.toString() === productid);
      if (!returnedItem) {
        console.log('Returned product not found in order');
        return res.status(404).send('Returned product not found in order');
      }

      // Calculate the refund amount for the returned product
      const refundAmount = returnedItem.price * returnedItem.quantity - (order.invdiscount || 0);

      // Update user's wallet with the refund amount
      await usercollection.findOneAndUpdate(
        { _id: userId },
        { $inc: { wallet: refundAmount } }
      );

      // Update the stock of the returned product
      await productcollection.updateOne(
        { _id: productid },
        { $inc: { Stock: +returnedItem.quantity } } // Increasing stock by the returned quantity
      );

      // Push the transaction to wallet history
      const user = await usercollection.findById(userId);
      user.Wallethistory.push({
        amount: refundAmount,
        Date: new Date(),
        Status: "Refund for returned order"
      });
      await user.save();
    } else {
      console.log('Order not found');
      return res.status(404).send('Order not found');
    }

    if (order) {
      res.redirect('/profile/showorders');
    } else {
      console.log("Order not found");
      res.status(404).send('Order not found');
    }
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).send('Internal Server Error');
  }
};


//user order productdetails view
const OrderViewMore = async (req, res) => {
  try {
    const userId = req.session.user;
    const productid = req.params.id;
    const orderid = req.params.orderid;

    const order = await ordercollection.findOne(
      { userid: userId, 'productcollection.productid': productid, _id: orderid },
    );


    const product = order.productcollection.find(product => product.productid.toString() === productid)

    if (!order) {
      // Handle the case where the order is not found
      return res.status(404).send('Order not found');
    }

    // Assuming you want to get the first product in the productcollection array
    const productId = order.productcollection[0].productid;

    // Await the result of productcollection.findById
    const products = await productcollection.findById(productId);



    const addressid = order.address;
    const address = await addresscollection.findById(addressid);
    const user = await usercollection.findById(userId);

    res.render('user/orderviewmore', { order, user, address, product, products });
  } catch (error) {
    // Handle any errors that might occur during the process
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

//wallet history
const WalletHistory=(req,res)=>{
  res.render('user/wallethistory')
}

//invoice downloads
const Invoice = async (req, res) => {
  try {
    let userId = req.session.user;
    console.log(userId);
    const orderId = req.params.orderid;
    console.log("Entered", orderId);

    const invoiceDetails = await usercollection.findOne({ _id: userId });
    console.log("Invoice", invoiceDetails);

    const specificOrder = await ordercollection.findById(orderId)
    console.log("Invoicee", specificOrder);




    // Create a new PDF document
    const doc = new PDFDocument();

    // Set response headers to trigger a download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
    // Pipe the PDF document to the response
    doc.pipe(res);

    // const imagePath = "public/img/logo.png"; // Change this to the path of your image
    // const imageWidth = 100; // Adjust image width based on your layout
    // const imageX = 550 - imageWidth; // Adjust X-coordinate based on your layout
    // const imageY = 50; // Adjust Y-coordinate to place the image at the top
    // doc.image(imagePath, imageX, imageY, { width: imageWidth });

    // Move to the next section after the image
    doc.moveDown(1);
    // Add content to the PDF document
    doc.fontSize(16).text("Billing Details", { align: "center" });
    doc.moveDown(1.2);
    doc.fontSize(10).text("Customer Details", { align: "center" });
    doc.moveDown(1);
    doc.text(`Order ID: ${orderId}`);

    doc.moveDown(0.3);
    doc.text(`Name: ${invoiceDetails.username || ""}`);
    doc.moveDown(0.3);
    doc.text(`Email: ${invoiceDetails.email || ""}`);



    doc.moveDown(0.3);
    const address = specificOrder.address;
    const addresses = await addresscollection.findById(address)
    doc.text(
      `Address: ${addresses.housename}, ${addresses.city}, ${addresses.state} ${address.pincode || ""
      }`
    );
    doc.moveDown(0.3);
    doc.text(`Payment Method: ${specificOrder.paymentmode || ""}`);

    doc.moveDown(0.3);

    const headerY = 300; // Adjust this value based on your layout
    doc.font("Helvetica-Bold");
    doc.text("Name", 100, headerY, { width: 150, lineGap: 5 });
    doc.text("Status", 300, headerY, { width: 150, lineGap: 5 });
    doc.text("Quantity", 400, headerY, { width: 50, lineGap: 5 });
    doc.text("Price", 500, headerY, { width: 50, lineGap: 5 });
    doc.font("Helvetica");

    // Table rows
    const contentStartY = headerY + 30; // Adjust this value based on your layout
    let currentY = contentStartY;
    console.log("Inn");
    specificOrder.productcollection.forEach((product, index) => {
      doc.text(product.productName || "", 100, currentY, {
        width: 150,
        lineGap: 5,
      });
      console.log("In");
      doc.text(product.status || "", 300, currentY, {
        width: 50,
        lineGap: 5,
      });
      doc.text(product.quantity || "", 400, currentY, {
        width: 50,
        lineGap: 5,
      });

      doc.text(product.price || "", 500, currentY, {
        width: 50,
        lineGap: 5,
      });
      console.log("Reached Here");

      // Calculate the height of the current row and add some padding
      const lineHeight = Math.max(
        doc.heightOfString(product.productName || "", { width: 150 }),
        doc.heightOfString(product.status || "", { width: 150 }),

        doc.heightOfString(product.price || "", { width: 50 })
      );
      currentY += lineHeight + 10; // Adjust this value based on your layout
    });
    doc.text(`Total Price: ${specificOrder.totalPrice || ""}`, {
      width: 400, // Adjust the width based on your layout
      lineGap: 5,
    });

    // Set the y-coordinate for the "Thank you" section
    const separation = 50; // Adjust this value based on your layout
    const thankYouStartY = currentY + separation; // Update this line

    // Move to the next section
    doc.y = thankYouStartY; // Change this line

    // Move the text content in the x-axis
    const textX = 60;
    const textWidth = 500;
    doc.fontSize(14).text(
      "Thank you for choosing Velocity! We appreciate your support and are excited to have you as part of our family.",
      textX,
      doc.y,
      { align: "center", width: textWidth, lineGap: 10 }
    );

    doc.end();
  } catch (error) {
    res.render("error");
  }
};


module.exports = {
  UserProfile,
  UserAddress,
  AddAddress,
  EditAddress,
  AddAddressPost,
  EditAddressPost,
  DeleteAddress,
  UpdateProfile,
  UpdateProfilePost,
  ChagePassword,
  ChangePasswordPost,
  UserOrders,
  OrderCancel,
  OrderReturn,
  OrderViewMore,
  Invoice,
  WalletHistory

}

