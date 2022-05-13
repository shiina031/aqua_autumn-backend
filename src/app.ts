import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectDB } from './db/connect';
import { OrdinaryError } from './errors/error';
import { loginRouter } from './routes/login';
import { userRouterForCustomer } from './routes/customer/user';
import { userRouterForEmployee } from './routes/employee/user';
import { initRouter } from './routes/init';
import { eventRouterForEmployee } from './routes/employee/event';
import { eventRouterForCustomer } from './routes/customer/event';

// .envファイルの設定を読み込み
dotenv.config();

const app: express.Express = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200,
};

// JSONを使用
app.use(express.json());
// CORS設定使用
app.use(cors(corsOptions));

// ルーター
app.use('/api/v1/', initRouter);
app.use('/api/v1/auth', loginRouter);
app.use('/api/tc/v1/user', userRouterForCustomer);
app.use('/api/tc/v1/event', eventRouterForCustomer);
app.use('/api/te/v1/user', userRouterForEmployee);
app.use('/api/te/v1/event', eventRouterForEmployee);

// 404エラー
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new OrdinaryError(404, 'NG', 'Endpoint is not found.'));
});
// 最上位エラーハンドリング
app.use((error: OrdinaryError, req: Request, res: Response, next: NextFunction) => {
  res.status(error.statusCode || 500).json({ processStatus: error.processStatus, message: error.message });
});

// データベースと接続し、サーバーを起動する
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log('サーバー起動');
    });
  } catch (err) {
    console.log(err);
  }
};

start();
