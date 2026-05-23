import {type CSSProperties, type FC } from 'react';

export interface ButtonProps {
  label: string;
  primary?: boolean;
  onClick?: () => void;
}

export const Button: FC<ButtonProps> = ({ label, primary = false, onClick }) => {
  const style: CSSProperties = {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: primary ? '#1ea7fd' : '#e2e8f0',
    color: primary ? '#ffffff' : '#1e293b',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'sans-serif'
  };
  return (
    <button style={style} onClick={onClick}>
      {label}
    </button>
  );
};
