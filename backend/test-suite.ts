/**
 * Comprehensive API Test Suite for HumanizeIt Backend
 */
async function runTests() {
  const BASE_URL = 'http://localhost:4000';
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} ${detail ? '(' + detail + ')' : ''}`);
      failed++;
    }
  }

  console.log('\n🧪 Starting HumanizeIt Backend API Test Suite...\n');

  // 1. Health Endpoint
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json() as any;
    assert(res.status === 200 || res.status === 503, 'GET /health responds with status code', `status: ${res.status}`);
    assert(data.status !== undefined, 'GET /health contains status');
  } catch (err: any) {
    assert(false, 'GET /health', err.message);
  }

  // 2. Usage Endpoint
  try {
    const res = await fetch(`${BASE_URL}/v1/usage`);
    const data = await res.json() as any;
    assert(res.status === 200, 'GET /v1/usage responds 200');
    assert(data.plan !== undefined || data.data?.plan !== undefined, 'GET /v1/usage returns plan info');
    assert((data.words_limit || data.data?.words_limit) > 0, 'GET /v1/usage returns words limit');
  } catch (err: any) {
    assert(false, 'GET /v1/usage', err.message);
  }

  // 3. Humanize Endpoint & Job Polling
  let jobId = '';
  try {
    const res = await fetch(`${BASE_URL}/v1/humanize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'The artificial intelligence algorithm meticulously analyzed comprehensive datasets to produce superior predictive outcomes across multiple operational parameters.',
        mode: 'balanced',
        tone: 'professional',
      }),
    });
    const data = await res.json() as any;
    assert(res.status === 202, 'POST /v1/humanize responds 202 Accepted', `status: ${res.status}`);
    jobId = data.job_id || data.data?.job_id;
    assert(Boolean(jobId), 'POST /v1/humanize returns job_id', `jobId: ${jobId}`);
  } catch (err: any) {
    assert(false, 'POST /v1/humanize', err.message);
  }

  // 4. Poll Job Result
  if (jobId) {
    try {
      let attempts = 0;
      let jobResult: any = null;
      while (attempts < 10) {
        await new Promise((r) => setTimeout(r, 800));
        const res = await fetch(`${BASE_URL}/v1/jobs/${jobId}`);
        const data = await res.json() as any;
        if (data.status === 'done' || data.data?.status === 'done') {
          jobResult = data;
          break;
        }
        attempts++;
      }
      assert(Boolean(jobResult), 'GET /v1/jobs/:id poll completes within timeout');
      const rewritten = jobResult?.rewritten_text || jobResult?.data?.result?.rewritten_text;
      assert(Boolean(rewritten && rewritten.length > 10), 'GET /v1/jobs/:id returns rewritten_text');
      const meaningScore = jobResult?.meaning_score ?? jobResult?.data?.result?.meaning_score;
      assert(typeof meaningScore === 'number', 'GET /v1/jobs/:id returns meaning_score');
    } catch (err: any) {
      assert(false, 'GET /v1/jobs/:id polling', err.message);
    }
  }

  // 5. Detect Endpoint
  try {
    const res = await fetch(`${BASE_URL}/v1/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'In conclusion, it is imperative to delve deeply into the underlying architecture of modern neural networks.',
      }),
    });
    const data = await res.json() as any;
    assert(res.status === 200, 'POST /v1/detect responds 200');
    const aiScore = data.ai_percentage ?? data.ai_score ?? data.data?.ai_percentage;
    assert(typeof aiScore === 'number', 'POST /v1/detect returns ai probability score');
    const sentenceScores = data.sentence_scores ?? data.flags ?? data.data?.flags;
    assert(Array.isArray(sentenceScores) && sentenceScores.length > 0, 'POST /v1/detect returns sentence breakdown');
  } catch (err: any) {
    assert(false, 'POST /v1/detect', err.message);
  }

  // 6. Plagiarism Endpoint
  try {
    const res = await fetch(`${BASE_URL}/v1/plagiarism`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'This is an academic research document analyzing the implications of advanced computational linguistics on modern cognitive science.',
      }),
    });
    const data = await res.json() as any;
    assert(res.status === 200 || res.status === 202, 'POST /v1/plagiarism responds 200/202');
    const similarity = data.similarity_score ?? data.similarity_percentage ?? data.data?.similarity_score;
    assert(typeof similarity === 'number', 'POST /v1/plagiarism returns similarity percentage');
  } catch (err: any) {
    assert(false, 'POST /v1/plagiarism', err.message);
  }

  // 7. Rewrite Sentence Endpoint
  try {
    const res = await fetch(`${BASE_URL}/v1/rewrite-sentence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sentence: 'Furthermore, it is widely acknowledged that synthetic intelligence outperforms traditional heuristics.',
        context: 'Discussion of machine learning algorithms in modern industry.',
        mode: 'balanced',
      }),
    });
    const data = await res.json() as any;
    assert(res.status === 200, 'POST /v1/rewrite-sentence responds 200');
    const rewrittenSentence = data.rewritten_sentence ?? data.rewritten ?? data.data?.rewritten;
    assert(Boolean(rewrittenSentence), 'POST /v1/rewrite-sentence returns rewritten sentence');
  } catch (err: any) {
    assert(false, 'POST /v1/rewrite-sentence', err.message);
  }

  // 8. Citations Endpoint
  try {
    const res = await fetch(`${BASE_URL}/v1/citations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_url_or_title: 'Attention Is All You Need, Vaswani et al., 2017',
        format: 'apa',
      }),
    });
    const data = await res.json() as any;
    assert(res.status === 200, 'POST /v1/citations responds 200');
    const citation = data.citation ?? data.data?.citation;
    assert(Boolean(citation), 'POST /v1/citations returns formatted academic citation');
  } catch (err: any) {
    assert(false, 'POST /v1/citations', err.message);
  }

  // 9. Auth Registration & Login
  let authToken = '';
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  try {
    const res = await fetch(`${BASE_URL}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    const data = await res.json() as any;
    assert(res.status === 201, 'POST /v1/auth/register creates user account');
    authToken = data.data?.token || data.token;
    assert(Boolean(authToken), 'POST /v1/auth/register issues JWT token');
  } catch (err: any) {
    assert(false, 'POST /v1/auth/register', err.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    const data = await res.json() as any;
    assert(res.status === 200, 'POST /v1/auth/login authenticates user');
  } catch (err: any) {
    assert(false, 'POST /v1/auth/login', err.message);
  }

  // 10. Authenticated Route: GET /v1/auth/me
  if (authToken) {
    try {
      const res = await fetch(`${BASE_URL}/v1/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json() as any;
      assert(res.status === 200, 'GET /v1/auth/me validates Bearer JWT');
      assert(data.data?.user?.email === testEmail, 'GET /v1/auth/me returns current user profile');
    } catch (err: any) {
      assert(false, 'GET /v1/auth/me', err.message);
    }
  }

  // 11. Voice Profile Creation & Listing
  try {
    const createRes = await fetch(`${BASE_URL}/v1/voice-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({
        name: 'Technical Academic Voice',
        sample_text: 'Our quantitative analysis clearly establishes that statistical variance diminishes substantially under iterative stochastic sampling protocols.',
      }),
    });
    const createData = await createRes.json() as any;
    assert(createRes.status === 201, 'POST /v1/voice-profile creates profile');

    const listRes = await fetch(`${BASE_URL}/v1/voice-profile`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });
    const listData = await listRes.json() as any;
    assert(listRes.status === 200, 'GET /v1/voice-profile lists profiles');
  } catch (err: any) {
    assert(false, 'Voice profile endpoints', err.message);
  }

  // 12. Documents History
  try {
    const res = await fetch(`${BASE_URL}/v1/documents`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });
    const data = await res.json() as any;
    assert(res.status === 200, 'GET /v1/documents returns document history');
  } catch (err: any) {
    assert(false, 'GET /v1/documents', err.message);
  }

  // 13. Billing Checkout Session
  if (authToken) {
    try {
      const res = await fetch(`${BASE_URL}/v1/billing/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ plan: 'pro' }),
      });
      const data = await res.json() as any;
      assert(res.status === 200, 'POST /v1/billing/checkout generates checkout URL');
      assert(Boolean(data.data?.checkout_url), 'Checkout contains checkout_url');
    } catch (err: any) {
      assert(false, 'POST /v1/billing/checkout', err.message);
    }
  }

  // 14. Billing Webhook Ingestion
  try {
    const res = await fetch(`${BASE_URL}/v1/webhooks/billing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'subscription.created',
        customer_id: 'cus_test123',
        plan: 'pro',
      }),
    });
    assert(res.status === 200, 'POST /v1/webhooks/billing ingests provider webhook');
  } catch (err: any) {
    assert(false, 'POST /v1/webhooks/billing', err.message);
  }

  console.log(`\n===========================================`);
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`===========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
