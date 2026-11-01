import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Verify password protection
    const authCookie = req.cookies.get('nx_auth');
    if (authCookie?.value !== 'authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized: Access password required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { inputs, prodKeys } = body;

    // Use environment variables or fallback to request body
    const token = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN || body.token;
    const owner = process.env.GITHUB_OWNER || body.owner || 'Cyclops3420';
    const repo = process.env.GITHUB_REPO || body.repo || 'nxnative-cloud-studio';
    const workflowFile = body.workflowFile || 'nxnative-builder.yml';

    if (!token) {
      return NextResponse.json(
        { error: 'GitHub Token is missing. Please set GITHUB_PAT in your Vercel project environment variables.' },
        { status: 500 }
      );
    }

    // If user provided prodKeys in the build trigger, auto-sync secret first
    if (prodKeys && typeof prodKeys === 'string') {
      try {
        const keyRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/secrets/public-key`, {
          headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${token.trim()}`,
            'X-GitHub-Api-Version': '2022-11-28',
            'User-Agent': 'NXNative-Cloud-Compiler',
          },
        });
        if (keyRes.ok) {
          const { key_id, key } = await keyRes.json();
          const sodium = await import('tweetsodium');
          const messageBytes = Buffer.from(prodKeys);
          const keyBytes = Buffer.from(key, 'base64');
          const encryptedBytes = sodium.seal(messageBytes, keyBytes);
          const encryptedBase64 = Buffer.from(encryptedBytes).toString('base64');

          await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/secrets/PROD_KEYS`, {
            method: 'PUT',
            headers: {
              'Accept': 'application/vnd.github+json',
              'Authorization': `Bearer ${token.trim()}`,
              'X-GitHub-Api-Version': '2022-11-28',
              'User-Agent': 'NXNative-Cloud-Compiler',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              encrypted_value: encryptedBase64,
              key_id,
            }),
          });
        }
      } catch (secErr) {
        console.warn('Auto-sync PROD_KEYS secret warning:', secErr);
      }
    }

    // Call GitHub API to trigger workflow_dispatch
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/dispatches`;

    const ghResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token.trim()}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'NXNative-Cloud-Compiler',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: inputs || {},
      }),
    });

    if (!ghResponse.ok) {
      const errorText = await ghResponse.text();
      let parsedError = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        parsedError = errorJson.message || errorText;
      } catch {
        // use raw
      }

      return NextResponse.json(
        {
          error: `GitHub API error (${ghResponse.status}): ${parsedError}`,
          hint: ghResponse.status === 404
            ? `Repository '${owner}/${repo}' or workflow '.github/workflows/${workflowFile}' was not found on 'main'.`
            : undefined,
        },
        { status: ghResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Build successfully dispatched to ${owner}/${repo} macOS Apple Silicon runner!`,
      repo: `${owner}/${repo}`,
      workflow: workflowFile,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Dispatch error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error while dispatching GitHub Action' },
      { status: 500 }
    );
  }
}
