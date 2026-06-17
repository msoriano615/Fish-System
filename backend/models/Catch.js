const mongoose = require('mongoose');

const catchSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    fish_type: {
        type: String,
        required: [true, 'Fish type is required'],
        enum: ['lake_whitefish', 'walleye', 'northern_pike', 'yellow_perch', 'burbot']
    },
    weight: {
        type: Number,
        required: [true, 'Weight is required'],
        min: [0, 'Weight cannot be negative']
    },
    length: {
        type: Number,
        required: [true, 'Length is required'],
        min: [0, 'Length cannot be negative']
    },
    bait_type: {
        type: String,
        required: [true, 'Bait type is required'],
        enum: ['live_bait', 'organic_bait', 'artificial_lure']
    },
    bait_name: {
        type: String,
        required: [true, 'Bait name is required'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        enum: ['sylvan_lake', 'gull_lake', 'pine_lake']
    },
    date: {
        type: Date,
        required: [true, 'Date is required']
    },
    time: {
        type: String,
        required: [true, 'Time is required']
    },
    weather: {
        type: [String],
        enum: ['sunny', 'cloudy', 'rainy']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Catch', catchSchema);