const { Router } = require('express');
const Specification = require('../models/Specification');
const Order = require('../models/Order');
const nodemailer = require('nodemailer');
const pdfService = require('../service/pdf-service');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const router = Router();

router.get('/invoice', auth, checkRole(['purchase_manager']), (req, res, next) => {
  const stream = res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment;filename=invoice.pdf'
  });

  pdfService.buildPDF(
    (chunk) => stream.write(chunk),
    () => stream.end()
  );
});

router.get('/specifications', auth, checkRole(['purchase_manager']), async (req, res) => {
  const specifications = await Specification.find({ isDeleted: false }).lean();

  res.render('specifications', {
    title: 'Специфікації',
    isSpecifications: true,
    specifications,
    name: req.user.name
  });
});

router.get('/specification/:id', auth, checkRole(['purchase_manager']), async (req, res) => {
  try {
    const specificationId = req.params.id;
    const specification = await Specification.findById(specificationId).lean();

    res.render('specification-details', {
      title: 'Специфікація',
      isSpecificationDetails: true,
      specification,
      name: req.user.name
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/specification/:id/pdf', auth, checkRole(['purchase_manager']), async (req, res) => {
  try {
    const specificationId = req.params.id;
    const specification = await Specification.findById(specificationId);

    if (!specification) {
      return res.status(404).send('Специфікація не знайдена');
    }

    specification.isPosted = true;
    await specification.save();

    const pdfBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      const dataCallback = (chunk) => chunks.push(chunk);
      const endCallback = () => resolve(Buffer.concat(chunks));
      pdfService.buildPDF(specification, dataCallback, endCallback);
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="specification.pdf"');
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

router.delete('/specification/:id', async (req, res) => {
  try {
    const specificationId = req.params.id;
    const updatedSpecification = await Specification.findByIdAndUpdate(
      specificationId,
      { isDeleted: true },
      { new: true }
    );

    if (!updatedSpecification) {
      return res.status(404).json({ message: 'Спецификация не найдена' });
    }

    res.json({ message: 'Спецификация успешно удалена' });
  } catch (err) {
    console.error('Ошибка при удалении спецификации:', err);
    res.status(500).json({ error: 'Ошибка при удалении спецификации' });
  }
});

router.delete('/specification-details/:id', async (req, res) => {
  try {
    const specificationId = req.params.id;
    await Specification.findByIdAndDelete(specificationId);
    res.json({ message: 'Спецификацію успішно видалено' });
  } catch (err) {
    console.error('Помилка при видаленні специфікації:', err);
    res.status(500).json({ error: 'Помилка при видаленні специфікації' });
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: 'olinkevich.yaroslav@gmail.com', 
    pass: 'hojx lyqr whoi fmri' 
  }
});

router.post('/send-specification/:id', async (req, res) => {
  try {
    const specificationId = req.params.id;
    const specification = await Specification.findById(specificationId).lean();

    if (!specification) {
      return res.status(404).json({ message: 'Специфікація не знайдена' });
    }
    
    const pdfBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      const dataCallback = (chunk) => chunks.push(chunk);
      const endCallback = () => resolve(Buffer.concat(chunks));
      pdfService.buildPDF(specification, dataCallback, endCallback);
    });
    
    const pdfUint8Array = new Uint8Array(pdfBuffer);

    const attachment = {
      filename: `specification_${specificationId}.pdf`,
      content: pdfUint8Array
    };

    const mailOptions = {
      from: 'olinkevich.yaroslav@gmail.com', 
      to: specification.email, ка)
      subject: 'Нова специфікація',
      text: 'Вкладений PDF-файл містить деталі замовлення.' + (req.body.comment ? `\n\nКоментар до замовлення: ${req.body.comment}` : ''),
      attachments: [attachment]
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Специфікацію успішно надіслано на email' });
  } catch (error) {
    console.error('Помилка під час відправлення специфікації:', error);
    res.status(500).json({ error: 'Помилка під час відправлення специфікації' });
  }
});

router.put('/specification/:id/post', async (req, res) => {
  try {
    const specificationId = req.params.id;

    const updatedSpecification = await Specification.findByIdAndUpdate(
      specificationId,
      { isPosted: true, postedDate: new Date() },
      { new: true }
    );

    if (!updatedSpecification) {
      return res.status(404).json({ message: 'Специфікація не знайдена' });
    }

    res.status(200).json(updatedSpecification);
  } catch (error) {
    console.error('Помилка під час відмічання специфікації як проведеної:', error);
    res.status(500).json({ error: 'Помилка під час відмічання специфікації як проведеної' });
  }
});

router.put('/specification/:id/complete', async (req, res) => {
  try {
    const specificationId = req.params.id;
    const { isCompleted } = req.body;

    const updatedSpecification = await Specification.findByIdAndUpdate(
      specificationId,
      { isCompleted },
      { new: true }
    );

    if (!updatedSpecification) {
      return res.status(404).json({ message: 'Специфікація не знайдена' });
    }

    res.status(200).json(updatedSpecification);
  } catch (error) {
    console.error('Помилка під час відмічання замовлення як виконаного/невиконаного:', error);
    res.status(500).json({ error: 'Помилка під час відмічання замовлення як виконаного/невиконаного' });
  }
});

router.get('/orders-list', auth, checkRole(['purchase_manager']), async (req, res) => {
  try {
    const specifications = await Specification.find({isPosted: true}).lean();

    res.render('orders-list', {
      title: 'Звітність',
      isOrders: true,
      specifications,
      name: req.user.name
    });
  } catch (error) {
    console.error('Ошибка при загрузке списка заказов:', error);
    res.status(500).send('Ошибка при загрузке списка заказов');
  }
});

module.exports = router;
