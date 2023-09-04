type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

export type BorderStyle =
  | 'dotted'
  | 'dashed'
  | 'solid'
  | 'double'
  | 'groove'
  | 'ridge'
  | 'inset'
  | 'outset'
  | 'none'
  | 'hidden';

export type Color = RGB | RGBA | HEX;

export type ContextWhiteLabel = {
  backgroundImage?: string;
  brandColor?: Color; // primary.main
  textColor?: Color; //text.primary
  textSecondaryColor?: Color; // text.secondary
  textCaptionColor?: Color; // text.caption
  linkColor?: Color;
  dividerColor?: Color;
  borderRadius?: `${string}px`;
  border?: `${number}px ${BorderStyle} ${Color}`;
  buttonTextColor?: Color;
  isGame?: boolean;
  loginPageTitle?: string;
  loginPageButtonText?: string;
  loginPageDescription?: string;
  loginPageTextFieldLabel?: string;
  loginPageTextFieldPlaceholder?: string;
  loginPageTextFieldErrorText?: string;
  loginPageTermsOfUse?: string;
  otpPageTitle?: string; // Verify email
  otpPageDescription?: string;
  otpPageButtonText?: string;
  confirmTransferPageTitle?: string;
  confirmTransferPageCancelButton?: string;
  confirmTransferPageConfirmButton?: string;
};
