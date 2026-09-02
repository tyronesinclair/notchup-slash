import { Resend } from "resend";
import { manageUrl } from "./stripe";

const resend = new Resend(process.env.RESEND_API_KEY);

type Service = {
  serviceType: string;
  provider: string;
};

type ConfirmationEmailParams = {
  name: string;
  email: string;
  services: Service[];
  paymentType: "immediate" | "scheduled" | "subscription";
  scheduledDate?: string;
};

const TYPE_LABEL: Record<string, string> = {
  internet: "Internet",
  cell_phone: "Mobile",
  tv: "TV",
  home_phone: "Home phone",
};

export async function sendConfirmationEmail({
  name,
  email,
  services,
  paymentType,
  scheduledDate,
}: ConfirmationEmailParams) {
  const serviceList = services
    .map((s) => `<li>${s.provider} — ${TYPE_LABEL[s.serviceType] ?? s.serviceType}</li>`)
    .join("");

  const isSub = paymentType === "subscription";

  const paymentNote = isSub
    ? `Your Slash subscription is active — <strong>$15/month, cancel anytime</strong>. You keep <strong>100%</strong> of every dollar we save you.`
    : paymentType === "scheduled" && scheduledDate
      ? `Your $35 activation fee is scheduled for <strong>${scheduledDate}</strong>.`
      : "Your $35 activation fee has been received.";

  const guarantee = isSub
    ? `<strong>30-day money-back guarantee, no questions asked.</strong> Not for you? Cancel any time from your <a href="${manageUrl(email)}" style="color:#027A48;">billing page</a>.`
    : `<strong>Remember:</strong> If we can't save you $100+/year, your $35 is fully refunded. If you reject our savings proposal, you get your $35 back too.`;

  const queueNote = isSub
    ? `We work your bills <strong>one at a time</strong> so each gets our full attention, starting with the first one you added. You'll get an email the moment we begin and again when there's a savings offer for you to approve.`
    : `We've added your account to our queue. Our AI agents will start negotiating your bills within 3–5 weeks. We'll email you the moment we begin and again when we have a savings proposal ready for you.`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${isSub ? "You're in — NotchUp Slash" : "You're on the list — NotchUp Slash"}</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #101828;">
        <div style="margin-bottom: 32px;">
          <span style="font-size: 20px; font-weight: 800; color: #4F4EA5;">NotchUp</span>
          <span style="font-size: 20px; font-weight: 800; background: #4F4EA5; color: #fff; padding: 2px 8px; border-radius: 4px; margin-left: 4px;">Slash</span>
        </div>

        <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 8px; color: #101828;">
          You're in, ${name}! 🎉
        </h1>
        <p style="color: #475467; margin-bottom: 24px;">${queueNote}</p>

        <div style="background: #F9F5FF; border: 1px solid #E9D7FE; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="font-weight: 700; margin-bottom: 12px; color: #4F4EA5;">Bills we're negotiating:</p>
          <ul style="margin: 0; padding-left: 20px; color: #344054;">
            ${serviceList}
          </ul>
        </div>

        <p style="color: #667085; font-size: 14px; margin-bottom: 8px;">${paymentNote}</p>

        <div style="background: #ECFDF3; border: 1px solid #A9EFC5; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <p style="font-size: 13px; color: #027A48; margin: 0;">${guarantee}</p>
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
    subject: isSub ? `You're in, ${name} — Slash is on your bills` : `You're in the queue, ${name} — NotchUp Slash`,
    html,
  });
}
