import nodemailer from 'nodemailer';
import { promisify } from 'util';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { MailOptions } from 'nodemailer/lib/stream-transport';
import { Logger, lodash as _, artTemplate } from '@serverless-cd/core';

function isString(x: any): x is string {
  return typeof x === 'string';
}

export default async (
  {
    config,
    mail,
  }: any,
  inputs: any,
) => {
  const newConfig = {
    ...config,
    auth: {
      user: mail.from, // 信息发送者邮箱
      pass: config.pass,
    },
  };
  const transporter = nodemailer.createTransport(newConfig);
  // console.log('transporter', transporter);
  // console.log('mail', mail);
  if (isString(mail.text) && !_.isEmpty(mail.text)) {
    mail.text = artTemplate.render(mail.text, inputs);
  } else if (isString(mail.html) && !_.isEmpty(mail.text)) {
    mail.html = artTemplate.render(mail.html, inputs);
  }
  await wrapedSendMail(transporter, mail);
};

async function wrapedSendMail(transporter: any, mailOptions: any){
  return new Promise((resolve,reject)=>{
      // console.log('mailOptions', mailOptions);
      transporter.sendMail(mailOptions, function(error: any, info: any){
        if (error) {
          console.log('没有发送成功', error);
          resolve(false);
        } 
      else {
          resolve(true);
        }
      });
  })
}