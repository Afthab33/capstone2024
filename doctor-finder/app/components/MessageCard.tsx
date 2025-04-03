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
    const baseStyles = 'break-words';
    const isLongMessage = message.content.length > 75;
    // don't apply background styling to image-only messages
    if (message.image && !message.content) {
      return `${baseStyles} self-${isMessageFromMe ? 'end' : 'start'}`;
    }
    
    const roundedStyle = isLongMessage 
      ? 'rounded-xl px-4 py-2 max-w-[75%]' 
      : 'rounded-full px-4 py-2';
    
    if (isMessageFromMe) {
      return `${baseStyles} ${roundedStyle} bg-primary dark:text-zinc-800 text-white self-end`;
    }
    return `${baseStyles} ${roundedStyle} bg-neutral-200 dark:bg-zinc-800 dark:text-zinc-100 text-neutral-600 self-start`;
  };

  const getImageStyles = () => {
    return 'rounded-lg max-h-60 w-auto';
  };

  // if we have both image and text, render them as separate messages
  if (message.image && message.content) {
    return (
      <div key={message.id} className={`flex flex-col ${isConsecutive ? 'mb-3' : 'mb-3'} ${isMessageFromMe ? 'items-end' : 'items-start'} w-full`}>
        {/* image message */}
        <div className={`flex items-start ${isMessageFromMe ? 'flex-row-reverse' : 'flex-row'} gap-2 max-w-full`}>
          {!isConsecutive ? (
            <img
              className='w-10 h-10 rounded-full overflow-hidden flex-shrink-0'
              src={isMessageFromMe ? me.profileImage : other.profileImage || "/profpic.png"}
              alt='Avatar'
            />
          ) : (
            <div className="w-10 h-10 flex-shrink-0"></div> 
          )}
          
          <div className={`self-${isMessageFromMe ? 'end' : 'start'}`}>
            <img src={message.image} className={getImageStyles()} alt="Message attachment" />
          </div>
        </div>
        
        {/* text message */}
        <div className={`flex items-start ${isMessageFromMe ? 'flex-row-reverse' : 'flex-row'} gap-2 max-w-full`}>
          <div className="w-10 h-10 flex-shrink-0"></div>
          <div className={getMessageContainerStyles()}>
            <p className="text-md overflow-wrap-anywhere">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  // regular message (image only or text only)
  return (
    <div key={message.id} className={`flex ${isConsecutive ? 'mb-3' : 'mb-3'} ${isMessageFromMe ? 'justify-end' : 'justify-start'} w-full`}>
      <div className={`flex items-start ${isMessageFromMe ? 'flex-row-reverse' : 'flex-row'} gap-2 max-w-full`}>
        {!isConsecutive ? (
          <img
            className='w-10 h-10 rounded-full overflow-hidden flex-shrink-0'
            src={isMessageFromMe ? me.profileImage : other.profileImage || "/profpic.png"}
            alt='Avatar'
          />
        ) : (
          <div className="w-10 h-10 flex-shrink-0"></div> 
        )}
        
        <div className={getMessageContainerStyles()}>
          {message.image && (
            <img src={message.image} className={getImageStyles()} alt="Message attachment" />
          )}
          {message.content && (
            <p className="text-md overflow-wrap-anywhere">{message.content}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageCard;