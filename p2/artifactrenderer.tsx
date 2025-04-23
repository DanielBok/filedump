// File: src/components/ArtifactRenderer.tsx
import React, { useState } from 'react';
import { Artifact } from '../types';
import { Card, Button, Tabs } from 'antd';
import { CopyOutlined, DownloadOutlined, CodeOutlined } from '@ant-design/icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MarkdownWithMath from './MarkdownWithMath';

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
            <MarkdownWithMath content={artifact.content} />
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