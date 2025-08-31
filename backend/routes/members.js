const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Get all members for a session
router.get('/:sessionId/members', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Check if session exists and not expired
    const { data: session } = await supabase
      .from('sessions')
      .select('id, expires_at')
      .eq('id', sessionId)
      .single();

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (new Date(session.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Session expired' });
    }

    // Try to get members with all columns, fallback to basic columns if schema issues
    let { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('session_id', sessionId)
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('Error fetching members with full schema:', error);
      // Fallback to basic columns if schema issues
      const { data: basicData, error: basicError } = await supabase
        .from('members')
        .select('id, session_id, name, phone_number, role, status, joined_at')
        .eq('session_id', sessionId)
        .order('joined_at', { ascending: true });
      
      if (basicError) throw basicError;
      data = basicData;
    }

    res.json(data);
  } catch (err) {
    console.error('Error in get members:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add member (join)
router.post('/:sessionId/members', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { name, phoneNumber } = req.body;
    
    // Check if session exists and not expired
    const { data: session } = await supabase
      .from('sessions')
      .select('id, expires_at')
      .eq('id', sessionId)
      .single();

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (new Date(session.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Session expired' });
    }

    // Try to insert with full schema, fallback to basic schema if needed
    let { data, error } = await supabase
      .from('members')
      .insert({
        session_id: sessionId,
        name: name.trim(),
        phone_number: phoneNumber || null,
        status: 'joined'
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting member with full schema:', error);
      // Fallback to basic insert
      const { data: basicData, error: basicError } = await supabase
        .from('members')
        .insert({
          session_id: sessionId,
          name: name.trim(),
          phone_number: phoneNumber || null,
          status: 'joined'
        })
        .select('id, session_id, name, phone_number, role, status, joined_at')
        .single();
      
      if (basicError) throw basicError;
      data = basicData;
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('Error in add member:', err);
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
      .update({ 
        status, 
        last_activity: new Date().toISOString() 
      })
      .match({ id: memberId, session_id: sessionId })
      .select()
      .single();

    if (error) return res.status(404).json({ error: 'Member not found' });
    res.json(data);
  } catch (err) {
    console.error('Error in update member:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
