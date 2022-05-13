import express, { Request, Response, Router } from 'express';
import { createEvent, deleteEvent, editEvent, getEvent, searchEvent } from '../../service/employee/event';

const eventRouterForEmployee: Router = express.Router();

eventRouterForEmployee.post('/create', (req: Request, res: Response) => {
  createEvent(req, res);
});

eventRouterForEmployee.get('/', (req: Request, res: Response) => {
  searchEvent(req, res);
});

eventRouterForEmployee.get('/:id', (req: Request, res: Response) => {
  getEvent(req, res);
});

eventRouterForEmployee.patch('/edit/:id', (req: Request, res: Response) => {
  editEvent(req, res);
});

eventRouterForEmployee.patch('/delete/:id', (req: Request, res: Response) => {
  deleteEvent(req, res);
});

export { eventRouterForEmployee };
