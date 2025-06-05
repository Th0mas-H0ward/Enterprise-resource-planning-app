const { Router } = require('express');
const express = require('express');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const router = Router();

router.get('/prod-orders-list', auth, checkRole(['production_planner']), async (req, res) => {
  
  const orders = await Order.find({ isDeleted: false, isPosted: true }).lean();

    res.render('prod-orders-list', {
      layout: 'prod-plnr.hbs',
      title: 'Замовлення',
      isOrders: true, 
      orders,
      name: req.user.name
    });
});

router.get('/prod-order/:id', auth, checkRole(['production_planner']), async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).lean();

    res.render('prod-order-details', {
      layout: 'prod-plnr.hbs',
      title: 'Замовлення',
      isOrders: true,
      order,
      name: req.user.name
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/update-order-status/:id', auth, checkRole(['production_planner']), async (req, res) => {
  try {
    const orderId = req.params.id;
    const { orderStatus } = req.body;

    await Order.findByIdAndUpdate(orderId, { orderStatus });

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


module.exports = router