// export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
//   const blob = new Blob([content], { type: mimeType });
//   const url = URL.createObjectURL(blob);

//   const link = document.createElement('a');
//   link.href = url;
//   link.download = filename;
//   link.style.display = 'none';

//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);

//   URL.revokeObjectURL(url);
// };

// export const formatFileSize = (bytes: number): string => {
//   if (bytes === 0) return '0 Bytes';

//   const k = 1024;
//   const sizes = ['Bytes', 'KB', 'MB', 'GB'];

//   const i = Math.floor(Math.log(bytes) / Math.log(k));

//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
// };

// export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
//   return allowedTypes.some(type => 
//     file.type === type || file.name.toLowerCase().endsWith(type.split('/')[1])
//   );
// };

export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.some(type => 
    file.type === type || file.name.toLowerCase().endsWith(type.split('/')[1])
  );
};