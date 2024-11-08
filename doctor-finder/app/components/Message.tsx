import React from 'react'

function Message() {
  return (
    <div className="relative w-fit bg-blue-400 p-2 rounded-lg">
        <p className="text-sm absolute -top-5">Sender Name</p>
        <p >Message</p>
        <p className="text-xs text-right">Time</p>
    </div>
  )
}

export default Message
