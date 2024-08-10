import * as React from 'react';

interface EmailTemplateProps {
  message: string;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({ message }) => {
  return (
    <div>
      <h1>Thông Báo Mới</h1>
      <p>{message}</p>
      <p>Trân trọng,</p>
      <p>Đội ngũ hỗ trợ Gmail 
      </p>
    </div>
  );
};