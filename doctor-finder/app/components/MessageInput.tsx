// MessageInput.tsx
'use client';

import React, { useState } from 'react';
import { FaPaperclip, FaPaperPlane } from 'react-icons/fa';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';// get stuff from Firebase Storage
import { app } from "../authcontext"; // Import Firebase app
import EmojiPicker from 'emoji-picker-react';

interface MessageInputProps {
  sendMessage: () => void;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  image: string | null;
  setImage: React.Dispatch<React.SetStateAction<string | null>>;
}

function MessageInput({ sendMessage, message, setMessage, image, setImage }: MessageInputProps) {
  const storage = getStorage(app);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
      // Display image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string); // Casting to string since FileReader result is string | ArrayBuffer | null
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      console.error('No file selected.');
      return;
    }

    const storageRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Error uploading file:', error.message);
      },
      () => {
        // Upload complete, get download URL and log it
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // console.log('File available at', downloadURL);
          // Reset file state and update message with download URL
          setFile(null);
          setImage(downloadURL);
          // Clear image preview
          setImagePreview(null);
          // weird style but gets rid of typescript warning
          const modal = document.getElementById('my_modal_3') as HTMLDialogElement;
          modal?.close();
        });
      }
    );
  };

  const handleEmojiClick = (emojiData: any) => {
    setMessage((prevMessage) => prevMessage + emojiData.emoji);
  };

  return (
    <div className='relative flex items-center p-4 border-t border-gray-200'>
      {/* Attach file/image */}
      <FaPaperclip
        onClick={() => {
          const modal = document.getElementById('my_modal_3') as HTMLDialogElement;
          modal?.showModal();
        }}
        className={`${image ? "text-blue-500" : "text-gray-500"} mr-2 cursor-pointer`}
      />

      {/* Emoji Picker Button */}
      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
        💊
      </button>

      {showEmojiPicker && (
        <div className='absolute right-100 bottom-full p-2'>
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        type='text'
        placeholder='Type a message...'
        className='flex-1 border-none p-2 outline-none'
      />

      <FaPaperPlane onClick={sendMessage} className='text-blue-500 cursor-pointer ml-2' />

      {/* Image Upload Modal */}
      <dialog id="my_modal_3" className="modal bg-gray-100">
        <div className="modal-box relative p-6 bg-white rounded-xl shadow-sm max-w-sm mx-auto">
          <form method="dialog" className="space-y-4">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Uploaded"
                className="max-h-60 w-60 rounded-md shadow mb-4 object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
            />
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleUpload}
                className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
              >
                Upload
              </button>
            </div>
            {uploadProgress != null && (
              <progress
                value={uploadProgress}
                max="100"
                className="w-full h-2 rounded-full overflow-hidden bg-gray-300 mt-2"
              ></progress>
            )}
          </form>
          <button
            onClick={() => {
              const modal = document.getElementById('my_modal_3') as HTMLDialogElement;
              modal?.close();
            }}
            className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      </dialog>
    </div>
  );
}

export default MessageInput;