const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Shop name is required'],
        trim: true,
        maxlength: [100, 'Shop name cannot be more than 100 characters']
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        // required: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: {
            type: String,
            default: 'Libya'
        },
        zipCode: String
    },
    phone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    website: {
        type: String,
        trim: true
    },
    logo: {
        type: String,
        default: 'default-shop-logo.png'
    },
    currency: {
        type: String,
        default: 'LYD',
        enum: ['LYD', 'USD', 'EUR']
    },
    timezone: {
        type: String,
        default: 'Africa/Tripoli'
    },
    businessType: {
        type: String,
        enum: ['retail', 'wholesale', 'service', 'restaurant', 'other'],
        default: 'retail'
    },
    taxNumber: {
        type: String,
        trim: true
    },
    registrationNumber: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    subscription: {
        plan: {
            type: String,
            enum: ['basic', 'premium', 'enterprise'],
            default: 'basic'
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'suspended'],
            default: 'active'
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        endDate: {
            type: Date
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Shop', shopSchema);

