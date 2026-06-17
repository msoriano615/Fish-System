const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    win_number: {
        type: String,
        required: [true, 'WIN number is required'],
        unique: true,
        trim: true,
        minlength: [10, 'WIN number must be 10 digits'],
        maxlength: [10, 'WIN number must be 10 digits']
    },
    phone: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);