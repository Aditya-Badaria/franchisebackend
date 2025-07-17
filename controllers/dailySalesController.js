const DailySalesEntry = require('../models/DailySalesEntry');

// Add sales entry
exports.addSalesEntry = async (req, res) => {
  const { date, totalSales, totalCustomers } = req.body;

  try {
    const newEntry = new DailySalesEntry({
      franchiseeId: req.user.id, // assuming JWT auth middleware adds user
      date,
      totalSales,
      totalCustomers
    });

    await newEntry.save();
    res.status(201).json({ message: "Sales entry added successfully", data: newEntry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add sales entry", error: error.message });
  }
};

// Get all sales entries for a franchisee
exports.getSalesHistory = async (req, res) => {
  try {
    const sales = await DailySalesEntry.find({ franchiseeId: req.user.id }).sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get analytics data for charts
exports.getAnalytics = async (req, res) => {
  try {
    const { period = '30', startDate, endDate } = req.query;
    
    let dateFilter = { franchiseeId: req.user.id };
    
    // Handle date filtering
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to last 30 days if no specific dates provided
      const daysAgo = parseInt(period);
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - daysAgo);
      dateFilter.date = { $gte: fromDate };
    }

    const salesData = await DailySalesEntry.find(dateFilter).sort({ date: 1 });
    
    // Format data for charts
    const chartData = salesData.map(entry => ({
      date: entry.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      sales: entry.totalSales,
      customers: entry.totalCustomers,
      avgSalesPerCustomer: entry.totalCustomers > 0 ? (entry.totalSales / entry.totalCustomers).toFixed(2) : 0
    }));

    // Calculate summary statistics
    const totalSales = salesData.reduce((sum, entry) => sum + entry.totalSales, 0);
    const totalCustomers = salesData.reduce((sum, entry) => sum + entry.totalCustomers, 0);
    const avgDailySales = salesData.length > 0 ? (totalSales / salesData.length).toFixed(2) : 0;
    const avgDailyCustomers = salesData.length > 0 ? (totalCustomers / salesData.length).toFixed(2) : 0;

    res.json({
      chartData,
      summary: {
        totalSales: totalSales.toFixed(2),
        totalCustomers,
        avgDailySales,
        avgDailyCustomers,
        totalDays: salesData.length,
        avgSalesPerCustomer: totalCustomers > 0 ? (totalSales / totalCustomers).toFixed(2) : 0
      }
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Get monthly analytics
exports.getMonthlyAnalytics = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const monthlyData = await DailySalesEntry.aggregate([
      {
        $match: {
          franchiseeId: req.user.id,
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$date" },
          totalSales: { $sum: "$totalSales" },
          totalCustomers: { $sum: "$totalCustomers" },
          avgSales: { $avg: "$totalSales" },
          avgCustomers: { $avg: "$totalCustomers" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const chartData = monthlyData.map(item => ({
      month: monthNames[item._id - 1],
      sales: item.totalSales.toFixed(2),
      customers: item.totalCustomers,
      avgSales: item.avgSales.toFixed(2),
      avgCustomers: item.avgCustomers.toFixed(2),
      daysWithData: item.count
    }));

    res.json({ chartData });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};