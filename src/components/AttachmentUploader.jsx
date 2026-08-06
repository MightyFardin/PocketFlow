import React, { useState, useRef } from 'react';
import { Upload, X, File, Image as ImageIcon, Loader2 } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

const AttachmentUploader = ({ attachments = [], onUploadComplete, onRemoveAttachment }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }
    
    uploadFile(file);
  };

  const uploadFile = (file) => {
    if (!storage) {
      alert("Firebase Storage is not initialized.");
      return;
    }
    
    setIsUploading(true);
    setProgress(0);

    // Create a unique file name
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `attachments/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(prog);
      },
      (error) => {
        console.error("Upload failed:", error);
        setIsUploading(false);
        alert("Upload failed. Please try again.");
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setIsUploading(false);
        
        const newAttachment = {
          name: file.name,
          url: downloadURL,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          size: file.size,
          createdAt: new Date().toISOString()
        };
        
        onUploadComplete(newAttachment);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,.pdf,.doc,.docx"
        />
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full flex items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all disabled:opacity-50"
        >
          {isUploading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Uploading... {Math.round(progress)}%</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-6 h-6 mb-2" />
              <span className="font-medium text-sm">Click to upload receipt or document</span>
              <span className="text-xs mt-1 opacity-70">PNG, JPG, PDF up to 5MB</span>
            </div>
          )}
        </button>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-1 gap-2">
          {attachments.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-black/20">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-white dark:bg-slate-800 rounded text-slate-400 shrink-0 shadow-sm">
                  {file.type === 'image' ? <ImageIcon className="w-4 h-4" /> : <File className="w-4 h-4" />}
                </div>
                <div className="overflow-hidden">
                  <a href={file.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate block hover:text-blue-500 hover:underline">
                    {file.name}
                  </a>
                  <p className="text-[10px] text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => onRemoveAttachment(file)}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttachmentUploader;
