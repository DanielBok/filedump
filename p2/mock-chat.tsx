// File: src/api/mockChatApi.ts
import { v4 as uuidv4 } from 'uuid';
import { Conversation, Message, Artifact } from '../types';

// Mock conversation data
const mockConversation: Conversation = {
  id: 'mock-conversation-id',
  title: 'Mock Conversation',
  messages: [
    {
      id: uuidv4(),
      role: 'user',
      content: 'Hello! Can you help me with React and Python?',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: uuidv4(),
      role: 'assistant',
      content: `I'd be happy to help you with React and Python! Both are powerful tools for different aspects of application development. 

What specific questions do you have about them? Are you looking to:

- Learn the basics of either language?
- Build a specific project combining React and Python?
- Understand how to connect a React frontend with a Python backend?
- Get help with a particular error or concept?`,
      timestamp: new Date(Date.now() - 3580000)
    },
    {
      id: uuidv4(),
      role: 'user',
      content: 'Can you show me how to calculate the Fibonacci sequence in Python and how to display it in React?',
      timestamp: new Date(Date.now() - 1800000),
    }
  ],
  createdAt: new Date(Date.now() - 3600000),
  updatedAt: new Date(Date.now() - 1800000)
};

// Mock artifacts
const mockArtifacts: Artifact[] = [
  {
    id: 'artifact-1',
    title: 'Fibonacci Sequence in Python',
    type: 'application/vnd.ant.code',
    language: 'python',
    content: `def fibonacci(n):
    """
    Calculate the Fibonacci sequence up to n terms.
    
    Args:
        n: The number of terms to generate
        
    Returns:
        A list containing the Fibonacci sequence
    """
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]
    
    # Initialize the sequence with the first two numbers
    fib_sequence = [0, 1]
    
    # Generate the sequence
    for i in range(2, n):
        # Each number is the sum of the two preceding ones
        next_number = fib_sequence[i-1] + fib_sequence[i-2]
        fib_sequence.append(next_number)
    
    return fib_sequence

# Example usage
if __name__ == "__main__":
    n_terms = 10
    result = fibonacci(n_terms)
    print(f"Fibonacci sequence with {n_terms} terms:")
    print(result)  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]`
  },
  {
    id: 'artifact-2',
    title: 'React Fibonacci Component',
    type: 'application/vnd.ant.code',
    language: 'typescript',
    content: `import React, { useState } from 'react';

const FibonacciDisplay: React.FC = () => {
  const [numTerms, setNumTerms] = useState<number>(10);
  const [sequence, setSequence] = useState<number[]>([]);

  // Calculate Fibonacci sequence
  const calculateFibonacci = (n: number): number[] => {
    if (n <= 0) return [];
    if (n === 1) return [0];
    if (n === 2) return [0, 1];

    const result = [0, 1];
    for (let i = 2; i < n; i++) {
      result.push(result[i - 1] + result[i - 2]);
    }
    
    return result;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSequence(calculateFibonacci(numTerms));
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Fibonacci Sequence Generator</h2>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            max="100"
            value={numTerms}
            onChange={(e) => setNumTerms(parseInt(e.target.value))}
            className="px-3 py-2 border rounded"
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Generate
          </button>
        </div>
      </form>
      
      {sequence.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Sequence:</h3>
          <div className="flex flex-wrap gap-2">
            {sequence.map((num, index) => (
              <div 
                key={index}
                className="px-3 py-1 bg-gray-100 rounded-full text-center"
              >
                {num}
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Visualization:</h3>
            <div className="flex items-end h-40 gap-1">
              {sequence.map((num, index) => (
                <div
                  key={index}
                  className="bg-blue-500 w-8"
                  style={{ 
                    height: `${Math.min(100, (num / Math.max(...sequence)) * 100)}%` 
                  }}
                  title={num.toString()}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FibonacciDisplay;`
  },
  {
    id: 'artifact-3',
    title: 'Fibonacci Mathematical Analysis',
    type: 'text/markdown',
    content: `# Mathematical Properties of the Fibonacci Sequence

The Fibonacci sequence has several interesting mathematical properties:

## The Golden Ratio

As the Fibonacci sequence progresses, the ratio between consecutive Fibonacci numbers approaches the golden ratio (φ ≈ 1.618033988749895):

$$\\lim_{n \\to \\infty} \\frac{F_{n+1}}{F_n} = \\phi = \\frac{1 + \\sqrt{5}}{2} \\approx 1.618033988749895$$

## Binet's Formula

The n-th Fibonacci number can be calculated directly using Binet's formula:

$$F_n = \\frac{\\phi^n - (1-\\phi)^n}{\\sqrt{5}}$$

Where φ is the golden ratio.

## Sum of Fibonacci Numbers

The sum of the first n Fibonacci numbers is equal to:

$$\\sum_{i=1}^{n} F_i = F_{n+2} - 1$$

## Sum of Squares

The sum of squares of Fibonacci numbers has a neat formula:

$$F_1^2 + F_2^2 + \\ldots + F_n^2 = F_n \\cdot F_{n+1}$$

## Relation to Pascal's Triangle

The Fibonacci sequence appears in Pascal's triangle when summing along specific diagonals.
`
  },
  {
    id: 'artifact-4',
    title: 'Fibonacci Visualization',
    type: 'image/svg+xml',
    content: `<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <style>
    .bar { fill: #4299e1; }
    .bar:hover { fill: #3182ce; }
    .label { font-size: 12px; font-family: sans-serif; text-anchor: middle; }
    .value { font-size: 10px; font-family: sans-serif; text-anchor: middle; fill: white; }
    .title { font-size: 20px; font-family: sans-serif; text-anchor: middle; font-weight: bold; }
  </style>
  
  <text x="400" y="30" class="title">Fibonacci Sequence Visualization</text>
  
  <g transform="translate(50, 50)">
    <!-- Bars representing Fibonacci numbers -->
    <rect x="0" y="280" width="30" height="20" class="bar" />
    <rect x="40" y="280" width="30" height="20" class="bar" />
    <rect x="80" y="260" width="30" height="40" class="bar" />
    <rect x="120" y="240" width="30" height="60" class="bar" />
    <rect x="160" y="210" width="30" height="90" class="bar" />
    <rect x="200" y="160" width="30" height="140" class="bar" />
    <rect x="240" y="90" width="30" height="210" class="bar" />
    <rect x="280" y="0" width="30" height="300" class="bar" />
    <rect x="320" y="0" width="30" height="300" class="bar" opacity="0.7" />
    <rect x="360" y="0" width="30" height="300" class="bar" opacity="0.5" />
    <rect x="400" y="0" width="30" height="300" class="bar" opacity="0.3" />
    <rect x="440" y="0" width="30" height="300" class="bar" opacity="0.2" />
    <rect x="480" y="0" width="30" height="300" class="bar" opacity="0.1" />
    
    <!-- Labels -->
    <text x="15" y="310" class="label">0</text>
    <text x="55" y="310" class="label">1</text>
    <text x="95" y="310" class="label">1</text>
    <text x="135" y="310" class="label">2</text>
    <text x="175" y="310" class="label">3</text>
    <text x="215" y="310" class="label">5</text>
    <text x="255" y="310" class="label">8</text>
    <text x="295" y="310" class="label">13</text>
    <text x="335" y="310" class="label">21</text>
    <text x="375" y="310" class="label">34</text>
    <text x="415" y="310" class="label">55</text>
    <text x="455" y="310" class="label">89</text>
    <text x="495" y="310" class="label">144</text>
    
    <!-- Value labels within bars -->
    <text x="15" y="295" class="value">0</text>
    <text x="55" y="295" class="value">1</text>
    <text x="95" y="280" class="value">1</text>
    <text x="135" y="270" class="value">2</text>
    <text x="175" y="255" class="value">3</text>
    <text x="215" y="230" class="value">5</text>
    <text x="255" y="195" class="value">8</text>
    <text x="295" y="150" class="value">13</text>
    <text x="335" y="150" class="value">21</text>
    <text x="375" y="150" class="value">34</text>
    <text x="415" y="150" class="value">55</text>
    <text x="455" y="150" class="value">89</text>
    <text x="495" y="150" class="value">144</text>
  </g>
  
  <g transform="translate(50, 370)">
    <text class="label">Sequence Index</text>
  </g>
  
  <g transform="translate(20, 200) rotate(-90)">
    <text class="label">Value</text>
  </g>
</svg>`
  }
];

