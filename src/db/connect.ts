import mongoose from 'mongoose';
import dotenv from 'dotenv';

// .envファイルの設定を読み込み
dotenv.config();

const URL = process.env.MONGO_URL || 'http://localhost:3000';

export const connectDB = () => {
  return mongoose
    .connect(URL)
    .then(() => console.log('データベースと接続中・・・'))
    .catch((err) => console.log(err));
};
