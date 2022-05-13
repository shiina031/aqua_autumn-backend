import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { OrdinaryError } from '../errors/error';

// .envファイルの設定を読み込み
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || 'test';
const jwtOptions: jwt.SignOptions = {
  algorithm: 'HS256',
  expiresIn: '1h',
};

const jwtPublisher = (userId: string, userCode: string, userRoleLevel: number): string => {
  const payLoad = {
    userId,
    userCode,
    userRoleLevel,
  };
  const token: string = jwt.sign(payLoad, SECRET_KEY, jwtOptions);
  return token;
};

const jwtChecker = (req: Request, res: Response): boolean => {
  const bearToken = req.headers.authorization;
  const token = bearToken?.slice('bearer'.length).trim();

  if (token !== undefined) {
    try {
      jwt.verify(token, SECRET_KEY);
      return true;
    } catch (error: any) {
      return false;
    }
  } else {
    return false;
  }
};

const fetchLoginUserId = (req: Request, res: Response): string | null => {
  const bearToken = req.headers.authorization;
  const token = bearToken?.slice('bearer'.length).trim();

  if (token !== undefined) {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      // @ts-ignore
      return decoded.userId;
    } catch (error: any) {
      throw new OrdinaryError(401, 'invalid_access_token: AccessTokenが有効ではありません');
    }
  } else {
    return null;
  }
};

const authenticateUser = (req: Request, res: Response, accessLevel: number, next: NextFunction) => {
  const bearToken = req.headers.authorization;
  const token = bearToken?.slice('bearer'.length).trim();

  if (token !== undefined) {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      // @ts-ignore
      const userRoleLevel = decoded.userRoleLevel;

      if (userRoleLevel < accessLevel) {
        return res.status(403).json({ message: 'access_forbidden: アクセス権限がありません' });
      }
      next();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new OrdinaryError(401, 'expired_access_token: AccessTokenが有効切れとなっています。');
      } else {
        throw new OrdinaryError(401, 'invalid_access_token: AccessTokenが有効ではありません');
      }
    }
  } else {
    return res.status(401).json({ message: 'invalid_access_token: AccessTokenが有効ではありません' });
  }
};

export { jwtPublisher, jwtChecker, fetchLoginUserId, authenticateUser };
