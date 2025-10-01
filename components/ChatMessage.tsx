import React from 'react';

interface ChatMessageProps {
  role: 'user' | 'model';
  text: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, text }) => {
  const isUser = role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
          <i className="fa-solid fa-robot text-white text-sm"></i>
        </div>
      )}
      <div
        className={`max-w-xs md:max-w-md p-3 rounded-2xl shadow-sm ${
          isUser
            ? 'bg-indigo-600 text-white rounded-br-none'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
        }`}
      >
        <p className="text-sm break-words">{text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
