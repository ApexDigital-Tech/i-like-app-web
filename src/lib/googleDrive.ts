/**
 * Transforms a Google Drive share link into a direct download/view link.
 */
export function getGoogleDriveUrl(url: string): string {
  if (!url) return '';
  
  // Example patterns:
  // https://drive.google.com/file/d/1A2B3C/view?usp=sharing
  // https://drive.google.com/open?id=1A2B3C
  
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  
  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  
  return url;
}
