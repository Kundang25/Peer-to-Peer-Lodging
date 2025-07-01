const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.object({
        url: Joi.string().uri().allow("", null),
        filename: Joi.string().allow("", null)
      }).optional(),
      
      price: Joi.number().required(),
      country: Joi.string().required(),
      location: Joi.string().required(),
    })
  });


module.exports.reviewSchema = Joi.object({
  review:Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().required(),

  }).required()
})  