// src/utils/download.js

/**
 * Triggers a browser file download for the given text content.
 * @param {string} content - The text content of the file.
 * @param {string} fileName - The desired name of the file (e.g., "theme.css").
 */
export const downloadFile = (content, fileName, mimeType = 'text/css;charset=utf-8') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};