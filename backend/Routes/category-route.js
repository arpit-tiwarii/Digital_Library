import express from 'express';
import Category from '../models/category.js'

const app = express.Router();

app.post('/postCategory', async (req, res) => {
    try {
        const category = new Category(req.body)
        await category.save();

        if (!category) { 
            res.status(404).send('error in sending category') 
        }
        res.status(201).send(category)
    } catch (err) {
        res.status(500).send(err)
    }
})

app.get('/getCategories', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true });
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: err.message
        });
    }
})

app.put('/updateCategory/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.status(200).send(category)
    } catch (err) {
        res.status(500).send(err)
    }
})

app.delete('/deleteCategory/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id, 
            { isActive: false }, 
            { new: true }
        );
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Category deactivated successfully',
            category: category
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to deactivate category',
            error: err.message
        });
    }
})

// Route to reactivate deactivated categories
app.put('/reactivateCategory/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id, 
            { isActive: true }, 
            { new: true }
        );
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Category reactivated successfully',
            category: category
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to reactivate category',
            error: err.message
        });
    }
})

export default app;