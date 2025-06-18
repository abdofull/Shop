const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.ObjectId,
        ref: 'Shop',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Employee name is required'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    position: {
        type: String,
        required: [true, 'Position is required'],
        enum: ['cashier', 'sales_associate', 'manager', 'accountant', 'security', 'cleaner', 'other'],
        default: 'sales_associate'
    },
    salary: {
        amount: {
            type: Number,
            required: [true, 'Salary amount is required'],
            min: [0, 'Salary cannot be negative']
        },
        frequency: {
            type: String,
            enum: ['hourly', 'daily', 'weekly', 'monthly'],
            default: 'monthly'
        }
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
        default: Date.now
    },
    endDate: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: {
            type: String,
            default: 'Libya'
        }
    },
    emergencyContact: {
        name: String,
        phone: String,
        relationship: String
    },
    nationalId: {
        type: String,
        trim: true
    },
    bankAccount: {
        accountNumber: String,
        bankName: String,
        iban: String
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot be more than 500 characters']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for better query performance
employeeSchema.index({ shop: 1, isActive: 1 });

module.exports = mongoose.model('Employee', employeeSchema);

