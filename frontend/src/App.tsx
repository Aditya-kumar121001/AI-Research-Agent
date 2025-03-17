import React, { useState, useEffect, KeyboardEvent, useRef } from 'react';
import axios from 'axios';

interface Source {
  title: string;
  url: string;
}

interface ResearchState {
  summary: string;
  sources: Source[];
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
  isStreaming?: boolean;
}

// Navbar Component
const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-900 text-white py-2 px-4 flex justify-between items-center">
      <div className="text-blue-400 font-bold">Research-Agent</div>
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-4 rounded">
        Log in
      </button>
    </nav>
  );
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const suggestRef = useRef<HTMLInputElement>(null);
  const [topic, setTopic] = useState('');
  const [summary, setSummary] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Auto scroll to the latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; 
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        setInput(transcript);
        sendMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: `Speech recognition error: ${event.error}`, isStreaming: false },
        ]);
        setIsListening(false);
      };
    } else {
      console.warn('SpeechRecognition API not supported in this browser.');
    }
  }, []);

  const sendMessage = async (): Promise<void> => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Simulated task sequence
    const tasks = [
      "Starting...",
      "Generating query...",
      "Performing search...",
      "Summarizing...",
      "Reflecting...",
      "Deciding next step...",
      "Finalizing...",
    ];
    let taskIndex = 0;

    const botMessage: Message = { sender: 'bot', text: tasks[taskIndex], isStreaming: true };
    setMessages((prev) => [...prev, botMessage]);

    // Simulate task updates every 500ms
    const taskInterval = setInterval(() => {
      taskIndex++;
      if (taskIndex < tasks.length) {
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg.isStreaming) {
            return [...prev.slice(0, -1), { ...lastMsg, text: tasks[taskIndex] }];
          }
          return prev;
        });
      }
    }, 2000);

    try {
      const response = await axios.post('http://localhost:5000/research', { topic: input });
      clearInterval(taskInterval);
      
      setSummary(response.data.summary);
      setSources(response.data.sources);
      const topicValue = response.data.topic || input;
      setTopic(topicValue ? topicValue.charAt(0).toUpperCase() + topicValue.slice(1) : '');
      
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        return [...prev.slice(0, -1), { sender: 'bot', text: 'Research complete!', isStreaming: false }];
      });
    } catch (error) {
      console.error('Error sending message:', error);
      clearInterval(taskInterval);
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        return [...prev.slice(0, -1), { sender: 'bot', text: 'Error occurred', isStreaming: false }];
      });
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  //Speachh to text
  const startSpeaking = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }


  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Navbar */}
      <Navbar />
      <div className="flex flex-col md:flex-row items-start justify-center p-4 gap-4">
        <div className="w-full md:w-3/5 overflow-y-auto bg-gray-800 rounded-lg h-[648px] p-2 text-justify px-4
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-track]:rounded-full
          [&::-webkit-scrollbar-track]:bg-gray-100
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-gray-300
          dark:[&::-webkit-scrollbar-track]:bg-neutral-700
          dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
          {topic ? <h1 className="text-xl text-center font-bold m-2">{topic.toUpperCase()}</h1> : ''}
          {summary ? <p>{summary}</p> : ''}
          {sources.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {sources.map((s, index) => (
                <li key={index}>
                  
                  {/* {s.title = s.title.replace(/.../g, '').trim()} */}
                  <p>{s.title.replace(/\.\.\.$/, '')}: <a className="text-blue-800" href={s.url}>Link</a></p>
                </li>
              ))}
            </ul>
          ) : (
            ''
          )}
        </div>

        {/* Right Panel: Chatbot */}
        <div className="w-full md:w-2/5 flex flex-col h-[648px]">
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto mb-4 bg-gray-800 p-4 rounded-lg 
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-track]:bg-gray-100
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gray-300
            dark:[&::-webkit-scrollbar-track]:bg-neutral-700
            dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div
                  className={`inline-block p-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  {msg.isStreaming ? (
                    <span>{msg.text}</span>
                  ) : (
                    <pre className="whitespace-pre-wrap break-words">{msg.text}</pre>
                  )}
                </div>
                <div ref={chatEndRef} /> {/* Invisible div to scroll to */}
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="w-full flex items-center bg-gray-800 rounded-lg p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              ref={suggestRef}
              placeholder="Ask a question"
              className="flex-1 bg-transparent outline-none p-2 text-white placeholder-gray-400 text-sm"
            />
            <button
              onClick={sendMessage}
              className="p-2 text-gray-400 hover:text-white transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
            <button 
              onClick={startSpeaking}
              className={`p-2 ${isListening ? 'text-red-500' : 'text-gray-400'} hover:text-white transition`}
              disabled={!recognitionRef.current}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
            </button>
            
            

          </div>
        </div>
      </div>
    </div>
  );
};

export default App;