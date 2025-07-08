// routers/comment.js
import { Router } from "express";
import Comment from "../models/comments.model.js";

const router = Router({ mergeParams: true });

// GET /posts/:postId/comments
// Mengambil semua komentar untuk post tertentu dengan pagination
router.get('/', async (req, res, next) => {
    try {
        const postId = req.params.postId;
        // Ambil page dan limit dari query parameters
        const page = parseInt(req.query.page) || 1; // Default ke halaman 1
        const limit = parseInt(req.query.limit) || 5; // Default ke 5 komentar per load
        const skip = (page - 1) * limit;

        // Hitung total komentar yang cocok untuk post ini
        const totalComments = await Comment.countDocuments({ post: postId });

        // Temukan komentar dengan skip dan limit
        const comments = await Comment.find({ post: postId })
                                     .sort({ createdAt: -1 }) // Urutkan dari terbaru
                                     .skip(skip)
                                     .limit(limit);

        // Kirim komentar dan totalCount sebagai respons JSON
        res.json({ comments, totalCount: totalComments });
    } catch (error) {
        next(error);
    }
});

// POST /posts/:postId/comments
router.post('/', async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Comment content cannot be empty.' });
        }

        const newComment = await Comment.create({ content, post: postId });
        res.status(201).json(newComment);
    } catch (error) {
        next(error);
    }
});

// Optional: DELETE /posts/:postId/comments/:commentId
router.delete('/:commentId', async (req, res, next) => {
    try {
        const { commentId, postId } = req.params;
        const deletedComment = await Comment.findOneAndDelete({ _id: commentId, post: postId });

        if (!deletedComment) {
            return res.status(404).json({ message: 'Comment not found or does not belong to this post.' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;