import { cookies } from 'next/headers';
import { verifyAgentToken } from './autarkicAuth';

export async function resolveRequestAuth(request) {
  const authorization = request.headers.get('authorization') || '';
  if (authorization.startsWith('Bearer ')) {
    const token = authorization.slice(7).trim();
    const claims = verifyAgentToken(token);
    const account = claims?.account || claims?.sub || null;
    if (!account) return { type: null, account: null, error: 'InvalidAutarkicToken' };
    return { type: 'agent', account, claims };
  }

  const jar = await cookies();
  const xummAccount = jar.get('xummAccount')?.value;
  if (xummAccount) return { type: 'human', account: xummAccount };

  return { type: null, account: null, error: 'NotAuthenticated' };
}

export function requireHuman(auth) {
  return auth?.type === 'human' ? null : 'HumanWalletAuthRequired';
}

export function requireAgent(auth) {
  return auth?.type === 'agent' ? null : 'AgentBearerAuthRequired';
}
