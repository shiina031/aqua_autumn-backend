import express, { NextFunction, Request, Response, Router } from 'express';
import { changePassword, login } from '../service/login';

const loginRouter: Router = express.Router();

loginRouter.post('/login', (req: Request, res: Response, next: NextFunction) => {
  login(req, res, next);
});

loginRouter.post('/changepassword', (req: Request, res: Response) => {
  changePassword(req, res);
});

export { loginRouter };
