import React from 'react';
import styled from 'styled-components';

const BubbleContainer = styled.div`
  display: flex;
  justify-content: ${props => props.type === 'bot' ? 'flex-start' : 'flex-end'};
  margin: 5px 0;
`;

const Bubble = styled.div`
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 15px;
  background: ${props => props.type === 'bot' ? '#f0f2f5' : '#3498db'};
  color: ${props => props.type === 'bot' ? '#2c3e50' : 'white'};
  font-size: 14px;
  line-height: 1.4;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ChatBubble = ({ type, text }) => {
  return (
    <BubbleContainer type={type}>
      <Bubble type={type}>
        {text}
      </Bubble>
    </BubbleContainer>
  );
};

export default ChatBubble; 