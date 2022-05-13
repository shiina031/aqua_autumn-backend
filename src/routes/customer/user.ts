import express, { NextFunction, Request, Response, Router } from 'express';
import { createUser, deleteUser, getOwnData, updateUser } from '../../service/customer/user';

const userRouterForCustomer: Router = express.Router();

// ユーザー新規作成（サインアップ）
userRouterForCustomer.post('/signup', (req: Request, res: Response) => {
  createUser(req, res);
});

// ユーザー情報取得
userRouterForCustomer.get('/:id', (req: Request, res: Response) => {
  getOwnData(req, res);
});

// ユーザー情報編集
userRouterForCustomer.patch('/edit/:id', (req: Request, res: Response, next: NextFunction) => {
  updateUser(req, res);
});

// ユーザー情報削除
userRouterForCustomer.patch('/delete/:id', (req: Request, res: Response) => {
  deleteUser(req, res);
});

export { userRouterForCustomer };