// Mock assistant's detailed response that includes all types of content
const mockAssistantResponse: Message = {
  id: uuidv4(),
  role: 'assistant',
  content: `# Fibonacci Sequence Implementation

Sure, I'd be happy to show you how to calculate the Fibonacci sequence in Python and how to display it in React!

## What is the Fibonacci Sequence?

The Fibonacci sequence is a series of numbers where each number is the sum of the two preceding ones, usually starting with 0 and 1. So the sequence begins: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, and so on.

Mathematically, it's defined as:
$F_0 = 0$
$F_1 = 1$
$F_n = F_{n-1} + F_{n-2}$ for $n > 1$

## Python Implementation

I've created a Python function to generate the Fibonacci sequence. The code is in the attached artifact.

Key implementation details:
- We handle base cases (0, 1, or 2 terms) separately
- For larger sequences, we initialize with [0, 1] and build the sequence iteratively
- Time complexity is O(n) where n is the number of terms

## React Implementation

For the React implementation, I've created a component that:
1. Uses React hooks (useState) to manage the state
2. Provides an input field for the user to specify the number of terms
3. Displays the sequence both as numbers and as a visual bar chart
4. Includes proper TypeScript typing

See the React component in the second artifact.

## Mathematical Analysis

The Fibonacci sequence has fascinating mathematical properties, including its relationship to the Golden Ratio. See the detailed mathematical analysis in the third artifact.

## Visualization

I've also created an SVG visualization of the Fibonacci sequence growth in the fourth artifact.

Let me know if you'd like any clarification or have questions about either implementation!`,
  timestamp: new Date(),
  artifacts: mockArtifacts
};

