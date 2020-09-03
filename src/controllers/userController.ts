import { User } from "../models/userModel";
import catchAsync from "../utils/catchAsync";
import { AppError } from "../utils/appError";
import * as factory from "./handlerFactory";

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

const getMe: any = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

const updateMe: any = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    next(
      new AppError(
        "You can not update your password here. Please do it there /updateMyPassword",
        403
      )
    );
  }

  const filteredBody = filterObj(req.body, "name", "email");

  const updatedUser = await User.findOneAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

const deleteMe: any = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

const getUser: any = factory.getOne(User, { path: "posts" });
const getAllUsers: any = factory.getAll(User);
const updateUser: any = factory.updateOne(User);
const deleteUser: any = factory.deleteOne(User);

const createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined. Please use /signup instead.",
  });
};

export {
  getMe,
  getUser,
  getAllUsers,
  updateMe,
  createUser,
  updateUser,
  deleteUser,
  deleteMe,
};
