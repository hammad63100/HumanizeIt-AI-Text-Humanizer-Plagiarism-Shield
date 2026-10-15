import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';
import { User, PlanTier, Document, Job, JobType, JobStatus, Scan, VoiceProfile, Subscription } from '../types';
import { Logger } from '../utils';

// Track if PostgreSQL connection is currently functional
let isPostgresAvailable = true;

function isConnectionError(err: any): boolean {
  if (!err) return false;
  const msg = err.message || err.code || '';
  return (
    msg.includes('ECONNREFUSED') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('ENOTFOUND') ||
    msg.includes('connection terminated') ||
    msg.includes('Connection terminated') ||
    msg.includes('no pg_hba.conf entry') ||
    err.code === 'ECONNREFUSED'
  );
}

// ==========================================
// IN-MEMORY STORES (Resilient local fallback)
// ==========================================
const memUsers = new Map<string, User>();
const memDocuments = new Map<string, Document>();
const memJobs = new Map<string, Job>();
const memScans = new Map<string, Scan>();
const memVoiceProfiles = new Map<string, VoiceProfile & { name?: string; description?: string }>();
const memUsageDaily = new Map<string, number>(); // key: `${userId}:${day}`
const memSubscriptions = new Map<string, Subscription>(); // key: userId

// ==========================================
// USERS
// ==========================================
export const UserRepo = {
  async findById(id: string): Promise<User | null> {
    if (isPostgresAvailable) {
      try {
        const rows = await query<User>('SELECT * FROM users WHERE id = $1', [id]);
        return rows[0] || null;
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
          Logger.warn('PostgreSQL connection unavailable, switching to in-memory store');
        } else {
          throw err;
        }
      }
    }
    return memUsers.get(id) || null;
  },

  async findByEmail(email: string): Promise<User | null> {
    if (isPostgresAvailable) {
      try {
        const rows = await query<User>('SELECT * FROM users WHERE email = $1', [email]);
        return rows[0] || null;
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
          Logger.warn('PostgreSQL connection unavailable, switching to in-memory store');
        } else {
          throw err;
        }
      }
    }
    for (const user of memUsers.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  },

  async create(email: string, passwordHash: string, plan: PlanTier = 'free'): Promise<User> {
    if (isPostgresAvailable) {
      try {
        const rows = await query<User>(
          'INSERT INTO users (email, password_hash, plan) VALUES ($1, $2, $3) RETURNING *',
          [email, passwordHash, plan]
        );
        return rows[0];
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
          Logger.warn('PostgreSQL connection unavailable, switching to in-memory store');
        } else {
          throw err;
        }
      }
    }
    const user: User = {
      id: uuidv4(),
      email,
      password_hash: passwordHash,
      plan,
      created_at: new Date(),
    };
    memUsers.set(user.id, user);
    return user;
  },

  async updatePlan(userId: string, plan: PlanTier): Promise<void> {
    if (isPostgresAvailable) {
      try {
        await query('UPDATE users SET plan = $1 WHERE id = $2', [plan, userId]);
        return;
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
        } else {
          throw err;
        }
      }
    }
    const user = memUsers.get(userId);
    if (user) {
      user.plan = plan;
    }
  },
};

