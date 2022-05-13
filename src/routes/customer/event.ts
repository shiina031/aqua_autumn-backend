import express, { Request, Response, Router } from 'express';
import {
  getEvent,
  getReservedEvent,
  getInterestedInEvent,
  interestedEvent,
  cancelInterestedEvent,
  reserveEvent,
  cancelReserveEvent,
  searchEvent,
} from '../../service/customer/event';

const eventRouterForCustomer: Router = express.Router();

eventRouterForCustomer.get('/', (req: Request, res: Response) => {
  searchEvent(req, res);
});

eventRouterForCustomer.get('/:id', (req: Request, res: Response) => {
  getEvent(req, res);
});

eventRouterForCustomer.get('/reserve', (req: Request, res: Response) => {
  getReservedEvent(req, res);
});

eventRouterForCustomer.get('/interested', (req: Request, res: Response) => {
  getInterestedInEvent(req, res);
});

eventRouterForCustomer.patch('/reserve/:id', (req: Request, res: Response) => {
  reserveEvent(req, res);
});

eventRouterForCustomer.patch('/reserve/cancel/:id', (req: Request, res: Response) => {
  cancelReserveEvent(req, res);
});

eventRouterForCustomer.patch('/interested/:id', (req: Request, res: Response) => {
  interestedEvent(req, res);
});

eventRouterForCustomer.patch('/interested/cancel/:id', (req: Request, res: Response) => {
  cancelInterestedEvent(req, res);
});

export { eventRouterForCustomer };
