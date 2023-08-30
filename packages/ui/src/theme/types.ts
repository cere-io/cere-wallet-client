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
  backgroundColor?: Color;
  palette?: {
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
      borderRadius: number | `${string}px`;
    };
    outlined?: {
      backgroundColor: Color | 'transparent';
      borderRadius: number | `${string}px`;
      border: `${number}px ${BorderStyle} ${Color}`;
    };
    text?: {
      color: Color;
    };
    textField?: {
      enabled: {
        input: Color;
        '& fieldset': {
          border: string;
        };
      };
      disabled: {
        '& .MuiInputBase-input.Mui-disabled': {
          WebkitTextFillColor: Color;
        };
      };
    };
  };
};
