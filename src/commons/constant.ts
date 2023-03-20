export class Constant {
  static randomCodeString = function (length = 6) {
    return Math.random().toString(20).substr(2, length);
  };
  static codeExpirationTime = 240000;
  static accessExpireIn = 86400000;
  static refreshExpireIn = 172800000;
  static activateHtml = function (url: string) {
    return `<p>Hello,</p>
    <p>Please click on the following button to activate your account address:</p>
    <a href="${url}">
      <button>Activate Now</button>
    </a>`;
  };
  static verifyLoginHtml = function (url: string) {
    return `<p>Hello,</p>
    <p>Please click on the following button to verify your email address:</p>
    <a href="${url}">
      <button>Verify Login</button>
    </a>`;
  };
}
