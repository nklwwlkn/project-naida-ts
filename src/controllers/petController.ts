import { Pet } from "../models/petModel";
import catchAsync from "../utils/catchAsync";
// eslint-disable-next-line no-unused-vars

// eslint-disable-next-line no-unused-vars

import * as factory from "./handlerFactory";
import { MongooseDocument, Document } from "mongoose";

const upload = require("../utils/imageUpload");

/* exports.topTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'price, -ratingsAverage';
  req.query.fields = 'name,price, ratingsAverage, duration';
  next();
};
 */

const uploadPetPhoto = upload.array("images", 2);

const getAllPets = factory.getAll(Pet);
const getPet = factory.getOne(Pet, { path: "pets" });
const updatePet = factory.updateOne(Pet);
const deletePet = factory.deleteOne(Pet);

const createPet: any = catchAsync(async (req, res) => {
  req.body.images = [];

  if (req.file) req.body.images = req.file.location;

  if (req.files)
    req.files.map((obj) => {
      const fileName = obj.location.split("/")[3];

      req.body.images.push({
        original: `https://naida-image-bucket.s3.eu-north-1.amazonaws.com/${fileName}`,
        l: `http://naida-image-bucket.s3-website.eu-north-1.amazonaws.com/450xAUTO/${fileName}`,
        m: `http://naida-image-bucket.s3-website.eu-north-1.amazonaws.com/300xAUTO/${fileName}`,
        s: `http://naida-image-bucket.s3-website.eu-north-1.amazonaws.com/150xAUTO/${fileName}`,
        xs: `http://naida-image-bucket.s3-website.eu-north-1.amazonaws.com/100xAUTO/${fileName}`,
      });
    });

  /* console.log(req.body.photos, req.file.filename); */

  const doc = await Pet.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});

const setUsersPetsId: any = (req, res, next) => {
  if (!req.body.pet) req.body.pet = req.params.petId;
  if (!req.body.user) req.body.user = req.user;
  next();
};

export {
  getAllPets,
  getPet,
  updatePet,
  deletePet,
  createPet,
  setUsersPetsId,
  uploadPetPhoto,
};
/* 
exports.getTourStats = catchAsync(async (req, res, next) => { 
/*  Aggregtionpipeline: */

/* const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 3 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice:  $ax: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021
  const stats = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' }
    }
  {
      $addFields: {
        month: '$_id'
      }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: {
        numTours: -1
      }
    }
  ]);

  res.status(201).json({
    status: 'sucess',
    data: {
      stats
    }
  });
}); */

/* /tours-within/:distance/center/48.662294, 44.440576/unit/:unit */

/* exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  console.log(latlng);
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(new AppError('Please provide correct lat and lng'), 401);
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});
 */
/* //! Проверь этот модуль потом, startLocation не индексируется:

exports.getToursDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(new AppError('Please provide correct lat and lng'), 401);
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      data: distances
    }
  });
});
 */
