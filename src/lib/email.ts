import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type Service = {
  serviceType: string;
  provider: string;
};

type ConfirmationEmailParams = {
  name: string;
  email: string;
  services: Service[];
  paymentType: "immediate" | "scheduled";
  scheduledDate?: string;
};

export async function sendConfirmationEmail({
  name,
  email,
  services,
  paymentType,
  scheduledDate,
}: ConfirmationEmailParams) {
  const serviceList = services
    .map(
      (s) =>
        `<li>${s.provider} — ${s.serviceType === "internet" ? "Internet" : "Cell Phone"}</li>`
    )
    .join("");

  const paymentNote =
    paymentType === "scheduled" && scheduledDate
      ? `Your $35 activation fee is scheduled for <strong>${scheduledDate}</strong>.`
      : "Your $35 activation fee has been received.";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>You're on the list — NotchUp Slash</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #101828;">
        <div style="margin-bottom: 32px;">
          <span style="font-size: 20px; font-weight: 800; color: #4F4EA5;">NotchUp</span>
          <span style="font-size: 20px; font-weight: 800; background: #4F4EA5; color: #fff; padding: 2px 8px; border-radius: 4px; margin-left: 4px;">Slash</span>
        </div>

        <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 8px; color: #101828;">
          You're in, ${name}! 🎉
        </h1>
        <p style="color: #475467; margin-bottom: 24px;">
          We've added your account to our queue. Our AI agents will start negotiating your bills within 3–5 weeks.
          We'll email you the moment we begin and again when we have a savings proposal ready for you.
        </p>

        <div style="background: #F9F5FF; border: 1px solid #E9D7FE; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="font-weight: 700; margin-bottom: 12px; color: #4F4EA5;">Services we're negotiating:</p>
          <ul style="margin: 0; padding-left: 20px; color: #344054;">
            ${serviceList}
          </ul>
        </div>

        <p style="color: #667085; font-size: 14px; margin-bottom: 8px;">${paymentNote}</p>

        <div style="background: #ECFDF3; border: 1px solid #A9EFC5; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <p style="font-size: 13px; color: #027A48; margin: 0;">
            <strong>Remember:</strong> If we can't save you $100+/year, your $35 is fully refunded.
            If you reject our savings proposal, you get your $35 back too.
          </p>
        </div>

        <p style="color: #667085; font-size: 13px;">
          Questions? Reply to this email or contact us at
          <a href="mailto:help@notchup.app" style="color: #7F56D9;">help@notchup.app</a>
        </p>

        <hr style="border: none; border-top: 1px solid #EAECF0; margin: 32px 0;" />
        <p style="color: #98A2B3; font-size: 11px; text-align: center;">
          © ${new Date().getFullYear()} NotchUp Financial Inc. · Canada 🇨🇦<br>
          <a href="https://notchup.app" style="color: #98A2B3;">notchup.app</a>
        </p>
      </body>
    </html>
  `;

  await resend.emails.send({
    from: "NotchUp Slash <slash@notchup.app>",
    to: email,
    subject: `You're in the queue, ${name} — NotchUp Slash`,
    html,
  });
}
