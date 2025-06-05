const { Router } = require('express');
const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const router = Router();

router.use(express.json());

router.get('/products', auth, checkRole(['order_manager']), async (req, res) => {
  try {
    const products = await Product.find({}).lean();
    const uniqueCategories = await Product.distinct('category');

    res.render('products', {
      layout: 'order-mngr.hbs',
      title: 'Продукція',
      isProducts: true,
      products,
      uniqueCategories,
      name: req.user.name
    });
  } catch (error) {
    console.error('Помилка під час завантаження сторінки складу продукції:', error);
    res.status(500).json({ error: 'Помилка під час завантаження сторінки складу продукції' });
  }
});


router.put('/products/:id', auth, checkRole(['order_manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, price } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: { title, category, price } },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Продукт не знайдено" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/api/products', auth, checkRole(['order_manager']), async (req, res) => {
  try {
    const products = await Product.find({}).lean();
    res.json(products);
  } catch (error) {
    console.error('Помилка під час отримання продуктів:', error);
    res.status(500).json({ error: 'Помилка під час отримання продуктів' });
  }
});

router.post('/api/products', auth, checkRole(['order_manager']), async (req, res) => {
  try {
    const { title, category, price } = req.body;
    const newProduct = new Product({ title, category, price });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/api/products/:id', auth, checkRole(['order_manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Продукт не знайдено" });
    }
    res.status(200).json({ message: "Продукт успішно видалено" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;