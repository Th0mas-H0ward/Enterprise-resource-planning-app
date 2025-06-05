const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateHeader(doc) {
  doc.image('./public/images/pdf-logo.png', 50, 45, { height: 50, width: 50 })
    .font("DejaVuSans")
    .fillColor('#444444')
    .fontSize(20)
    .text('Innovatech Engineering', 110, 63)
    .fontSize(10)
    .text('вул. Набережна, 12', 200, 65, { align: 'right' })
    .text('м. Київ, Україна', 200, 80, { align: 'right' })
    .moveDown();
}

function generateFooter(doc) {
  doc.fontSize(
    10,
  ).text(
    'Оплата здійснюється протягом 15 днів. Дякуємо за вашу співпрацю.',
    50,
    700,
    { align: 'center', width: 500 },
  );
}

function generateOrderInformation(doc, specification) {

  var totalPrice = 0;
  doc
    .fillColor("#444444")
    .fontSize(15)
    .font("DejaVuSans-Bold")
    .text(`Замовлення: №${specification._id}`, 50, 160);

  generateHr(doc, 185);

  const orderInformationTop = 200;

  specification.materials.forEach(function (material) {
    totalPrice += material.price * material.quantity;
  });

  doc
    .fontSize(10)
    .font("DejaVuSans-Bold")
    .text("Дата створення:", 50, orderInformationTop)
    .font("helvetica_cyr_oblique")
    .text(formatDate(new Date()), 150, orderInformationTop)
    .font("DejaVuSans-Bold")
    .text("До сплати:", 50, orderInformationTop + 15)
    .font("helvetica_cyr_oblique")
    .text(totalPrice + " UAH", 150, orderInformationTop + 15)
    .font("DejaVuSans-Bold")
    .text("Дата поставки:", 50, orderInformationTop + 30)
    .font("helvetica_cyr_oblique")
    .text(`${specification.date}`, 150, orderInformationTop + 30)
    .font("DejaVuSans-Bold")
    .text("Постачальник:", 50, orderInformationTop + 45)
    .font("DejaVuSans")
    .text(`${specification.provider}`, 150, orderInformationTop + 45)

  
    .font("DejaVuSans")
    .text("ПП: Олінкевич Я.В.", 300, orderInformationTop)
    .font("DejaVuSans")
    .text("Адреса: Україна, м. Київ, вул. Лісна 24", 300, orderInformationTop + 15)
    .moveDown();

  generateHr(doc, 272);
}

function generateOrderTable(doc, specification) {
  var totalPrice = 0;
  var i;
  const orderTableTop = 330;

  specification.materials.forEach(function (material) {
    totalPrice += material.price;
  });

  doc.font("DejaVuSans-Bold");
  generateTableRow(
    doc,
    orderTableTop,
    "Матеріал",
    "Кількість (од.)",
    "Вартість (UAH)",
    "Всього (UAH)"
  );
  generateHr(doc, orderTableTop + 20);
  doc.font("DejaVuSans");

  for (i = 0; i < specification.materials.length; i++) {
    const material = specification.materials[i];
    const position = orderTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      material.title,
      material.quantity,
      material.price
    );

    generateHr(doc, position + 20);
  }

  const duePosition = orderTableTop + (i + 1) * 30;

  // Добавляем блок после табли

  // Общая сумма
  doc.font("DejaVuSans-Bold")
      .text("Загальна сума", 310, duePosition + 20);
  doc.font("DejaVuSans")
      .text(`${totalPrice} UAH`, 480, duePosition + 20);

  // Сплачено
  doc.font("DejaVuSans-Bold")
      .text("Сплачено", 310, duePosition + 40);
  doc.font("DejaVuSans")
      .text("0 UAH", 480, duePosition + 40);

  // До сплати
  doc.font("DejaVuSans-Bold")
      .text("До сплати", 310, duePosition + 60);
  doc.font("DejaVuSans")
      .text(`${totalPrice} UAH`, 480, duePosition + 60);
}

function buildPDF(specification, dataCallback, endCallback) {
  const doc = new PDFDocument({ deflateLevel: 9 });
  doc.on('data', dataCallback);
  doc.on('end', endCallback);

  doc.registerFont('DejaVuSans', './public/fonts/djsans/DejaVuSans.ttf');
  doc.registerFont('DejaVuSans-Bold', './public/fonts/djsans/DejaVuSans-Bold.ttf');
  doc.registerFont('helvetica_cyr_oblique', './public/fonts/helvetica/helvetica_cyr_oblique.ttf');

  generateHeader(doc);
  generateOrderInformation(doc, specification);
  generateOrderTable(doc, specification);

  const currentHeight = doc.y;
  const footerHeight = 30;
  const maxHeight = doc.page.height - 50; 

  if (currentHeight + footerHeight > maxHeight) {
    doc.addPage();
  }

  generateFooter(doc);

  doc.end();
}

function generateHr(doc, y) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function generateTableRow(
  doc,
  y,
  title,
  quantity,
  price
) {
  doc
    .fontSize(10)
    .text(title, 50, y, { width: 90, align: "center" })
    .text(quantity, 250, y, { width: 90, align: "center" })
    .text(price, 450, y, { width: 90, align: "center" })
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const monthFormatted = month < 10 ? "0" + month : month;

  return (day < 10 ? "0" : "") + day + "." + monthFormatted + "." + year;
}

module.exports = { buildPDF };