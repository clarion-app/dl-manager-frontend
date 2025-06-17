import React from 'react';
import { useGetMessagesQuery, MessageType } from './downloadManagerApi';

export const Messages = () => {
  const { data: messages, isLoading, error } = useGetMessagesQuery();

  if (isLoading) {
    return <div>Loading messages...</div>;
  }

  if (error) {
    return <div>Error fetching messages.</div>;
  }

  return (
    <div>
      <h1>Messages</h1>
      {messages?.map((msg: MessageType) => (
        <div key={msg.id}>
          <h3>From: {msg.from}</h3>
          <p>{msg.message}</p>
          <p><strong>To:</strong> {msg.to}</p>
        </div>
      ))}
    </div>
  );
};
