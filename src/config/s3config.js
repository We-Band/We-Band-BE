import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";
import { logger } from "../utils/logger.js";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// 필수 환경 변수 검증
const requiredEnvVars = [
  "CLOUDFLARE_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`필수 환경 변수가 누락되었습니다: ${envVar}`);
  }
}

// R2 클라이언트 설정
export const s3Client = new S3Client({
  region: "auto", // Cloudflare R2는 'auto'로 고정
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false, // Cloudflare R2는 virtual-hosted-style URL만 지원
});

// R2 연결 확인
export const checkS3Connection = async () => {
  const bucketName = process.env.R2_BUCKET_NAME;
  const testKey = `connection-test-${Date.now()}`;

  try {
    // 테스트 파일 업로드
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: testKey,
        Body: "R2 Connection Test",
      })
    );

    // 테스트 파일 삭제
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: testKey,
      })
    );

    logger.info(`R2 연결 성공 (버킷: ${bucketName})`);
  } catch (error) {
    logger.error(`R2 연결 실패: ${error.message}`);
    logger.error(`에러 상세: ${JSON.stringify(error, null, 2)}`);
    throw error; // 상위 레벨에서 에러 처리를 할 수 있도록 에러를 다시 throw
  }
};
