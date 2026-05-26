import { FC, CSSProperties } from 'react';

export interface CardProps {
  title: string;
  content: string;
}

export const Card: FC<CardProps> = ({ title, content }) => {
  const style: CSSProperties = {
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    fontFamily: 'sans-serif',
    maxWidth: '300px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };
  return (
    <div style={style}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1e293b' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>{content}</p>
    </div>
  );
};
