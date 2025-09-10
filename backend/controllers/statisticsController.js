import express from "express";
import Book from "../models/book.js";
import User from "../models/user.js";
import Issue from "../models/issue.js";
import BookRequest from "../models/bookRequest.js";
import BookDonation from "../models/bookDonation.js";

const router = express.Router();

export const getDashboardStats = async (req, res) => {
  try {
    // ---- BOOKS ----
    const bookStats = await Book.aggregate([
      {
        $group: {
          _id: null,
          totalCopies: { $sum: "$totalCopies" },
          availableCopies: { $sum: "$availableCopies" },
        },
      },
    ]);

    const totalBooks = bookStats[0]?.totalCopies || 0;
    console.log("totalBooks", totalBooks)
    const availableBooks = bookStats[0]?.availableCopies || 0;
    console.log("availableBooks", availableBooks)
    const issuedBooks = totalBooks - availableBooks;

    // ---- USERS ----
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    // ---- ISSUES ----
    const totalIssues = await Issue.countDocuments(); // counts all issues
    console.log("totalIssues", totalIssues)
const activeIssues = await Issue.countDocuments({
  $or: [{ isReturned: false }, { isReturned: "false" }] // handle string or boolean
});

    const returnedIssues = await Issue.countDocuments({ isReturned: true });
    const today = new Date();
    const overdueIssues = await Issue.countDocuments({
      isReturned: false,
      returnDate: { $lt: today },
    });

    // ---- REQUESTS & DONATIONS ----
    const pendingRequests = await BookRequest.countDocuments({ status: "pending" });
    const pendingDonations = await BookDonation.countDocuments({ status: "pending" });

    // ---- FINES ----
    const pendingFines = await Issue.aggregate([
      { $match: { fineAmount: { $gt: 0 }, finePaid: false } },
      { $group: { _id: null, total: { $sum: "$fineAmount" } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        books: {
          total: totalBooks,
          available: availableBooks,
          issued: issuedBooks,
        },
        users: {
          total: totalUsers + totalAdmins,
          regular: totalUsers,
          admins: totalAdmins,
        },
        issues: {
          total: totalIssues,
          active: activeIssues,
          returned: returnedIssues,
          overdue: overdueIssues,
        },
        requests: {
          pending: pendingRequests,
        },
        donations: {
          pending: pendingDonations,
        },
        fines: {
          pending: pendingFines[0]?.total || 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};