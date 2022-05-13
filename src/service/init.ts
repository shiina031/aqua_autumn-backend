import { Request, Response } from 'express';

// 初期処理
const init = (req: Request, res: Response) => {
  res.status(200).json({ processStatus: 'OK', message: '初期処理OK', data: null });
};

export { init };
