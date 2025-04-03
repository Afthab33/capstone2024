// MessageInput.tsx
'use client';

import React, { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';// get stuff from Firebase Storage
import { app } from "../authcontext"; // Import Firebase app
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, Smile, X, Paperclip } from "lucide-react";
import { useTheme } from 'next-themes';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { theme } = useTheme();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
      // Display image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
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
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFile(null);
          setImage(downloadURL);
          setImagePreview(null);
          setIsDialogOpen(false);
          setUploadProgress(null);
        });
      }
    );
  };

  const handleEmojiClick = (emojiData: any) => {
    setMessage((prevMessage) => prevMessage + emojiData.emoji);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setImagePreview(null);
    setFile(null);
    setUploadProgress(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() || image) {
        sendMessage();
      }
    }
  };

  return (
    <div className='flex items-center'>
      <div className='relative flex-1 flex items-center gap-2 p-2 border border-gray-300 dark:border-zinc-800 rounded-full'>
        <Button 
          variant="outline" 
          size="icon"
          className="h-8 w-8 rounded-full shrink-0"
          onClick={() => setIsDialogOpen(true)}
        >
          <Paperclip className={`${image ? "text-primary" : "text-muted-foreground"} h-4 w-4`} />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full shrink-0"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Smile className="h-4 w-4 text-muted-foreground" />
        </Button>

        {showEmojiPicker && (
          <div className='absolute right-100 bottom-full p-2'>
            {/* light theme picker */}
            <div className={theme === 'dark' ? 'hidden' : ''}>
              <EmojiPicker 
                theme={Theme.LIGHT}
                onEmojiClick={handleEmojiClick}
                width={300}
                height={400}
                searchPlaceholder="Search emoji..."
                skinTonesDisabled={false}
                autoFocusSearch={false}
                lazyLoadEmojis={true}
                previewConfig={{
                  showPreview: true,
                  defaultCaption: "Pick your emoji..."
                }}
              />
            </div>
            
            {/* dark theme picker */}
            <div className={theme === 'light' ? 'hidden' : ''}>
              <EmojiPicker 
                theme={Theme.DARK}
                onEmojiClick={handleEmojiClick}
                width={300}
                height={400}
                searchPlaceholder="Search emoji..."
                skinTonesDisabled={false}
                autoFocusSearch={false}
                lazyLoadEmojis={true}
                previewConfig={{
                  showPreview: true,
                  defaultCaption: "Pick your emoji..."
                }}
              />
            </div>
          </div>
        )}

        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder='Type a message...'
          className='flex-1 border-none text-4xl shadow-none focus-visible:ring-0'
        />

        <Button 
          variant="outline"
          size="icon"
          onClick={sendMessage}
          className="h-8 w-8 shrink-0 rounded-full"
        >
          <ArrowUp className="h-4 w-4 text-primary" />
        </Button>
      </div>

      {/* image upload dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] w-[90vw] max-w-[90vw] rounded-lg">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
            <DialogDescription>
              Upload an image to send in your message
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* preview section */}
            {imagePreview && (
              <div className="flex justify-center">
                <div className="relative w-60 h-60 rounded-md overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* file input section */}
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 dark:file:bg-zinc-800 dark:file:text-zinc-300 dark:hover:file:bg-zinc-700"
              />
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={!file || uploadProgress !== null}
                >
                  {uploadProgress !== null ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
              
              {uploadProgress !== null && (
                <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MessageInput;