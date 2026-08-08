/* ═══════════════════════════════════════════════
   AUTH — Supabase Auth (email/password) + وضع الضيف
   ─ Login حقيقي: التسجيل والدخول عبر Supabase Auth.
   ─ الضيف: يمكن المتابعة بدون حساب (مطلوب فقط اسم).
   ─ الجلسة تُستعاد تلقائياً عند إعادة تحميل الصفحة عبر
     supabase-js (يخزّنها في localStorage افتراضياً).
═══════════════════════════════════════════════ */

let authMode = 'login'; // 'login' | 'signup'

function getAuthClient() {
  if (!S.sb) S.sb = supabase.createClient(SUPA_URL, SUPA_KEY);
  return S.sb;
}

function switchAuthTab(mode) {
  authMode = mode;
  document.getElementById('auth-tab-login').classList.toggle('active', mode === 'login');
  document.getElementById('auth-tab-signup').classList.toggle('active', mode === 'signup');
  document.getElementById('auth-submit-btn').textContent = mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب';
  document.getElementById('auth-title').textContent = mode === 'login' ? 'مرحباً بعودتك' : 'أنشئ حسابك';
}

async function submitAuth() {
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  if (!email || !password) { showStatus('auth', 'أدخل البريد الإلكتروني وكلمة المرور', 'err'); return; }
  if (password.length < 6) { showStatus('auth', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'err'); return; }

  const btn = document.getElementById('auth-submit-btn');
  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = 'جارٍ التحقق…';

  const client = getAuthClient();
  try {
    let result;
    if (authMode === 'signup') {
      result = await client.auth.signUp({ email, password });
    } else {
      result = await client.auth.signInWithPassword({ email, password });
    }

    if (result.error) {
      showStatus('auth', translateAuthError(result.error.message), 'err');
      btn.disabled = false; btn.textContent = originalText;
      return;
    }

    if (authMode === 'signup' && !result.data.session) {
      // بريد التفعيل مطلوب (حسب إعدادات مشروع Supabase)
      showStatus('auth', '✓ تحقق من بريدك لتفعيل الحساب، ثم سجّل الدخول', 'ok');
      btn.disabled = false; btn.textContent = originalText;
      switchAuthTab('login');
      return;
    }

    onAuthSuccess(result.data.user);
    btn.disabled = false; btn.textContent = originalText;
  } catch (e) {
    showStatus('auth', 'تعذّر الاتصال بخدمة الحسابات', 'err');
    btn.disabled = false; btn.textContent = originalText;
  }
}

function continueAsGuest() {
  const name = document.getElementById('auth-guest-name').value.trim();
  if (!name) { showStatus('auth', 'أدخل اسمك للمتابعة كضيف', 'err'); return; }
  S.myName = name;
  S.isGuest = true;
  sessionStorage.setItem('eco_guest_name', name);
  goToLanding();
}

function onAuthSuccess(user) {
  S.currentUser = user;
  S.isGuest = false;
  S.myName = user.user_metadata?.display_name || user.email.split('@')[0];
  toast(`أهلاً ${S.myName} ✓`, 'ok');
  goToLanding();
}

function goToLanding() {
  document.getElementById('auth').classList.remove('active');
  document.getElementById('landing').classList.add('active');
  updateNavUserChip();
}

function updateNavUserChip() {
  const chip = document.getElementById('nav-user-chip');
  if (!chip) return;
  if (S.myName) {
    chip.style.display = 'flex';
    chip.querySelector('.nav-user-avatar').textContent = S.myName.charAt(0).toUpperCase();
    chip.querySelector('.nav-user-name').textContent = S.myName;
  } else {
    chip.style.display = 'none';
  }
}

async function logout() {
  if (S.sb && S.currentUser) await S.sb.auth.signOut();
  S.currentUser = null;
  S.isGuest = false;
  S.myName = '';
  sessionStorage.removeItem('eco_guest_name');
  updateNavUserChip();

  // تفريغ حقول شاشة الدخول من أي بيانات سابقة
  document.getElementById('auth-email').value = '';
  document.getElementById('auth-password').value = '';
  document.getElementById('auth-guest-name').value = '';

  document.getElementById('landing').classList.remove('active');
  document.getElementById('auth').classList.add('active');
  toast('تم تسجيل الخروج', 'info');
}

function translateAuthError(msg) {
  if (/already registered/i.test(msg)) return 'هذا البريد مسجّل مسبقاً — سجّل الدخول بدلاً من ذلك';
  if (/invalid login credentials/i.test(msg)) return 'بيانات الدخول غير صحيحة';
  if (/email not confirmed/i.test(msg)) return 'يرجى تفعيل بريدك الإلكتروني أولاً';
  return 'حدث خطأ، حاول مرة أخرى';
}

/* ═══════════════════════════════════════════════
   AUTH BOOTSTRAP — يُستدعى عند تحميل الصفحة
   يتحقق من جلسة Supabase موجودة، أو اسم ضيف محفوظ،
   وإلا يعرض شاشة الدخول.
═══════════════════════════════════════════════ */
async function bootstrapAuth() {
  const client = getAuthClient();

  try {
    const { data } = await client.auth.getSession();
    if (data.session && data.session.user) {
      S.currentUser = data.session.user;
      S.isGuest = false;
      S.myName = data.session.user.user_metadata?.display_name || data.session.user.email.split('@')[0];
      updateNavUserChip();
      return 'landing';
    }
  } catch (e) { /* Supabase غير متاح — نتابع كضيف */ }

  const guestName = sessionStorage.getItem('eco_guest_name');
  if (guestName) {
    S.myName = guestName;
    S.isGuest = true;
    updateNavUserChip();
    return 'landing';
  }

  return 'auth';
}
