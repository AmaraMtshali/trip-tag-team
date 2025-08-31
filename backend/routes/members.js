const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Add member (join)
router.post('/:sessionId/members', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { name, phoneNumber } = req.body;
    // optional: check session exists and not expired
    const { data: session } = await supabase
      .from('sessions')
      .select('id, expires_at')
      .eq('id', sessionId)
      .single();

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (new Date(session.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Session expired' });
    }

    const { data, error } = await supabase
      .from('members')
      .insert({
        session_id: sessionId,
        name: name.trim(),
        phone_number: phoneNumber || null
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    // handle uniqueness violation gracefully
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Member with that name already exists' });
    }
    res.status(500).json({ error: err.message || err });
  }
});

// Update member status
router.patch('/:sessionId/members/:memberId', async (req, res) => {
  try {
    const { sessionId, memberId } = req.params;
    const { status } = req.body;
    const { data, error } = await supabase
      .from('members')
      .update({ status, last_activity: new Date().toISOString() })
      .match({ id: memberId, session_id: sessionId })
      .select()
      .single();

    if (error) return res.status(404).json({ error: 'Member not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
