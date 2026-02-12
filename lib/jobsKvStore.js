import { createClient } from '@vercel/kv';

const kv = createClient({
  url: process.env.PAIKEY_KV_REST_API_URL,
  token: process.env.PAIKEY_KV_REST_API_TOKEN,
});

const JOB_KEY = (id) => `job:${id}`;
const DISPUTE_KEY = (jobId) => `dispute:${jobId}`;
const AGENT_KEY_AUTARKIC = (id) => `autarkic:${id}`;
const AGENT_KEY_VENDOR = (id) => `agent:${id}`;
const JOBS_ALL = 'jobs:all';
const JOBS_BY_HIRER = (wallet) => `jobs:byHirer:${wallet}`;
const JOBS_BY_AGENT = (wallet) => `jobs:byAgent:${wallet}`;

async function resolveAgent(agentId) {
  const autarkic = await kv.hgetall(AGENT_KEY_AUTARKIC(agentId));
  if (autarkic?.id) return { origin: 'autarkic', record: autarkic, key: AGENT_KEY_AUTARKIC(agentId) };
  const vendor = await kv.hgetall(AGENT_KEY_VENDOR(agentId));
  if (vendor?.id) return { origin: 'vendor', record: vendor, key: AGENT_KEY_VENDOR(agentId) };
  return null;
}

export const jobsStore = {
  async loadAgent(agentId) {
    return resolveAgent(agentId);
  },

  async createJob(job) {
    await kv.hset(JOB_KEY(job.id), job);
    await kv.zadd(JOBS_ALL, { score: job.createdAt, member: job.id });
    await kv.zadd(JOBS_BY_HIRER(job.hirerWallet), { score: job.createdAt, member: job.id });
    await kv.zadd(JOBS_BY_AGENT(job.agentWallet), { score: job.createdAt, member: job.id });
    return job;
  },

  async updateJob(job) {
    await kv.hset(JOB_KEY(job.id), job);
    return job;
  },

  async getJob(jobId) {
    return kv.hgetall(JOB_KEY(jobId));
  },

  async listJobs({ hirerWallet, agentWallet, status }) {
    const ids = hirerWallet
      ? await kv.zrange(JOBS_BY_HIRER(hirerWallet), 0, -1, { rev: true })
      : agentWallet
        ? await kv.zrange(JOBS_BY_AGENT(agentWallet), 0, -1, { rev: true })
        : await kv.zrange(JOBS_ALL, 0, -1, { rev: true });
    if (!ids?.length) return [];
    return (await Promise.all(ids.map((id) => kv.hgetall(JOB_KEY(id))))).filter((job) => job && (!status || job.status === status));
  },

  async saveDispute(dispute) {
    await kv.set(DISPUTE_KEY(dispute.jobId), dispute);
    return dispute;
  },

  async getDispute(jobId) {
    return kv.get(DISPUTE_KEY(jobId));
  },

  async updateAgentReputation(agentId, updater) {
    const resolved = await resolveAgent(agentId);
    if (!resolved) return null;

    const current = resolved.record;
    const next = updater(current);
    await kv.hset(resolved.key, next);
    return next;
  },
};
