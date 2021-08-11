import {extname} from 'path';
import config from '../config/config.json';
import {FastifyInstance} from 'fastify';
import multer from 'fastify-multer';
import * as crypto from 'crypto';
import {File} from '../documents/File';
import {minio} from '../util/MinIO';
import {generateFileName} from '../util/GenerationUtil';
import {uploadHandler} from '../handlers/UploadHandler';
import {v4 as uuid} from 'uuid';
import path from 'path';
import {addMonth, formatEmbed} from '../util/Util';
export default async function UploadRouter(router: FastifyInstance) {
  const upload = multer({
    storage: multer.memoryStorage(),
  });

  router.post(
    '/sharex',
    {preHandler: [uploadHandler, upload.single('file')]},
    async (request, reply) => {
      try {
        const {user} = request;

        if (!user) {
          return reply.status(403).send({
            message: 'Unauthorized',
          });
        }
        if (
          !request.file ||
          request.file.buffer === undefined ||
          request.file.buffer.length === 0
        ) {
          return reply
            .status(400)
            .send({message: 'You need to provide a file!'});
        }
        if (
          request.file.size! > 52_428_800 &&
          user.roles.premium &&
          user.roles.admin
        ) {
          return reply.status(413).send({message: 'File is too big!'});
        }

        user.uploads += 1;
        await user.save();

        const file = new File();

        const cdnFileName = uuid() + extname(request.file.originalname);

        const domain =
          user.settings.domains[
            Math.floor(Math.random() * user.settings.embeds.list.length)
          ];
        const sha1 = crypto.createHash('sha1');
        const hash = sha1.update(request.file.buffer).digest('hex');

        file.fileName =
          path.parse(domain.fileNamePrefix).base +
          generateFileName(user, request.file.originalname);
        file.originalFileName = request.file.originalname;

        file.hash = hash;
        file.size = request.file.size!;

        file.cdnFileName = cdnFileName;

        file.uploader = {
          id: user.id,
          name: user.username,
        };

        file.mimeType = request.file.mimetype || 'application/octet-stream';

        const embed = formatEmbed(
          user.settings.embeds.list.find(
            e =>
              e._id ===
              domain.embeds[
                Math.floor(Math.random() * user.settings.embeds.list.length)
              ]
          ) || file.embed,
          user,
          file
        );
        file.embed = {
          ...embed,
          enabled: true,
        };

        file.embed.enabled = user.settings.embeds.enabled;

        const previousName = await File.findOne({fileName: file.fileName});

        if (previousName) {
          previousName.fileName = previousName.fileName + uuid();
          await previousName.save();
        }

        minio.putObject(config.minio.bucket, cdnFileName, request.file.buffer);

        await file.save();

        return reply.send({
          imageUrl: `https://beta.${
            domain.name
          }/${domain.fileNamePrefix.replace(
            path.parse(domain.fileNamePrefix).base,
            ''
          )}${file.fileName}`,
          embed: file.embed,
        });
      } catch (error) {
        return reply.status(500).send({message: error.message});
      }
    }
  );
}

export async function checkFiles() {
  const files = await File.find({
    uploadedAt: {$gte: addMonth(new Date())},
  });

  for (const file of files) {
    await minio.removeObject(config.minio.bucket, file.cdnFileName);
    file.deleted = true;
    await file.save();
  }
}
export const autoPrefix = '/upload';
