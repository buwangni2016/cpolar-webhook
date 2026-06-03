export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true });
  }

  const body = req.body;
  const message = body.message || body.edited_message || {};
  const text = message.text || '';
  const chatId = message.chat?.id?.toString() || '';

  const authorizedChatId = process.env.TELEGRAM_CHAT_ID;
  if (authorizedChatId && chatId !== authorizedChatId) {
    return res.status(200).json({ ok: true });
  }

  const matonKey = process.env.MATON_API_KEY;
  const token = process.env.TELEGRAM_TOKEN;

  async function sendMessage(text) {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  }

  async function triggerWorkflow(workflow) {
    const repo = process.env.GH_REPO || 'buwangni2016/cpolar-monitor';
    const resp = await fetch(
      `https://gateway.maton.ai/github/repos/${repo}/actions/workflows/${workflow}/dispatches`,
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
    return resp.ok || resp.status === 204;
  }

  try {
    if (text === '/cpolar') {
      const ok = await triggerWorkflow('monitor.yml');
      if (ok) {
        await sendMessage('⏳ 正在检查隧道状态...');
      } else {
        console.error('GitHub trigger failed for monitor.yml');
      }
    } else if (text === '/update') {
      await sendMessage('🔄 正在触发 MoviePilot 更新，请稍候...');
      const ok = await triggerWorkflow('update-moviepilot.yml');
      if (!ok) {
        await sendMessage('❌ 触发更新失败，请检查 GitHub Actions 配置。');
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }

  return res.status(200).json({ ok: true });
}
