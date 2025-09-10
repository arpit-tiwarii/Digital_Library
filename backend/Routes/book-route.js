import express from 'express';
import Issue from '../models/issue.js';
import Book from '../models/book.js';
import Category from '../models/category.js';
import {auth,userAuth, adminAuth } from '../middleware/auth.js';
import upload from '../middleware/multerconfig.js'

const app = express.Router();

app.post('/postBook', upload.single('coverImage'), auth, adminAuth, async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    if(!req.file){
        return res.status(404).json({ error: "Upload book image is required" });
    }
    
    // Handle FormData parsing for nested objects
    const categoryName = req.body['categoryName'] || req.body.Category?.categoryName;
    console.log(categoryName);
    const category = categoryName ? { categoryName } : null;
    const { availableCopies, ...bookdata } = req.body;
    
    console.log('Parsed category:', category);
    console.log('Parsed bookdata:', bookdata);

    // Validate mandatory fields
    if (!bookdata.bookTitle || !bookdata.isbn || !bookdata.publisher || !bookdata.year || !bookdata.bookAuthor || !bookdata.totalCopies) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Validate category data
    if (!category || !category.categoryName) {
      return res.status(400).json({ error: 'Category information is required' });
    }

    // Find or create category
    let categorie = await Category.findOne({ categoryName: category.categoryName });

    if (!categorie) {
      categorie = new Category(category);
      await categorie.save();
    }

    // ✅ Automatically set availableCopies = totalCopies
    const newBook = new Book({
      ...bookdata,
      availableCopies: bookdata.totalCopies,
      categoryId: categorie._id,
      coverImage: req.file.filename // Set the uploaded file name
    });
    await newBook.save();

    res.status(200).json({
      success: true,
      message: 'Book added successfully!',
      book: {
        id: newBook._id,
        title: newBook.bookTitle,
        author: newBook.bookAuthor,
        isbn: newBook.isbn,
        publisher: newBook.publisher,
        year: newBook.year,
        category: categorie.categoryName,
        availableCopies: newBook.availableCopies,
        coverImage: newBook.coverImage,
        description: newBook.description
      }
    });
  } catch (err) {
    console.error('Error creating book:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/getBooks', async (req, res) => {
    try {
        const books = await Book.find()
          .populate('categoryId', 'categoryName color icon') // populate category details
          .lean();
        console.log('Books fetched:', books.length);
        
        const booksForFrontend = books.map(book => ({
            id: book._id,
            bookTitle: book.bookTitle,
            bookAuthor: book.bookAuthor,
            isbn: book.isbn,
            publisher: book.publisher,
            year: book.year,
            categoryName: book.categoryId ? book.categoryId.categoryName : 'Unknown',
            categoryColor: book.categoryId ? book.categoryId.color : '#6c757d',
            categoryIcon: book.categoryId ? book.categoryId.icon : '📚',
            totalCopies: book.totalCopies,
            availableCopies: book.availableCopies,
            description: book.description,
            coverImage: book.coverImage || 'defaultBook.jpg',
            createdAt: book.createdAt,
            updatedAt: book.updatedAt
        }));
        
        res.status(200).json({
            success: true,
            books: booksForFrontend
        });
    } catch (err) {
        console.error('Error in getBooks:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch books',
            error: err.message
        });
    }
})

