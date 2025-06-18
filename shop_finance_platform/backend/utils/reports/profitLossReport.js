// utils/reports/profitLossReport.js
const Invoice = require('../../models/Invoice');
const Purchase = require('../../models/Purchase');

/**
 * @desc    توليد تقرير الأرباح والخسائر
 * @param   {String} shopId - معرف المتجر
 * @param   {Date} startDate - تاريخ البدء
 * @param   {Date} endDate - تاريخ الانتهاء
 * @return  {Object} - بيانات تقرير الأرباح والخسائر
 */
const generateProfitLossReport = async (shopId, startDate, endDate) => {
    try {
        // حساب إجمالي المبيعات من الفواتير
        const sales = await Invoice.aggregate([
            {
                $match: {
                    shop: shopId,
                    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                    status: 'paid'
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$total' }
                }
            }
        ]);

        // حساب إجمالي المشتريات
        const purchases = await Purchase.aggregate([
            {
                $match: {
                    shop: shopId,
                    date: { $gte: new Date(startDate), $lte: new Date(endDate) }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPurchases: { $sum: '$total' }
                }
            }
        ]);

        const totalSales = sales.length > 0 ? sales[0].totalSales : 0;
        const totalPurchases = purchases.length > 0 ? purchases[0].totalPurchases : 0;
        const netProfit = totalSales - totalPurchases;

        return {
            totalSales,
            totalPurchases,
            netProfit,
            profitMargin: totalSales > 0 ? (netProfit / totalSales) * 100 : 0
        };
    } catch (error) {
        console.error('Error generating profit/loss report:', error);
        throw new Error('فشل في توليد تقرير الأرباح والخسائر');
    }
};

module.exports = generateProfitLossReport;