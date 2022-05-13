import { EventType } from '../definition/eventType';

type CreateEventData = {
  eventName: string;
  eventType: EventType;
  mainImage: string;
  subImage: string | undefined;
  description: string;
  detail: string;
  inCharge: string;
  makedUser: string | null;
  startDate: Date;
  finalDate: Date;
  fee: number | undefined;
  capacity: number | undefined;
};

type EventInformation = {
  _id: string;
  eventName: string;
  eventType: EventType;
  mainImage: string;
  subImage: string | null;
  description: string;
  detail: string;
  inCharge: string;
  makedUser: string | null;
  startDate: Date;
  finalDate: Date;
  fee: number | undefined;
  capacity: number | undefined;
  reserved: number;
  updateVersion: number;
  closedFlg: boolean;
  deleteFlg: boolean;
};

type EventInformationForCustomer = {
  _id: string;
  eventName: string;
  eventType: EventType;
  mainImage: string;
  subImage: string | null;
  description: string;
  detail: string;
  startDate: Date;
  finalDate: Date;
  fee: number | undefined;
  capacity: number | undefined;
  reserved: number;
};

type UpdateEventInformation = {
  eventName: string;
  eventType: EventType;
  mainImage: string;
  subImage: string | null;
  description: string;
  detail: string;
  inCharge: string;
  updatedUser: string | null;
  startDate: Date;
  finalDate: Date;
  fee: number | undefined;
  capacity: number | undefined;
  updateVersion: number;
  closedFlg: boolean;
};

export { CreateEventData, EventInformation, EventInformationForCustomer, UpdateEventInformation };
