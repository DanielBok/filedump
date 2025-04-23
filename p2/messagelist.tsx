// File: src/components/MessageList.tsx
import React from 'react';
import { Message } from '../types';
import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === 'user' ? (
            <UserMessage message={message} />
          ) : (
            <AssistantMessage message={message} />
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageList;