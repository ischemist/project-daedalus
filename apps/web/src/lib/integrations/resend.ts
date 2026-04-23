import "server-only"

import { Resend } from "resend"

const defaultFromEmail = "daedalus <onboarding@resend.dev>"

let resend: Resend | null = null

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    throw new Error("resend_api_key is required to send magic links.")
  }

  resend ??= new Resend(apiKey)

  return resend
}

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text: string
}) {
  const response = await getResendClient().emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? defaultFromEmail,
    to: [to],
    subject,
    html,
    text,
  })

  if (response.error) {
    throw new Error(
      response.error.message ?? "failed to send email with resend."
    )
  }
}
