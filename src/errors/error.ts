// エラーの基底クラス
class CustomError extends Error {
  constructor(e?: string) {
    super(e);
    this.name = new.target.name;
  }
}

// 基本はこのエラーを使う
class OrdinaryError extends CustomError {
  constructor(public statusCode: number, public processStatus: string, e?: string) {
    super(e);
  }
}

export { OrdinaryError };
