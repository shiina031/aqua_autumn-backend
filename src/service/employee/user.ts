import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { authenticateUser } from '../../auth/auth';
import { EmployeeInformation, FullUserInformation, UpdateEmployeeInformation } from '../../types/userTypes';
import { userModel } from '../../models/User';
import { USER_ROLE_LEVEL_EMPLOYEE, USER_ROLE_LEVEL_MANAGER } from '../../definition/userRole';

// 従業員新規作成
const createEmployee = (req: Request, res: Response) => {
  authenticateUser(req, res, USER_ROLE_LEVEL_MANAGER, async () => {
    // パスワードはハッシュ化する
    const inputPassword = req.body.password;
    const hashedPassword = bcrypt.hashSync(inputPassword, 10);
    const createUserData = { ...req.body, employeeFlg: 1, password: hashedPassword };
    try {
      await userModel.create(createUserData);
      return res.status(200).json({ processStatus: 'OK', message: '従業員の作成に成功しました', data: null });
    } catch (error) {
      return res.status(500).json({
        processStatus: 'NG',
        message: 'create_employee_process_faied: 従業員新規作成処理に失敗しました',
        data: null,
      });
    }
  });
};

// 全従業員情報取得
const getAllEmployees = (req: Request, res: Response) => {
  authenticateUser(req, res, USER_ROLE_LEVEL_MANAGER, async () => {
    try {
      const getEmployees: EmployeeInformation[] = await userModel
        .find({ employeeFlg: 1, deleteFlg: false })
        .select('-password -createdAt -updatedAt -deleteFlg -__v');
      return res.status(200).json({ processStatus: 'OK', message: '従業員情報取得に成功しました', data: getEmployees });
    } catch (error) {
      return res
        .status(500)
        .json({ processStatus: 'NG', message: 'get_employee_process_faied: 従業員情報取得に失敗しました', data: null });
    }
  });
};

// 従業員情報取得
const getEmployee = (req: Request, res: Response) => {
  authenticateUser(req, res, USER_ROLE_LEVEL_EMPLOYEE, async () => {
    const userId = req.params.id;
    try {
      const getEmployee: EmployeeInformation | null = await userModel
        .findOne({
          _id: userId,
          employeeFlg: 1,
          deleteFlg: false,
        })
        .select('-password -createdAt -updatedAt -deleteFlg');
      if (!getEmployee) {
        return res
          .status(404)
          .json({ processStatus: 'NG', message: 'target_employee_not_found: 存在しない従業員です', data: null });
      }
      return res.status(200).json({ processStatus: 'OK', message: '従業員情報取得に成功しました', data: getEmployee });
    } catch (error) {
      return res
        .status(500)
        .json({ processStatus: 'NG', message: 'get_employee_process_faied: 従業員情報取得に失敗しました', data: null });
    }
  });
};

// 従業員情報更新
const updateEmployee = (req: Request, res: Response) => {
  authenticateUser(req, res, USER_ROLE_LEVEL_MANAGER, async () => {
    const userId: string = req.params.id;
    const { userCode, mailAddress, displayName, iconImage, authorityManager, authorityAdmin, updateVersion } = req.body;
    const updateInformation: UpdateEmployeeInformation = {
      userCode,
      mailAddress,
      displayName,
      iconImage,
      authorityManager,
      authorityAdmin,
      updateVersion: updateVersion + 1,
    };
    try {
      const updateEmployee: FullUserInformation | null = await userModel.findOneAndUpdate(
        { _id: userId },
        updateInformation,
        { new: true }
      );
      if (updateEmployee) {
        const result: EmployeeInformation = {
          userId: updateEmployee._id,
          userCode: updateEmployee.userCode,
          mailAddress: updateEmployee.mailAddress,
          displayName: updateEmployee.displayName,
          iconImage: updateEmployee.iconImage,
          authorityManager: updateEmployee.authorityManager,
          authorityAdmin: updateEmployee.authorityAdmin,
          updateVersion: updateEmployee.updateVersion,
        };
        return res.status(200).json({ processStatus: 'OK', message: '従業員情報更新に成功しました', data: result });
      } else {
        return res
          .status(404)
          .json({ processStatus: 'NG', message: 'target_employee_not_found: 存在しない従業員です', data: null });
      }
    } catch (error) {
      return res.status(500).json({
        processStatus: 'NG',
        message: 'update_employee_process_faied: 従業員情報更新に失敗しました',
        data: null,
      });
    }
  });
};

// 従業員削除
const deleteEmployee = (req: Request, res: Response) => {
  authenticateUser(req, res, USER_ROLE_LEVEL_MANAGER, async () => {
    const userId: string = req.params.id;
    try {
      const deleteEmployee: FullUserInformation | null = await userModel.findOneAndUpdate(
        { _id: userId },
        { deleteFlg: true },
        { new: true }
      );
      if (!deleteEmployee) {
        return res
          .status(404)
          .json({ processStatus: 'NG', message: 'target_employee_not_found: 存在しない従業員です', data: null });
      }
      return res.status(200).json({ processStatus: 'OK', message: '従業員を削除しました', data: null });
    } catch (error) {
      return res
        .status(500)
        .json({ processStatus: 'NG', message: 'update_employee_process_faied: 従業員削除に失敗しました', data: null });
    }
  });
};

export { createEmployee, getAllEmployees, getEmployee, updateEmployee, deleteEmployee };