// ==========================================
// DOCUMENTS
// ==========================================
export const DocumentRepo = {
  async create(data: {
    user_id: string | null;
    original_text: string;
    mode: string;
    tone?: string;
    word_count: number;
  }): Promise<Document> {
    if (isPostgresAvailable) {
      try {
        const rows = await query<Document>(
          `INSERT INTO documents (user_id, original_text, mode, tone, word_count)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [data.user_id, data.original_text, data.mode, data.tone || null, data.word_count]
        );
        return rows[0];
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
          Logger.warn('PostgreSQL connection unavailable, switching to in-memory store');
        } else {
          throw err;
        }
      }
    }
    const doc: Document = {
      id: uuidv4(),
      user_id: data.user_id,
      original_text: data.original_text,
      rewritten_text: null,
      mode: data.mode as any,
      tone: data.tone || null,
      word_count: data.word_count,
      meaning_score: null,
      created_at: new Date(),
    };
    memDocuments.set(doc.id, doc);
    return doc;
  },

  async updateResult(
    id: string,
    rewrittenText: string,
    meaningScore: number | null
  ): Promise<void> {
    if (isPostgresAvailable) {
      try {
        await query(
          'UPDATE documents SET rewritten_text = $1, meaning_score = $2 WHERE id = $3',
          [rewrittenText, meaningScore, id]
        );
        return;
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
        } else {
          throw err;
        }
      }
    }
    const doc = memDocuments.get(id);
    if (doc) {
      doc.rewritten_text = rewrittenText;
      doc.meaning_score = meaningScore;
    }
  },

  async findById(id: string): Promise<Document | null> {
    if (isPostgresAvailable) {
      try {
        const rows = await query<Document>('SELECT * FROM documents WHERE id = $1', [id]);
        return rows[0] || null;
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
        } else {
          throw err;
        }
      }
    }
    return memDocuments.get(id) || null;
  },

  async findByUser(userId: string, limit: number = 50, offset: number = 0): Promise<Document[]> {
    if (isPostgresAvailable) {
      try {
        return await query<Document>(
          'SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
          [userId, limit, offset]
        );
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
        } else {
          throw err;
        }
      }
    }
    const userDocs = Array.from(memDocuments.values())
      .filter((d) => d.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(offset, offset + limit);
    return userDocs;
  },

  async deleteById(id: string, userId: string): Promise<boolean> {
    if (isPostgresAvailable) {
      try {
        const rows = await query(
          'DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING id',
          [id, userId]
        );
        return rows.length > 0;
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
        } else {
          throw err;
        }
      }
    }
    const doc = memDocuments.get(id);
    if (doc && doc.user_id === userId) {
      memDocuments.delete(id);
      return true;
    }
    return false;
  },

  async deleteGuestOlderThan(hours: number = 24): Promise<number> {
    if (isPostgresAvailable) {
      try {
        const rows = await query(
          `DELETE FROM documents
           WHERE user_id IS NULL
           AND created_at < NOW() - INTERVAL '${hours} hours'
           RETURNING id`,
          []
        );
        return rows.length;
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
        } else {
          throw err;
        }
      }
    }
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    let deleted = 0;
    for (const [id, doc] of memDocuments.entries()) {
      if (!doc.user_id && new Date(doc.created_at).getTime() < cutoff) {
        memDocuments.delete(id);
        deleted++;
      }
    }
    return deleted;
  },
};

// ==========================================
// JOBS
// ==========================================
export const JobRepo = {
  async create(data: {
    user_id: string | null;
    session_id: string | null;
    type: JobType;
    document_id?: string | null;
  }): Promise<Job> {
    if (isPostgresAvailable) {
      try {
        const rows = await query<Job>(
          `INSERT INTO jobs (user_id, session_id, type, status, document_id)
           VALUES ($1, $2, $3, 'queued', $4)
           RETURNING *`,
          [data.user_id, data.session_id, data.type, data.document_id || null]
        );
        return rows[0];
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
          Logger.warn('PostgreSQL connection unavailable, switching to in-memory store');
        } else {
          throw err;
        }
      }
    }
    const job: Job = {
      id: uuidv4(),
      user_id: data.user_id,
      session_id: data.session_id,
      type: data.type,
      status: 'queued',
      document_id: data.document_id || null,
      error: null,
      created_at: new Date(),
      finished_at: null,
    };
    memJobs.set(job.id, job);
    return job;
  },

  async findById(id: string): Promise<Job | null> {
    if (isPostgresAvailable) {
      try {
        const rows = await query<Job>('SELECT * FROM jobs WHERE id = $1', [id]);
        return rows[0] || null;
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
        } else {
          throw err;
        }
      }
    }
    return memJobs.get(id) || null;
  },

  async updateStatus(id: string, status: JobStatus, error?: string): Promise<void> {
    if (isPostgresAvailable) {
      try {
        if (status === 'done' || status === 'failed') {
          await query(
            'UPDATE jobs SET status = $1, error = $2, finished_at = NOW() WHERE id = $3',
            [status, error || null, id]
          );
        } else {
          await query('UPDATE jobs SET status = $1 WHERE id = $2', [status, id]);
        }
        return;
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
        } else {
          throw err;
        }
      }
    }
    const job = memJobs.get(id);
    if (job) {
      job.status = status;
      if (error) job.error = error;
      if (status === 'done' || status === 'failed') {
        job.finished_at = new Date();
      }
    }
  },

  async setDocumentId(jobId: string, documentId: string): Promise<void> {
    if (isPostgresAvailable) {
      try {
        await query('UPDATE jobs SET document_id = $1 WHERE id = $2', [documentId, jobId]);
        return;
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
        } else {
          throw err;
        }
      }
    }
    const job = memJobs.get(jobId);
    if (job) {
      job.document_id = documentId;
    }
  },

  async deleteGuestOlderThan(hours: number = 24): Promise<number> {
    if (isPostgresAvailable) {
      try {
        const rows = await query(
          `DELETE FROM jobs
           WHERE user_id IS NULL AND session_id IS NOT NULL
           AND created_at < NOW() - INTERVAL '${hours} hours'
           RETURNING id`,
          []
        );
        return rows.length;
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
        } else {
          throw err;
        }
      }
    }
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    let deleted = 0;
    for (const [id, job] of memJobs.entries()) {
      if (!job.user_id && job.session_id && new Date(job.created_at).getTime() < cutoff) {
        memJobs.delete(id);
        deleted++;
      }
    }
    return deleted;
  },
};

// ==========================================
// SCANS
// ==========================================
export const ScanRepo = {
  async create(data: {
    document_id: string;
    ai_score_before?: number;
    ai_score_after?: number;
    plagiarism_percent?: number;
    sources?: Record<string, unknown>[];
  }): Promise<Scan> {
    if (isPostgresAvailable) {
      try {
        const rows = await query<Scan>(
          `INSERT INTO scans (document_id, ai_score_before, ai_score_after, plagiarism_percent, sources)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [
            data.document_id,
            data.ai_score_before ?? null,
            data.ai_score_after ?? null,
            data.plagiarism_percent ?? null,
            data.sources ? JSON.stringify(data.sources) : null,
          ]
        );
        return rows[0];
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
          Logger.warn('PostgreSQL connection unavailable, switching to in-memory store');
        } else {
          throw err;
        }
      }
    }
    const scan: Scan = {
      id: uuidv4(),
      document_id: data.document_id,
      ai_score_before: data.ai_score_before ?? null,
      ai_score_after: data.ai_score_after ?? null,
      plagiarism_percent: data.plagiarism_percent ?? null,
      sources: data.sources || null,
      created_at: new Date(),
    };
    memScans.set(scan.id, scan);
    return scan;
  },

  async findByDocumentId(documentId: string): Promise<Scan | null> {
    if (isPostgresAvailable) {
      try {
        const rows = await query<Scan>(
          'SELECT * FROM scans WHERE document_id = $1 ORDER BY created_at DESC LIMIT 1',
          [documentId]
        );
        return rows[0] || null;
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
        } else {
          throw err;
        }
      }
    }
    for (const scan of memScans.values()) {
      if (scan.document_id === documentId) {
        return scan;
      }
    }
    return null;
  },
};

