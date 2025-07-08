// routers/post.js
import { Router } from "express";
import Post from "../models/posts.model.js";
import User from "../models/users.model.js";
import commentRouter from './comment.js';
import passport from '../config/passport.js'; // Import passport
import { isSameUserValidator } from "../validators/post.validator.js";

// Hapus import { protect } from "../middlewares/auth.middleware.js"; // <-- HAPUS INI

const router = Router();

// Middleware untuk autentikasi JWT (menggantikan 'protect')
const jwtAuth = passport.authenticate('jwt', { session: false });

// Middleware untuk memeriksa peran admin
const isAdmin = (req, res, next) => {
    // req.user diisi oleh jwtAuth
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }
    next();
};

router.use('/:postId/comments', commentRouter);

// GET /posts/:postId (Public Access)
router.get('/:postId', async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const result = await Post.findById(postId).populate('author', 'username email');
        if (!result) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        res.json(result);
    } catch (error) {
        console.error(`Error in GET /posts/${req.params.postId}:`, error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid Post ID format.' });
        }
        next(error);
    }
});

// GET /posts (Public Access)
router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 8;
        const keyword = req.query.keyword;

        const skip = (page - 1) * pageSize;

        let query = {};
        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, '$options': 'i' } },
                { content: { '$regex': keyword, '$options': 'i' } }
            ];
        }

        const totalCount = await Post.countDocuments(query);

        const findPosts = await Post.find(query)
                                    .sort({ createdAt: -1 })
                                    .skip(skip)
                                    .limit(pageSize)
                                    .populate('author', 'username');

        res.json({
            posts: findPosts,
            totalCount: totalCount,
            page: page,
            pageSize: pageSize
        });
    } catch (error) {
        console.error("Error in GET /posts:", error);
        next(error);
    }
});

// POST /posts - Membutuhkan user yang terautentikasi (JWT)
router.post('/', jwtAuth, async (req, res, next) => { // jwtAuth memastikan user login
    try {
        const { title, content, imageUrl } = req.body;
        const authorId = req.user.id; // ID user dari JWT

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required.' });
        }

        const createdPost = await Post.create({
            title,
            content,
            imageUrl,
            author: authorId
        });

        await User.findByIdAndUpdate(authorId, { $push: { posts: createdPost._id } });

        res.status(201).json(createdPost);
    } catch (error) {
        console.error("Error in POST /posts:", error);
        next(error);
    }
});

// PUT /posts/:postId - Membutuhkan user yang terautentikasi (JWT)
// Admin bisa mengedit semua post, user biasa hanya post sendiri
router.put('/:postId', jwtAuth, async (req, res, next) => { // Hapus isSameUserValidator dari sini
    try {
        const postId = req.params.postId;
        const { title, content, imageUrl } = req.body;
        const requestingUser = req.user; // Dapatkan objek user lengkap dari req.user

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required for update.' });
        }

        const postToUpdate = await Post.findById(postId);
        if (!postToUpdate) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // --- LOGIKA OTORISASI ADMIN/USER BIASA ---
        // Jika user adalah admin, izinkan update
        // Jika user bukan admin, cek apakah dia penulis post
        if (requestingUser.role !== 'admin' && postToUpdate.author?.toString() !== requestingUser._id.toString()) {
            return res.status(403).json({ message: 'Forbidden: You are not the author of this post or do not have admin privileges.' });
        }
        // --- AKHIR LOGIKA OTORISASI ---

        const updatedPost = await Post.findByIdAndUpdate(postId, {
            title,
            content,
            imageUrl
        }, {
            new: true,
            runValidators: true
        });

        res.json(updatedPost);
    } catch (error) {
        console.error(`Error in PUT /posts/${req.params.postId}:`, error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid Post ID format.' });
        }
        next(error);
    }
});

// DELETE /posts/:postId - Membutuhkan user yang terautentikasi (JWT)
// Admin bisa menghapus semua post, user biasa hanya post sendiri
router.delete("/:postId", jwtAuth, async (req, res, next) => { // Hapus isSameUserValidator dari sini
    try {
        const postId = req.params.postId;
        const requestingUser = req.user; // Dapatkan objek user lengkap dari req.user

        const postToDelete = await Post.findById(postId);
        if (!postToDelete) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // --- LOGIKA OTORISASI ADMIN/USER BIASA ---
        // Jika user adalah admin, izinkan delete
        // Jika user bukan admin, cek apakah dia penulis post
        if (requestingUser.role !== 'admin' && postToDelete.author?.toString() !== requestingUser._id.toString()) {
            return res.status(403).json({ message: 'Forbidden: You are not the author of this post or do not have admin privileges.' });
        }
        // --- AKHIR LOGIKA OTORISASI ---

        await Post.findByIdAndDelete(postId);

        // Hapus post dari daftar post user (penulis asli)
        // Penting: Hapus dari user yang sebenarnya menulis post, bukan user yang melakukan request delete
        // Jika admin menghapus post user lain, kita harus hapus dari daftar post user lain itu.
        if (postToDelete.author) { // Pastikan author ada
             await User.findByIdAndUpdate(postToDelete.author, { $pull: { posts: postId } });
        }

        res.status(204).send();
    } catch (error) {
        console.error(`Error in DELETE /posts/${req.params.postId}:`, error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid Post ID format.' });
        }
        next(error);
    }
});

export default router;