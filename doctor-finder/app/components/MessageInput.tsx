// MessageInput.tsx
'use client';

import React, { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';// get stuff from Firebase Storage
import { app } from "../authcontext"; // Import Firebase app
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, Smile, X, Paperclip } from "lucide-react";
import { useTheme } from 'next-themes';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDropzone } from 'react-dropzone';

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
  const [isDragActive, setIsDragActive] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const selectedFile = acceptedFiles[0];
      if (selectedFile) {
        setFile(selectedFile);
        // Display image preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      }
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1
  });

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

  const handleDialogOpen = () => {
    // if there's an image already uploaded (either from preview or final upload)
    if (imagePreview || image) {
      // if we have a final uploaded image but no preview, create a preview from it
      if (image && !imagePreview) {
        setImagePreview(image);
      }
    }
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    // don't reset the imagePreview here so it persists between dialog opens
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() || image) {
        sendMessage();
      }
    }
  };

  const handleDeleteImage = async () => {
    try {
      // if there's an uploaded image in Firebase storage
      if (image) {
        // create a reference to the image in Firebase storage
        const storage = getStorage(app);
        const imageRef = ref(storage, image);
        
        try {
          // delete the image from Firebase storage
          await deleteObject(imageRef);
          console.log("Image deleted from storage successfully");
        } catch (error) {
          console.error("Error deleting image from storage:", error);
          // continue with UI cleanup even if storage deletion fails
        }
      }
      
      // clear all states
      setImage(null);
      setFile(null);
      setImagePreview(null);
      setUploadProgress(null);
    } catch (error) {
      console.error("Error in handleDeleteImage:", error);
    }
  };

  return (
    <div className='flex items-center'>
      <div className='relative flex-1 flex items-center gap-2 p-2 border border-gray-300 dark:border-zinc-800 rounded-full'>
        <Button 
          variant="outline" 
          size="icon"
          className="h-8 w-8 rounded-full shrink-0"
          onClick={handleDialogOpen}
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
        <DialogContent className="sm:max-w-[500px] w-[90vw] max-w-[90vw] rounded-lg">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
            <DialogDescription>
              Upload an image to send in your message
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* preview section - show either the preview or the uploaded image */}
            {(imagePreview || image) && (
              <div className="flex flex-col items-center gap-2">
                <div className="relative max-w-full rounded-md overflow-hidden">
                  <img
                    src={imagePreview || image || ''}
                    alt="Preview"
                    className="max-h-[300px] w-auto object-contain"
                  />
                  
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
            )}

            {/* dropzone section */}
            <div
              {...getRootProps()}
              className={`p-8 border-2 border-dashed rounded-lg cursor-pointer
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800'
                }
                hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}
            >
              <input {...getInputProps()} />
              {uploadProgress !== null ? (
                <p className="text-center text-gray-500 dark:text-gray-400">Uploading...</p>
              ) : isDragActive ? (
                <p className="text-center text-blue-500 dark:text-blue-400">Drop the image here...</p>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Drag and drop an image here, or click to select
                </p>
              )}
            </div>
              
            <div className="flex justify-end gap-2">
              {(imagePreview || image) && (
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteImage}
                >
                  <X className="h-4 w-4 mr-2" />
                  {image ? "Delete Image" : "Remove Image"}
                </Button>
              )}
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MessageInput;