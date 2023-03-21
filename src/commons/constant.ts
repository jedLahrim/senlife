import { ButtonComponent } from './component/button.component';

export class Constant {
  static randomCodeString = function (length = 6) {
    return Math.random().toString(20).substr(2, length);
  };
  static codeExpirationTime = 240000;
  static accessExpireIn = 86400000;
  static refreshExpireIn = 172800000;
  static activateHtml = function (url: string) {
    return ButtonComponent.ACTIVATE_NOW(url);
  };
  static verifyLoginHtml = function (url: string) {
    return ButtonComponent.VERIFY_LOGIN(url);
  };

  static ANDROID_PACKAGE_NAME = 'com.senlife.app';
  static IOS_BUNDLE_ID = 'com.senlife.app';
}
