const { Router } = require('express');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const router = Router();

router.get('/sales-reports', auth, checkRole(['order_manager']), async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const startDate = new Date(year - 2, 0, 1); // 1 января 2 года назад
    const endDate = new Date(year + 2, 11, 31); // 31 декабря 2 года вперед

    const orders = await Order.find({
      postedDate: { $gte: startDate, $lte: endDate },
      isCompleted: true
    });

    const monthlyExpenses = {};
    
    orders.forEach(order => {
      const month = order.postedDate.getMonth() + 1;
      const year = order.postedDate.getFullYear();
      const monthYear = `${month}/${year}`;

      if (!monthlyExpenses[monthYear]) {
        monthlyExpenses[monthYear] = 0;
      }

      const totalOrderCost = order.products.reduce((sum, product) => {
        return sum + product.price;
      }, 0);

      monthlyExpenses[monthYear] += totalOrderCost;
    });

    const labels = Object.keys(monthlyExpenses).sort((a, b) => {
      const [monthA, yearA] = a.split('/').map(Number);
      const [monthB, yearB] = b.split('/').map(Number);
      return yearA !== yearB ? yearA - yearB : monthA - monthB;
    });

    const data = labels.map(label => monthlyExpenses[label]);

    res.render('sales-reports', {
      title: 'Статистика',
      layout: 'order-mngr.hbs',
      isReports: true,
      labels: JSON.stringify(labels),
      data: JSON.stringify(data),
      name: req.user.name
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
