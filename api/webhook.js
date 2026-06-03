/**
 * ⚠️  已废弃 (Deprecated)
 *
 * 此文件为早期版本，现已由 cpolar-monitor 仓库取代。
 * 当前活跃项目：https://github.com/buwangni2016/cpolar-monitor
 * Vercel 项目：cpolar-tg (https://cpolar-tg.vercel.app/api/webhook)
 *
 * 支持命令：
 *   /cpolar    — 查询当前 cpolar 隧道状态
 *   /update mp — 触发 MoviePilot 自动更新
 */

export default async function handler(req, res) {
  return res.status(200).json({ ok: true, deprecated: true });
}
