// utils/reports/expensesReport.js
const Transaction = require('../../models/Transaction');

/**
 * @desc    توليد تقرير المصروفات
 * @param   {String} shopId - معرف المتجر
 * @param   {Date} startDate - تاريخ البدء
 * @param   {Date} endDate - تاريخ الانتهاء
 * @return  {Object} - بيانات تقرير المصروفات
 */
const generateExpensesReport = async (shopId, startDate, endDate) => {
    try {
        // حساب المصروفات (المعاملات من نوع 'expense')
        const expenses = await Transaction.aggregate([
            {
                $match: {
                    shop: shopId,
                    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                    type: 'expense'
                }
            },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' }
                }
            },
            {
                $project: {
                    category: '$_id',
                    total: 1,
                    _id: 0
                }
            }
        ]);

        // حساب المصروفات الشهرية
        const monthlyExpenses = await Transaction.aggregate([
            {
                $match: {
                    shop: shopId,
                    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                    type: 'expense'
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    total: { $sum: '$amount' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            },
            {
                $project: {
                    month: { $concat: [
                        { $toString: '$_id.year' },
                        '-',
                        { $toString: '$_id.month' }
                    ]},
                    total: 1,
                    _id: 0
                }
            }
        ]);

        // حساب إجمالي المصروفات
        const totalExpenses = expenses.reduce((sum, item) => sum + item.total, 0);

        return {
            totalExpenses,
            expensesByCategory: expenses,
            monthlyExpenses: monthlyExpenses
        };
    } catch (error) {
        console.error('Error generating expenses report:', error);
        throw new Error('فشل في توليد تقرير المصروفات');
    }
};

module.exports = generateExpensesReport;