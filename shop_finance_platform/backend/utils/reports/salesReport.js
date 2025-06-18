
// utils/reports/salesReport.js
const Invoice = require('../../models/Invoice');
const Product = require('../../models/Product');

/**
 * @desc    توليد تقرير المبيعات
 * @param   {String} shopId - معرف المتجر
 * @param   {Date} startDate - تاريخ البدء
 * @param   {Date} endDate - تاريخ الانتهاء
 * @return  {Object} - بيانات تقرير المبيعات
 */
const generateSalesReport = async (shopId, startDate, endDate) => {
    try {
        // الحصول على الفواتير في الفترة المحددة
        const invoices = await Invoice.find({
            shop: shopId,
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            },
            status: 'paid'
        }).populate('items.product');

        // تحليل بيانات المبيعات
        const salesData = {
            totalSales: 0,
            totalInvoices: invoices.length,
            salesByProduct: {},
            dailySales: {}
        };

        invoices.forEach(invoice => {
            // تاريخ الفاتورة بدون وقت
            const invoiceDate = invoice.date.toISOString().split('T')[0];
            
            // تحديث المبيعات اليومية
            salesData.dailySales[invoiceDate] = (salesData.dailySales[invoiceDate] || 0) + invoice.total;
            
            // تحديث إجمالي المبيعات
            salesData.totalSales += invoice.total;

            // تحليل العناصر
            invoice.items.forEach(item => {
                const product = item.product;
                
                // تحديث المبيعات حسب المنتج
                if (!salesData.salesByProduct[product._id]) {
                    salesData.salesByProduct[product._id] = {
                        name: product.name,
                        quantity: 0,
                        total: 0
                    };
                }
                salesData.salesByProduct[product._id].quantity += item.quantity;
                salesData.salesByProduct[product._id].total += item.price * item.quantity;
            });
        });

        return salesData;
    } catch (error) {
        console.error('Error generating sales report:', error);
        throw new Error('فشل في توليد تقرير المبيعات');
    }
};

module.exports = generateSalesReport;