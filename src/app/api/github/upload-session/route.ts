import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const authCookie = req.cookies.get('nx_auth');
    if (authCookie?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER || 'Cyclops3420';
    const repo = process.env.GITHUB_REPO || 'nxnative-cloud-studio';

    if (!token) {
      return NextResponse.json({ error: 'GitHub token missing' }, { status: 500 });
    }

    const headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token.trim()}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'NXNative-Cloud-Compiler',
    };

    const tag = 'game-inputs';

    // 1. Check if release already exists
    let releaseData = null;
    try {
      const getRel = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`, { headers });
      if (getRel.ok) {
        releaseData = await getRel.json();
      }
    } catch (e) {
      // not found
    }

    // 2. If not found, create release
    if (!releaseData) {
      const createRel = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tag_name: tag,
          name: 'Game Input Binaries (Automated)',
          body: 'Automated release holding uploaded game backups for GitHub Actions runners.',
          draft: false,
          prerelease: true,
        }),
      });

      if (!createRel.ok) {
        const err = await createRel.text();
        return NextResponse.json({ error: `Failed to create input release: ${err}` }, { status: createRel.status });
      }

      releaseData = await createRel.json();
    }

    // Return the upload URL and token to allow the browser to stream directly to uploads.github.com
    return NextResponse.json({
      success: true,
      releaseId: releaseData.id,
      uploadUrl: releaseData.upload_url.replace(/\{(\?name,label)?\}/, ''),
      token: token.trim(),
    });
  } catch (err: any) {
    console.error('Error getting upload session:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
