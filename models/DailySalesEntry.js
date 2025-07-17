// const mongoose = require('mongoose');

// const dailySalesEntrySchema = new mongoose.Schema({
//   franchiseeId: { type: String, ref: 'User', required: true },
//   date: { type: String, required: true },
//   totalSales: { type: Number, required: true },
//   totalCustomers: { type: Number, required: true }
// }, { timestamps: true });

// module.exports = mongoose.model('DailySalesEntry', dailySalesEntrySchema);





////////////////////////////
const mongoose = require('mongoose');

const dailySalesEntrySchema = new mongoose.Schema({
  franchiseeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: Date,  // Changed from String to Date for better querying
    required: true,
    index: true  // Added index for better performance on date queries
  },
  totalSales: { 
    type: Number, 
    required: true,
    min: 0  // Validation to ensure positive numbers
  },
  totalCustomers: { 
    type: Number, 
    required: true,
    min: 0  // Validation to ensure positive numbers
  },
  // You can add more fields as needed
  notes: {
    type: String,
    default: ''
  }
}, { 
  timestamps: true,
  // Add compound index for franchiseeId and date for unique entries
  indexes: [
    { 
      fields: { franchiseeId: 1, date: 1 }, 
      unique: true 
    }
  ]
});

// Add virtual for formatted date if needed
dailySalesEntrySchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

module.exports = mongoose.model('DailySalesEntry', dailySalesEntrySchema);