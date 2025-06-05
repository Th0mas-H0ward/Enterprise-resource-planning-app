const Provider = require('../models/Provider');
var csv = require('csvtojson');

const importProvider = async (req, res) => {
  try {
    const providerId = req.params.id;
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ status: 404, success: false, msg: 'Provider not found' });
    }

    const csvData = await csv().fromFile(req.file.path);
    const materialsData = csvData.map((row) => ({
      category: row.category,
      title: row.title,
      price: parseFloat(row.price),
    }));

    provider.materials = [...provider.materials, ...materialsData];
    await provider.save();

    // Отправляем успешный ответ на фронтенд
    res.status(200).json({ success: true, provider });
  } catch (error) {
    res.status(400).json({ success: false, msg: error.message });
  }
};

module.exports = {
  importProvider
}