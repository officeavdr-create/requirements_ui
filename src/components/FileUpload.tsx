import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, AlertCircle } from 'lucide-react';
import { formatFileSize, isValidFileType } from '../utils/download';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  loading?: boolean;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, loading, error }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && isValidFileType(file, ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'])) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
    disabled: loading,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="space-y-2">
          <Upload className="h-8 w-8 text-gray-400 mx-auto" />

          {isDragActive ? (
            <p className="text-primary-600 font-medium">Drop the Excel file here...</p>
          ) : (
            <div>
              <p className="text-gray-600 font-medium">
                {loading ? 'Processing...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-gray-500">
                Excel files (.xlsx, .xls) up to 10MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* File Info */}
      {acceptedFiles.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <File className="h-5 w-5 text-green-500" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{acceptedFiles[0].name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(acceptedFiles[0].size)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700 font-medium">Upload Error</p>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;