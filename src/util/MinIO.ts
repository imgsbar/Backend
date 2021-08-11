import {Client} from 'minio';
import config from '../config/config.json';

export const minio = new Client({
  endPoint: config.minio.endpoint,
  accessKey: config.minio.accessKey,
  secretKey: config.minio.secretKey,
  useSSL: true,
  port: config.minio.port,
});

export async function checkBucket() {
  if (!(await minio.bucketExists(config.minio.bucket))) {
    minio.makeBucket(config.minio.bucket, 'eu-central-1', () => {
      console.log('Created MinIO Bucket.');
    });
  }
}
