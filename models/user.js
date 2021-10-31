const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    phone: { type: Number },
    isAdmin: { type: Boolean },
    token: { type: String },
});

const User = mongoose.model("User", userSchema);
module.exports = { User };