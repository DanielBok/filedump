// File: src/components/AssistantMessage.tsx
import React from 'react';
import { Message } from '../types';
import { Avatar } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import ArtifactRenderer from './artifactrenderer.tsx';
import MarkdownWithMath from './MarkdownWithMath';

interface AssistantMessageProps {
  message: Message;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({ message }) => {
  return (
    <div className="flex gap-4">
      <Avatar icon={<RobotOutlined />} className="flex-shrink-0 bg-purple-500" />
      <div className="flex-1">
        <div className="text-sm text-gray-500 mb-1">Assistant</div>
        <div className="prose max-w-none">
          <MarkdownWithMath content={message.content} />
          
          {message.artifacts && message.artifacts.length > 0 && (
            <div className="mt-4 space-y-4">
              {message.artifacts.map((artifact) => (
                <ArtifactRenderer key={artifact.id} artifact={artifact} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssistantMessage;
