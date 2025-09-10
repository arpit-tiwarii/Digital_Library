import express from 'express';
import { submitContact, listContacts, updateContactStatus } from '../controllers/contactController.js';
import auth from '../middleware/auth.js';
import userAuth from '../middleware/auth.js';

const app = express.Router();

// Public endpoint to submit contact form
app.post('/contact', submitContact);

// Admin endpoints to manage contact messages
app.get('/contacts', auth, userAuth, async (req, res, next) => {
  try {
    // assuming userAuth attaches req.user
    if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
    return listContacts(req, res);
  } catch (e) { return next(e); }
});

app.put('/contacts/:id/status', auth, userAuth, async (req, res, next) => {
  try {
    if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
    return updateContactStatus(req, res);
  } catch (e) { return next(e); }
});

export default app;


