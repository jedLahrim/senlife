import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
import { User } from '../user/entities/user.entity';
import { v4 as uuid } from 'uuid';
import { Attachment } from './entities/attachment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ERR_UPLOAD_FAILED } from '../commons/errors/errors-codes';
import { AppError } from '../commons/errors/app-error';
import { S3 } from 'aws-sdk';
import { PutObjectCommandInput } from '@aws-sdk/client-s3';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentRepo: Repository<Attachment>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private configService: ConfigService,
  ) {}

  async upload(file, uploadAttachmentDto: UploadAttachmentDto, user: User) {
    try {
      const bucket = this.configService.get('AWS_BACKET_NAME');
      const accessKeyId = this.configService.get('AWS_ACCESS_KEY');
      const secretAccessKey = this.configService.get('AWS_SECRET_KEY');
      const awsFile: PutObjectCommandInput = {
        Body: file.buffer,
        Bucket: bucket,
        Key: `${uuid()}-${file.originalname}`,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };

      const s3 = new S3({
        credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey,
        },
      });
      const sendData = await s3.upload(awsFile).promise();
      // save attachment after upload
      const { name } = uploadAttachmentDto;
      const attachment = this.attachmentRepo.create({
        name,
        url: sendData.Location,
      });
      return this.attachmentRepo.save(attachment);
    } catch (e) {
      throw new ConflictException(new AppError(ERR_UPLOAD_FAILED));
    }
  }
}
