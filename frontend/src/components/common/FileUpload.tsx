
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { 
  Upload, 
  File, 
  FileText, 
  FileImage, 
  FileVideo, 
  FileArchive,
  X,
  CheckCircle2,
  AlertCircle 
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { formatNumber } from '../../lib/utils'

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>
  accept?: Record<string, string[]>
  maxSize?: number
  maxFiles?: number
  className?: string
}

interface UploadingFile {
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

export default function FileUpload({
  onUpload,
  accept,
  maxSize = 15 * 1024 * 1024, // 15MB default
  maxFiles = 5,
  className
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, UploadingFile>>(new Map())

  const handleFileUpload = useCallback(async (acceptedFiles: File[]) => {
    const newUploadingFiles = new Map(uploadingFiles)
    acceptedFiles.forEach(file => {
      newUploadingFiles.set(file.name, {
        file,
        progress: 0,
        status: 'uploading'
      })
    })
    setUploadingFiles(newUploadingFiles)

    try {
      await onUpload(acceptedFiles)
      
      acceptedFiles.forEach(file => {
        newUploadingFiles.set(file.name, {
          file,
          progress: 100,
          status: 'success'
        })
      })
      setUploadingFiles(new Map(newUploadingFiles))
      
      setTimeout(() => {
        setUploadingFiles(prev => {
          const updated = new Map(prev)
          acceptedFiles.forEach(file => {
            if (updated.get(file.name)?.status === 'success') {
              updated.delete(file.name)
            }
          })
          return updated
        })
      }, 3000)
    } catch (error) {
      acceptedFiles.forEach(file => {
        newUploadingFiles.set(file.name, {
          file,
          progress: 0,
          status: 'error',
          error: 'Upload failed'
        })
      })
      setUploadingFiles(new Map(newUploadingFiles))
    }
  }, [onUpload, uploadingFiles])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop: handleFileUpload,
    accept,
    maxSize,
    maxFiles
  })

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) return FileImage
    if (['mp4', 'avi', 'mov', 'webm'].includes(ext || '')) return FileVideo
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) return FileArchive
    if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext || '')) return FileText
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const removeFile = (fileName: string) => {
    setUploadingFiles(prev => {
      const updated = new Map(prev)
      updated.delete(fileName)
      return updated
    })
  }

  return (
    <div className={className}>
      <Card
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed transition-all cursor-pointer',
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
          'p-8'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="text-center">
          <Upload className={cn(
            'mx-auto w-12 h-12 mb-4',
            isDragActive ? 'text-blue-500' : 'text-gray-400'
          )} />
          
          <p className="text-sm font-medium text-gray-900 mb-1">
            {isDragActive ? 'Drop files here' : 'Drop files here or click to browse'}
          </p>
          
          <p className="text-xs text-gray-500">
            Maximum {maxFiles} files, up to {formatFileSize(maxSize)} each
          </p>
        </div>
      </Card>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="mt-4 space-y-2">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="flex items-start space-x-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">{file.name}:</span>
                {errors.map(error => (
                  <span key={error.code} className="ml-1">
                    {error.code === 'file-too-large' && `File too large (max ${formatFileSize(maxSize)})`}
                    {error.code === 'file-invalid-type' && 'Invalid file type'}
                    {error.code === 'too-many-files' && `Too many files (max ${maxFiles})`}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploading Files */}
      {uploadingFiles.size > 0 && (
        <div className="mt-4 space-y-3">
          {Array.from(uploadingFiles.entries()).map(([fileName, uploadInfo]) => {
            const FileIcon = getFileIcon(fileName)
            
            return (
              <Card key={fileName} className="p-4">
                <div className="flex items-start space-x-3">
                  <FileIcon className="w-8 h-8 text-gray-400 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fileName}
                      </p>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => removeFile(fileName)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-2">
                      {formatFileSize(uploadInfo.file.size)}
                    </p>
                    
                    {uploadInfo.status === 'uploading' && (
                      <Progress value={uploadInfo.progress} className="h-1" />
                    )}
                    
                    {uploadInfo.status === 'success' && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs">Upload complete</span>
                      </div>
                    )}
                    
                    {uploadInfo.status === 'error' && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs">{uploadInfo.error}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}