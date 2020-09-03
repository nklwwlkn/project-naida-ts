import mongoose from "mongoose";
// const User = require('./userModel');
// const validator = require('validator');

interface IManagerSchema extends mongoose.Document {
  user: typeof mongoose.Schema.Types.ObjectId;
}

const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    location: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    animalType: {
      type: String,
      enum: ["dog", "cat"],
    },
    publicationType: {
      type: String,
      enum: ["losted", "lfh"],
    },
    breed: {
      type: String,
    },
    images: {
      type: [Array],
    },
    sex: {
      type: String,
      enum: ["male", "female"],
    },
    colors: {
      type: [String],
    },
    age: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    description: {
      type: String,
      maxlength: [
        250,
        "У объявления должно быть описание максимум в 250 символов",
      ],
      minlength: [1, "У объявления должно быть описание минимум в 1 символ"],
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Объявление должно принадлежать пользователю"],
    },

    CreatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// tourSchema.index({ price: 1 });
petSchema.index({ pet: 1, user: 1 } /* , { unique: true } */);

// Virtual populate
petSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'pet',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // });

  (this as any).populate({
    path: "user",
    select: "name photo, phoneNumber",
  });
  next();
});

// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function(next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// tourSchema.pre('find', function(next) {
/* tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
}); */

/* tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
}); */

// tourSchema.post(/^find/, function(docs, next) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds!`);
//   next();
// });

// AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//   console.log(this.pipeline());
//   next();
// });

const Pet = mongoose.model("Pet", petSchema);

export { Pet };
