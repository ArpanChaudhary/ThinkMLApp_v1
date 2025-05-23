import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import getBotResponse from '../engine/thinkBotEngine';
import ChatBubble from './ChatBubble';
import axios from 'axios';

// Animations
const slideIn = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const typing = keyframes`
  0% { content: '.'; }
  33% { content: '..'; }
  66% { content: '...'; }
  100% { content: '.'; }
`;

// Styled Components
const ThinkBotContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  width: 400px;
  max-width: 95vw;
  height: 600px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  /* animation: ${slideIn} 0.3s ease-out; */
`;

const ChatHeader = styled.div`
  background: #2c3e50;
  color: white;
  padding: 15px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`;

const ChatBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: #f8f9fa;
`;

const InputContainer = styled.div`
  padding: 15px;
  background: white;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #3498db;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: #3498db;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;

  &:hover {
    background: #2980b9;
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const OptionButton = styled(Button)`
  background: #e9ecef;
  color: #2c3e50;
  font-size: 13px;
  padding: 6px 12px;

  &:hover {
    background: #dee2e6;
  }
`;

const TypingIndicator = styled.div`
  color: #666;
  font-size: 14px;
  padding: 10px;
  animation: ${fadeIn} 0.3s ease-out;

  &::after {
    content: '.';
    animation: ${typing} 1.5s infinite;
  }
`;

const ThinkBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [stage, setStage] = useState('welcome');
  const [options, setOptions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState({
    user: null,
    progress: {
      completedLessons: [],
      currentLesson: null,
      quizScores: {}
    }
  });
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize chat on mount with greeting and options
  useEffect(() => {
    setMessages([
      { type: 'bot', content: "Hi! I'm ThinkBot. Welcome to ThinkMLApp." },
      { type: 'bot', content: "Are you a new user or already registered?" }
    ]);
    setOptions(["Register", "Login"]);
    setStage('welcome');
  }, []);

  const handleAuthResponse = async (response, isLogin = false) => {
    if (response.status === 'success') {
      setContext(prev => ({
        ...prev,
        user: response.user
      }));
      setStage('onboarding');
      return true;
    } else {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: response.message || 'An error occurred. Please try again.'
      }]);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsTyping(true);
    setIsLoading(true);

    try {
      // Handle authentication stages
      if (stage === 'register_identifier') {
        setContext(prev => ({ ...prev, tempIdentifier: userMessage }));
        setMessages(prev => [...prev, { type: 'bot', content: 'Please set a password (minimum 6 characters):' }]);
        setStage('register_password');
        setIsTyping(false);
        setIsLoading(false);
        return;
      }

      if (stage === 'register_password') {
        const identifier = context.tempIdentifier;
        try {
          const response = await axios.post('http://localhost:5000/register', {
            identifier,
            password: userMessage
          });
          await handleAuthResponse(response.data);
        } catch (error) {
          setMessages(prev => [...prev, {
            type: 'bot',
            content: error.response?.data?.message || 'Unable to connect to server. Please try again.'
          }]);
        }
        setIsTyping(false);
        setIsLoading(false);
        return;
      }

      if (stage === 'login_identifier') {
        setContext(prev => ({ ...prev, tempIdentifier: userMessage }));
        setMessages(prev => [...prev, { type: 'bot', content: 'Please enter your password:' }]);
        setStage('login_password');
        setIsTyping(false);
        setIsLoading(false);
        return;
      }

      if (stage === 'login_password') {
        const identifier = context.tempIdentifier;
        try {
          const response = await axios.post('http://localhost:5000/login', {
            identifier,
            password: userMessage
          });
          await handleAuthResponse(response.data, true);
        } catch (error) {
          setMessages(prev => [...prev, {
            type: 'bot',
            content: error.response?.data?.message || 'Invalid credentials. Try again.'
          }]);
        }
        setIsTyping(false);
        setIsLoading(false);
        return;
      }

      // Handle other stages
      const response = await getBotResponse(userMessage, context);
      
      if (response.messages) {
        setMessages(prev => [...prev, ...response.messages]);
      }
      
      if (response.stage) {
        setStage(response.stage);
      }
      
      if (response.options) {
        setOptions(response.options);
      }

      if (response.navigate) {
        navigate(response.navigate);
      }

    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: error.response?.data?.message || 'Unable to connect to server. Please try again.'
      }]);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleButtonClick = async (option) => {
    setMessages(prev => [...prev, { type: 'user', content: option }]);
    setIsTyping(true);
    setIsLoading(true);

    try {
      // Handle welcome stage for Register/Login
      if (stage === 'welcome') {
        if (option === 'Register') {
          setMessages(prev => [...prev, { type: 'bot', content: 'Please enter your identifier (email or phone):' }]);
          setStage('register_identifier');
          setOptions([]);
          setIsTyping(false);
          setIsLoading(false);
          return;
        }
        if (option === 'Login') {
          setMessages(prev => [...prev, { type: 'bot', content: 'Please enter your identifier (email or phone):' }]);
          setStage('login_identifier');
          setOptions([]);
          setIsTyping(false);
          setIsLoading(false);
          return;
        }
      }
      const response = await getBotResponse(option, context);
      if (response.messages) {
        setMessages(prev => [...prev, ...response.messages]);
      }
      if (response.stage) {
        setStage(response.stage);
      }
      if (response.options) {
        setOptions(response.options);
      }
      if (response.navigate) {
        navigate(response.navigate);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: error.response?.data?.message || 'Unable to connect to server. Please try again.'
      }]);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  return (
    <ThinkBotContainer>
      <ChatHeader>
        <span>🤖 ThinkBot</span>
      </ChatHeader>
      <ChatBody ref={messagesEndRef}>
        {messages.map((message, index) => (
          <ChatBubble
            key={index}
            type={message.type}
            text={message.content}
          />
        ))}
        {isTyping && <TypingIndicator>ThinkBot is responding</TypingIndicator>}
        {options.length > 0 && (
          <OptionsContainer>
            {options.map((option, index) => (
              <OptionButton
                key={index}
                onClick={() => handleButtonClick(option)}
              >
                {option}
              </OptionButton>
            ))}
          </OptionsContainer>
        )}
      </ChatBody>
      <InputContainer>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isTyping || isLoading}
          />
          <Button type="submit" disabled={isTyping || isLoading || !input.trim()}>
            Send
          </Button>
        </form>
      </InputContainer>
    </ThinkBotContainer>
  );
};

export default ThinkBot; 