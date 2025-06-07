const { Router } = require('express');
const express = require('express');
const Material = require('../models/Material');
const Provider = require('../models/Provider');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const router = Router();

router.use(express.json());

const fs = require('fs');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true}));
router.use(express.static(path.resolve(__dirname, 'public')));

var storage = multer.diskStorage({
    destination:(req,file,cb) => {
      cb(null, './public/uploads')
    },
    filename:(req,file,cb) =>{
      cb(null,file.originalname)
    }
});

var upload = multer({ storage:storage });

const providerController = require('../controllers/providerController');

router.post('/provider/:id/upload-materials', upload.single('file'), providerController.importProvider);

router.get('/providers', auth, checkRole(['purchase_manager']), async (req, res) => {
  const providers = await Provider.find({}).lean();

  res.render('providers', {
    title: 'Постачальники',
    isProviders: true,
    providers,
    name: req.user.name
  });
});

router.get('/provider/:id', auth, checkRole(['purchase_manager']), async (req, res) => {
  try {
    const providerId = req.params.id;
    const provider = await Provider.findById(providerId).lean();

    res.render('provider-details', {
      title: 'Постачальник',
      isProviderDetails: true,
      provider,
      name: req.user.name
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

router.put('/provider/:id', async (req, res) => {
  try {
    const providerId = req.params.id;
    const { provider, phone, email } = req.body;

    const updatedProvider = await Provider.findByIdAndUpdate(
      providerId,
      { provider, phone, email },
      { new: true }
    );

    res.json({ success: true, provider: updatedProvider });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: 'Сталася помилка під час оновлення даних про постачальника' });
  }
});

router.delete('/provider/:id', async (req, res) => {
  try {
    const providerId = req.params.id;
    const provider = await Provider.findById(providerId);

    if (!provider) {
      return res.status(404).json({ error: 'Постачальника не знайдено' });
    }

    await Material.deleteMany({ providerId });

    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    const providerMaterialsFiles = fs.readdirSync(uploadsDir).filter(file => file.startsWith(providerId));

    for (const file of providerMaterialsFiles) {
      fs.unlinkSync(path.join(uploadsDir, file));
    }

    await Provider.findOneAndDelete({ _id: providerId });

    res.json({ message: 'Постачальника успішно видалено' });
  } catch (err) {
    console.error('Помилка під час видалення постачальника:', err);
    res.status(500).json({ error: 'Помилка під час видалення постачальника' });
  }
});

router.delete('/provider/:id/clear-materials', async (req, res) => {
  try {
    const providerId = req.params.id;
    const provider = await Provider.findById(providerId);

    if (!provider) {
      return res.status(404).json({ error: 'Постачальника не знайдено' });
    }

    provider.materials = [];
    await provider.save();

    res.json({ message: 'Матеріали успішно видалено' });
  } catch (err) {
    console.error('Помилка під час видалення матеріалів:', err);
    res.status(500).json({ error: 'Помилка під час видалення матеріалів' });
  }
});

router.get('/create-provider', auth, checkRole(['purchase_manager']), (req, res) => {
  res.render('create-provider', {
    title: 'Додати постачальника',
    isCreate: true,
    name: req.user.name
  })
})

router.post('/create-provider', async (req, res) => {
  const provider = new Provider({
    provider: req.body.provider,
    phone: req.body.phone,
    email: req.body.email
  })

  await provider.save()
  res.redirect('/providers')
})

module.exports = router
