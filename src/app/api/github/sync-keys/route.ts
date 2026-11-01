import { NextRequest, NextResponse } from 'next/server';
import * as sodium from 'tweetsodium';

export async function POST(req: NextRequest) {
  try {
    const authCookie = req.cookies.get('nx_auth');
    if (authCookie?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prodKeys } = await req.json();
    if (!prodKeys || typeof prodKeys !== 'string') {
      return NextResponse.json({ error: 'prodKeys text is required' }, { status: 400 });
    }

    const token = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER || 'Cyclops3420';
    const repo = process.env.GITHUB_REPO || 'nxnative-cloud-studio';

    if (!token) {
      return NextResponse.json({ error: 'GITHUB_PAT not set' }, { status: 500 });
    }

    const headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token.trim()}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'NXNative-Cloud-Compiler',
    };

    // 1. Get repo public key for secrets
    const keyRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/secrets/public-key`, {
      headers,
    });
    if (!keyRes.ok) {
      const err = await keyRes.text();
      return NextResponse.json({ error: `Failed to fetch repo public key: ${err}` }, { status: keyRes.status });
    }

    const { key_id, key } = await keyRes.json();

    // 2. Encrypt prod.keys using libsodium sealed box
    const messageBytes = Buffer.from(prodKeys);
    const keyBytes = Buffer.from(key, 'base64');
    const encryptedBytes = sodium.seal(messageBytes, keyBytes);
    const encryptedBase64 = Buffer.from(encryptedBytes).toString('base64');

    // 3. Put secret PROD_KEYS
    const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/secrets/PROD_KEYS`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        encrypted_value: encryptedBase64,
        key_id,
      }),
    });

    if (!putRes.ok) {
      const putErr = await putRes.text();
      return NextResponse.json({ error: `Failed to save PROD_KEYS secret: ${putErr}` }, { status: putRes.status });
    }

    return NextResponse.json({ success: true, message: 'PROD_KEYS successfully synced to GitHub Secrets!' });
  } catch (err: any) {
    console.error('Error syncing secret:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