// Add the assistant response to the mock conversation
mockConversation.messages.push(mockAssistantResponse);

// Mock API functions
export const mockChatApi = {
  sendMessage: async (conversationId: string, message: string, files: File[] = []): Promise<any> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create a new user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    // Add user message to conversation
    mockConversation.messages.push(userMessage);
    mockConversation.updatedAt = new Date();
    
    // Generate a mock response based on the user's message
    const assistantMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: generateMockResponse(message),
      timestamp: new Date(),
      artifacts: message.toLowerCase().includes('code') ? [generateMockCodeArtifact(message)] : []
    };
    
    // Add assistant message to conversation after a delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    mockConversation.messages.push(assistantMessage);
    mockConversation.updatedAt = new Date();
    
    return {
      conversation: {
        ...mockConversation,
        created_at: mockConversation.createdAt.toISOString(),
        updated_at: mockConversation.updatedAt.toISOString()
      }
    };
  },
  
  getConversations: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: mockConversation.id,
        title: mockConversation.title,
        created_at: mockConversation.createdAt.toISOString(),
        updated_at: mockConversation.updatedAt.toISOString(),
        message_count: mockConversation.messages.length
      }
    ];
  },
  
  getConversation: async (conversationId: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      ...mockConversation,
      created_at: mockConversation.createdAt.toISOString(),
      updated_at: mockConversation.updatedAt.toISOString()
    };
  },
  
  createConversation: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Reset mock conversation to initial state
    mockConversation.messages = [
      {
        id: uuidv4(),
        role: 'user',
        content: 'Hello! Can you help me get started with a project?',
        timestamp: new Date()
      }
    ];
    mockConversation.createdAt = new Date();
    mockConversation.updatedAt = new Date();
    
    return {
      ...mockConversation,
      created_at: mockConversation.createdAt.toISOString(),
      updated_at: mockConversation.updatedAt.toISOString()
    };
  }
};

