import { Injectable, Logger } from '@nestjs/common';
import { CrudService } from '../core/crud/crud.service';
import { Notifications, NotificationsArea } from './schema/notifications.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ISendEmailDetails } from '../auth/auth.service';

import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService extends CrudService<Notifications> {
  constructor(
    @InjectModel('notifications') private notifications: Model<Notifications>
  ) {
    super(notifications);
  }


  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: 'info@enwardo.com',
      serviceClient: process.env.G_CLIENT_ID,
      privateKey: process.env.G_PRIVATE_KEY.replace(/\\n/g, '\n')
    }
  });

  public async sendEmailToRegisteredNotifiers(details: ISendEmailDetails, area: NotificationsArea) {
    const notifiers = await this.getAll();
    notifiers.forEach(notifier => {
      if (notifier.area.includes(area)) {
        this.sendEmail({
          to: notifier.receiverEmail,
          ...details
        });
      }
    });
  }

  public async sendEmail(details: ISendEmailDetails) {
    try {
      const info = await this.transporter.sendMail({
        from: details.from,
        to: details.to,
        subject: details.subject,
        html: details.html,
      });
      Logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (e) {
      Logger.log(e)
    }
    return true;
  }

}
