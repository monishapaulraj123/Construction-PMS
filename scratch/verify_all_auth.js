import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testAuthAndDashboards() {
  console.log('=== STARTING END-TO-END VERIFICATION ===\n');

  const credentials = [
    { label: 'ADMIN', email: 'admin@constructionpms.in', pass: 'password123' },
    { label: 'SUPERVISOR', email: 'supervisor@pms.com', pass: 'password123' },
    { label: 'WORKER', email: 'worker@pms.com', pass: 'password123' },
  ];

  const tokens = {};

  for (const cred of credentials) {
    console.log(`[TEST 1] Logging in as ${cred.label} (${cred.email})...`);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cred.email, password: cred.pass }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        console.log(`✅ ${cred.label} Login Successful!`);
        console.log(`   User ID: ${data.user.user_id}, Name: ${data.user.name}, Role: ${data.user.role}`);
        tokens[cred.label] = data.token;
      } else {
        console.error(`❌ ${cred.label} Login Failed:`, data);
      }
    } catch (err) {
      console.error(`❌ ${cred.label} Login Exception:`, err.message);
    }
    console.log('');
  }

  if (tokens.WORKER) {
    console.log('[TEST 2] Verifying Worker Dashboard API (/api/attendance/today)...');
    try {
      const res = await fetch(`${API_BASE}/attendance/today`, {
        headers: { Authorization: `Bearer ${tokens.WORKER}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        console.log('✅ Worker Today Status Endpoint Passed!');
        console.log(`   Worker Name: ${data.worker?.name}`);
        console.log(`   Assigned Site: ${data.assignedSite?.site_name || 'None'}`);
      } else {
        console.error('❌ Worker Today Status Endpoint Failed:', data);
      }
    } catch (err) {
      console.error('❌ Worker Today Status Exception:', err.message);
    }
    console.log('');
  }

  if (tokens.SUPERVISOR) {
    console.log('[TEST 3] Verifying Supervisor Dashboard API (/api/attendance/dashboard)...');
    try {
      const res = await fetch(`${API_BASE}/attendance/dashboard`, {
        headers: { Authorization: `Bearer ${tokens.SUPERVISOR}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        console.log('✅ Supervisor Dashboard Metrics Endpoint Passed!');
        console.log(`   Total Assigned Workers: ${data.metrics?.totalAssignedWorkers}`);
        console.log(`   Present Today: ${data.metrics?.presentToday}`);
        console.log(`   Site Breakdown Count: ${data.siteBreakdown?.length}`);
      } else {
        console.error('❌ Supervisor Dashboard Metrics Endpoint Failed:', data);
      }
    } catch (err) {
      console.error('❌ Supervisor Dashboard Exception:', err.message);
    }
    console.log('');
  }

  console.log('=== VERIFICATION COMPLETED ===');
  process.exit(0);
}

testAuthAndDashboards();
