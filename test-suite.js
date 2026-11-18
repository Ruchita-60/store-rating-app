(async () => {
  const API_URL = 'http://localhost:5000/api';
  console.log('=============================================');
  console.log('🧪 RUNNING COMPREHENSIVE E2E VERIFICATION SUITE');
  console.log('=============================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log('✅ PASS:', testName);
      passed++;
    } else {
      console.error('❌ FAIL:', testName);
      failed++;
    }
  }

  try {
    // 1. Health Check
    const healthRes = await fetch(API_URL + '/health');
    const health = await healthRes.json();
    assert(health.status === 'ok', '1. Health Check');

    // 2. Frontend Server Check
    const feRes = await fetch('http://localhost:5173');
    const feHtml = await feRes.text();
    assert(feHtml.includes('id="root"'), '2. Frontend serves HTML with root mount');

    // 3. Form Validation Rejection Test (Name < 20 characters)
    const invalidNameRes = await fetch(API_URL + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Name', // 10 chars < 20
        email: 'invalid.test@example.com',
        password: 'ValidPass123!',
        address: '123 Test Street'
      })
    });
    const invalidNameJson = await invalidNameRes.json();
    assert(!invalidNameJson.success && invalidNameRes.status === 400, '3. Rejects Name < 20 chars');

    // 4. Form Validation Rejection Test (Weak password: no special char or uppercase)
    const invalidPassRes = await fetch(API_URL + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Valid Name Exactly Twenty Chars', // 31 chars
        email: 'invalid.pass@example.com',
        password: 'weakpassword',
        address: '123 Test Street'
      })
    });
    const invalidPassJson = await invalidPassRes.json();
    assert(!invalidPassJson.success && invalidPassRes.status === 400, '4. Rejects password without uppercase/special char');

    // 5. Valid Normal User Registration
    const testEmail = 'shopper.test.' + Date.now() + '@example.com';
    const regRes = await fetch(API_URL + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Brand New Verified Shopper User',
        email: testEmail,
        password: 'ShopperPass123!',
        address: '777 Shopping Way, Suite 400, Retail District'
      })
    });
    const regJson = await regRes.json();
    assert(regJson.success && regJson.token && regJson.user.role === 'user', '5. Normal User Registration');

    // 6. Admin Login
    const adminLoginRes = await fetch(API_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@storerating.com',
        password: 'AdminPass123!'
      })
    });
    const admin = await adminLoginRes.json();
    assert(admin.success && admin.user.role === 'admin', '6. Admin Login');

    // 7. Admin Stats
    const statsRes = await fetch(API_URL + '/admin/stats', {
      headers: { Authorization: 'Bearer ' + admin.token }
    });
    const stats = await statsRes.json();
    assert(stats.success && stats.data.totalUsers >= 6 && stats.data.totalStores >= 3, '7. Admin Statistics');

    // 8. Admin Add New Store
    const newStoreRes = await fetch(API_URL + '/admin/stores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + admin.token
      },
      body: JSON.stringify({
        name: 'Pinnacle Electronics Mega Plaza',
        email: 'info.pinnacle.' + Date.now() + '@example.com',
        address: '990 Technology Drive, Cyber Valley, CV 94000',
        owner_id: 2
      })
    });
    const newStore = await newStoreRes.json();
    assert(newStore.success && newStore.data.id, '8. Admin Add New Store');

    // 9. Admin List Users with Search and Sort
    const usersRes = await fetch(API_URL + '/admin/users?search=Alice&sortBy=name&sortOrder=ASC', {
      headers: { Authorization: 'Bearer ' + admin.token }
    });
    const usersJson = await usersRes.json();
    assert(usersJson.success && usersJson.data.some(u => u.name.includes('Alice')), '9. Admin Search and Sort Users');

    // 10. Store Owner Login & Dashboard Isolation
    const ownerLoginRes = await fetch(API_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice.owner@shopvista.com',
        password: 'OwnerPass123!'
      })
    });
    const owner = await ownerLoginRes.json();
    assert(owner.success && owner.user.role === 'store_owner', '10. Store Owner Login');

    const ownerDashRes = await fetch(API_URL + '/store-owner/dashboard', {
      headers: { Authorization: 'Bearer ' + owner.token }
    });
    const ownerDash = await ownerDashRes.json();
    assert(ownerDash.success && ownerDash.hasStore && ownerDash.store.name.includes('ShopVista'), '11. Store Owner Dashboard & Store Association');

    // 11. Normal User Rating Submission & Update (1 rating per store rule)
    const userLoginRes = await fetch(API_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'johnathan.doe@example.com',
        password: 'UserPass123!'
      })
    });
    const user = await userLoginRes.json();
    assert(user.success && user.user.role === 'user', '12. Normal User Login');

    // Rate store 3 (FreshOrganic)
    const rateRes = await fetch(API_URL + '/user/ratings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + user.token
      },
      body: JSON.stringify({ storeId: 3, rating: 5 })
    });
    const rateJson = await rateRes.json();
    assert(rateJson.success && rateJson.data.userRating === 5, '13. User Submit Rating');

    // Update rating on store 3 to 4
    const updateRateRes = await fetch(API_URL + '/user/ratings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + user.token
      },
      body: JSON.stringify({ storeId: 3, rating: 4 })
    });
    const updateRateJson = await updateRateRes.json();
    assert(updateRateJson.success && updateRateJson.data.isUpdate === true && updateRateJson.data.userRating === 4, '14. User Update Rating (Single rating per store rule)');

    // 12. Password Change
    const changePassRes = await fetch(API_URL + '/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + regJson.token
      },
      body: JSON.stringify({
        currentPassword: 'ShopperPass123!',
        newPassword: 'UpdatedPass123!'
      })
    });
    const changePassJson = await changePassRes.json();
    assert(changePassJson.success, '15. Change Password Functionality');

    console.log('=============================================');
    console.log('📊 RESULTS:', passed, 'PASSED,', failed, 'FAILED');
    console.log('=============================================');
  } catch (err) {
    console.error('Fatal test error:', err);
  }
})();
