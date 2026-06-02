import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, FileText, X, Plus, AlertCircle, Layers,
  FileSpreadsheet, File
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { Label } from '@/components/ui/label';

export type EpicUploadMode = 'multi-files' | 'single' | 'multi-worksheets';

export interface EpicFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  worksheets?: string[];  // For Excel files with multiple worksheets
}

export interface EpicFileUploaderProps {
  onFilesChange: (files: EpicFile[], mode: EpicUploadMode) => void;
  uploadMode: EpicUploadMode;
  onModeChange: (mode: EpicUploadMode) => void;
  maxFiles?: number;
}

export const EpicFileUploader: React.FC<EpicFileUploaderProps> = ({
  onFilesChange,
  uploadMode,
  onModeChange,
  maxFiles = 10
}) => {
  const [files, setFiles] = useState<EpicFile[]>([]);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getSupportedExtensions = (mode: EpicUploadMode): string[] => {
    switch (mode) {
      case 'multi-files':
        return ['.md', '.xlsx', '.xls'];
      case 'single':
        return ['.md', '.xlsx', '.xls', '.csv'];
      case 'multi-worksheets':
        return ['.xlsx', '.xls'];
      default:
        return ['.md', '.xlsx', '.xls', '.csv'];
    }
  };

  const getAcceptString = (mode: EpicUploadMode): string => {
    return getSupportedExtensions(mode).join(',');
  };

  const validateFile = (file: File, mode: EpicUploadMode): string | null => {
    const supportedExtensions = getSupportedExtensions(mode);
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!supportedExtensions.includes(fileExtension)) {
      return `File type not supported. Allowed: ${supportedExtensions.join(', ')}`;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return 'File size must be less than 50MB';
    }

    return null;
  };

  const handleFileSelect = useCallback(async (selectedFiles: FileList) => {
    setError('');
    const newFiles: EpicFile[] = [];
    const errors: string[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      // Validate file
      const validationError = validateFile(file, uploadMode);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
        continue;
      }

      // Check if we exceed max files
      if (files.length + newFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        break;
      }

      const epicFile: EpicFile = {
        id: `${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
      };

      // For Excel files, we'll extract worksheet names later in the backend
      // For now, we'll just mark them as having potential multiple worksheets
      if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
        // This would be populated by the backend after processing
        epicFile.worksheets = ['Sheet1']; // Placeholder
      }

      newFiles.push(epicFile);
    }

    if (errors.length > 0) {
      setError(errors.join('; '));
    }

    if (newFiles.length > 0) {
      const updatedFiles = uploadMode === 'single' ? newFiles.slice(0, 1) : [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles, uploadMode);
    }
  }, [files, uploadMode, maxFiles, onFilesChange]);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileSelect(selectedFiles);
    }
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles, uploadMode);
  };

  const clearFiles = () => {
    setFiles([]);
    onFilesChange([], uploadMode);
    setError('');
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
    switch (ext) {
      case '.xlsx':
      case '.xls':
        return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
      case '.md':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case '.csv':
        return <File className="h-5 w-5 text-orange-600" />;
      default:
        return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  const getModeDescription = (mode: EpicUploadMode): string => {
    switch (mode) {
      case 'single':
        return 'Upload a single SYS2 file (traditional mode)';
      case 'multi-files':
        return 'Upload multiple files, each representing an EPIC';
      case 'multi-worksheets':
        return 'Upload Excel file with multiple worksheets, each representing an EPIC';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Epic-wise SYS2 Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* File Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptString(uploadMode)}
            onChange={handleFileInput}
            multiple={uploadMode !== 'single'}
            className="hidden"
          />

          {files.length === 0 ? (
            <div className="text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                {uploadMode === 'single' 
                  ? 'Drop your SYS2 file here or click to browse'
                  : uploadMode === 'multi-files'
                  ? 'Drop multiple SYS2 files here or click to browse'
                  : 'Drop your Excel file with multiple worksheets here'
                }
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Supports: {getSupportedExtensions(uploadMode).join(', ')}
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Select File{uploadMode !== 'single' ? 's' : ''}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  Uploaded Files ({files.length})
                </h4>
                <div className="flex gap-2">
                  {uploadMode !== 'single' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add More
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFiles}
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getFileIcon(file.name)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-blue-900">{file.name}</p>
                        <p className="text-xs text-blue-900">
                          {(file.size / 1024).toFixed(2)} KB
                          {file.worksheets && file.worksheets.length > 1 && 
                            ` • ${file.worksheets.length} worksheets`
                          }
                        </p>
                      </div>
                      {uploadMode === 'multi-worksheets' && (
                        <Badge variant="secondary">
                          Multi-sheet
                        </Badge>
                      )}
                      {uploadMode === 'multi-files' && (
                        <Badge variant="outline" className='font-medium text-blue-900'>
                          EPIC {files.indexOf(file) + 1}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upload Limits */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Maximum file size: 50MB per file</p>
          <p>• Maximum files: {maxFiles} files</p>
          {uploadMode === 'multi-worksheets' && (
            <p>• Maximum worksheets per Excel: 20 worksheets</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};