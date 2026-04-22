import "server-only"

import { sendTransactionalEmail } from "@/lib/integrations/resend"

export const MAGIC_LINK_EXPIRES_IN_SECONDS = 60 * 10

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export async function sendMagicLinkEmail({ email, url }: { email: string; url: string }) {
  const subject = "your daedalus magic link"
  const preheader = "one-tap sign-in to daedalus. expires in 10 minutes."
  const safeUrl = escapeHtml(url)

  const sansStack =
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif"
  const serifStack = "'iowan old style','Palatino Linotype',Palatino,Georgia,serif"

  // aegean palette — matches the signin card (teal-700 accents on cool neutrals)
  const ink = "#0f172a" // slate-900
  const muted = "#475569" // slate-600
  const subtle = "#94a3b8" // slate-400
  const wash = "#eef4f4" // faint teal wash for the outer bg
  const card = "#ffffff"
  const border = "rgba(15,118,110,0.18)" // teal-700 @ ~20%
  const borderSoft = "rgba(15,118,110,0.10)"
  const accent = "#0f766e" // teal-700
  const accentDeep = "#115e59" // teal-800
  const accentSoft = "rgba(15,118,110,0.06)"

  await sendTransactionalEmail({
    to: email,
    subject,
    text: [
      "your daedalus magic link",
      "",
      "open the link below to authorize sign-in. it expires in 10 minutes.",
      "",
      url,
      "",
      "if you didn't request this, you can safely ignore this email — no one can sign in without the link.",
    ].join("\n"),
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background:${wash};font-family:${sansStack};color:${ink};-webkit-font-smoothing:antialiased;">
    <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;mso-hide:all;">
      ${escapeHtml(preheader)}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${wash};">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;background:${card};border:1px solid ${border};border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:32px 40px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-family:${sansStack};font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:${accent};font-weight:600;">
                      project daedalus
                    </td>
                    <td align="right" style="font-family:${sansStack};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${subtle};">
                      magic link
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 0;">
                <div style="height:1px;background:${borderSoft};line-height:1px;font-size:0;">&nbsp;</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 8px;">
                <h1 style="margin:0;font-family:${serifStack};font-size:28px;line-height:1.15;font-weight:600;color:${ink};letter-spacing:-0.01em;">
                  your magic link is ready.
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 40px 0;">
                <p style="margin:0;font-family:${sansStack};font-size:15px;line-height:1.65;color:${muted};">
                  tap the button below to authorize. this link is single-use and expires in <strong style="color:${ink};font-weight:600;">10 minutes</strong>.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" style="border-radius:10px;background:${accent};">
                      <a href="${safeUrl}" target="_blank" rel="noopener" style="display:inline-block;padding:14px 26px;font-family:${sansStack};font-size:14px;font-weight:600;letter-spacing:0.02em;color:#ffffff;text-decoration:none;border-radius:10px;border:1px solid ${accentDeep};">
                        sign in to daedalus &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 0;">
                <p style="margin:0 0 8px;font-family:${sansStack};font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:${subtle};font-weight:600;">
                  or paste this link
                </p>
                <div style="background:${accentSoft};border:1px solid ${borderSoft};border-radius:8px;padding:12px 14px;">
                  <a href="${safeUrl}" style="font-family:'SFMono-Regular',Menlo,Consolas,'Liberation Mono',monospace;font-size:12px;line-height:1.55;color:${accent};text-decoration:none;word-break:break-all;">${safeUrl}</a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 32px;">
                <div style="height:1px;background:${borderSoft};line-height:1px;font-size:0;">&nbsp;</div>
                <p style="margin:20px 0 0;font-family:${sansStack};font-size:12px;line-height:1.6;color:${subtle};">
                  didn't request this? ignore the email — no one can sign in without clicking the link above.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;font-family:${sansStack};font-size:11px;letter-spacing:0.08em;color:${subtle};">
            daedalus &middot; synthesis planning
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  })
}
