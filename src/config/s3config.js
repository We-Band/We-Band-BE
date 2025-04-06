import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";
import { logger } from "../utils/logger.js";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// R2 클라이언트 설정
export const s3Client = new S3Client({
  region: "auto", // Cloudflare는 'auto'로 고정
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false, // R2는 virtual-hosted-style 사용
});

// R2 연결 확인 (s3랑 다르게 더미데이터를 주고받으면서 확인해야함)
export const checkS3Connection = async () => {
  const bucketName = process.env.R2_BUCKET_NAME;
  const testKey = `connection-test-${Date.now()}`;

  try {
    // dummy 파일 업로드
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: testKey,
        Body: "R2 Connection Test",
      })
    );

    // dummy 파일 삭제
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: testKey,
      })
    );

    logger.info(`R2 연결 성공 (버킷: ${bucketName})`);
  } catch (error) {
    logger.error(`R2 연결 실패: ${error.message}`);
  }
};
