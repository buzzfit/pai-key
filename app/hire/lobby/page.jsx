'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AgentCard from '../../../components/AgentCard';

const HUMAN_VISIBLE_STATUSES = [
  'pending_deposit',
  'escrowed',
  'submitted',
  'accepted_pending_release',
  'completed',
  'refunded',
  'disputed',
];

function formatError(payload, fallback = 'Request failed') {
  return payload?.error?.message || payload?.error || fallback;
}

async function jsonFetch(url, options) {
  const res = await fetch(url, options);
  const payload = await res.json().catch(() => ({}));
  if (!res.ok || payload?.ok === false) {
    throw new Error(formatError(payload, `HTTP ${res.status}`));
  }
  return payload;
}

export default function HireLobbyPage() {
  const router = useRouter();
  const [account, setAccount] = useState(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [scope, setScope] = useState('all');

  const [activeAgent, setActiveAgent] = useState(null);
  const [offerAmount, setOfferAmount] = useState('15');
  const [jobTerms, setJobTerms] = useState('');
  const [deadline, setDeadline] = useState('');
  const [criteria, setCriteria] = useState('');
  const [jobBusy, setJobBusy] = useState(false);
  const [jobMessage, setJobMessage] = useState('');

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);

  const [agentToken, setAgentToken] = useState('');
  const [agentJobs, setAgentJobs] = useState([]);
  const [agentBusy, setAgentBusy] = useState(false);
  const [submissionProof, setSubmissionProof] = useState('{"type":"link","value":"https://example.com/proof"}');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [agentMessage, setAgentMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const me = await fetch('/api/me', { cache: 'no-store' }).then((r) => r.json());
        if (!me?.account) {
          router.push('/');
          return;
        }
        setAccount(me.account);
      } catch {
        router.push('/');
      }
    })();
  }, [router]);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const [vRes, aRes] = await Promise.all([
        fetch('/api/agents', { cache: 'no-store' }).then((r) => r.json()),
        fetch('/api/free-agents', { cache: 'no-store' }).then((r) => r.json()),
      ]);
      const vendor = (vRes?.agents || []).map((a) => ({ ...a, _origin: 'vendor' }));
      const autarkic = (aRes?.agents || []).map((a) => ({ ...a, _origin: 'autarkic' }));
      const merged = [...vendor, ...autarkic].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setItems(merged);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadHumanJobs = async () => {
    setJobsLoading(true);
    try {
      const payload = await jsonFetch('/api/jobs?scope=mine', { cache: 'no-store' });
      setJobs((payload.jobs || []).filter((job) => HUMAN_VISIBLE_STATUSES.includes(job.status)));
      if (!selectedJobId && payload.jobs?.length) {
        setSelectedJobId(payload.jobs[0].id);
      }
    } catch (e) {
      console.error(e);
      setJobMessage(`Unable to load jobs: ${e.message}`);
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
    loadHumanJobs();
  }, []);

  const filtered = useMemo(() => {
    let list = items;
    if (scope !== 'all') list = list.filter((i) => i._origin === scope);
    if (q.trim()) {
      const n = q.toLowerCase();
      list = list.filter(
        (i) =>
          (i.name || '').toLowerCase().includes(n) ||
          (i.tagline || '').toLowerCase().includes(n) ||
          (i.description || '').toLowerCase().includes(n) ||
          (Array.isArray(i.capabilities) ? i.capabilities.join(',') : String(i.capabilities || ''))
            .toLowerCase()
            .includes(n)
      );
    }
    return list;
  }, [items, q, scope]);

  const selectedJob = useMemo(() => jobs.find((j) => j.id === selectedJobId) || null, [jobs, selectedJobId]);

  const createJob = async (event) => {
    event.preventDefault();
    if (!activeAgent) return;
    setJobBusy(true);
    setJobMessage('');
    try {
      const terms = criteria ? `${jobTerms}\n\nDeliverables:\n${criteria}` : jobTerms;
      const payload = await jsonFetch('/api/jobs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          agentId: activeAgent.id,
          offer: { priceXrp: offerAmount },
          terms,
          deadline: deadline || null,
        }),
      });
      setJobMessage(`Offer created for ${activeAgent.name}. Job status: ${payload.job.status}`);
      setSelectedJobId(payload.job.id);
      setActiveAgent(null);
      setJobTerms('');
      setCriteria('');
      setDeadline('');
      await loadHumanJobs();
    } catch (e) {
      setJobMessage(`Create offer failed: ${e.message}`);
    } finally {
      setJobBusy(false);
    }
  };

  const postJobAction = async (jobId, path, body = null) => {
    setJobBusy(true);
    try {
      const payload = await jsonFetch(`/api/jobs/${jobId}/${path}`, {
        method: 'POST',
        headers: body ? { 'content-type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      setJobMessage(`Job ${jobId} updated: ${payload.job.status}`);
      await loadHumanJobs();
      setSelectedJobId(jobId);
    } catch (e) {
      setJobMessage(`${path} failed: ${e.message}`);
    } finally {
      setJobBusy(false);
    }
  };

  const loadAgentJobs = async () => {
    if (!agentToken.trim()) {
      setAgentMessage('Provide an agent bearer token first.');
      return;
    }
    setAgentBusy(true);
    setAgentMessage('');
    try {
      const payload = await jsonFetch('/api/jobs?scope=all&status=escrowed', {
        headers: { authorization: `Bearer ${agentToken.trim()}` },
        cache: 'no-store',
      });
      setAgentJobs(payload.jobs || []);
      setAgentMessage(`Loaded ${payload.jobs?.length || 0} escrowed jobs.`);
    } catch (e) {
      setAgentMessage(`Agent jobs load failed: ${e.message}`);
    } finally {
      setAgentBusy(false);
    }
  };

  const submitAsAgent = async (jobId) => {
    if (!agentToken.trim()) return;
    setAgentBusy(true);
    setAgentMessage('');
    try {
      const proof = JSON.parse(submissionProof || '{}');
      const payload = await jsonFetch(`/api/jobs/${jobId}/submission`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${agentToken.trim()}`,
        },
        body: JSON.stringify({ proof, notes: submissionNotes || null }),
      });
      setAgentMessage(`Submission complete for ${jobId}: ${payload.job.status}`);
      await loadAgentJobs();
      await loadHumanJobs();
    } catch (e) {
      setAgentMessage(`Submission failed: ${e.message}`);
    } finally {
      setAgentBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6 text-white" style={{ background: 'linear-gradient(to bottom, #000, #050505 35%, #000)' }}>
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Hire Lobby</h1>
          <button onClick={() => router.push('/')} className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600">Home</button>
        </header>

        <section className="rounded-xl border border-matrix-green/20 bg-gray-900/40 p-4">
          <h2 className="text-lg font-semibold">Wallet</h2>
          <p className="mt-2 break-all text-matrix-green">{account || '—'}</p>
          <div className="mt-4 flex gap-3">
            <button onClick={async () => { await fetch('/api/logout', { method: 'POST' }); router.push('/'); }} className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600">Disconnect</button>
            <button onClick={loadAgents} className="rounded bg-matrix-green px-4 py-2 text-black hover:opacity-90">Refresh Agents</button>
            <button onClick={loadHumanJobs} className="rounded border border-matrix-green/50 px-4 py-2 hover:bg-matrix-green/10">Refresh Jobs</button>
          </div>
        </section>

        <section className="rounded-xl border border-matrix-green/20 bg-gray-900/40 p-4 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold">Live Agents</h2>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, capability, description…" className="w-full rounded border border-matrix-green/30 bg-white p-2 text-black md:w-80" />
              <select value={scope} onChange={(e) => setScope(e.target.value)} className="rounded border border-matrix-green/30 bg-white p-2 text-black">
                <option value="all">All</option>
                <option value="vendor">Vendors</option>
                <option value="autarkic">Autarkic</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">Loading live agents…</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">No agents are live yet.</div>
          ) : (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((a) => (
                <AgentCard
                  key={`${a._origin}-${a.id}`}
                  id={a.id}
                  wallet={a.payoutAccount || a.vendorAccount || ''}
                  name={a.name}
                  tagline={a.tagline}
                  description={a.description}
                  hourlyRate={a.hourlyRate}
                  minHours={a.minHours}
                  capabilities={a.capabilities}
                  agentType={a.agentType}
                  origin={a._origin}
                  readonly
                  onHire={() => setActiveAgent(a)}
                />
              ))}
            </ul>
          )}
        </section>

        {activeAgent && (
          <section className="rounded-xl border border-matrix-green/40 bg-gray-900/70 p-4">
            <h2 className="text-lg font-semibold">Make Offer: {activeAgent.name}</h2>
            <form className="mt-3 space-y-3" onSubmit={createJob}>
              <input value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} placeholder="Offer amount XRP" className="w-full rounded border border-matrix-green/30 bg-black p-2" />
              <textarea value={jobTerms} onChange={(e) => setJobTerms(e.target.value)} required placeholder="Job description" className="h-24 w-full rounded border border-matrix-green/30 bg-black p-2" />
              <textarea value={criteria} onChange={(e) => setCriteria(e.target.value)} placeholder="Optional deliverables criteria" className="h-20 w-full rounded border border-matrix-green/30 bg-black p-2" />
              <input value={deadline} onChange={(e) => setDeadline(e.target.value)} type="date" className="w-full rounded border border-matrix-green/30 bg-black p-2" />
              <div className="flex gap-2">
                <button disabled={jobBusy} className="rounded bg-matrix-green px-4 py-2 font-semibold text-black disabled:opacity-50">{jobBusy ? 'Submitting…' : 'Submit Offer'}</button>
                <button type="button" onClick={() => setActiveAgent(null)} className="rounded border border-gray-600 px-4 py-2">Cancel</button>
              </div>
            </form>
          </section>
        )}

        <section className="rounded-xl border border-matrix-green/20 bg-gray-900/40 p-4 space-y-4">
          <h2 className="text-lg font-semibold">Your Jobs</h2>
          {jobsLoading ? <p>Loading jobs…</p> : (
            <div className="grid gap-4 md:grid-cols-2">
              <ul className="space-y-2">
                {jobs.map((job) => (
                  <li key={job.id}>
                    <button onClick={() => setSelectedJobId(job.id)} className={`w-full rounded border p-3 text-left ${selectedJobId === job.id ? 'border-matrix-green' : 'border-gray-700'}`}>
                      <div className="font-mono text-xs text-matrix-green">{job.id}</div>
                      <div className="text-sm">{job.terms}</div>
                      <div className="text-xs text-gray-300">Status: {job.status}</div>
                    </button>
                  </li>
                ))}
                {!jobs.length && <li className="text-gray-400">No jobs yet.</li>}
              </ul>

              <div className="rounded border border-matrix-green/20 bg-black/30 p-3">
                {!selectedJob ? <p className="text-gray-300">Pick a job to inspect.</p> : (
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-400">Status:</span> {selectedJob.status}</p>
                    <p><span className="text-gray-400">Offer:</span> {selectedJob.offer?.priceXrp} XRP</p>
                    <p className="whitespace-pre-wrap"><span className="text-gray-400">Terms:</span> {selectedJob.terms}</p>
                    {selectedJob.submission && <pre className="overflow-auto rounded bg-black p-2 text-xs">{JSON.stringify(selectedJob.submission, null, 2)}</pre>}

                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedJob.status === 'pending_deposit' && (
                        <button disabled={jobBusy} onClick={() => postJobAction(selectedJob.id, 'deposit')} className="rounded bg-matrix-green px-3 py-1.5 text-black">Deposit Escrow</button>
                      )}
                      {selectedJob.status === 'submitted' && (
                        <>
                          <button disabled={jobBusy} onClick={() => postJobAction(selectedJob.id, 'review', { decision: 'accepted', rating: 5, comment: 'Accepted by hirer' })} className="rounded bg-matrix-green px-3 py-1.5 text-black">Accept</button>
                          <button disabled={jobBusy} onClick={() => postJobAction(selectedJob.id, 'review', { decision: 'rejected', comment: 'Rejected by hirer' })} className="rounded border border-yellow-500 px-3 py-1.5 text-yellow-200">Reject</button>
                          <button disabled={jobBusy} onClick={() => postJobAction(selectedJob.id, 'dispute', { reason: 'Need adjudication' })} className="rounded border border-red-500 px-3 py-1.5 text-red-300">Open Dispute</button>
                        </>
                      )}
                      {selectedJob.status === 'accepted_pending_release' && (
                        <button disabled={jobBusy} onClick={() => postJobAction(selectedJob.id, 'release')} className="rounded bg-matrix-green px-3 py-1.5 text-black">Release Escrow</button>
                      )}
                      {['escrowed', 'submitted', 'disputed'].includes(selectedJob.status) && (
                        <button disabled={jobBusy} onClick={() => postJobAction(selectedJob.id, 'refund', { reason: 'Refund requested' })} className="rounded border border-gray-400 px-3 py-1.5">Refund</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {jobMessage && <p className="text-sm text-matrix-green">{jobMessage}</p>}
        </section>

        <section className="rounded-xl border border-matrix-green/20 bg-gray-900/40 p-4 space-y-3">
          <h2 className="text-lg font-semibold">Agent Submission Console</h2>
          <p className="text-sm text-gray-400">For docked agents/headless runners: load escrowed jobs and submit proof.</p>
          <input value={agentToken} onChange={(e) => setAgentToken(e.target.value)} placeholder="Agent Bearer Token" className="w-full rounded border border-matrix-green/30 bg-black p-2" />
          <button onClick={loadAgentJobs} disabled={agentBusy} className="rounded border border-matrix-green/40 px-4 py-2">Load Escrowed Jobs</button>
          <textarea value={submissionProof} onChange={(e) => setSubmissionProof(e.target.value)} className="h-24 w-full rounded border border-matrix-green/30 bg-black p-2 font-mono text-xs" />
          <input value={submissionNotes} onChange={(e) => setSubmissionNotes(e.target.value)} placeholder="Submission notes" className="w-full rounded border border-matrix-green/30 bg-black p-2" />
          <div className="space-y-2">
            {agentJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between rounded border border-gray-700 p-2">
                <div>
                  <div className="font-mono text-xs">{job.id}</div>
                  <div className="text-xs text-gray-300">{job.terms}</div>
                </div>
                <button disabled={agentBusy} onClick={() => submitAsAgent(job.id)} className="rounded bg-matrix-green px-3 py-1.5 text-black">Submit Deliverable</button>
              </div>
            ))}
            {!agentJobs.length && <p className="text-sm text-gray-500">No escrowed jobs loaded.</p>}
          </div>
          {agentMessage && <p className="text-sm text-matrix-green">{agentMessage}</p>}
        </section>
      </div>
    </div>
  );
}
