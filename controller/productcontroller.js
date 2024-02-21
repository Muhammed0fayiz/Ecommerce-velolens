const express = require('express');
const router = express.Router();
const productcollection = require('../models/product')
const categorycollection = require('../models/category');
const { Category } = require('./categorycontroller');
// product page render
const ProductPage = async (req, res) => {
    try {
        const data = await productcollection.find().populate('Category')
        console.log(data)
        res.render('admin/product', { data })
    } catch (error) {
        console.log(error)
        return res.status(500).send("Internal Server Error");
    }
}

// addproduct render
const AddProduct = async (req, res) => {
    const Category = await categorycollection.find({}, { category: 1, _id: 1 });


    res.render('admin/addProduct', { Category })
}
// add product post
const AddProductPost = async (req, res) => {
    try {

        const Category = await categorycollection.find({}, { category: 1, _id: 1 });
        const existingCategory = await productcollection.findOne({
            productName: { $regex: new RegExp(`^${req.body.productName}`, 'i') },
        });

        if (existingCategory) {
            // Product name already exists, send a response to the client
            res.render('admin/addProduct', { message: 'Product already exists', Category });
        } else {
            const data = {
                productName: req.body.productName,
                Category: req.body.brand,
                Price: req.body.price,
                Rating: req.body.rating,
                Model: req.body.model,
                Stock: req.body.stock,
                Description: req.body.description,
                image: req.body.croppedImages
                // image: req.files.map(file => file.path.substring(6)),
            };

            await productcollection.insertMany([data])
                .then(() => {
                    console.log('Inserted');
                    res.redirect('/admin/productlist');
                })
                .catch((error) => {
                    console.error('Not inserted', error);
                    res.status(500).send("Internal Server Error");
                });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
};

// updateProduct page render
const UpdateProduct = async (req, res) => {
    try {
        const Category = await categorycollection.find({}, { category: 1, _id: 1 })
        const id = req.params.id
        const updProduct = await productcollection.findOne({ _id: id }).populate('Category')
        res.render('admin/updateProduct', { updProduct, Category })
    } catch (error) {
        console.log(error)
        return res.status(500).send("Internal Server Error");
    }
}
//  updateproduct  post
const UpdateProductPost = async (req, res) => {
    try {
        const id = req.params.id
        // console.log(id);
        const value = await productcollection.findByIdAndUpdate(id, {
            Category: req.body.brand,
            Price: req.body.price,
            Rating: req.body.rating,
            Stock: req.body.stock,
            Model: req.body.model,
            Description: req.body.description,
        }, { new: true })
        if (!value) {
            // const values=await Product.findById(id)
            res.render('admin/updateProduct', value)
        } else {
            if (req.files && req.files.length > 0) {
                const newImages = req.files.map(file => file.path.substring(6))
                value.image = value.image.concat(newImages);
            }
            if (!value) {
                console.log("Product not found");
                res.status(404).send("Product not found");
                return;
            }
            await value.save();
            console.log(value);
            res.redirect("/admin/productlist");
        }
    } catch (error) {
        console.log(error);
    }
}



// update imagepost
const Deleteimg = async (req, res) => {
    
    try {
        const productId = req.body.productId;
        const imageIndex = req.body.imageIndex;
        console.log("HOY");
        const product = await productcollection.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        if (imageIndex < 0 || imageIndex >= product.image.length) {
            return res.status(400).send('Invalid image index');
        }
        product.image.splice(imageIndex, 1);
        await product.save();
        res.status(200).send('Image removed successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}
//listed product
const ProductListed = async (req, res) => {
    try {
        const id = req.params.id
        const product = await productcollection.findById(id)
        product.islisted = !product.islisted
        //    instead update
        await product.save()

        res.redirect('/admin/productlist')
    } catch (error) {
        console.log(error)
        return res.status(500).send("Internal Server Error");
    }
}
// delectproduct
const DeleteProduct = async (req, res) => {
    try {
        const id = req.params.id
        await productcollection.findByIdAndDelete({ _id: id })
            .then(() => {
                res.redirect('/admin/productlist')
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
// Search route
const ProductSearch = async (req, res) => {
    try {
        const productNameRegex = new RegExp(req.params.productName, 'i');
        const page = parseInt(req.query.page) || 1;
        const perPage = 6; // Number of products per page

        const totalProducts = await productcollection.countDocuments({
            productName: productNameRegex,
            islisted: true
        });

        const totalPages = Math.ceil(totalProducts / perPage);

        const products = await productcollection.find({
            productName: productNameRegex,
            islisted: true,
        })
            .skip((page - 1) * perPage)
            .limit(perPage).populate('Category');

        res.json({ products, totalPages, currentPage: page });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// filter sort
const HandleShopPageFilter = async (req, res) => {
    try {
        const { brand, sort, lowprice, highprice, search, page = 1 } = req.body;
        const limit = 6;  // Set the limit to the desired number of products per page

        let query = {
            islisted: true,
            Stock: { $gt: 0 }  // Filter for stock less than 0
        };

        // Check if a specific category is selected
        if (brand && brand !== 'Select Category') {
            query.Category = brand;
        }

        // Add search query for product name
        if (search) {
            query.productName = { $regex: new RegExp(search, 'i') }; // Case-insensitive search
        }

        if (lowprice && highprice) {
            query.Price = { $gte: parseInt(lowprice), $lte: parseInt(highprice) };
        } else if (lowprice) {
            query.Price = { $gte: parseInt(lowprice) };
        } else if (highprice) {
            query.Price = { $lte: parseInt(highprice) };
        }

        const skip = (page - 1) * limit;

        const products = await productcollection
            .find(query)
            .sort(sort === 'low-high' ? { Price: 1 } : { Price: -1 })
            .skip(skip)
            .limit(limit)
            .populate('Category')

        // Calculate total pages
        const totalProducts = await productcollection.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        res.json({ products, currentPage: parseInt(page), totalPages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};





module.exports = {

    ProductPage,
    AddProduct,
    AddProductPost,
    UpdateProduct,
    UpdateProductPost,
    Deleteimg,
    DeleteProduct,
    ProductSearch,
    HandleShopPageFilter,
    ProductListed
}
