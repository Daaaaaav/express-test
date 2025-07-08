// post.validator.js (VERSI KOREKSI)

import Post from "../models/posts.model.js";

export async function isUserValidator(req, res, next) {
    const user = req.user; // Ambil informasi user dari req.user (diisi oleh Passport.js)
    if (!user) {
        return res.status(401).json({ message: "Unauthorized: Please log in." });
    }
    next();
}

export async function isSameUserValidator(req, res, next) {
    const user = req.user
    if(!user)
        res.json("Not Authorized")

    const post =  await Post.findById(req.params.postId)

    if(!post.author._id.equals(user._id))
        res.status(403).json('Not Authorized.')
    next();
}