// ==========================================
// VOICE PROFILES
// ==========================================
export const VoiceProfileRepo = {
  async create(
    userId: string,
    style: Record<string, unknown>,
    metadata?: { name?: string; description?: string }
  ): Promise<VoiceProfile & { name?: string; description?: string }> {
    if (isPostgresAvailable) {
      try {
        const rows = await query<VoiceProfile>(
          'INSERT INTO voice_profiles (user_id, style) VALUES ($1, $2) RETURNING *',
          [userId, JSON.stringify(style)]
        );
        return { ...rows[0], name: metadata?.name || 'Custom Voice', description: metadata?.description || '' };
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
          Logger.warn('PostgreSQL connection unavailable, switching to in-memory store');
        } else {
          throw err;
        }
      }
    }
    const profile = {
      id: uuidv4(),
      user_id: userId,
      style,
      name: metadata?.name || 'Custom Voice',
      description: metadata?.description || 'Custom user voice profile',
      created_at: new Date(),
    };
    memVoiceProfiles.set(profile.id, profile);
    return profile;
  },

  async findByUser(userId: string): Promise<Array<VoiceProfile & { name?: string; description?: string }>> {
    if (isPostgresAvailable) {
      try {
        const rows = await query<VoiceProfile>(
          'SELECT * FROM voice_profiles WHERE user_id = $1 ORDER BY created_at DESC',
          [userId]
        );
        return rows.map((r, i) => ({
          ...r,
          name: (r.style as any)?.name || `Voice Profile ${i + 1}`,
          description: (r.style as any)?.description || 'Personal writing style',
        }));
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
        } else {
          throw err;
        }
      }
    }
    return Array.from(memVoiceProfiles.values()).filter((p) => p.user_id === userId);
  },

  async findById(id: string): Promise<(VoiceProfile & { name?: string; description?: string }) | null> {
    if (isPostgresAvailable) {
      try {
        const rows = await query<VoiceProfile>('SELECT * FROM voice_profiles WHERE id = $1', [id]);
        if (!rows[0]) return null;
        return {
          ...rows[0],
          name: (rows[0].style as any)?.name || 'Custom Voice',
          description: (rows[0].style as any)?.description || '',
        };
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
        } else {
          throw err;
        }
      }
    }
    return memVoiceProfiles.get(id) || null;
  },
};

