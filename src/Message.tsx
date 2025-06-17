import React from 'react';
import { MessageType } from './downloadManagerApi';

interface MessageProps {
  message: MessageType;
}

export const Message = ({ message }: MessageProps) => {
  return (
    <div>
      <h2>Message from: {message.from}</h2>
      <p><strong>To:</strong> {message.to}</p>
      <p>{message.message}</p>
    </div>
  );
};
