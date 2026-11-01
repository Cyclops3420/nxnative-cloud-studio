import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || searchParams.get('token');
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const runId = searchParams.get('runId');

    if (!token || !owner || !repo) {
      return NextResponse.json(
        { error: 'token, owner, and repo query parameters are required' },
        { status: 400 }
      );
    }

    const headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token.trim()}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'NXNative-Cloud-Compiler',
    };

    let targetRun: any = null;

    if (runId) {
      // Fetch specific run
      const runRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}`, { headers });
      if (!runRes.ok) {
        return NextResponse.json({ error: `Failed to fetch run ${runId}` }, { status: runRes.status });
      }
      targetRun = await runRes.json();
    } else {
      // Fetch latest workflow runs
      const runsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=5&event=workflow_dispatch`,
        { headers }
      );
      if (!runsRes.ok) {
        const err = await runsRes.text();
        return NextResponse.json({ error: `Failed to list runs: ${err}` }, { status: runsRes.status });
      }
      const data = await runsRes.json();
      targetRun = data.workflow_runs?.[0] || null;
    }

    if (!targetRun) {
      return NextResponse.json({
        found: false,
        message: 'No active or recent workflow runs found yet.',
      });
    }

    // If completed, fetch artifacts
    let artifacts: any[] = [];
    if (targetRun.id) {
      const artRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/actions/runs/${targetRun.id}/artifacts`,
        { headers }
      );
      if (artRes.ok) {
        const artData = await artRes.json();
        artifacts = artData.artifacts || [];
      }
    }

    return NextResponse.json({
      found: true,
      run: {
        id: targetRun.id,
        name: targetRun.name,
        status: targetRun.status, // queued, in_progress, completed
        conclusion: targetRun.conclusion, // success, failure, cancelled
        html_url: targetRun.html_url,
        created_at: targetRun.created_at,
        updated_at: targetRun.updated_at,
        run_attempt: targetRun.run_attempt,
        display_title: targetRun.display_title,
      },
      artifacts: artifacts.map((art) => ({
        id: art.id,
        name: art.name,
        size_in_bytes: art.size_in_bytes,
        archive_download_url: art.archive_download_url,
        expired: art.expired,
      })),
    });
  } catch (error: any) {
    console.error('Status error:', error);
    return NextResponse.json(
      { error: error?.message || 'Error checking workflow status' },
      { status: 500 }
    );
  }
}
