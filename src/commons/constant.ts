import { ButtonComponent } from './component/button.component';

export class Constant {
  static randomCodeString = function (length = 6) {
    return Math.random().toString(20).substr(2, length);
  };
  static CODE_EXPIRES_IN_MILI = 240000;
  static DYNAMIC_LINK_DOMAIN_URI_PREFIX = 'https://senlife.page.link';
  static FIREBASE_LINK = function (code) {
    return `https://senlife.page.link/activate?code=${code}`;
  };
  static FIREBASE_URL = function (firebaseAPIKey) {
    return `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${firebaseAPIKey}`;
  };
  // for testing
  static ACCESS_EXPIRES_IN = '1w';
  static REFRESH_EXPIRES_IN = '60d';
  static ACTIVATE_HTML = function (url: string) {
    return ButtonComponent.ACTIVATE_NOW(url);
  };
  static VERIFY_LOGIN_HTML = function (url: string) {
    return ButtonComponent.VERIFY_LOGIN(url);
  };
  static FACEBOOK_URL = function (facebookFields, facebookToken) {
    return `https://graph.facebook.com/v12.0/me?fields=${facebookFields}&access_token=${facebookToken}`;
  };
  static FACEBOOK_FIELDS = 'id,email,first_name,last_name,picture';
  static GOOGLE_URL = function (googleToken) {
    return `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleToken}`;
  };
  static ANDROID_PACKAGE_NAME = 'com.senlife.app';
  static IOS_BUNDLE_ID = 'com.senlife.app';
  static TAKE = 40;
  static SKIP = 0;
}
