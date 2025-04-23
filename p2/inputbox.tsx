// File: src/components/InputBox.tsx
import React, { useState, useRef } from 'react';
import { Button } from 'antd';
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