'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, CheckCircle, AlertCircle, FileText, Mic, Image } from 'lucide-react'
import { useFileUpload } from '../../hooks/useApi'
import toast from 'react-hot-toast'

interface UploadedFile {
  id: string
  file: File
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
  taskId?: string
}

export function FileUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const { uploadFile, uploading, uploadProgress, uploadError } = useFileUpload()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'uploading' as const,
      progress: 0
    }))
    
    setFiles(prev => [...prev, ...newFiles])
    
    // Upload each file to backend
    for (const uploadedFile of newFiles) {
      try {
        const response = await uploadFile(uploadedFile.file)
        
        if (response) {
          // Update file status to processing
          setFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, status: 'processing', progress: 100, taskId: response.task_id }
              : f
          ))
          
          // Show success toast
          toast.success(`${uploadedFile.file.name} uploaded successfully!`)
          
          // Simulate processing completion (in real app, you'd poll for task status)
          setTimeout(() => {
            setFiles(prev => prev.map(f => 
              f.id === uploadedFile.id 
                ? { ...f, status: 'completed' }
                : f
            ))
          }, 3000)
          
        } else {
          // Handle upload failure
          setFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, status: 'error', error: 'Upload failed' }
              : f
          ))
          toast.error(`Failed to upload ${uploadedFile.file.name}`)
        }
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
            : f
        ))
        toast.error(`Error uploading ${uploadedFile.file.name}`)
      }
    }
  }, [uploadFile])

  // Update progress from the hook
  React.useEffect(() => {
    setFiles(prev => prev.map(f => {
      const progress = uploadProgress[f.file.name]
      if (progress !== undefined && f.status === 'uploading') {
        return { ...f, progress }
      }
      return f
    }))
  }, [uploadProgress])

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.txt', '.md', '.doc', '.docx'],
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: uploading
  })

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('text/')) return <FileText className="h-6 w-6" />
    if (file.type.startsWith('audio/')) return <Mic className="h-6 w-6" />
    if (file.type.startsWith('image/')) return <Image className="h-6 w-6" />
    return <File className="h-6 w-6" />
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return 'Uploading...'
      case 'processing': return 'Processing with AI...'
      case 'completed': return 'Ready'
      case 'error': return 'Failed'
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          isDragActive
            ? 'border-primary-400 bg-primary-50'
            : uploading
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className={`mx-auto h-12 w-12 mb-4 ${
          isDragActive ? 'text-primary-600' : 
          uploading ? 'text-gray-300' : 'text-gray-400'
        }`} />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isDragActive ? 'Drop files here' : 
           uploading ? 'Uploading...' : 'Upload your files'}
        </h3>
        <p className="text-gray-600 mb-4">
          {uploading ? 'Please wait while files are being uploaded' :
           'Drag and drop files here, or click to select'}
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
          <span className="px-2 py-1 bg-gray-100 rounded">📄 Text files</span>
          <span className="px-2 py-1 bg-gray-100 rounded">🎵 Audio files</span>
          <span className="px-2 py-1 bg-gray-100 rounded">🖼️ Images</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">Max file size: 50MB</p>
      </div>

      {/* Upload Error */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{uploadError}</p>
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Files</h3>
          <div className="space-y-3">
            {files.map((uploadedFile) => (
              <div key={uploadedFile.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="text-gray-500">
                    {getFileIcon(uploadedFile.file)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {uploadedFile.file.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.file.type}
                    </p>
                    
                    {/* Progress Bar */}
                    {(uploadedFile.status === 'uploading' || uploadedFile.status === 'processing') && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>{getStatusText(uploadedFile.status)}</span>
                          <span>{uploadedFile.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadedFile.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {uploadedFile.status === 'completed' && (
                      <div className="mt-2 text-xs text-green-600 font-medium">
                        ✓ Processed and added to timeline
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(uploadedFile.status)}
                    <button
                      onClick={() => removeFile(uploadedFile.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Remove file"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                
                {uploadedFile.error && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                    ❌ {uploadedFile.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
