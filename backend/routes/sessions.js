const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { nanoid } = require('nanoid'); // optional for short code

function makeShortId() {
  return nanoid(8).toUpperCase();
}

// Create session
router.post('/', async (req, res) => {
  try {
    const { name, leaderName, leaderPhone, durationMs } = req.body;
    const sessionDuration = durationMs || 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + sessionDuration).toISOString();

    const shortId = makeShortId();

    const { data: session, error: sessionErr } = await supabase
      .from('sessions')
      .insert({
        short_id: shortId,
        name,
        leader_name: leaderName || null,
        leader_phone: leaderPhone || null,
        expires_at: expiresAt
      })
      .select()
      .single();

    if (sessionErr) throw sessionErr;

    // create leader member if provided
    let leaderMember = null;
    if (leaderName) {
      const { data: member, error: memberErr } = await supabase
        .from('members')
        .insert({
          session_id: session.id,
          name: leaderName.trim(),
          phone_number: leaderPhone || null,
          role: 'leader',
          status: 'present'
        })
        .select()
        .single();

      if (memberErr) throw memberErr;

      leaderMember = member;

      // update session.leader_member_id
      await supabase
        .from('sessions')
        .update({ leader_member_id: member.id })
        .eq('id', session.id);
    }

    res.status(201).json({ session, leaderMember });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || err });
  }
});

// Fetch session by short id (public info for join page)
router.get('/short/:shortId', async (req, res) => {
  try {
    const { shortId } = req.params;
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('short_id', shortId)
      .single();

    if (error) return res.status(404).json({ error: 'Session not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get session by ID (for internal use)
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) return res.status(404).json({ error: 'Session not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
