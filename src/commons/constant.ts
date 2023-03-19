export class Constant {
  static randomCodeString = function (length = 6) {
    return Math.random().toString(20).substr(2, length);
  };
  static codeExpirationTime = 240000;
}
