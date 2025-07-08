// models/posts.model.js (PERBAIKAN)
import mongoose, { Schema } from "mongoose";

const PostSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true, // <-- PERBAIKAN: Author harus wajib
            index: true
        },
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }]
    },
    {
        timestamps: true
    }
);

const Post = mongoose.model("Post", PostSchema);
export default Post;