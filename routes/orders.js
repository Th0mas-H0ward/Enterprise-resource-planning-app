const { Router } = require('express');
const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const nodemailer = require('nodemailer');
const pdfServiceClient = require('../service/pdf-service-client');
const router = Router();

router.get('/place-order', auth, checkRole(['order_manager']), async (req, res) => {
  try {
    const category = req.query.category;
    const query = category ? { category } : {};
    const products = await Product.find(query).lean();
    const uniqueCategories = await Product.distinct('category');

    res.render('place-order', {
      layout: 'order-mngr.hbs',
      title: 'Створення замовлення',
      isCreate: true,
      products: JSON.stringify(products), 
      uniqueCategories,
      name: req.user.name
    });
  } catch (error) {
    console.error('Помилка під час завантаження сторінки замовлення:', error);
    res.status(500).json({ error: 'Помилка під час завантаження сторінки замовлення:' });
  }
});

router.post('/place-order', auth, checkRole(['order_manager']), async (req, res) => {
  try {
    const { delivery_date, name, phone, email, products } = req.body;

    const productsData = products.map(item => ({
      title: item.title,
      quantity: parseInt(item.quantity),
      price: parseFloat(item.price)
    }));

    const order = new Order({
      date: delivery_date,
      customer: name,
      phone,
      email,
      products: productsData
    });

    await order.save();

    res.redirect('/order-specifications');
  } catch (error) {
    console.error('Помилка під час створення замовлення:', error);
    res.status(500).json({ error: 'Помилка під час створення замовлення' });
  }
});

router.get('/order-specifications', auth, checkRole(['order_manager']), async (req, res) => {
  const orderSpecifications = await Order.find({ isDeleted: false }).lean();

  res.render('order-specifications', {
    layout: 'order-mngr.hbs',
    title: 'Специфікації',
    isCreate: true,
    orderSpecifications,
    name: req.user.name
  });
});

router.get('/order/:id', auth, checkRole(['order_manager']), async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).lean();

    res.render('order-details', {
      layout: 'order-mngr.hbs',
      title: 'Замовлення',
      isCreate: true,
      order,
      name: req.user.name
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

router.delete('/order/:id', auth, checkRole(['order_manager']), async (req, res) => {
  try {
    const orderId = req.params.id;
    // Обновляем флаг isDeleted вместо удаления документа
    const updatedOrderSpecification = await Order.findByIdAndUpdate(
      orderId,
      { isDeleted: true },
      { new: true }
    );

    if (!updatedOrderSpecification) {
      return res.status(404).json({ message: 'Спецификация не найдена' });
    }

    res.json({ message: 'Спецификация успешно удалена' });
  } catch (err) {
    console.error('Ошибка при удалении спецификации:', err);
    res.status(500).json({ error: 'Ошибка при удалении спецификации' });
  }
});

router.get('/order/:id/pdf', auth, checkRole(['order_manager']), async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).send('Замовлення не знайдене');
    }
    order.isPosted = true;
    await order.save();

    const pdfBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      const dataCallback = (chunk) => chunks.push(chunk);
      const endCallback = () => resolve(Buffer.concat(chunks));
      pdfServiceClient.buildPDF(order, dataCallback, endCallback);
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="order.pdf"');
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/send-order/:id', auth, checkRole(['order_manager']), async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).lean();

    if (!order) {
      return res.status(404).json({ message: 'Специфікація не знайдена' });
    }

    const pdfBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      const dataCallback = (chunk) => chunks.push(chunk);
      const endCallback = () => resolve(Buffer.concat(chunks));
      pdfServiceClient.buildPDF(order, dataCallback, endCallback);
    });
    
    const pdfUint8Array = new Uint8Array(pdfBuffer);

    const attachment = {
      filename: `order_${orderId}.pdf`,
      content: pdfUint8Array
    };

    const mailOptions = {
      from: 'olinkevich.yaroslav@gmail.com',
      to: order.email, 
      subject: 'Ваше замовлення',
      text: 'Вкладений PDF-файл містить деталі замовлення.' + (req.body.comment ? `\n\nКоментар до замовлення: ${req.body.comment}` : ''),
      attachments: [attachment]
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Накладну успішно надіслано на email' });
  } catch (error) {
    console.error('Помилка під час відправлення накладної:', error);
    res.status(500).json({ error: 'Помилка під час відправлення накладної' });
  }
});

router.delete('/order-details/:id', auth, checkRole(['order_manager']), async (req, res) => {
  try {
    const orderId = req.params.id;
    await Order.findByIdAndDelete(orderId);
    res.json({ message: 'Замовлення успішно видалено' });
  } catch (err) {
    console.error('Помилка при видаленні замовлення:', err);
    res.status(500).json({ error: 'Помилка при видаленні замовлення' });
  }
});

router.put('/order/:id/post', async (req, res) => {
  try {
    const orderSpecificationId = req.params.id;

    const updatedOrderSpecification = await Order.findByIdAndUpdate(
      orderSpecificationId,
      { isPosted: true, postedDate: new Date(), orderStatus: "1" },
      { new: true }
    );

    if (!updatedOrderSpecification) {
      return res.status(404).json({ message: 'Специфікація не знайдена' });
    }

    res.status(200).json(updatedOrderSpecification);
  } catch (error) {
    console.error('Помилка під час відмічання специфікації як проведеної:', error);
    res.status(500).json({ error: 'Помилка під час відмічання специфікації як проведеної' });
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail', // 
  auth: {
    user: 'olinkevich.yaroslav@gmail.com', 
    pass: 'hojx lyqr whoi fmri' 
  }
});

router.put('/order/:id/complete', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { isCompleted } = req.body;

    const updatedOrderSpecification = await Order.findByIdAndUpdate(
      orderId,
      { isCompleted },
      { new: true }
    );

    if (!updatedOrderSpecification) {
      return res.status(404).json({ message: 'Замовлення не знайдено' });
    }

    res.status(200).json(updatedOrderSpecification);
  } catch (error) {
    console.error('Помилка під час відмічання замовлення як виконаного/невиконаного:', error);
    res.status(500).json({ error: 'Помилка під час відмічання замовлення як виконаного/невиконаного' });
  }
});

router.get('/invoice', auth, checkRole(['order_manager']), (req, res, next) => {
  const stream = res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment;filename=invoice.pdf'
  });

  pdfServiceClient.buildPDF(
    (chunk) => stream.write(chunk),
    () => stream.end()
  );
});

router.get('/client-orders-list', auth, checkRole(['order_manager']), async (req, res) => {
  try {
    const orders = await Order.find({isPosted: true}).lean();

    res.render('client-orders-list', {
      layout: 'order-mngr.hbs',
      title: 'Список замовлень',
      isOrders: true,
      orders,
      name: req.user.name
    });
  } catch (error) {
    console.error('Ошибка при загрузке списка заказов:', error);
    res.status(500).send('Ошибка при загрузке списка заказов');
  }
});


module.exports = router
