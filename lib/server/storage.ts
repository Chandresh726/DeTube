import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env, PRESIGNED_URL_EXPIRY_SECONDS } from "./env";

let client: S3Client | undefined;

export interface StorageGateway {
  getUploadUrl(fileName: string, contentType: string): Promise<string>;
  getPublicUrl(fileName: string): string;
}

export function getR2Client(): S3Client {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${env.r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.r2AccessKeyId,
        secretAccessKey: env.r2SecretAccessKey,
      },
    });
  }
  return client;
}

export class R2StorageGateway implements StorageGateway {
  async getUploadUrl(fileName: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: env.r2BucketName,
      Key: fileName,
      ContentType: contentType,
    });
    return getSignedUrl(getR2Client(), command, { expiresIn: PRESIGNED_URL_EXPIRY_SECONDS });
  }

  getPublicUrl(fileName: string): string {
    return `${env.r2PublicUrl}/${fileName}`;
  }
}

let gateway: StorageGateway | undefined;

export function getStorageGateway(): StorageGateway {
  if (!gateway) gateway = new R2StorageGateway();
  return gateway;
}

export function __setStorageGateway(g: StorageGateway | undefined): void {
  gateway = g;
}

/** Owner-scoped object key: prevents any-user overwrite of victim UUIDs. */
export function buildObjectKey(fileType: string, ownerUserId: number, uuid: string): string {
  return `${fileType}/${ownerUserId}/${uuid}`;
}

export function isAllowedContentType(fileType: string, contentType: string): boolean {
  const normalized = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  if (!normalized.includes("/")) return false;
  if (normalized === "image/svg+xml" || normalized.endsWith("+xml")) return false;
  if (fileType === "temp-video") {
    return normalized.startsWith("video/") && normalized !== "video/svg+xml";
  }
  return normalized.startsWith("image/");
}

export function isHttpsUrlFromPublicBucket(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    const pub = new URL(env.r2PublicUrl);
    return u.host === pub.host;
  } catch {
    return false;
  }
}
