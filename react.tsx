// File: src/types/index.ts
export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    artifacts?: Artifact[];
  }
  
  export interface Artifact {
    id: string;
    title: string;
    type: string;
    content: string;
    language?: string;
  }
  
  export interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface FileUpload {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }
  
  // File: src/api/chatApi.ts
  import axios from 'axios';
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  export const chatApi = {
    sendMessage: async (conversationId: string, message: string, files: File[] = []) => {
      const formData = new FormData();
      formData.append('message', message);
      formData.append('conversation_id', conversationId);
      
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });
  
      const response = await axios.post(`${API_URL}/api/chat/message`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    },
  
    getConversations: async () => {
      const response = await axios.get(`${API_URL}/api/conversations`);
      return response.data;
    },
  
    getConversation: async (conversationId: string) => {
      const response = await axios.get(`${API_URL}/api/conversations/${conversationId}`);
      return response.data;
    },
  
    createConversation: async () => {
      const response = await axios.post(`${API_URL}/api/conversations`);
      return response.data;
    },
  };
  
  // File: src/components/ChatInterface.tsx
  import React, { useState, useEffect, useRef } from 'react';
  import { Input, Button, Upload, Spin, message } from 'antd';
  import { SendOutlined, PaperClipOutlined, PictureOutlined } from '@ant-design/icons';
  import { v4 as uuidv4 } from 'uuid';
  import { Message, Conversation, FileUpload } from '../types';
  import { chatApi } from '../api/chatApi';
  import MessageList from './MessageList';
  import InputBox from './InputBox';
  
  const ChatInterface: React.FC = () => {
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      const initConversation = async () => {
        // Check if there's an active conversation in localStorage
        const activeConversationId = localStorage.getItem('activeConversationId');
        
        if (activeConversationId) {
          try {
            const convo = await chatApi.getConversation(activeConversationId);
            setConversation(convo);
          } catch (error) {
            console.error('Failed to load conversation:', error);
            createNewConversation();
          }
        } else {
          createNewConversation();
        }
      };
  
      initConversation();
    }, []);
  
    useEffect(() => {
      scrollToBottom();
    }, [conversation?.messages]);
  
    const createNewConversation = async () => {
      try {
        const newConvo = await chatApi.createConversation();
        setConversation(newConvo);
        localStorage.setItem('activeConversationId', newConvo.id);
      } catch (error) {
        console.error('Failed to create new conversation:', error);
        message.error('Failed to create a new conversation. Please try again.');
      }
    };
  
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
  
    const handleSendMessage = async () => {
      if (!inputValue.trim() && files.length === 0) return;
      
      if (!conversation) {
        message.error('No active conversation');
        return;
      }
  
      // Create temporary user message for immediate display
      const tempUserMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: inputValue,
        timestamp: new Date(),
      };
  
      // Update UI immediately with user message
      setConversation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, tempUserMessage]
        };
      });
  
      // Clear input and files
      setInputValue('');
      setFiles([]);
      setFileUploads([]);
      
      setIsLoading(true);
  
      try {
        // Send message to API
        const response = await chatApi.sendMessage(conversation.id, inputValue, files);
        
        // Update conversation with response from API
        setConversation(response.conversation);
      } catch (error) {
        console.error('Failed to send message:', error);
        message.error('Failed to send message. Please try again.');
        
        // Revert UI if failed
        setConversation(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: prev.messages.filter(msg => msg.id !== tempUserMessage.id)
          };
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleFileUpload = (file: File) => {
      setFiles(prev => [...prev, file]);
      
      setFileUploads(prev => [
        ...prev, 
        {
          id: uuidv4(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file)
        }
      ]);
      
      return false; // Prevent default upload behavior
    };
  
    const removeFile = (fileId: string) => {
      const fileUpload = fileUploads.find(f => f.id === fileId);
      if (fileUpload) {
        URL.revokeObjectURL(fileUpload.url);
      }
      
      setFileUploads(prev => prev.filter(f => f.id !== fileId));
      setFiles(prev => {
        const index = fileUploads.findIndex(f => f.id === fileId);
        if (index === -1) return prev;
        const newFiles = [...prev];
        newFiles.splice(index, 1);
        return newFiles;
      });
    };
  
    if (!conversation) {
      return (
        <div className="flex items-center justify-center h-screen">
          <Spin size="large" tip="Loading conversation..." />
        </div>
      );
    }
  
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="flex-1 overflow-y-auto p-4">
          <MessageList messages={conversation.messages} />
          <div ref={messagesEndRef} />
        </div>
        
        {fileUploads.length > 0 && (
          <div className="px-4 py-2 bg-white border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {fileUploads.map(file => (
                <div key={file.id} className="flex items-center gap-2 bg-gray-100 rounded px-2 py-1">
                  <span className="text-xs truncate max-w-xs">{file.name}</span>
                  <Button 
                    type="text" 
                    size="small" 
                    onClick={() => removeFile(file.id)} 
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="p-4 border-t border-gray-200 bg-white">
          <InputBox
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSendMessage}
            isLoading={isLoading}
            onFileUpload={handleFileUpload}
          />
        </div>
      </div>
    );
  };
  
  export default ChatInterface;
  
  // File: src/components/InputBox.tsx
  import React, { useState, useRef } from 'react';
  import { Input, Button, Upload } from 'antd';
  import { SendOutlined, PaperClipOutlined, PictureOutlined } from '@ant-design/icons';
  import TextareaAutosize from 'react-textarea-autosize';
  
  interface InputBoxProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
    onFileUpload: (file: File) => boolean;
  }
  
  const InputBox: React.FC<InputBoxProps> = ({ 
    value, 
    onChange, 
    onSubmit, 
    isLoading, 
    onFileUpload 
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
  
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSubmit();
      }
    };
  
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      let newValue = e.target.value;
      
      // Handle code block conversion (triple backticks)
      if (newValue.includes('```') && !value.includes('```')) {
        const parts = newValue.split('```');
        if (parts.length >= 3) {
          // Keep the content between the backticks and add appropriate formatting
          const beforeCode = parts[0];
          const code = parts[1];
          const afterCode = parts.slice(2).join('```');
          newValue = `${beforeCode}\n\`\`\`\n${code}\n\`\`\`\n${afterCode}`;
        }
      }
      
      onChange(newValue);
    };
  
    const triggerFileUpload = () => {
      fileInputRef.current?.click();
    };
  
    const triggerImageUpload = () => {
      imageInputRef.current?.click();
    };
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileUpload(files[0]);
        // Reset the input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
  
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileUpload(files[0]);
        // Reset the input
        if (imageInputRef.current) {
          imageInputRef.current.value = '';
        }
      }
    };
  
    return (
      <div className={`relative border rounded-lg transition-all ${isFocused ? 'border-blue-500 shadow-sm' : 'border-gray-300'}`}>
        <TextareaAutosize
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full px-4 py-3 resize-none outline-none max-h-[200px] overflow-y-auto"
          placeholder="Message Claude..."
          minRows={1}
          maxRows={8}
        />
        
        <div className="flex items-center px-3 py-2 border-t border-gray-200">
          <div className="flex-1 flex gap-2">
            <button
              type="button"
              onClick={triggerFileUpload}
              className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
            >
              <PaperClipOutlined />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            
            <button
              type="button"
              onClick={triggerImageUpload}
              className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
            >
              <PictureOutlined />
            </button>
            <input
              type="file"
              ref={imageInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={onSubmit}
            loading={isLoading}
            disabled={isLoading || (!value.trim() && !fileInputRef.current?.files?.length)}
            className="flex items-center justify-center"
          >
            Send
          </Button>
        </div>
      </div>
    );
  };
  
  export default InputBox;
  
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
  
  // File: src/components/UserMessage.tsx
  import React from 'react';
  import { Message } from '../types';
  import ReactMarkdown from 'react-markdown';
  import remarkGfm from 'remark-gfm';
  import { Avatar } from 'antd';
  import { UserOutlined } from '@ant-design/icons';
  
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
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  };
  
  export default UserMessage;
  
  // File: src/components/AssistantMessage.tsx
  import React from 'react';
  import { Message } from '../types';
  import ReactMarkdown from 'react-markdown';
  import remarkGfm from 'remark-gfm';
  import { Avatar } from 'antd';
  import { RobotOutlined } from '@ant-design/icons';
  import ArtifactRenderer from './ArtifactRenderer';
  
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
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
            
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
  
  // File: src/components/ArtifactRenderer.tsx
  import React, { useState } from 'react';
  import { Artifact } from '../types';
  import { Card, Button, Tabs } from 'antd';
  import { CopyOutlined, DownloadOutlined, CodeOutlined } from '@ant-design/icons';
  import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
  import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
  import ReactMarkdown from 'react-markdown';
  import remarkGfm from 'remark-gfm';
  
  interface ArtifactRendererProps {
    artifact: Artifact;
  }
  
  const ArtifactRenderer: React.FC<ArtifactRendererProps> = ({ artifact }) => {
    const [activeTab, setActiveTab] = useState('preview');
    
    const copyToClipboard = () => {
      navigator.clipboard.writeText(artifact.content);
    };
    
    const downloadArtifact = () => {
      const blob = new Blob([artifact.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${artifact.title || 'artifact'}.${getExtension(artifact.type, artifact.language)}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
    
    const getExtension = (type: string, language?: string) => {
      if (type === 'application/vnd.ant.code') {
        switch (language?.toLowerCase()) {
          case 'javascript': return 'js';
          case 'typescript': return 'ts';
          case 'python': return 'py';
          case 'html': return 'html';
          case 'css': return 'css';
          default: return 'txt';
        }
      } else if (type === 'text/markdown') {
        return 'md';
      } else if (type === 'text/html') {
        return 'html';
      } else if (type === 'image/svg+xml') {
        return 'svg';
      } else {
        return 'txt';
      }
    };
    
    const renderContent = () => {
      if (activeTab === 'source') {
        return (
          <SyntaxHighlighter
            language={artifact.language || getLanguageFromType(artifact.type)}
            style={vscDarkPlus}
            className="rounded"
          >
            {artifact.content}
          </SyntaxHighlighter>
        );
      }
      
      // Preview tab
      switch (artifact.type) {
        case 'application/vnd.ant.code':
          return (
            <SyntaxHighlighter
              language={artifact.language || 'text'}
              style={vscDarkPlus}
              className="rounded"
            >
              {artifact.content}
            </SyntaxHighlighter>
          );
        
        case 'text/markdown':
          return (
            <div className="bg-white rounded p-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {artifact.content}
              </ReactMarkdown>
            </div>
          );
        
        case 'text/html':
          return (
            <div className="bg-white rounded border p-0 overflow-hidden">
              <iframe
                srcDoc={artifact.content}
                title={artifact.title || 'HTML Preview'}
                className="w-full h-64 border-0"
                sandbox="allow-scripts"
              />
            </div>
          );
        
        case 'image/svg+xml':
          return (
            <div className="bg-white rounded p-4 flex justify-center">
              <div dangerouslySetInnerHTML={{ __html: artifact.content }} />
            </div>
          );
        
        case 'application/vnd.ant.mermaid':
          return (
            <div className="bg-white rounded p-4 text-center">
              <div className="mermaid">{artifact.content}</div>
            </div>
          );
        
        default:
          return (
            <div className="bg-gray-100 rounded p-4">
              <pre className="whitespace-pre-wrap">{artifact.content}</pre>
            </div>
          );
      }
    };
    
    const getLanguageFromType = (type: string) => {
      switch (type) {
        case 'text/markdown': return 'markdown';
        case 'text/html': return 'html';
        case 'image/svg+xml': return 'xml';
        case 'application/vnd.ant.mermaid': return 'mermaid';
        default: return 'text';
      }
    };
    
    return (
      <Card
        title={artifact.title || 'Artifact'}
        className="mt-4"
        extra={
          <div className="flex gap-2">
            <Button
              icon={<CopyOutlined />}
              onClick={copyToClipboard}
              size="small"
            />
            <Button
              icon={<DownloadOutlined />}
              onClick={downloadArtifact}
              size="small"
            />
          </div>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'preview',
              label: 'Preview',
              children: renderContent()
            },
            {
              key: 'source',
              label: 'Source',
              icon: <CodeOutlined />,
              children: renderContent()
            }
          ]}
        />
      </Card>
    );
  };
  
  export default ArtifactRenderer;