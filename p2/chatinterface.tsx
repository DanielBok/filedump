// File: src/components/ChatInterface.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Upload, Spin, message } from 'antd';
import { SendOutlined, PaperClipOutlined, PictureOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { Message, Conversation, FileUpload } from '../types';
// Import the mock API instead of the real one
import { mockChatApi as chatApi } from '../api/mockChatApi';
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
      try {
        // Always get the mock conversation
        const convo = await chatApi.getConversation('mock-conversation-id');
        setConversation({
          id: convo.id,
          title: convo.title,
          messages: convo.messages,
          createdAt: new Date(convo.created_at),
          updatedAt: new Date(convo.updated_at)
        });
      } catch (error) {
        console.error('Failed to load conversation:', error);
        message.error('Failed to load conversation. Using empty conversation.');
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
      setConversation({
        id: newConvo.id,
        title: newConvo.title,
        messages: newConvo.messages,
        createdAt: new Date(newConvo.created_at),
        updatedAt: new Date(newConvo.updated_at)
      });
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
      // Send message to mock API
      const response = await chatApi.sendMessage(conversation.id, inputValue, files);
      
      // Update conversation with response from mock API
      setConversation({
        id: response.conversation.id,
        title: response.conversation.title,
        messages: response.conversation.messages,
        createdAt: new Date(response.conversation.created_at),
        updatedAt: new Date(response.conversation.updated_at)
      });
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
      <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">{conversation.title}</h1>
        <Button onClick={createNewConversation}>New Conversation</Button>
      </div>
      
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