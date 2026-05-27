import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { TrackdayEvent, Participant } from './types';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-2',
});

const isDevelopment = process.env.NODE_ENV !== 'production';
const BUCKET_NAME = process.env.BUCKET_NAME;

if (!isDevelopment && !BUCKET_NAME) {
  throw new Error('BUCKET_NAME environment variable is required');
}

const dataDir = path.resolve(process.cwd(), 'data');

const streamToString = async (stream: any): Promise<string> => {
  const chunks: Buffer[] = [];

  return await new Promise((resolve, reject) => {
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf-8'));
    });
  });
};

const getJsonFromS3 = async <T>(key: string): Promise<T> => {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }),
  );

  const body = await streamToString(response.Body);
  return JSON.parse(body) as T;
};

const putJsonToS3 = async <T>(key: string, data: T): Promise<void> => {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
    }),
  );
};

const getJsonFromLocal = async <T>(key: string): Promise<T> => {
  const filePath = path.join(dataDir, key);
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
};

const putJsonToLocal = async <T>(key: string, data: T): Promise<void> => {
  const filePath = path.join(dataDir, key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

export const readEvents = async (): Promise<TrackdayEvent[]> => {
  if (isDevelopment) {
    return getJsonFromLocal<TrackdayEvent[]>('events.json');
  }

  return getJsonFromS3<TrackdayEvent[]>('events.json');
};

export const writeEvents = async (
  events: TrackdayEvent[],
): Promise<void> => {
  if (isDevelopment) {
    await putJsonToLocal('events.json', events);
    return;
  }

  await putJsonToS3('events.json', events);
};

export const readParticipants = async (): Promise<Participant[]> => {
  if (isDevelopment) {
    return getJsonFromLocal<Participant[]>('participants.json');
  }

  return getJsonFromS3<Participant[]>('participants.json');
};