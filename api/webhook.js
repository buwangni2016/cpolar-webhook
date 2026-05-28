export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true });
  }

  const body = req.body;
  const message = body.message || body.edited_message || {};
  const text = message.text || '';
  const chatId = message.chat?.id?.toString() || '';

  // Only respond to /cpolar command from authorized chat
  const authorizedChatId = process.env.TELEGRAM_CHAT_ID;
  if (text !== '/cpolar' || (authorizedChatId && chatId !== authorizedChatId)) {
    return res.status(200).json({ ok: true });
  }

  try {
    // Trigger GitHub Actions workflow via Maton gateway
    const matonKey = process.env.MATON_API_KEY;
    const repo = process.env.GH_REPO || 'buwangni2016/cpolar-monitor';
    const resp = await fetch(
      `https://gateway.maton.ai/github/repos/${repo}/actions/workflows/monitor.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${matonKey}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ref: 'main' }),
      }
    );

    if (resp.ok || resp.status === 204) {
      // Notify user that check is running
      const token = process.env.TELEGRAM_TOKEN;
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '⏳ 正在检查隧道状态...',
        }),
      });
    } else {
      console.error('GitHub trigger failed:', resp.status, await resp.text());
    }
  } catch (err) {
    console.error('Error:', err.message);
  }

  return res.status(200).json({ ok: true });
}
