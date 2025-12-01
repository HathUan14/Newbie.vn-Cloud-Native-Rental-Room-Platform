import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../users/user.entity';

export enum ModerationStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEEDS_EDIT = 'NEEDS_EDIT',
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
}

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) { }

  async sendUserConfirmation(user: User, token: string) {
    const url = `http://localhost:3000/verify-email?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Chào mừng đến với Newbie.com! Xác thực Email của bạn',
      template: './confirmation',
      context: {
        name: user.fullName,
        url,
      },
    });
  }

  async sendModerationResult(
    user: User,
    roomTitle: string,
    status: ModerationStatus,
    reason: string = '',
    roomId: number
  ) {
    let template = '';
    let subject = '';
    let link = '';

    const frontendUrl = 'http://localhost:3001';

    switch (status) {
      case ModerationStatus.APPROVED:
        template = './listing-approved';
        subject = 'Tin đăng của bạn đã được duyệt!';
        link = `${frontendUrl}/rooms/${roomId}`;
        break;

      case ModerationStatus.REJECTED:
        template = './listing-rejected';
        subject = 'Tin đăng bị từ chối';
        link = `${frontendUrl}/dashboard/my-posts`;
        break;

      case ModerationStatus.NEEDS_EDIT:
        template = './listing-needs-edit';
        subject = 'Yêu cầu chỉnh sửa tin đăng';
        link = `${frontendUrl}/host/manage/rooms/${roomId}/edit`;
        break;
    }

    await this.mailerService.sendMail({
      to: user.email,
      subject: subject,
      template: template,
      context: {
        name: user.fullName,
        roomTitle: roomTitle,
        reason: reason,
        link: link,
      },
    });
  }
}