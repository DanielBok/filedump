// File: src/components/UserMessage.tsx
import React from 'react';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface UserMessageProps {
  message: Message;
}

const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  return (
    <div className="flex gap-4">
      <Avatar icon={<UserOutlined />} className="flex-shrink-0 bg-blue-500" />
      <div className="flex-1">
        <div className="text-sm text-gray-500 mb-1">You</div>
        <div className="prose max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default UserMessage;