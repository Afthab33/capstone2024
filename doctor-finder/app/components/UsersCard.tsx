import React from 'react';

interface UsersCardProps {
  name: string;              // Required prop
  latestMessage?: string;     // Required prop
  type: string;              // Required prop
  time?: string;             // Optional prop
  avatarUrl?: string;        // Optional prop
  email?: string;
}

// Reminder: put a default image
// function UsersCard({ name, latestMessage, type, time, avatarUrl }) {
function UsersCard({ name, latestMessage, type, time, avatarUrl = "https://th.bing.com/th/id/OIP.HsRS97pdiTGR5gobxacKjgHaH4?pid=ImgDet&w=200&h=213&c=7&dpr=1.3", email}: UsersCardProps) {
  return (
    <div className="flex items-center p-4 border-b border-gray-200 relative hover:cursor-pointer">

      {/* Avatar on the left find image later when marcus does images */}
      <div className="flex-shrink-0 mr-4 relative">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <img className="w-full h-full object-cover" src={avatarUrl} alt="Avatar" />
        </div>
        
      </div>
        
        {/* Format for Chatrooms need name, time, lastMessage*/}
        {
        type == "chat" &&
        /* Name, latest message, and time on the right */
          <div className="flex-1">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{name}</h2>
                <span className='text-xs text-gray-500'>{time}</span>
             </div>
            <p className="text-gray-500 truncate">{latestMessage}</p>
         </div>
        }

        {/* Format for Online Users just need name*/}
        {
           type == "users" &&
              /* Name */
          <div className="flex-1">
             <div className="flex flex-col items-start">
                <h2 className="text-lg font-semibold">{name}</h2>
                <span className='text-xs text-gray-500'>{email}</span>
             </div>
          </div>
        }
      

    </div>
  );
}

export default UsersCard;