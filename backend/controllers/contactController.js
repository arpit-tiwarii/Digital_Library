import ContactMessage from '../models/contactMessage.js';
import { sendContactConfirmationEmail, sendContactForwardEmail } from '../utils/emailService.js';

export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const contact = await ContactMessage.create({ name, email, subject, message });

    // fire-and-forget emails; don't block response
    Promise.allSettled([
      sendContactConfirmationEmail?.(email, name, subject, message),
      sendContactForwardEmail?.(name, email, subject, message)
    ]).catch(() => {});

    return res.status(201).json({ success: true, data: contact });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit contact message', error: error.message });
  }
};

export const listContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { status } : {};
    const [items, total] = await Promise.all([
      ContactMessage.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      ContactMessage.countDocuments(query)
    ]);

    return res.status(200).json({ success: true, data: items, total });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch contact messages', error: error.message });
  }
};

export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await ContactMessage.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Message not found' });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
};


