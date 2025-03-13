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
      {/* Logo */}
      <div className="text-blue-400 font-bold">
        Research-Agent
      </div>

      {/* Login Button */}
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
  const suggestRef = useRef<HTMLInputElement>(null)
  const [topic, setTopic] = useState('')
  const [summary, setSummary] = useState('')
  const [sources, setSources] = useState([])

  //auto scroll
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (): Promise<void> => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const botMessage: Message = { sender: 'bot', text: '', isStreaming: true };
    setMessages((prev) => [...prev, botMessage]);

    try {
      const response = await axios.post(
        'http://localhost:5000/research',
        { topic: input }
      );
      
      //setBotRes(response.data.results)
      //console.log(input)
      setSummary(response.data.summary)
      setSources(response.data.sources)
      setTopic(response.data.topic)
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };


  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <Navbar />
      <div className="flex flex-col md:flex-row items-start justify-center p-4 gap-4">
        <div className="w-full md:w-2/4 overflow-y-auto bg-gray-800 rounded-lg h-[648px] p-2
          [&::-webkit-scrollbar]:w-2
              [&::-webkit-scrollbar-track]:rounded-full
              [&::-webkit-scrollbar-track]:bg-gray-100
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-gray-300
              dark:[&::-webkit-scrollbar-track]:bg-neutral-700
              dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
          <h2 className="text-xl font-bold text-center">Result</h2>
          {
            topic? <h1 className='text-xl text-center'>Topic: {topic}</h1> : ''
          }
          
          {
            summary? <p>{summary}</p> : ''
          }
          {sources.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {sources.map((s, index) => (
                  <li key={index}>
                    <p>{s.title}:  <a className='text-blue-800' href={s.url}>Link</a></p>
                  </li>
                ))}
              </ul>
            ) : (
              ''
            )}
        </div>

        {/* Right Panel: Chatbot */}
        <div className="w-full md:w-2/4 flex flex-col h-[648px]">
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
                    <span>Typing...</span>
                  ) : msg.results ? (
                    <ul className="space-y-1">
                      {msg.results.map((movie, idx) => {
                        const keys = Object.keys(movie);
                        const titleKey = keys[0]; // First key (e.g., title)
                        const secondKey = keys[1]; // Second key (e.g., popularity, vote_average)
                        const secondValue = secondKey && typeof movie[secondKey] === 'number'
                          ? movie[secondKey].toFixed(1)
                          : '-';
                        return (
                          <li key={idx} className="flex justify-between gap-5">
                            <span>{movie[titleKey] || 'Movie'}</span>
                            <span className="font-semibold">{secondValue}</span>
                          </li>
                        );
                      })}
                    </ul>
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
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;