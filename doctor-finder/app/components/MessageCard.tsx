// MessageCard.tsx
import React from 'react';
import moment from 'moment';
import { Timestamp } from 'firebase/firestore';

// Define the types for the props
interface Message {
  id: string;
  senderId: string;
  content: string;
  time: Timestamp;
  image?: string;
}

interface User {
  id: string;
  profileImage: string;
}

interface MessageCardProps {
  message: Message;
  me: User;
  other: User;
  isConsecutive?: boolean;
}

function MessageCard({ message, me, other, isConsecutive = false }: MessageCardProps) {
  const isMessageFromMe = message.senderId === me.id;
  
  const formatTimeAgo = (time: Timestamp) => {
    const date = time?.toDate();
    const momentDate = moment(date);
    return momentDate.fromNow();
  };

  const getMessageContainerStyles = () => {
    const baseStyles = '';
    const roundedStyle = message.image ? 'rounded-lg px-2 py-2' : 'rounded-full px-4 py-2';
    
    if (isMessageFromMe) {
      return `${baseStyles} ${roundedStyle} bg-primary dark:text-zinc-800 text-white self-end`;
    }
    return `${baseStyles} ${roundedStyle} bg-neutral-200 dark:bg-zinc-800 dark:text-zinc-100 text-neutral-600 self-start`;
  };

  const getImageStyles = () => {
    const baseStyles = 'rounded-lg max-h-60 w-auto ';
    if (message.image) {
      return isMessageFromMe 
        ? `${baseStyles}` 
        : `${baseStyles}`;
    }
    return '';
  };

  return (
    <div key={message.id} className={`flex ${isConsecutive ? 'mb-3' : 'mb-3'} ${isMessageFromMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start ${isMessageFromMe ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
        {!isConsecutive ? (
          <img
            className='w-10 h-10 rounded-full overflow-hidden'
            src={isMessageFromMe ? me.profileImage : other.profileImage || "/profpic.png"}
            alt='Avatar'
          />
        ) : (
          <div className="w-10 h-10"></div> 
        )}
        
        <div className={getMessageContainerStyles()}>
          {message.image && (
            <img src={message.image} className={getImageStyles()} alt="Message attachment" />
          )}
          <p className={`text-md ${message.image ? 'mt-1' : ''}`}>{message.content}</p>
        </div>
      </div>
    </div>
  );
}

export default MessageCard;