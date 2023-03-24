export class ButtonComponent {
  // ACTIVATE BUTTON
  static ACTIVATE_NOW = (url) => {
    return `<p>Hello,</p>
    <p>Please click on the following button to activate your account address:</p>
    <a href="${url}">
      <button style="background-color: #008CBA; 
      color: white;
      margin-top: 18px; 
      padding: 12px 24px; 
      border: none; 
      border-radius: 5px; 
      cursor: pointer;">Activate Now</button>
    </a>`;
  };
  // ACTIVATE BUTTON
  static VERIFY_LOGIN = (url) => {
    return `<p>Hello,</p>
    <p>Please click on the following button to verify your email address:</p>
    <a href="${url}">
       <button style="background-color: #008CBA;
        color: white;
        margin-top: 18px;
        padding: 12px 24px;
        border: none; border-radius: 5px; 
        cursor: pointer;">Verify Login</button>
    </a>`;
  };
}
