const express = require('express');
const router = express.Router();

const productcollection = require('../models/product')
const categorycollection = require('../models/category')
const usermanagement = require('../models/users')
const ordercollection = require('../models/order');
const addresscollection = require('../models/address')
const PDFDocument = require("pdfkit-table");
const ExcelJS = require("exceljs");


//admin login
const AdminLogin = (req, res) => {
  if (req.session.admin) {
    res.redirect('/admin/dashboard')
  } else { res.render('admin/adminlogin'); }
};
// admin login post
const LoginPost = (req, res) => {
  const credential = {
    username: 'admin',
    password: '123'
  };
  if (credential.username == req.body.name && credential.password == req.body.password) {
    //session 
    req.session.admin = credential
    res.redirect('/admin/dashboard');
  } else {
    res.render('admin/adminlogin', { message: "Invalid Entry " })
  }
};


// dashboard render
const Dashboard = async (req, res) => {


  if (req.session.admin) {
    try {
      // Daily Orders
      const dailyOrders = await ordercollection.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderdate" } },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
 

      const { dates, orderCounts, totalOrderCount } = dailyOrders.reduce(
        (result, order) => {
          result.dates.push(order._id);
          result.orderCounts.push(order.orderCount);
          result.totalOrderCount += order.orderCount;
          return result;
        },
        { dates: [], orderCounts: [], totalOrderCount: 0 }
      );
      // monthly
      const monthlyOrders = await ordercollection.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$orderdate" },
              month: { $month: "$orderdate" },
            },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);
     
      const monthlyData = monthlyOrders.reduce((result, order) => {
        const monthYearString = `${order._id.year}-${String(
          order._id.month
        ).padStart(2, "0")}`;
        result.push({
          month: monthYearString,
          orderCount: order.orderCount,
        });
        return result;
      }, []);
      let monthdata = orderCounts;

      //  Yearly Order
      const yearlyOrders = await ordercollection.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y", date: "$orderdate" } },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      console.log("years Orders:", yearlyOrders);
      const { years, orderCounts3, totalOrderCount3 } = yearlyOrders.reduce(
        (result, order) => {
          result.years.push(order._id);
          result.orderCounts3.push(order.orderCount);
          result.totalOrderCount3 += order.orderCount;
          return result;
        },
        { years: [], orderCounts3: [], totalOrderCount3: 0 }
      );


      const topsellingproduct = await ordercollection.aggregate([
        {
          $unwind: "$productcollection" // Deconstruct the productcollection array
        },
        {
          $group: {
            _id: "$productcollection.productid", // Group by product id
            totalQuantity: { $sum: "$productcollection.quantity" }, // Calculate total quantity sold for each product
            productName: { $first: "$productcollection.productName" } // Retrieve the productName
          }
        },
        {
          $sort: { totalQuantity: -1 } // Sort by total quantity sold in descending order
        },
        {
          $limit: 4 // Limit the result to the top 5 products
        }
      ]);


      const productNames = [];
      const sellingQuantities = [];

      // Iterate over the aggregation result
      topsellingproduct.forEach(product => {
        productNames.push(product.productName); // Push product name to productNames array
        sellingQuantities.push(product.totalQuantity); // Push total quantity to sellingQuantities array
      });


      const topsellingcategory = await ordercollection.aggregate([
        { $unwind: "$productcollection" }, // Deconstruct the productcollection array
        { $group: { _id: "$productcollection.Category", totalQuantity: { $sum: "$productcollection.quantity" } } }, // Group by Category and calculate total quantity sold
        { $sort: { totalQuantity: -1 } }, // Sort by total quantity sold in descending order
        { $limit: 5 } // Limit the result to the top 5 categories
      ]);

      // Separate arrays to store category names and selling quantities
      const categoryNames = [];
      const sellingQuantitiesByCategory = [];

      // Iterate over the aggregation result
      topsellingcategory.forEach(category => {
        categoryNames.push(category._id); // Push category name to categoryNames array
        sellingQuantitiesByCategory.push(category.totalQuantity); // Push total quantity to sellingQuantitiesByCategory array
      });


      res.render("admin/dashboard", {
        dates,
        orderCounts,
        totalOrderCount,
        monthdata,
        years,
        orderCounts3,
        totalOrderCount3,
        productNames,
        sellingQuantities,
        categoryNames: categoryNames, // Pass categoryNames as an array
        categoryNamesJSON: JSON.stringify(categoryNames),
        sellingQuantitiesByCategory,

      });
    } catch (error) {
      console.error("Error fetching and aggregating orders:", error);
      res.status(500).send("Internal Server Error");
    }
  }



  else {
    res.redirect("/admin/adminlogin");
  }
}




