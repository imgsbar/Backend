import 'fastify';
import {File, FilesObject} from 'fastify-multer/lib/interfaces';
import {isMultipart} from 'fastify-multer/lib/lib/content-parser';
type FilesInRequest = FilesObject | Partial<File>[];

declare module 'fastify' {
  interface FastifyRequest {
    isMultipart: typeof isMultipart;
    file: File;
    files: FilesInRequest;
  }
}
