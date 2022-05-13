import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

import { authenticateUser, fetchLoginUserId, jwtPublisher } from '../../auth/auth';
import { FullUserInformation, UpdateUserInformation, UserInformation } from '../../types/userTypes';
import { userModel } from '../../models/User';
import { USER_ROLE_LEVEL_CUSTERMER } from '../../definition/userRole';

// ユーザー新規作成（サインアップ）
const createUser = async (req: Request, res: Response) => {
  // パスワードはハッシュ化する
  const inputPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(inputPassword, 10);
  const { userCode: inputUserCode, mailAddress } = req.body;
  const createUserData = { userCode: inputUserCode, mailAddress, password: hashedPassword };
  try {
    // ユーザーコード重複チェック
    const userDataList = await userModel.find({ deleteFlg: false }).select('userCode');
    if (userDataList.length > 0 && userDataList.some((userData) => userData.userCode === inputUserCode)) {
      return res.status(400).json({
        processStatus: 'NG',
        message: 'create_user_process_faied: そのユーザーコードはすでに使われています',
        data: null,
      });
    }
    const createUser: FullUserInformation = await userModel.create(createUserData);
    const { _id: userId, userCode, mailAddress, displayName, iconImage, updateVersion } = createUser;
    // ユーザーロールを判定
    const userRoleLevel = 0;
    // jwtを発行
    const token = jwtPublisher(userId, userCode, userRoleLevel);
    // 情報を返却
    const result: UserInformation = {
      userId,
      userCode,
      userRoleLevel,
      mailAddress,
      displayName,
      iconImage,
      updateVersion,
    };
    return res.status(200).json({
      processStatus: 'OK',
      message: 'ユーザー新規作成処理に成功しました',
      data: { token, result },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      processStatus: 'NG',
      message: 'create_user_process_faied: ユーザー新規作成処理に失敗しました',
      data: null,
    });
  }
};

// ユーザー情報取得（自分のみ）
const getOwnData = (req: Request, res: Response) => {
  authenticateUser(req, res, USER_ROLE_LEVEL_CUSTERMER, async () => {
    const userId: string = req.params.id;
    const loginUserId = fetchLoginUserId(req, res);
    if (userId !== loginUserId) {
      return res
        .status(404)
        .json({ processStatus: 'NG', message: 'target_user_not_found: 存在しないユーザーです', data: null });
    }
    try {
      const getUser: FullUserInformation | null = await userModel
        .findOne({ _id: userId, deleteFlg: false })
        .select('_id userCode mailAddress displayName iconImage updateVersion');
      if (!getUser) {
        return res
          .status(404)
          .json({ processStatus: 'NG', message: 'target_user_not_found: 存在しないユーザーです', data: null });
      }
      res.status(200).json({ processStatus: 'OK', message: 'ユーザー情報取得に成功しました', data: getUser });
    } catch (error) {
      return res.status(500).json({
        processStatus: 'NG',
        message: 'fetch_user_data_process_faied: ユーザー情報取得処理に失敗しました',
        data: null,
      });
    }
  });
};

// ユーザー情報更新（自分のみ）
const updateUser = (req: Request, res: Response) => {
  authenticateUser(req, res, USER_ROLE_LEVEL_CUSTERMER, async () => {
    const userId: string = req.params.id;
    const loginUserId = fetchLoginUserId(req, res);
    if (userId !== loginUserId) {
      return res
        .status(404)
        .json({ processStatus: 'NG', message: 'target_user_not_found: 存在しないユーザーです', data: null });
    }
    const { userCode, mailAddress, displayName, iconImage, updateVersion } = req.body;
    const updateInformation: UpdateUserInformation = {
      userCode,
      mailAddress,
      displayName,
      iconImage,
      updateVersion: updateVersion + 1,
    };
    try {
      const updateUser: FullUserInformation | null = await userModel.findOneAndUpdate(
        { _id: userId },
        updateInformation,
        { new: true }
      );
      if (updateUser) {
        const result: UserInformation = {
          userId: updateUser._id,
          userCode: updateUser.userCode,
          userRoleLevel: 0,
          mailAddress: updateUser.mailAddress,
          displayName: updateUser.displayName,
          iconImage: updateUser.iconImage,
          updateVersion: updateUser.updateVersion,
        };
        return res.status(200).json({ processStatus: 'OK', message: 'ユーザー情報の更新に成功しました', data: result });
      } else {
        return res
          .status(404)
          .json({ processStatus: 'NG', message: 'target_user_not_found: 存在しないユーザーです', data: null });
      }
    } catch (error) {
      return res.status(500).json({
        processStatus: 'NG',
        message: 'update_user_process_faied: ユーザー情報更新に失敗しました',
        data: null,
      });
    }
  });
};

// ユーザー情報削除（自分のみ）
const deleteUser = (req: Request, res: Response) => {
  authenticateUser(req, res, USER_ROLE_LEVEL_CUSTERMER, async () => {
    const userId: string = req.params.id;
    const loginUserId = fetchLoginUserId(req, res);
    if (userId !== loginUserId) {
      return res
        .status(404)
        .json({ processStatus: 'NG', message: 'target_user_not_found: 存在しないユーザーです', data: null });
    }
    try {
      const deleteUser: FullUserInformation | null = await userModel.findOneAndUpdate(
        { _id: userId },
        { deleteFlg: true },
        { new: true }
      );
      if (deleteUser) {
        return res.status(200).json({ processStatus: 'OK', message: 'ユーザーを削除しました', data: null });
      } else {
        return res
          .status(404)
          .json({ processStatus: 'NG', message: 'target_user_not_found: 存在しないユーザーです', data: null });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ processStatus: 'NG', message: 'update_user_process_faied: ユーザー削除に失敗しました', data: null });
    }
  });
};

export { createUser, getOwnData, updateUser, deleteUser };
