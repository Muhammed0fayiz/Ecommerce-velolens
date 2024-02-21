const categorycollection = require('../models/category')
const productcollection = require('../models/product')
// category page render
const Category = async (req, res) => {
    try {
        const data = await categorycollection.find()
        res.render('admin/category', { data })
    } catch (error) {
        console.log(error);
        res.status(500).send("internal server error")
    }
}



// add category render
const AddCategory = (req, res) => {
    res.render('admin/addcategory')
}
// addcategory post
const NewCategory = async (req, res) => {
    try {
        // Check if brandname is empty
        if (req.body.brandname.trim() === "") {
            // Brand name is empty, send a response to the client
            return res.status(400).json({ success: false, message: 'Brand name must be filled' });
        }

        // Check if the category already exists
        const existingCategory = await categorycollection.findOne({
            category: { $regex: new RegExp(req.body.brandname, 'i') },
        });

        if (existingCategory) {
            // Brand name already exists, send a response to the client
            return res.status(400).json({ success: false, message: 'Category already exists' });
        }

        // If brandname is not empty and the category doesn't exist, proceed with insertion
        const data = {
            category: req.body.brandname,
        };

        await categorycollection.insertMany([data]);

        console.log('Category inserted successfully');
        return res.status(200).json({ success: true, message: 'Insert successful' });
    } catch (error) {
        console.log('Error while post:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};





// category update pass value
const UpdateCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const updCategory = await categorycollection.findOne({ _id: id });

        res.render('admin/updateCategory', { updCategory });
    } catch (error) {
        console.error('Error in updateCategory:', error);
        res.status(500).send('Internal Server Error');
    }
};
// category update post
const UpdateCategoryPost = async (req, res) => {
    try {
        if (req.body.brandname.trim() === "") {
            // Brand name is empty, send a response to the client
            return res.status(400).json({ success: false, message: 'Brand name must be filled' });
        }

        // Check if the category already exists
        const existingCategory = await categorycollection.findOne({
            category: { $regex: new RegExp(req.body.brandname, 'i') },
        });

        if (existingCategory) {
            // Brand name already exists, send a response to the client
            return res.status(400).json({ success: false, message: 'Category already exists' });
        }

        const id = req.params.id;



        await categorycollection.findByIdAndUpdate(id, {
            category: req.body.brandname
        });
        await productcollection.fid



        console.log('Category inserted successfully');
        return res.status(200).json({ success: true, message: 'Insert successful' });

        // res.redirect('/admin/category')

    } catch (error) {
        console.log('Error while post:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
// delete category
const DeleteCategory = async (req, res) => {
    try {
        const id = req.params.id
        await categorycollection.findByIdAndDelete({ _id: id })
            .then(() => {
                res.redirect('/admin/category')
            })
            .catch((error) => {
                console.log(error);
                res.status(500).send("internal server error")
            })
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error");
    }
}


module.exports = {
    Category,
    AddCategory,
    NewCategory,
    UpdateCategory,
    UpdateCategoryPost,
    DeleteCategory,
}