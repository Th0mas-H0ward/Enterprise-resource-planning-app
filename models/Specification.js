const { Schema, model } = require('mongoose')

const materialSchema = new Schema({
  title: {
    type: String, //назва матеріалу
    required: true
  },

  quantity: { //кількість матеріалу
    type: Number,
    required: true
  },

  price: { //ціна матеріалу
    type: Number,
    required: true
  }
});

const specificationSchema = new Schema({
  date: { //Бажана дата доставки замовлення 
    type: String,
    required: true
  },

  provider: { //компанія-постачальник
    type: String,
    required: true
  },

  email: { //імейл постачальника
    type: String,
    required: true
  },

  isPosted: { // статус, що каже про те, чи була відправлена заявка на замовлення постачльникові
    type: Boolean,
    required: true,
    default: false
  },

  postedDate: { //Дата подання заявки
    type: Date
  },

  isDeleted: {
    type: Boolean,
    required: true,
    default: false
  },

  isCompleted: {
    type: Boolean,
    required: true,
    default: false
  },

  materials: [materialSchema]
});

module.exports = model('Specification', specificationSchema);

