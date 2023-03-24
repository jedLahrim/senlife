import { Button } from './component/button.component';

export class Constant {
  static randomCodeString = function (length = 6) {
    return Math.random().toString(20).substr(2, length);
  };
  static codeExpiresInMili = 240000;
  static DYNAMIC_LINK_DOMAIN_URI_PREFIX = 'https://senlife.page.link';
  static accessExpireIn = 86400000;
  static refreshExpireIn = 172800000;
  static activateHtml = function (url: string) {
    return Button.ACTIVATE_NOW(url);
  };
  static verifyLoginHtml = function (url: string) {
    return Button.VERIFY_LOGIN(url);
  };
  static FACEBOOK_URL = function (fields, token) {
    return `https://graph.facebook.com/v12.0/me?fields=${fields}&access_token=${token}`;
  };
  static FIELDS = 'id,email,first_name,last_name,picture';
  static GOOGLE_URL = function (token) {
    return `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`;
  };
  static ANDROID_PACKAGE_NAME = 'com.senlife.app';
  static IOS_BUNDLE_ID = 'com.senlife.app';
}
