import express, { Request, Response, Router } from 'express';
import { init } from '../service/init';

const initRouter: Router = express.Router();

initRouter.post('/init', (req: Request, res: Response) => {
  init(req, res);
});

export { initRouter };
