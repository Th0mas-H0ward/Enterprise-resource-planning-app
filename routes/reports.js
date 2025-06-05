const { Router } = require('express');
const Specification = require('../models/Specification');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const router = Router();

router.get('/reports', auth, checkRole(['purchase_manager']), async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const startDate = new Date(year - 2, 0, 1); // 1 января 2 года назад
    const endDate = new Date(year + 2, 11, 31); // 31 декабря 2 года вперед

    const specifications = await Specification.find({
      postedDate: { $gte: startDate, $lte: endDate },
      isCompleted: true
    });

    const monthlyExpenses = {};
    
    specifications.forEach(spec => {
      const month = spec.postedDate.getMonth() + 1;
      const year = spec.postedDate.getFullYear();
      const monthYear = `${month}/${year}`;

      if (!monthlyExpenses[monthYear]) {
        monthlyExpenses[monthYear] = 0;
      }

      const totalSpecCost = spec.materials.reduce((sum, material) => {
        return sum + material.price;
      }, 0);

      monthlyExpenses[monthYear] += totalSpecCost;
    });

    const labels = Object.keys(monthlyExpenses).sort((a, b) => {
      const [monthA, yearA] = a.split('/').map(Number);
      const [monthB, yearB] = b.split('/').map(Number);
      return yearA !== yearB ? yearA - yearB : monthA - monthB;
    });

    const data = labels.map(label => monthlyExpenses[label]);

    res.render('reports', {
      title: 'Звітність',
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
