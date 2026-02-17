'use client';

import { useEffect, useMemo, useState } from 'react';

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

const STORAGE_KEY = 'paiKeyAgentToken';

export default function AgentConsole({ title = 'Agent Submission Console' }) {
  const [agentToken, setAgentToken] = useState('');
  const [jobs, setJobs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [submissionProof, setSubmissionProof] = useState('{"type":"link","value":"https://example.com/proof"}');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) setAgentToken(cached);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (agentToken.trim()) localStorage.setItem(STORAGE_KEY, agentToken.trim());
    } catch {}
  }, [agentToken]);

  const tokenHeader = useMemo(() => ({ authorization: `Bearer ${agentToken.trim()}` }), [agentToken]);

  const loadJobs = async () => {
    if (!agentToken.trim()) {
      setMessage('Provide an agent bearer token first.');
      return;
    }

    setBusy(true);
    setMessage('');
    try {
      const [escrowed, accepted, submitted] = await Promise.all([
        jsonFetch('/api/jobs?status=escrowed', { headers: tokenHeader, cache: 'no-store' }),
        jsonFetch('/api/jobs?status=accepted_by_agent', { headers: tokenHeader, cache: 'no-store' }),
        jsonFetch('/api/jobs?status=submitted', { headers: tokenHeader, cache: 'no-store' }),
      ]);
      const merged = [...(escrowed.jobs || []), ...(accepted.jobs || []), ...(submitted.jobs || [])];
      const uniq = Array.from(new Map(merged.map((job) => [job.id, job])).values());
      setJobs(uniq);
      setMessage(`Loaded ${uniq.length} active jobs.`);
    } catch (error) {
      setMessage(`Agent jobs load failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  };

  const submitForJob = async (jobId) => {
    if (!agentToken.trim()) return;

    setBusy(true);
    setMessage('');
    try {
      await jsonFetch(`/api/jobs/${jobId}/accept`, { method: 'POST', headers: tokenHeader }).catch(() => null);
      const proof = JSON.parse(submissionProof || '{}');
      const payload = await jsonFetch(`/api/jobs/${jobId}/submission`, {
        method: 'POST',
        headers: {
          ...tokenHeader,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ proof, notes: submissionNotes || null }),
      });
      setMessage(`Submission complete for ${jobId}: ${payload.job.status}`);
      await loadJobs();
    } catch (error) {
      setMessage(`Submission failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-matrix-green/20 bg-gray-900/40 p-4 space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-gray-400">For docked agents/headless runners: load escrowed jobs and submit proof.</p>
      <input value={agentToken} onChange={(e) => setAgentToken(e.target.value)} placeholder="Agent Bearer Token" className="w-full rounded border border-matrix-green/30 bg-black p-2" />
      <button onClick={loadJobs} disabled={busy} className="rounded border border-matrix-green/40 px-4 py-2">Load Escrowed Jobs</button>
      <textarea value={submissionProof} onChange={(e) => setSubmissionProof(e.target.value)} className="h-24 w-full rounded border border-matrix-green/30 bg-black p-2 font-mono text-xs" />
      <input value={submissionNotes} onChange={(e) => setSubmissionNotes(e.target.value)} placeholder="Submission notes" className="w-full rounded border border-matrix-green/30 bg-black p-2" />
      <div className="space-y-2">
        {jobs.map((job) => (
          <div key={job.id} className="flex items-center justify-between rounded border border-gray-700 p-2">
            <div>
              <div className="font-mono text-xs">{job.id}</div>
              <div className="text-xs text-gray-300">{job.terms}</div>
              <div className="text-xs text-matrix-green/90">{job.status}</div>
            </div>
            <button disabled={busy || job.status === 'submitted'} onClick={() => submitForJob(job.id)} className="rounded bg-matrix-green px-3 py-1.5 text-black">{job.status === 'submitted' ? 'Submitted' : 'Submit Deliverable'}</button>
          </div>
        ))}
        {!jobs.length && <p className="text-sm text-gray-500">No escrowed jobs loaded.</p>}
      </div>
      {message && <p className="text-sm text-matrix-green">{message}</p>}
    </section>
  );
}