// ==========================================
// USAGE TRACKING
// ==========================================
export const UsageRepo = {
  async getWordsUsedToday(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    if (isPostgresAvailable) {
      try {
        const rows = await query<{ words_used: number }>(
          'SELECT words_used FROM usage_daily WHERE user_id = $1 AND day = $2',
          [userId, today]
        );
        return rows[0]?.words_used || 0;
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
        } else {
          throw err;
        }
      }
    }
    return memUsageDaily.get(`${userId}:${today}`) || 0;
  },

  async getWordsUsedThisMonth(userId: string): Promise<number> {
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (isPostgresAvailable) {
      try {
        const monthStart = `${monthPrefix}-01`;
        const rows = await query<{ total: string }>(
          `SELECT COALESCE(SUM(words_used), 0) as total
           FROM usage_daily
           WHERE user_id = $1 AND day >= $2`,
          [userId, monthStart]
        );
        return parseInt(rows[0]?.total || '0', 10);
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
        } else {
          throw err;
        }
      }
    }
    let total = 0;
    for (const [key, words] of memUsageDaily.entries()) {
      if (key.startsWith(`${userId}:${monthPrefix}`)) {
        total += words;
      }
    }
    return total;
  },

  async addWords(userId: string, wordCount: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    if (isPostgresAvailable) {
      try {
        await query(
          `INSERT INTO usage_daily (user_id, day, words_used)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, day)
           DO UPDATE SET words_used = usage_daily.words_used + $3`,
          [userId, today, wordCount]
        );
        return;
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
        } else {
          throw err;
        }
      }
    }
    const key = `${userId}:${today}`;
    const current = memUsageDaily.get(key) || 0;
    memUsageDaily.set(key, current + wordCount);
  },

  async releaseWords(userId: string, wordCount: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    if (isPostgresAvailable) {
      try {
        await query(
          `UPDATE usage_daily
           SET words_used = GREATEST(0, words_used - $3)
           WHERE user_id = $1 AND day = $2`,
          [userId, today, wordCount]
        );
        return;
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
        } else {
          throw err;
        }
      }
    }
    const key = `${userId}:${today}`;
    const current = memUsageDaily.get(key) || 0;
    memUsageDaily.set(key, Math.max(0, current - wordCount));
  },
};

// ==========================================
// SUBSCRIPTIONS
// ==========================================
export const SubscriptionRepo = {
  async findByUser(userId: string): Promise<Subscription | null> {
    if (isPostgresAvailable) {
      try {
        const rows = await query<Subscription>(
          'SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY renews_at DESC LIMIT 1',
          [userId]
        );
        return rows[0] || null;
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
        } else {
          throw err;
        }
      }
    }
    return memSubscriptions.get(userId) || null;
  },

  async upsert(data: {
    user_id: string;
    provider: string;
    provider_customer_id: string;
    status: string;
    renews_at?: Date;
  }): Promise<Subscription> {
    if (isPostgresAvailable) {
      try {
        const rows = await query<Subscription>(
          `INSERT INTO subscriptions (user_id, provider, provider_customer_id, status, renews_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (user_id) DO UPDATE
           SET provider = $2, provider_customer_id = $3, status = $4, renews_at = $5
           RETURNING *`,
          [data.user_id, data.provider, data.provider_customer_id, data.status, data.renews_at || null]
        );
        return rows[0];
      } catch (err: any) {
        if (isConnectionError(err)) {
          isPostgresAvailable = false;
        } else {
          throw err;
        }
      }
    }
    const sub: Subscription = {
      id: uuidv4(),
      user_id: data.user_id,
      provider: data.provider as any,
      provider_customer_id: data.provider_customer_id,
      status: data.status as any,
      renews_at: data.renews_at || null,
    };
    memSubscriptions.set(data.user_id, sub);
    return sub;
  },
};
