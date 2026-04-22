import "server-only"

import { sendTransactionalEmail } from "@/lib/integrations/resend"

export const MAGIC_LINK_EXPIRES_IN_SECONDS = 60 * 10

export async function sendMagicLinkEmail({ email, url }: { email: string; url: string }) {
  const subject = "your daedalus magic link"

  await sendTransactionalEmail({
    to: email,
    subject,
    text: [
      "sign in to daedalus.",
      "",
      `open this link to continue: ${url}`,
      "",
      "this link expires in 10 minutes.",
    ].join("\n"),
    html: `
      <div style="background:#f6f3ea;padding:32px;font-family:georgia,'times new roman',serif;color:#292524">
        <div style="margin:0 auto;max-width:560px;border:1px solid rgba(41,37,36,0.12);background:#fffdf8;padding:32px">
          <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:#a16207">project daedalus</p>
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.1;font-weight:600">your magic link is ready.</h1>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#57534e">
            use the link below to enter the control plane. it expires in 10 minutes.
          </p>
          <a
            href="${url}"
            style="display:inline-block;border-radius:999px;background:#1c1917;padding:14px 22px;color:#fafaf9;font-size:14px;font-weight:600;letter-spacing:0.04em;text-decoration:none"
          >
            sign in to daedalus
          </a>
          <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#78716c;word-break:break-all">
            if the button misbehaves, paste this into your browser:<br />
            <a href="${url}" style="color:#0f766e">${url}</a>
          </p>
        </div>
      </div>
    `,
  })
}
