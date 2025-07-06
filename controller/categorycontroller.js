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
    const brandname = req.body.brandname.trim();

    if (brandname === "") {
      return res.status(400).json({ success: false, message: 'Brand name must be filled' });
    }

    // Exact, case-insensitive match
    const existingCategory = await categorycollection.findOne({
      category: { $regex: new RegExp(`^${brandname}$`, 'i') }
    });

    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    await categorycollection.insertMany([{ category: brandname }]);

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
        const brandname = req.body.brandname.trim();


        if (brandname === "") {
            return res.status(400).json({ success: false, message: 'Brand name must be filled' });
        }

   
        const existingCategory = await categorycollection.findOne({
            category: { $regex: new RegExp(`^${brandname}$`, 'i') }
        });


        if (existingCategory && existingCategory._id.toString() !== req.params.id) {
            return res.status(400).json({ success: false, message: 'Category already exists' });
        }

        const id = req.params.id;

  
        await categorycollection.findByIdAndUpdate(id, {
            category: brandname
        });

       
        await productcollection.updateMany(
            { category: { $regex: new RegExp(`^${brandname}$`, 'i') } },
            { $set: { category: brandname } }
        );

        console.log('Category updated successfully');
        return res.status(200).json({ success: true, message: 'Update successful' });

    } catch (error) {
        console.log('Error while updating category:', error);
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