//user manangement render
const UserManagement = async (req, res) => {

  try {
    const data = await usermanagement.find()
    res.render('admin/userManagement', { data });
  } catch (error) {
    console.log(error)
    return res.status(500).send("Internal Server Error");
  }
};
//block user
const BlockUser = async (req, res) => {
  try {
    const id = req.params.id
    const user = await usermanagement.findById(id)
    user.isblocked = !user.isblocked
    //    instead update
    await user.save()

    res.redirect('/admin/userManagement')
  } catch (error) {
    console.log(error)
    return res.status(500).send("Internal Server Error");
  }
}







//sales report

const SalesReport = async (req, res) => {
  const orders = await ordercollection.find().sort({ orderdate: -1 });

  res.render('admin/salesreport', { orders })
}


//sales reportfilter
const SalesReportFilter=async (req, res) => {
try {
  const startDate = new Date(req.body.start_date);
  const endDate = new Date(req.body.end_date);
  const orders = await ordercollection.find({
    orderdate: { $gte: startDate, $lte: endDate }
}).sort({ orderdate: -1 });


  res.render('admin/salesreport', { orders })
}

 catch (error) {
  console.log(error)
}
}

// logout
const Logout = (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.error(err);
      res.status(500).send("Error");

    } else {

      res.redirect('/admin/adminlogin')
    }
  });
};

const excelReport = async (req, res) => {
  try {
    console.log("Excel");

    const startdate = new Date(req.query.startingdate);
    const Endingdate = new Date(req.query.endingdate);
    console.log(startdate);
    console.log(Endingdate);
    Endingdate.setDate(Endingdate.getDate() + 1);

    const orderCursor = await ordercollection.aggregate([
      {
        $match: {
          orderdate: { $gte: startdate, $lte: Endingdate },
        },
      },
    ]);
    console.log(orderCursor);
    if (orderCursor.length === 0) {
      return res.redirect("/admin/dashboard");
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet 1");
    let addressDetails
    for(let address of orderCursor){
     addressDetails = await addresscollection.findById(address.address);
   
 }
    // Add data to the worksheet
    worksheet.columns = [
      { header: "Username", key: "username", width: 15 },
      { header: "Product Name", key: "productname", width: 20 },
      { header: "Quantity", key: "quantity", width: 15 },
      { header: "Price", key: "price", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Order Date", key: "orderdate", width: 18 },
      { header: "Address", key: "address", width: 30 },
      { header: "City", key: "city", width: 20 },
      { header: "Pincode", key: "pincode", width: 15 },
      { header: "State", key: "state", width: 15 },
    ];

    for (const orderItem of orderCursor) {
      // Fetch address details based on the address ID

      worksheet.addRow({
        username: orderItem.username,
        productname: orderItem.productcollection
          .map((product) => product.productName)
          .join(", "),
        quantity:orderItem.productcollection.map((product) => product.quantity).join(", "),
        price: orderItem.totalPrice,
        status: orderItem.productcollection.map((product) => product.status).join(", "),
        orderdate: orderItem.orderdate,
        address:addressDetails.housename,
        city:addressDetails.city,
        pincode: addressDetails.pincode,
        state: addressDetails.state
      });
    }

    // Generate the Excel file and send it as a response
    workbook.xlsx.writeBuffer().then((buffer) => {
      const excelBuffer = Buffer.from(buffer);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=excel.xlsx");
      res.send(excelBuffer);
    });
  } catch (error) {
    console.error("Error creating or sending Excel file:", error);
    res.status(500).send("Internal Server Error");
  }
};

const salesPdf = async (req, res) => {
  try {
    const startingDate = new Date(req.query.startingdate);
    const endingDate = new Date(req.query.endingdate);

    // Fetch orders within the specified date range
    const orders = await ordercollection.find({
      
orderdate: { $gte: startingDate, $lte: endingDate },
    });

    // Create a PDF document
   // Assuming addresscollection is an array
  
   let addressDetails
   for(let address of orders){
    addressDetails = await addresscollection.findById(address.address);
  
}
    const doc = new PDFDocument();
    const filename = "sales_report.pdf";

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // Add content to the PDF document
    doc.text("Sales Report", { align: "center", fontSize: 10, margin: 2 });

    // Define the table data
    const tableData = {
      headers: [
        "Username",
        "Product Name",
        "Price",
        "Address",
        "City",
        "Pincode",
        "State",
      ],
      rows: orders.map((order) => [
        order.username,
        order.productcollection.map((product) => product.productName).join(", "),
        order.
        totalPrice,
        addressDetails.
        housename,
        addressDetails.city,
        addressDetails.pincode,
        addressDetails.
        state
        ,
      ]),
    };

    // Draw the table
    await doc.table(tableData, {
      prepareHeader: () => doc.font("Helvetica-Bold"),
      prepareRow: () => doc.font("Helvetica"),
    });

    // Finalize the PDF document
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  AdminLogin,
  LoginPost,
  UserManagement,
  Dashboard,
  Logout,
  BlockUser,
  SalesReport,
  SalesReportFilter,
  salesPdf,
  excelReport

}
