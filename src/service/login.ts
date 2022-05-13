import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';

import { userModel } from '../models/User';
import { FullUserInformation, UserInformation } from '../types/userTypes';
import { authenticateUser, fetchLoginUserId, jwtPublisher } from '../auth/auth';
import { OrdinaryError } from '../errors/error';
import { USER_ROLE_LEVEL_CUSTERMER } from '../definition/userRole';

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { userCode, password } = req.body;
  try {
    const getUser: FullUserInformation | null = await userModel.findOne({ userCode, deleteFlg: false });
    // パスワードを比較
    if (getUser && bcrypt.compareSync(password, getUser.password)) {
      const {
        _id: userId,
        userCode,
        mailAddress,
        displayName,
        iconImage,
        employeeFlg,
        authorityManager,
        authorityAdmin,
        updateVersion,
      } = getUser;
      // ユーザーロールを判定
      const userRoleLevel = employeeFlg + authorityManager + authorityAdmin;
      // jwtを発行
      const token = jwtPublisher(userId, userCode, userRoleLevel);
      // 情報を返却
      const result: UserInformation = {
        userId,
        userCode,
        mailAddress,
        userRoleLevel,
        displayName,
        iconImage,
        updateVersion,
      };
      return res.status(200).json({
        processStatus: 'OK',
        message: 'ログインに成功しました',
        data: { token, result },
      });
    } else {
      return res.status(401).json({
        processStatus: 'NG',
        message: 'login_faied: ユーザーコードまたはパスワードが正しくありません',
        data: null,
      });
    }
  } catch (error: any) {
    throw new OrdinaryError(500, 'NG', 'login_process_faied: ログイン処理に失敗しました');
  }
};

const changePassword = async (req: Request, res: Response) => {
  authenticateUser(req, res, USER_ROLE_LEVEL_CUSTERMER, async () => {
    const targetUserId: string = req.params.id;
    const loginUserId = fetchLoginUserId(req, res);
    if (targetUserId !== loginUserId) {
      return res
        .status(404)
        .json({ processStatus: 'NG', message: 'target_user_not_found: 存在しないユーザーです', data: null });
    }
    // パスワードはハッシュ化する
    const inputPassword = req.body.password;
    const hashedPassword = bcrypt.hashSync(inputPassword, 10);
    try {
      await userModel.findOneAndUpdate({ _id: targetUserId }, { password: hashedPassword }, { new: true });
      return res.status(200).json({ processStatus: 'OK', message: 'パスワードの変更に成功しました', data: null });
    } catch (error) {
      return res.status(500).json({
        processStatus: 'NG',
        message: 'update_user_process_faied: パスワードの変更に失敗しました',
        data: null,
      });
    }
  });
};

export { login, changePassword };