app.get('/list', async (req, res) => {
    console.log("list me aya")
    console.log(req.query)
    // Correctly handle optional URL parameters.
    // If a parameter is not provided, it will be an empty string.
    const search = req.query.search || '';
    const category = req.query.category || '';
    const availability = req.query.availability || '';
    console.log(search,category,availability)
    
    try {
        let query = {};
        
        // Build the search conditions
        if (search) {
            query.$or = [
                { bookTitle: { $regex: search, $options: 'i' } },
                { bookAuthor: { $regex: search, $options: 'i' } }
            ];
        }

        if (availability === 'available') {
            query.availableCopies = { $gt: 0 };
        }

        // If category is specified, find the category first
        if (category) {
            const categoryDoc = await Category.findOne({ categoryName: category });
            if (categoryDoc) {
                query.categoryId = categoryDoc._id;
            }
        }

        // Get books that are either active or don't have isActive field (existing records)
        const listBook = await Book.find({
            ...query,
            $or: [
                { isActive: true },
                { isActive: { $exists: false } }
            ]
        }).populate('categoryId');
        console.log(listBook)
        
        // The status for a successful GET request is 200 OK, not 201 Created.
        // It's better to render the page even if no books are found and show a message in the EJS.
        if (listBook.length > 0) {
            const booksForEjs = listBook.map(book => ({
                id: book._id,
                title: book.bookTitle,
                author: book.bookAuthor,
                isbn: book.isbn,
                category: book.categoryId ? book.categoryId.categoryName : 'Unknown',
                availableCopies: book.availableCopies,
                description: book.description,
                rating: book.rating || 0,
                image: book.coverImage || '/default-image.png'
            }));
            
            res.status(200).render('layout', {page:'books/index', book: booksForEjs, user: req.user || null });
        } else {
            // A 404 is appropriate if no books are found for the given criteria.
            res.status(404).send('No books found matching your criteria.');
        }

    } catch (err) {
        console.error('Error fetching books:', err);
        // Provide a more specific error message in a real application
        res.status(500).send('An unexpected server error occurred.');
    }
});

app.delete('/deleteBook/:id', auth, adminAuth, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }
        await Book.findByIdAndDelete(req.params.id);
        
        res.status(200).json({
            success: true,
            message: 'Book deleted successfully',
            book: book
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to deactivate book',
            error: err.message
        });
    }
})

// Update book details
app.put('/update/:id', auth, adminAuth, async (req, res) => {
    try {
        console.log('=== Received book update request ===');
        console.log('Book ID:', req.params.id);
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('User:', req.user); // Log the authenticated user
        
        const { bookTitle, bookAuthor, isbn, publisher, year, totalCopies, description } = req.body;
        
        // Validate required fields
        if (!bookTitle || !bookAuthor || !isbn || !publisher || !year || totalCopies === undefined) {
            console.error('Validation failed: Missing required fields');
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['bookTitle', 'bookAuthor', 'isbn', 'publisher', 'year', 'totalCopies']
            });
        }
        
        // Find the book by ID
        const book = await Book.findById(req.params.id);
        
        if (!book) {
            console.error('Book not found with ID:', req.params.id);
            return res.status(404).json({ error: 'Book not found' });
        }
        
        console.log('Found book to update:', JSON.stringify(book, null, 2));
        
        // Calculate the difference in total copies to update available copies
        const copiesDifference = totalCopies - book.totalCopies;
        
        // Update book details
        book.bookTitle = bookTitle || book.bookTitle;
        book.bookAuthor = bookAuthor || book.bookAuthor;
        book.isbn = isbn || book.isbn;
        book.publisher = publisher || book.publisher;
        book.year = year || book.year;
        book.totalCopies = totalCopies || book.totalCopies;
        book.availableCopies += copiesDifference; // Update available copies based on the difference
        book.description = description || book.description;
        
        // Save the updated book
        const updatedBook = await book.save();
        
        res.status(200).json(updatedBook);
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ error: 'Failed to update book' });
    }
});

// Route to reactivate deactivated books
app.put('/reactivateBook/:id', auth, adminAuth, async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(
            req.params.id, 
            { isActive: true }, 
            { new: true }
        );
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Book reactivated successfully',
            book: book
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to reactivate book',
            error: err.message
        });
    }
})

app.get('/searchbooks', (req, res) => {
    // try{
    res.send("done")
    // }
})

// Route to render add book page (EJS template)
app.get('/add', (req, res) => {
    res.render('./books/create', { user: req.user || null });
});

// Route to render book details page (for EJS template)
app.get('/getBook/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('categoryId');

        if (!book || (book.isActive === false)) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Map backend fields to EJS template fields
        const bookForEjs = {
            id: book._id,
            title: book.bookTitle,
            author: book.bookAuthor,
            rating: book.rating || 0,
            isbn: book.isbn,
            publisher: book.publisher,
            publishedDate: book.year,
            category: book.categoryId ? book.categoryId.categoryName : 'Unknown',
            availableCopies: book.availableCopies,
            totalCopies: book.totalCopies,
            description: book.description,
            image: book.coverImage || '/default-image.png'
        };

        res.render('layout', {page:"./books/show", books: bookForEjs, user: req.user || null });
    } catch (err) {
        console.error('Error fetching book:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default app;