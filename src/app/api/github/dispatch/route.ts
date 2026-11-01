import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, owner, repo, workflowFile = 'nxnative-builder.yml', inputs } = body;

    if (!token || !owner || !repo) {
      return NextResponse.json(
        { error: 'GitHub Personal Access Token, Owner/Username, and Repository Name are required.' },
        { status: 400 }
      );
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
        // use raw error text
      }

      return NextResponse.json(
        {
          error: `GitHub API error (${ghResponse.status}): ${parsedError}`,
          hint: ghResponse.status === 404
            ? `Make sure repo '${owner}/${repo}' exists, the token has 'workflow' & 'repo' scopes, and '.github/workflows/${workflowFile}' is committed to the 'main' branch.`
            : undefined,
        },
        { status: ghResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Workflow successfully triggered on GitHub Actions runner!',
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
