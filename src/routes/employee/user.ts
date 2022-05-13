import express, { Request, Response, Router } from 'express';
import {
  createEmployee,
  deleteEmployee,
  getAllEmployees,
  getEmployee,
  updateEmployee,
} from '../../service/employee/user';

const userRouterForEmployee: Router = express.Router();

userRouterForEmployee.post('/create', (req: Request, res: Response) => {
  createEmployee(req, res);
});

userRouterForEmployee.get('/', (req: Request, res: Response) => {
  getAllEmployees(req, res);
});

userRouterForEmployee.get('/:id', (req: Request, res: Response) => {
  getEmployee(req, res);
});

userRouterForEmployee.patch('/edit/:id', (req: Request, res: Response) => {
  updateEmployee(req, res);
});

userRouterForEmployee.patch('/delete/:id', (req: Request, res: Response) => {
  deleteEmployee(req, res);
});

export { userRouterForEmployee };
