import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import util from "util";
import { check, sanitize, validationResult } from "express-validator";

import { User } from "../models/userModel";
import catchAsync from "../utils/catchAsync";
import { AppError } from "../utils/appError";

/**
 * Required interfaces.
 */
interface IManageCookieOptions {
  expires: Date;
  httpOnly: boolean;
  secure?: boolean;
}

interface IManageRequestUser extends Request {
  user: any;
}

/**
 * Twilio service configuration to work with @phoneNumber and @code auth.
 */
const client = require("twilio")(
  process.env["TWILIO_ACCOUNT_SID"],
  process.env["TWILIO_AUTH_TOKEN"]
);

/**
 * Genetates unique JWT tokenfor each user to make it possible to authenticate they.
 */
const signToken = (id: string): string => {
  /**Genretes @token using @JWT_SECRET ans sets the expiration time */
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE_TIME!,
  });
};

/**
 * Manages the signed token.
 */
const sendToken = (user, statusCode: number, res: Response): void => {
  const token: string = signToken(user._id);

  /**Configure @cookie */
  const cookieOptions: IManageCookieOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV! === "production") cookieOptions.secure = true;

  /**Put the @token to @cookie with the configuration*/
  res.cookie("jwt", token, cookieOptions);

  /** Hide the user's password from the user object*/
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
  });
};

/**
 * Sends the @code to the user's @phoneNumber , used in: @function login and @function signup
 */
const sendCode: any = async (
  req: Request,
  res: Response,
  next: NextFunction,
  phoneNumber: string,
  channel: string
) => {
  try {
    const data = await client.verify
      .services(process.env.TWILIO_SERVISE_ID)
      .verifications.create({
        to: `+${phoneNumber}`,
        channel: channel === "call" ? "call" : "sms",
      });

    if (data && data.status === "pending") {
      return res.status(200).json({
        status: "success",
        results: data.status,
        data,
      });
    }
  } catch (err) {
    return next();
  }
};

/**
 * Verify the @code sent to the user's @phoneNumber
 * @route POST users/verify
 */
const userVerify: any = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const phoneNumber: string = req.body.phoneNumber;
    const code: string = req.body.code;

    if (phoneNumber && code.length === 4) {
      const user = await User.findOne({ phoneNumber });

      const data = await client.verify
        .services(process.env.TWILIO_SERVISE_ID)
        .verificationChecks.create({
          to: `+${phoneNumber}`,
          code,
        });

      if (data.status === "approved") {
        await User.findOneAndUpdate(
          { phoneNumber: phoneNumber },
          { activated: true }
        );
        return sendToken(user, 200, res);
      }

      return next(new AppError("Неверный код", 400));
    }
    return next(new AppError("Неверный код или мобильный номер", 400));
  }
);

/**
 * Sign up using @phoneNumber @name and @role
 * @route POST users/signup
 */
const signUp: any = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const name: string = req.body.name;
    const phoneNumber: string = req.body.phoneNumber;
    const role: string = req.body.role;

    let newUser = await User.findOne({ phoneNumber });

    if (!newUser) {
      newUser = await User.create({
        name: name,
        phoneNumber: phoneNumber,
        role: role,
      });

      return sendCode(phoneNumber, "sms", res);
    }

    return next(
      new AppError(`Пользователь с номером ${phoneNumber} уже существует`, 400)
    );
  }
);

/**
 * Log in using @phoneNumber
 * @route POST users/login
 */
const login: any = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const phoneNumber: string = req.body.phoneNumber;

    if (phoneNumber) {
      const user = await User.findOne({ phoneNumber });

      if (!user) {
        return next(
          new AppError("Пользователя с таким номером не существует", 400)
        );
      }

      await sendCode(req, res, next, phoneNumber, "sms");
    }
  }
);

/**
 * Protect routes (only logged in users will receive responses).
 */
const protect: any = catchAsync(
  async (req: IManageRequestUser, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }

    // 2) Check verification token
    const decoded = await util.promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exist.",
          401
        )
      );
    }

    //* В случае миграции на email/password:

    /*  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! Please log in again.', 401));
  } */

    // GRANT ACCESS TO PROTECTED ROUTE

    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  }
);

/**
 * Verify users' roles.
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Ошибка прав", 403));
    }
    next();
  };
};

export { login, userVerify, signUp, protect };

//* В случае миграции на email/password:

/* exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('Пользователя с таким EMAIL не существует'), 404);
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/org/resetPassword/${resetToken}`;

  const message = `Забыли пароль? Совершите PATCH request с новым паролем по этой ссылке: ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Ссылка для изменения пароля (Действительна 10 минут)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Токен был отправлен на почту',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        `Произошла ошибка при отправке ссылки восстановления пароля, повторите позже ${err}`,
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    next(new AppError('Неверный токен, или токен сгорел', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  

  sendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return next(new AppError('Пожалуйста, войдите, чтобы изменить пароль', 401));
  }
  console.log(user);

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Неверный пароль', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  sendToken(user, 200, res);
});
 */
