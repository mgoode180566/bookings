// import {
//   S3Client,
//   GetObjectCommand,
//   PutObjectCommand,
// } from '@aws-sdk/client-s3';

// import type { TrackdayEvent, Participant } from './types';

// const s3 = new S3Client({
//   region: process.env.AWS_REGION || 'eu-west-2',
// });

// const BUCKET_NAME = process.env.BUCKET_NAME;

// if (!BUCKET_NAME) {
//   throw new Error('BUCKET_NAME environment variable is required');
// }

// const streamToString = async (stream: any): Promise<string> => {
//   const chunks: Buffer[] = [];

//   return await new Promise((resolve, reject) => {
//     stream.on('data', (chunk: Buffer) => chunks.push(chunk));
//     stream.on('error', reject);
//     stream.on('end', () => {
//       resolve(Buffer.concat(chunks).toString('utf-8'));
//     });
//   });
// };

// const getJsonFromS3 = async <T>(key: string): Promise<T> => {
//   const response = await s3.send(
//     new GetObjectCommand({
//       Bucket: BUCKET_NAME,
//       Key: key,
//     }),
//   );

//   const body = await streamToString(response.Body);
//   return JSON.parse(body) as T;
// };

// const putJsonToS3 = async <T>(key: string, data: T): Promise<void> => {
//   await s3.send(
//     new PutObjectCommand({
//       Bucket: BUCKET_NAME,
//       Key: key,
//       Body: JSON.stringify(data, null, 2),
//       ContentType: 'application/json',
//     }),
//   );
// };

// export const readEvents = async (): Promise<TrackdayEvent[]> => {
//   return getJsonFromS3<TrackdayEvent[]>('events.json');
// };

// export const writeEvents = async (
//   events: TrackdayEvent[],
// ): Promise<void> => {
//   await putJsonToS3('events.json', events);
// };

// export const readParticipants = async (): Promise<Participant[]> => {
//   return getJsonFromS3<Participant[]>('participants.json');
// };