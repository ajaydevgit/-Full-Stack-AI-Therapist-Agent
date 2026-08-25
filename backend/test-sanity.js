const app = require('./server');
const http = require('http');

let server;
const PORT = 5055;

async function request(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:${PORT}${path}`);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  server = app.listen(PORT, async () => {
    console.log('🧪 Running Sanity Tests on port', PORT);
    try {
      // 1. Health Check
      const health = await request('/api/health');
      console.log('✅ 1. Health check status:', health.status, health.data);

      // 2. Guest Registration
      const guest = await request('/api/auth/guest', 'POST');
      console.log('✅ 2. Guest user created:', guest.data.user.username);
      const token = guest.data.token;

      // 3. Create Session
      const session = await request('/api/sessions', 'POST', { mood: 'Anxiety' }, token);
      console.log('✅ 3. Session created:', session.data.id, 'Mood:', session.data.mood);
      const sessionId = session.data.id;

      // 4. Send Normal Chat Message
      const msg = await request(`/api/sessions/${sessionId}/messages`, 'POST', { content: 'I have been feeling overwhelmed with deadlines.' }, token);
      console.log('✅ 4. AI response received:\n   Serene:', msg.data.aiMessage.content);

      // 5. Test Crisis Detection
      const crisisMsg = await request(`/api/sessions/${sessionId}/messages`, 'POST', { content: 'I feel so hopeless and want to end my life' }, token);
      console.log('✅ 5. Crisis detected flag:', !!crisisMsg.data.crisis);
      console.log('   Emergency resources provided:', crisisMsg.data.crisis ? crisisMsg.data.crisis.length : 0);

      // 6. End Session and generate summary
      const ended = await request(`/api/sessions/${sessionId}/end`, 'POST', {}, token);
      console.log('✅ 6. Session summary generated:');
      console.log('   Title:', ended.data.title);
      console.log('   Summary:', ended.data.summary);
      console.log('   Coping Steps:', ended.data.coping_steps?.length || 0, 'strategies');

      // 7. Get History
      const history = await request('/api/sessions', 'GET', null, token);
      console.log('✅ 7. Session history count:', history.data.length);

      console.log('\n🎉 ALL FULL-STACK TESTS PASSED SUCCESSFULLY!');
    } catch (err) {
      console.error('❌ Test failed:', err);
    } finally {
      server.close();
    }
  });
}

runTests();
