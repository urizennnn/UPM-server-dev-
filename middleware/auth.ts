import { verifyJWT, cookies } from "../utils/jwt";
import CustomAPIErrorHandler from "../error/custom-error";
import { StatusCodes } from "http-status-codes";
import Token from "../model/token";
import { Response, Request, NextFunction } from "express";

async function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const { accessToken, refreshToken } = req.signedCookies;
    const payload = verifyJWT(refreshToken);
    //@ts-ignore
    if (!payload || !payload.user || !payload.user.UserId || !payload.refreshToken) {
      throw new CustomAPIErrorHandler(
        "Invalid JWT payload",
        StatusCodes.BAD_REQUEST,
      );
    }
    const existing = await Token.findOne({
      //@ts-ignore
      UserId: payload.user.UserId,
      //@ts-ignore
      refreshToken: payload.refreshToken,
    });

    if (!existing) {
      throw new CustomAPIErrorHandler("Not found", StatusCodes.BAD_REQUEST);
    }
    //@ts-ignore
    cookies(res, payload.user, existing.refreshToken);
    //@ts-ignore
    req.user = payload.user;
    next();
  } catch (error) {
    throw new CustomAPIErrorHandler(
      "Something Went Wrong",
      StatusCodes.BAD_REQUEST,
    );
  }
}

export default auth;