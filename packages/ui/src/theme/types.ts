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
  backgroundImage?: string; // default background image
  backgroundColor?: Color; // if there is no backgroundImage (errors) -> (can be hex, rgb or rgba)
  palette?: {
    // primary, secondary only used in markup
    primary?: {
      main: Color;
      light: Color;
    };
    secondary?: {
      main: Color;
      light: Color;
    };
    text?: {
      primary: Color;
      secondary: Color;
      caption: Color;
    };
    divider?: Color;
  };
  button?: {
    contained?: {
      backgroundColor: Color;
      borderRadius: number;
    };
    outlined?: {
      backgroundColor: Color | 'transparent';
      borderRadius: number;
      border: `${number}px ${BorderStyle} ${Color}`; // maybe need to add types for em's and rem's
    };
    text?: {
      color: Color;
    };
  };
};
