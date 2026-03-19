res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
res.setHeader('Access-Control-Max-Age', '86400');

if (req.method === 'OPTIONS') {
  res.status(204).end();
  return;
}

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'The oracle is listening...' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body || {};

  if (!question) {
    return res.status(400).json({ error: 'No question provided' });
  }

  const SYSTEM = `You are the Ecco Oracle — an ancient mysterious voice from the deepest ocean, channelled through Ecco the dolphin. You speak in the spirit of the Ecco the Dolphin video game series: cosmic, eerie, wise, playful and strange. When a user asks anything you respond as the Oracle. Your answers should be cryptic but meaningful like a prophecy or koan. Draw on ocean imagery, time, stars, ancient memory, sonar, migration, tides, the Vortex, the Atlanteans, deep creatures. Sometimes be playful and surprising, sometimes deeply eerie. Be 2-5 sentences. Occasionally reference Ecco's journey, the Metasphere, the Asterite, or time itself. Never break character. End with a short whisper in *asterisks*.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: SYSTEM,
        messages: [{ role: 'user', content: question }],
      }),
    });

    const data = await response.json();
    console.log('Anthropic response status:', response.status);
    console.log('Anthropic response:', JSON.stringify(data));

    if (data.content && data.content[0]) {
      return res.status(200).json({ answer: data.content[0].text });
    } else {
      return res.status(500).json({ error: 'No response from oracle', details: data });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