// Helper function to generate mock responses
function generateMockResponse(message: string): string {
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    return "Hello! How can I help you today?";
  }
  
  if (message.toLowerCase().includes('code') || message.toLowerCase().includes('programming')) {
    return "I'd be happy to help with your coding question. Here's an example implementation:";
  }
  
  if (message.toLowerCase().includes('math') || message.toLowerCase().includes('equation')) {
    return `Let me explain this mathematical concept.

The solution to this equation can be expressed as:

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

This is known as the quadratic formula and is used to solve equations in the form $ax^2 + bx + c = 0$.`;
  }
  
  // Default response
  return `Thank you for your message. I've analyzed what you're asking about, and here's what I can tell you:

1. The concept you're referring to has several interesting aspects
2. There are multiple approaches to address this
3. I can provide more specific information if you could clarify your question

Would you like me to elaborate on any particular aspect?`;
}

// Helper function to generate a mock code artifact
function generateMockCodeArtifact(message: string): Artifact {
  if (message.toLowerCase().includes('python')) {
    return {
      id: uuidv4(),
      title: 'Python Example',
      type: 'application/vnd.ant.code',
      language: 'python',
      content: `def greet(name):
    """A simple greeting function"""
    return f"Hello, {name}!"

def calculate_stats(numbers):
    """Calculate basic statistics for a list of numbers"""
    if not numbers:
        return None
    
    stats = {
        "count": len(numbers),
        "sum": sum(numbers),
        "average": sum(numbers) / len(numbers),
        "min": min(numbers),
        "max": max(numbers)
    }
    
    return stats

# Example usage
if __name__ == "__main__":
    print(greet("World"))
    
    data = [10, 15, 20, 25, 30]
    result = calculate_stats(data)
    print(f"Statistics for {data}:")
    for key, value in result.items():
        print(f"{key}: {value}")`
    };
  }
  
  if (message.toLowerCase().includes('javascript') || message.toLowerCase().includes('react')) {
    return {
      id: uuidv4(),
      title: 'React Component',
      type: 'application/vnd.ant.code',
      language: 'typescript',
      content: `import React, { useState, useEffect } from 'react';

interface DataItem {
  id: number;
  name: string;
  value: number;
}

const DataVisualization: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real app, this would be an API call
        const mockData: DataItem[] = [
          { id: 1, name: 'Alpha', value: 45 },
          { id: 2, name: 'Beta', value: 72 },
          { id: 3, name: 'Gamma', value: 18 },
          { id: 4, name: 'Delta', value: 56 },
          { id: 5, name: 'Epsilon', value: 30 }
        ];
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setData(mockData);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (isLoading) {
    return <div>Loading data...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Data Visualization</h2>
      
      <div className="flex items-end h-60 gap-2">
        {data.map(item => (
          <div key={item.id} className="flex flex-col items-center">
            <div 
              className="w-16 bg-blue-500 rounded-t"
              style={{ height: \`\${item.value * 2}px\` }}
            />
            <div className="mt-2 text-sm">{item.name}</div>
            <div className="text-xs text-gray-500">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataVisualization;`
    };
  }
  
  // Default code artifact
  return {
    id: uuidv4(),
    title: 'Code Example',
    type: 'application/vnd.ant.code',
    language: 'javascript',
    content: `// A simple JavaScript function
function processData(data) {
  const results = [];
  
  // Process each item
  for (const item of data) {
    const processed = {
      id: item.id,
      name: item.name.toUpperCase(),
      value: item.value * 2,
      category: categorize(item.value)
    };
    
    results.push(processed);
  }
  
  return results;
}

// Helper function to categorize values
function categorize(value) {
  if (value < 10) return 'low';
  if (value < 50) return 'medium';
  return 'high';
}

// Example usage
const sampleData = [
  { id: 1, name: 'first item', value: 5 },
  { id: 2, name: 'second item', value: 25 },
  { id: 3, name: 'third item', value: 75 }
];

const processed = processData(sampleData);
console.log(processed);`
  };
}