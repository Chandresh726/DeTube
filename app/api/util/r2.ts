import { getStorageGateway } from '@/lib/server/storage';

/** @deprecated Use getStorageGateway() from @/lib/server/storage instead. */
export async function generatePreSignedURL(fileName: string, contentType: string) {
  return getStorageGateway().getUploadUrl(fileName, contentType);
}

/** @deprecated Use getStorageGateway().getPublicUrl() instead. */
export function getPublicR2URL(fileName: string) {
  return getStorageGateway().getPublicUrl(fileName);
}
