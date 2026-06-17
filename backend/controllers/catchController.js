const Catch = require('../models/Catch');
const { catchAsync, AppError } = require('../middleware/errorHandler');

// ─── Log a Catch ───
const logCatch = catchAsync(async function(req, res) {
    const { fish_type, weight, length, bait_type, bait_name, location, date, time, weather } = req.body;

    const newCatch = await Catch.create({
        user: req.user.id,
        fish_type,
        weight,
        length,
        bait_type,
        bait_name,
        location,
        date,
        time,
        weather
    });

    res.status(201).json({
        success: true,
        message: 'Catch logged successfully',
        catch: newCatch
    });
});

// ─── Get All Catches for Logged In User ───
const getRecords = catchAsync(async function(req, res) {
    const catches = await Catch.find({ user: req.user.id }).sort({ date: -1 });

    // Calculate summary stats
    const totalCatches = catches.length;

    if (totalCatches === 0) {
        return res.status(200).json({
            success: true,
            summary: {
                totalCatches: 0,
                heaviestFish: 0,
                longestFish: 0,
                avgWeight: 0,
                avgLength: 0
            },
            catches: []
        });
    }

    const heaviestFish = Math.max(...catches.map(c => c.weight));
    const longestFish = Math.max(...catches.map(c => c.length));
    const avgWeight = (catches.reduce((sum, c) => sum + c.weight, 0) / totalCatches).toFixed(1);
    const avgLength = (catches.reduce((sum, c) => sum + c.length, 0) / totalCatches).toFixed(1);

    res.status(200).json({
        success: true,
        summary: {
            totalCatches,
            heaviestFish,
            longestFish,
            avgWeight,
            avgLength
        },
        catches
    });
});

// ─── Get Statistics ───
const getStatistics = catchAsync(async function(req, res) {
    const catches = await Catch.find({});

    const totalCatches = catches.length;

    if (totalCatches === 0) {
        return res.status(200).json({
            success: true,
            statistics: {
                species: [],
                locations: [],
                baitTypes: [],
                timeOfDay: []
            }
        });
    }

    // Fish species distribution
    const speciesCount = {};
    catches.forEach(function(c) {
        speciesCount[c.fish_type] = (speciesCount[c.fish_type] || 0) + 1;
    });
    const species = Object.entries(speciesCount).map(function([name, count]) {
        return { name, percentage: Math.round((count / totalCatches) * 100) };
    });

    // Location distribution
    const locationCount = {};
    catches.forEach(function(c) {
        locationCount[c.location] = (locationCount[c.location] || 0) + 1;
    });
    const locations = Object.entries(locationCount).map(function([name, count]) {
        return { name, percentage: Math.round((count / totalCatches) * 100) };
    });

    // Bait type distribution
    const baitCount = {};
    catches.forEach(function(c) {
        baitCount[c.bait_type] = (baitCount[c.bait_type] || 0) + 1;
    });
    const baitTypes = Object.entries(baitCount).map(function([name, count]) {
        return { name, percentage: Math.round((count / totalCatches) * 100) };
    });

    // Time of day distribution
    const timeSlots = {
        '6AM': 0, '8AM': 0, '10AM': 0, '12PM': 0,
        '2PM': 0, '4PM': 0, '6PM': 0, '8PM': 0
    };
    catches.forEach(function(c) {
        const hour = parseInt(c.time.split(':')[0]);
        if (hour >= 5 && hour < 7) timeSlots['6AM']++;
        else if (hour >= 7 && hour < 9) timeSlots['8AM']++;
        else if (hour >= 9 && hour < 11) timeSlots['10AM']++;
        else if (hour >= 11 && hour < 13) timeSlots['12PM']++;
        else if (hour >= 13 && hour < 15) timeSlots['2PM']++;
        else if (hour >= 15 && hour < 17) timeSlots['4PM']++;
        else if (hour >= 17 && hour < 19) timeSlots['6PM']++;
        else if (hour >= 19 && hour < 21) timeSlots['8PM']++;
    });
    const timeOfDay = Object.entries(timeSlots).map(function([slot, count]) {
        return { slot, count };
    });

    res.status(200).json({
        success: true,
        statistics: {
            species,
            locations,
            baitTypes,
            timeOfDay
        }
    });
});

// ─── Update a Catch ───
const updateCatch = catchAsync(async function(req, res) {
    const { fish_type, weight, length, bait_type, bait_name, location, date, time, weather } = req.body;

    const existingCatch = await Catch.findById(req.params.id);

    if (!existingCatch) {
        throw new AppError('Catch not found', 404);
    }

    // Make sure the catch belongs to the logged in user
    if (existingCatch.user.toString() !== req.user.id) {
        throw new AppError('Not authorized to edit this catch', 403);
    }

    existingCatch.fish_type = fish_type;
    existingCatch.weight = weight;
    existingCatch.length = length;
    existingCatch.bait_type = bait_type;
    existingCatch.bait_name = bait_name;
    existingCatch.location = location;
    existingCatch.date = date;
    existingCatch.time = time;
    existingCatch.weather = weather;

    await existingCatch.save();

    res.status(200).json({
        success: true,
        message: 'Catch updated successfully',
        catch: existingCatch
    });
});

// ─── Delete a Catch ───
const deleteCatch = catchAsync(async function(req, res) {
    const existingCatch = await Catch.findById(req.params.id);

    if (!existingCatch) {
        throw new AppError('Catch not found', 404);
    }

    if (existingCatch.user.toString() !== req.user.id) {
        throw new AppError('Not authorized to delete this catch', 403);
    }

    await existingCatch.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Catch deleted successfully'
    });
});

module.exports = { logCatch, getRecords, getStatistics, updateCatch, deleteCatch };