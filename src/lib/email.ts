export interface EmailMessage {
  to: string[];
  subject: string;
  html: string;
}

const BATCH_SIZE = 100;

export async function sendBatchEmails(
  messages: EmailMessage[],
): Promise<{ success: boolean; sentCount: number }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromAddress) {
    console.error("Email not configured: missing RESEND_API_KEY or RESEND_FROM_EMAIL");
    return { success: false, sentCount: 0 };
  }

  const validMessages = messages.filter((message) => message.to.length > 0);
  if (validMessages.length === 0) {
    return { success: true, sentCount: 0 };
  }

  let sentCount = 0;
  let allSuccess = true;

  for (let i = 0; i < validMessages.length; i += BATCH_SIZE) {
    const chunk = validMessages.slice(i, i + BATCH_SIZE);
    const payload = chunk.map((message) => ({
      from: fromAddress,
      to: message.to,
      subject: message.subject,
      html: message.html,
    }));

    try {
      const response = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Resend batch send failed:", response.status, errorBody);
        allSuccess = false;
      } else {
        sentCount += chunk.length;
      }
    } catch (error) {
      console.error("Resend batch send error:", error);
      allSuccess = false;
    }
  }

  return { success: allSuccess, sentCount };
}

/** @deprecated Prefer sendBatchEmails */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  const result = await sendBatchEmails([message]);
  return result.success && result.sentCount > 0;
}
