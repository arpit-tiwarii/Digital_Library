import express from 'express';
import Issue from '../models/issue.js';
import { issueController } from '../controllers/issueController.js';
import { auth, adminAuth, userAuth } from '../middleware/auth.js';

const app = express.Router();

app.get('/getAllIssues', auth, adminAuth, issueController.getAllIssues)
app.get('/getIssue/:id', auth, userAuth, issueController.getIssue)
app.get('/overdue', auth, adminAuth, issueController.getOverdueIssues)
app.get('/due-soon', auth, adminAuth, issueController.getDueSoonIssues)

// Note: Direct book issuance is disabled - books can only be issued through request approval process
app.post('/postIssue', auth, adminAuth, issueController.createIssue)
app.put('/updateIssue/:issueId', auth, adminAuth, issueController.updateIssue)
app.delete('/deleteIssue/:id', auth, adminAuth, issueController.deleteIssue)

export default app;