import mongoose, { Schema } from "mongoose";

const CommentSchema = new Schema(
    {
        content: {
            type: String,
            required: true, // Konten komentar wajib ada
            trim: true
        },
        // Referensi ke model Post. Ini menunjukkan bahwa satu komentar milik satu post.
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true // Komentar harus terkait dengan post
        }
    },
    {
        timestamps: true // Otomatis menambahkan createdAt dan updatedAt
    }
);

const Comment = mongoose.model("Comment", CommentSchema); // Membuat model Comment dari skema
export default Comment; // Ekspor model Comment