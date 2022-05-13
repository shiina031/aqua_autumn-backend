type FullUserInformation = {
  _id: string;
  userCode: string;
  password: string;
  mailAddress: string;
  displayName: string;
  iconImage: string;
  employeeFlg: number;
  authorityManager: number;
  authorityAdmin: number;
  updateVersion: number;
  createdAt: Date;
  updateAt: Date;
  deleteFlg: boolean;
};

type EmployeeInformation = {
  userId: string;
  userCode: string;
  mailAddress: string;
  displayName: string;
  iconImage: string;
  authorityManager: number;
  authorityAdmin: number;
  updateVersion: number;
};

type UpdateEmployeeInformation = {
  userCode: string;
  mailAddress: string;
  displayName: string;
  iconImage: string;
  authorityManager: number;
  authorityAdmin: number;
  updateVersion: number;
};

type UserInformation = {
  userId: string;
  userCode: string;
  userRoleLevel: number;
  mailAddress: string;
  displayName: string;
  iconImage: string;
  updateVersion: number;
};

type UpdateUserInformation = {
  userCode: string;
  mailAddress: string;
  displayName: string;
  iconImage: string;
  updateVersion: number;
};

export { FullUserInformation, EmployeeInformation, UpdateEmployeeInformation, UserInformation, UpdateUserInformation };
