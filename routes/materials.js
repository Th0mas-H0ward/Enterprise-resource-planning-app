const { Router } = require('express');
const express = require('express'); // Здесь правильно импортируем express
const Material = require('../models/Material');
const Provider = require('../models/Provider');
const Specification = require('../models/Specification');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const router = Router();

router.use(express.json());

router.get('/', auth, checkRole(['purchase_manager', 'production_planner']), async (req, res) => {
  try {
    const materials = await Material.find({}).lean();
    const uniqueCategories = await Material.distinct('category');

    let isManager = false;
    if (req.user.role === 'purchase_manager') {
      isManager = true;
    }

    let layout;
    if (req.user.role === 'purchase_manager') {
      layout = 'main.hbs';
    } else if (req.user.role === 'production_planner') {
      layout = 'prod-plnr.hbs';
    } else {
      return res.status(403).send('Access denied'); // Если роль не соответствует ожидаемым
    }

    res.render('index', {
      title: 'Склад',
      layout: layout,
      isIndex: true,
      isProducts: true,
      materials,
      uniqueCategories,
      name: req.user.name,
      isManager: isManager
    });
  } catch (error) {
    console.error('Помилка під час завантаження сторінки складу:', error);
    res.status(500).json({ error: 'Помилка під час завантаження сторінки складу' });
  }
});

router.put('/material/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, quantity } = req.body;

    const updatedMaterial = await Material.findByIdAndUpdate(
      id,
      { $set: { title, category, quantity } },
      { new: true }
    );

    if (!updatedMaterial) {
      return res.status(404).json({ message: "Матеріал не знайдено" });
    }

    res.status(200).json(updatedMaterial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/api/materials', auth, checkRole(['purchase_manager']), async (req, res) => {
  try {
    const materials = await Material.find({}).lean();
    res.json(materials);
  } catch (error) {
    console.error('Помилка під час отримання матеріалів:', error);
    res.status(500).json({ error: 'Помилка під час отримання матеріалів' });
  }
});

router.post('/api/materials', async (req, res) => {
  try {
    const { title, category, quantity } = req.body;
    const newMaterial = new Material({ title, category, quantity });
    await newMaterial.save();
    res.status(201).json(newMaterial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/api/materials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMaterial = await Material.findByIdAndDelete(id);
    if (!deletedMaterial) {
      return res.status(404).json({ message: "Матеріал не знайдено" });
    }
    res.status(200).json({ message: "Матеріал успішно видалено" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/order', auth, checkRole(['purchase_manager']), async (req, res) => {
  try {
    const providers = await Provider.find({}).lean();
    res.render('order', { title: 'Специфікація', isOrder: true, providers, name: req.user.name });
  } catch (error) {
    console.error('Помилка під час завантаження сторінки замовлення:', error);
    res.status(500).json({ error: 'Помилка під час завантаження сторінки замовлення:' });
  }
});

router.get('/api/provider-materials', auth, checkRole(['purchase_manager']), async (req, res) => {
  try {
    const providerId = req.query.providerId;
    const category = req.query.category;

    if (!providerId) {
      return res.status(400).json({ error: 'Постачальник не вказаний' });
    }

    const provider = await Provider.findById(providerId).lean();

    if (!provider) {
      return res.status(404).json({ error: 'Постачальника не знайдено' });
    }

    let materials = provider.materials;

    if (category) {
      materials = materials.filter(material => material.category === category);
    }

    const uniqueCategories = [...new Set(materials.map(material => material.category))];

    res.json({ materials, uniqueCategories });
  } catch (error) {
    console.error('Помилка під час отримання матеріалів постачальника:', error);
    res.status(500).json({ error: 'Помилка під час отримання матеріалів постачальника' });
  }
});

router.post('/order', async (req, res) => {
  try {
    const { delivery_date, provider, materials } = req.body;

    const providerData = await Provider.findById(provider);

    const materialsData = materials.map(item => ({
      title: item.title,
      quantity: parseInt(item.quantity),
      price: parseFloat(item.price)
    }));

    const specification = new Specification({
      date: delivery_date,
      provider: providerData.provider, 
      email: providerData.email, 
      isPosted: false,
      materials: materialsData
    });

    await specification.save();

  } catch (error) {
    console.error('Помилка під час створення специфікації:', error);
    res.status(500).json({ error: 'Помилка під час створення специфікації' });
  }
});


module.exports = router

