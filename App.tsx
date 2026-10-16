import { useState, useRef, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────
type Page =
  | 'home' | 'login' | 'dashboard' | 'checkin' | 'checkin-results'
  | 'chat' | 'resources' | 'counselors' | 'counselor-profile'
  | 'booking' | 'tracker' | 'profile' | 'emergency';

interface MoodEntry { date: string; mood: number; note: string; }

// ─── Data ────────────────────────────────────────────────────────────────────
const counselors = [
  { id: 1, name: 'Dr. Amara Osei', title: 'Licensed Clinical Psychologist', specialties: ['Anxiety', 'Depression', 'Academic Stress'], rating: 4.9, reviews: 128, available: true, image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&auto=format', availability: ['Mon 10am', 'Wed 2pm', 'Fri 11am'] },
  { id: 2, name: 'Dr. Marcus Rivera', title: 'Counseling Psychologist', specialties: ['Trauma', 'Relationship Issues', 'Identity'], rating: 4.8, reviews: 94, available: true, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&auto=format', availability: ['Tue 9am', 'Thu 3pm', 'Fri 2pm'] },
  { id: 3, name: 'Dr. Priya Sharma', title: 'Student Wellness Counselor', specialties: ['Mindfulness', 'Burnout', 'Cultural Stress'], rating: 4.7, reviews: 76, available: false, image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&auto=format', availability: ['Mon 2pm', 'Wed 10am'] },
  { id: 4, name: 'Dr. James Kowalski', title: 'Psychiatrist & Therapist', specialties: ['ADHD', 'Sleep Disorders', 'Stress'], rating: 4.9, reviews: 210, available: true, image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&auto=format', availability: ['Tue 11am', 'Thu 1pm'] },
];

const resources = [
  { id: 1, category: 'Anxiety', title: 'Understanding and Managing Academic Anxiety', type: 'Article', duration: '8 min read', color: 'bg-teal-50 text-teal-700', icon: '📖' },
  { id: 2, category: 'Mindfulness', title: 'Box Breathing for Immediate Stress Relief', type: 'Exercise', duration: '5 min', color: 'bg-purple-50 text-purple-700', icon: '🧘' },
  { id: 3, category: 'Sleep', title: 'Student Sleep Hygiene: A Practical Guide', type: 'Guide', duration: '12 min read', color: 'bg-blue-50 text-blue-700', icon: '🌙' },
  { id: 4, category: 'Depression', title: 'Recognizing Low Mood vs. Clinical Depression', type: 'Article', duration: '10 min read', color: 'bg-indigo-50 text-indigo-700', icon: '💡' },
  { id: 5, category: 'Relationships', title: 'Building Healthy Peer Connections', type: 'Workshop', duration: '20 min', color: 'bg-rose-50 text-rose-700', icon: '🤝' },
  { id: 6, category: 'Focus', title: 'Pomodoro & Deep Work for Students', type: 'Technique', duration: '7 min read', color: 'bg-amber-50 text-amber-700', icon: '⏰' },
];

const checkInQuestions = [
  { id: 'mood', label: 'How would you rate your overall mood today?', low: 'Very low', high: 'Excellent' },
  { id: 'stress', label: 'How stressed do you feel right now?', low: 'Very calm', high: 'Extremely stressed' },
  { id: 'sleep', label: 'How well did you sleep last night?', low: 'Very poorly', high: 'Very well' },
  { id: 'academic', label: 'How much is academic pressure affecting you?', low: 'Not at all', high: 'Overwhelmingly' },
  { id: 'social', label: 'How connected do you feel to others?', low: 'Very isolated', high: 'Fully connected' },
];

const aiResponses: Record<string, string> = {
  default: "I hear you. It's completely okay to feel that way. Would you like to explore some coping strategies, or would it help to talk through what's on your mind a bit more?",
  stress: "Stress is a very common experience for university students — you're not alone. A few things that can help in the moment: try 4-7-8 breathing (inhale 4s, hold 7s, exhale 8s), or take a 10-minute walk. Would you like to explore resources on managing stress, or talk about what's specifically weighing on you?",
  anxious: "Feeling anxious can be really exhausting. It's brave of you to acknowledge it. Anxiety often comes with physical sensations — tight chest, racing thoughts. One grounding technique is the 5-4-3-2-1 method: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. Would you like to try this together?",
  sleep: "Sleep struggles are really tough and can affect everything else. Good sleep hygiene starts with consistency — a regular bedtime, no screens 30 minutes before bed, and a cool, dark room. Is there something keeping your mind busy at night? Sometimes journaling worries before bed can help offload them.",
  lonely: "Feeling lonely, especially at university, is more common than people let on. It doesn't mean something is wrong with you. Even small connections — a smile to a classmate, a message to an old friend — can help. Is there a particular situation making you feel disconnected right now?",
  help: "I'm here for you. While I can offer support and coping strategies, for more serious concerns a trained counselor can provide deeper, personalized care. You can book an appointment directly from the dashboard, or if you need immediate support, please check our Emergency Support page.",
};

function getAIResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('stress') || lower.includes('overwhelm') || lower.includes('pressure')) return aiResponses.stress;
  if (lower.includes('anxi') || lower.includes('panic') || lower.includes('worried')) return aiResponses.anxious;
  if (lower.includes('sleep') || lower.includes('tired') || lower.includes('exhaust')) return aiResponses.sleep;
  if (lower.includes('lone') || lower.includes('alone') || lower.includes('isolat')) return aiResponses.lonely;
  if (lower.includes('help') || lower.includes('serious') || lower.includes('crisis') || lower.includes('hurt')) return aiResponses.help;
  return aiResponses.default;
}

// ─── Shared Components ────────────────────────────────────────────────────────
function NavBar({ page, setPage, loggedIn }: { page: Page; setPage: (p: Page) => void; loggedIn: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <button onClick={() => setPage(loggedIn ? 'dashboard' : 'home')} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm">M</div>
          <span className="font-semibold text-[var(--foreground)] text-lg" style={{ fontFamily: 'DM Serif Display, serif' }}>MindBridge</span>
        </button>

        {loggedIn && (
          <div className="hidden md:flex items-center gap-1">
            {([['dashboard','Dashboard'],['checkin','Check-In'],['chat','AI Chat'],['resources','Resources'],['counselors','Counselors'],['tracker','Tracker']] as [Page,string][]).map(([p, label]) => (
              <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-[var(--muted)] text-[var(--primary)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'}`}>{label}</button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button onClick={() => setPage('emergency')} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors">
            <span>🆘</span> Emergency
          </button>
          <button onClick={() => setPage('profile')} className="w-8 h-8 rounded-full bg-[var(--primary)] text-white text-sm font-semibold flex items-center justify-center hover:opacity-90">JD</button>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(v => !v)}>
            <div className="w-5 h-0.5 bg-[var(--foreground)] mb-1"></div>
            <div className="w-5 h-0.5 bg-[var(--foreground)] mb-1"></div>
            <div className="w-5 h-0.5 bg-[var(--foreground)]"></div>
          </button>
        </div>
      </div>

      {menuOpen && loggedIn && (
        <div className="md:hidden bg-white border-t border-[var(--border)] px-4 py-3 flex flex-col gap-1">
          {([['dashboard','Dashboard'],['checkin','Check-In'],['chat','AI Chat'],['resources','Resources'],['counselors','Counselors'],['tracker','Tracker'],['emergency','Emergency']] as [Page,string][]).map(([p, label]) => (
            <button key={p} onClick={() => { setPage(p); setMenuOpen(false); }} className={`text-left px-3 py-2 rounded-lg text-sm font-medium ${page === p ? 'bg-[var(--muted)] text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`}>{label}</button>
          ))}
        </div>
      )}
    </nav>
  );
}

function Badge({ children, color = 'teal' }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = { teal: 'bg-teal-50 text-teal-700', purple: 'bg-purple-50 text-purple-700', blue: 'bg-blue-50 text-blue-700', red: 'bg-red-50 text-red-600' };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.teal}`}>{children}</span>;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl border border-[var(--border)] shadow-sm ${className}`}>{children}</div>;
}

// ─── Pages ───────────────────────────────────────────────────────────────────

function HomePage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#e8f8f7] via-[#f0f4fd] to-[#ede9fa] py-20 md:py-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[var(--primary)]/10 blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-[var(--accent)]/10 blur-3xl"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="max-w-2xl">
            <Badge color="teal">Built for Students · By Professionals</Badge>
            <h1 className="mt-4 text-5xl md:text-6xl text-[var(--foreground)] leading-tight">
              Your mental health <em className="text-[var(--primary)] not-italic">matters</em> here
            </h1>
            <p className="mt-5 text-lg text-[var(--muted-foreground)] leading-relaxed max-w-xl">
              MindBridge connects university students with professional counselors, evidence-based resources, and compassionate AI support — all in one private, secure space.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => setPage('login')} className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-[var(--primary)]/20">
                Get Started Free
              </button>
              <button onClick={() => setPage('counselors')} className="px-6 py-3 rounded-xl bg-white text-[var(--foreground)] font-semibold border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
                Meet Our Counselors
              </button>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-[var(--muted-foreground)]">
              {['🔒 Fully Confidential', '🎓 University-Verified', '⚡ Available 24/7', '🌍 Culturally Inclusive'].map(f => (
                <span key={f} className="flex items-center gap-1.5">{f}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl text-[var(--foreground)]">Everything you need to thrive</h2>
          <p className="mt-3 text-[var(--muted-foreground)] max-w-lg mx-auto">A comprehensive wellness ecosystem designed around the realities of student life.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '🧠', title: 'Daily Check-Ins', desc: 'Quick, guided mood and wellbeing assessments to help you stay in tune with yourself.', page: 'checkin' as Page },
            { icon: '💬', title: 'AI Support Chat', desc: 'Talk anonymously with our compassionate AI any time, day or night.', page: 'chat' as Page },
            { icon: '👩‍⚕️', title: 'Counselor Directory', desc: 'Find and connect with licensed mental health professionals at your university.', page: 'counselors' as Page },
            { icon: '📚', title: 'Wellness Resources', desc: 'Curated articles, exercises, and guides for anxiety, sleep, relationships, and more.', page: 'resources' as Page },
            { icon: '📊', title: 'Mood Tracker', desc: 'Visualize your emotional journey over time and spot patterns that matter.', page: 'tracker' as Page },
            { icon: '🆘', title: 'Emergency Support', desc: 'Immediate access to crisis lines and on-campus emergency mental health services.', page: 'emergency' as Page },
          ].map(f => (
            <Card key={f.title} className="p-6 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer" >
              <div onClick={() => setPage(f.page)}>
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2" style={{ fontFamily: 'DM Serif Display, serif' }}>{f.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{f.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[var(--primary)] py-16">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[['2,400+', 'Students Supported'], ['18', 'Licensed Counselors'], ['94%', 'Satisfaction Rate'], ['24/7', 'AI Availability']].map(([n, l]) => (
            <div key={l}>
              <div className="text-3xl font-bold" style={{ fontFamily: 'DM Serif Display, serif' }}>{n}</div>
              <div className="text-sm mt-1 text-white/70">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl text-[var(--foreground)]">Ready to take the first step?</h2>
        <p className="mt-4 text-[var(--muted-foreground)]">It starts with a simple check-in. No judgment, no pressure.</p>
        <button onClick={() => setPage('login')} className="mt-8 px-8 py-4 rounded-xl bg-[var(--primary)] text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-[var(--primary)]/20">
          Begin Your Journey
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--muted-foreground)]">
          <span>© 2026 MindBridge · University Mental Health Platform</span>
          <div className="flex gap-4">
            <button onClick={() => setPage('emergency')} className="hover:text-[var(--primary)] transition-colors">Emergency Support</button>
            <button onClick={() => setPage('profile')} className="hover:text-[var(--primary)] transition-colors">Privacy</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LoginPage({ setPage, setLoggedIn }: { setPage: (p: Page) => void; setLoggedIn: (v: boolean) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoggedIn(true); setPage('dashboard'); }, 1200);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-[var(--primary)] to-[#1a9e94] p-12 text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">M</div>
          <span className="text-lg font-semibold" style={{ fontFamily: 'DM Serif Display, serif' }}>MindBridge</span>
        </div>
        <div>
          <h2 className="text-4xl leading-tight mb-4" style={{ fontFamily: 'DM Serif Display, serif' }}>"Asking for help is the first act of courage."</h2>
          <p className="text-white/70">MindBridge — a safer space for every student.</p>
        </div>
        <div className="flex gap-4 text-sm text-white/60">
          <span>🔒 HIPAA-aligned</span>
          <span>🎓 Student-only access</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl text-[var(--foreground)] mb-2">Welcome back</h1>
          <p className="text-[var(--muted-foreground)] mb-8">Sign in with your university credentials.</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">University Email</label>
              <input
                type="email"
                placeholder="jane.doe@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Forgot password?</button>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--border)] text-center">
            <p className="text-sm text-[var(--muted-foreground)]">New student? <button className="text-[var(--primary)] font-medium hover:underline" onClick={() => setPage('login')}>Register here</button></p>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100">
            <p className="text-xs text-red-600 text-center">🆘 In crisis? <button onClick={() => setPage('emergency')} className="underline font-medium">Get immediate help</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ setPage }: { setPage: (p: Page) => void }) {
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-[var(--muted-foreground)]">{today}</p>
          <h1 className="text-3xl md:text-4xl text-[var(--foreground)] mt-1">Good morning, Jane ✨</h1>
          <p className="mt-1 text-[var(--muted-foreground)]">How are you feeling today?</p>
        </div>
        <button onClick={() => setPage('emergency')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 hover:bg-red-100 transition-colors">
          🆘 Emergency Support
        </button>
      </div>

      {/* Mood check-in banner */}
      <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[#1a9e94] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-white/80 text-sm">Daily Check-In</p>
          <p className="text-lg font-semibold mt-0.5">You haven't checked in today</p>
          <p className="text-white/70 text-sm mt-1">Takes only 2 minutes · Completely private</p>
        </div>
        <button onClick={() => setPage('checkin')} className="shrink-0 px-5 py-2.5 rounded-xl bg-white text-[var(--primary)] font-semibold text-sm hover:bg-white/90 transition-colors">
          Start Check-In →
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Mood Streak', value: '5 days', icon: '🔥', sub: 'Keep it up!' },
          { label: 'Sessions Booked', value: '2', icon: '📅', sub: 'This month' },
          { label: 'Resources Read', value: '8', icon: '📚', sub: 'This week' },
          { label: 'Avg Mood Score', value: '7.2 / 10', icon: '📈', sub: 'Last 7 days' },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-[var(--foreground)]" style={{ fontFamily: 'DM Serif Display, serif' }}>{s.value}</div>
            <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{s.label}</div>
            <div className="text-xs text-[var(--primary)] mt-1">{s.sub}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">Quick Actions</h2>
          <div className="flex flex-col gap-3">
            {[
              { icon: '💬', label: 'Talk to AI Support', desc: 'Chat anonymously', page: 'chat' as Page, color: 'from-teal-50 to-cyan-50 border-teal-100' },
              { icon: '👩‍⚕️', label: 'Book Counselor Session', desc: 'Next slot: Today 2pm', page: 'booking' as Page, color: 'from-purple-50 to-indigo-50 border-purple-100' },
              { icon: '📊', label: 'View Mood History', desc: 'See your progress', page: 'tracker' as Page, color: 'from-blue-50 to-sky-50 border-blue-100' },
              { icon: '📚', label: 'Browse Resources', desc: '6 new articles', page: 'resources' as Page, color: 'from-amber-50 to-orange-50 border-amber-100' },
            ].map(a => (
              <button key={a.label} onClick={() => setPage(a.page)} className={`flex items-center gap-3 p-4 rounded-xl border bg-gradient-to-r ${a.color} hover:shadow-sm transition-all text-left`}>
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{a.label}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{a.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recommended Resources */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Recommended for You</h2>
            <button onClick={() => setPage('resources')} className="text-sm text-[var(--primary)] hover:underline">View all</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {resources.slice(0, 4).map(r => (
              <Card key={r.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium mb-3 ${r.color}`}>
                  {r.icon} {r.category}
                </div>
                <p className="text-sm font-semibold text-[var(--foreground)] leading-snug mb-1">{r.title}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{r.type} · {r.duration}</p>
              </Card>
            ))}
          </div>

          {/* Featured Counselor */}
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">Your Assigned Counselor</h2>
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <img src={counselors[0].image} alt={counselors[0].name} className="w-14 h-14 rounded-full object-cover bg-[var(--muted)]" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--foreground)]">{counselors[0].name}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{counselors[0].title}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {counselors[0].specialties.slice(0, 2).map(s => <Badge key={s} color="teal">{s}</Badge>)}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => setPage('counselor-profile')} className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">Profile</button>
                  <button onClick={() => setPage('booking')} className="text-xs px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity">Book</button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckInPage({ setPage, setCheckInResults }: { setPage: (p: Page) => void; setCheckInResults: (r: Record<string, number>) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');

  const q = checkInQuestions[step];
  const val = answers[q?.id] ?? 5;

  const handleNext = () => {
    if (step < checkInQuestions.length - 1) {
      setStep(s => s + 1);
    } else {
      setCheckInResults({ ...answers, note: note.length });
      setPage('checkin-results');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="mb-8">
        <button onClick={() => setPage('dashboard')} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors mb-4 flex items-center gap-1">← Back to Dashboard</button>
        <h1 className="text-3xl text-[var(--foreground)]">Mental Health Check-In</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">Your responses are private and never shared without your consent.</p>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {checkInQuestions.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}></div>
        ))}
      </div>

      <Card className="p-8">
        <div className="text-sm text-[var(--muted-foreground)] mb-2">Question {step + 1} of {checkInQuestions.length}</div>
        <h2 className="text-xl text-[var(--foreground)] mb-8 leading-snug">{q.label}</h2>

        <div className="space-y-4">
          <input
            type="range"
            min={1} max={10}
            value={val}
            onChange={e => setAnswers(a => ({ ...a, [q.id]: +e.target.value }))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
            <span>{q.low}</span>
            <span className="text-[var(--primary)] font-semibold text-sm">{val} / 10</span>
            <span>{q.high}</span>
          </div>
        </div>

        {step === checkInQuestions.length - 1 && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Anything else on your mind? (optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="You can share as much or as little as you'd like…"
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
        )}

        <button
          onClick={handleNext}
          className="mt-8 w-full py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity"
        >
          {step < checkInQuestions.length - 1 ? 'Next Question →' : 'See My Results →'}
        </button>
      </Card>

      <p className="mt-6 text-xs text-center text-[var(--muted-foreground)]">
        This check-in does not constitute a clinical diagnosis. If you're in crisis, please <button onClick={() => setPage('emergency')} className="text-red-500 underline">get immediate help</button>.
      </p>
    </div>
  );
}

function CheckInResults({ setPage, results }: { setPage: (p: Page) => void; results: Record<string, number> }) {
  const avg = Object.values(results).filter(v => v > 0).reduce((a, b) => a + b, 0) / Math.max(Object.values(results).filter(v => v > 0).length, 1);
  const level = avg >= 7 ? 'thriving' : avg >= 5 ? 'managing' : 'struggling';
  const colors = { thriving: { bg: 'bg-teal-50', text: 'text-teal-700', ring: 'ring-teal-200' }, managing: { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200' }, struggling: { bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-200' } };
  const c = colors[level];
  const messages = {
    thriving: "You seem to be in a good place right now. Keep nurturing these positive patterns — they matter.",
    managing: "You're holding things together, which takes real effort. There are resources and support available whenever you need them.",
    struggling: "It sounds like things have been tough lately, and that's completely valid. You don't have to navigate this alone — support is here.",
  };
  const labels: Record<string, string> = { mood: 'Mood', stress: 'Stress', sleep: 'Sleep', academic: 'Academic Pressure', social: 'Social Connection' };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <button onClick={() => setPage('dashboard')} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors mb-6 flex items-center gap-1">← Back to Dashboard</button>

      <h1 className="text-3xl text-[var(--foreground)] mb-2">Your Check-In Summary</h1>
      <p className="text-[var(--muted-foreground)] mb-6">Here's a snapshot of how you're doing today.</p>

      {/* Score card */}
      <Card className={`p-6 mb-6 ring-2 ${c.ring} ${c.bg}`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${c.bg} ring-2 ${c.ring}`} style={{ fontFamily: 'DM Serif Display, serif' }}>
            {avg.toFixed(1)}
          </div>
          <div>
            <p className={`text-lg font-semibold capitalize ${c.text}`} style={{ fontFamily: 'DM Serif Display, serif' }}>You seem to be {level}</p>
            <p className={`text-sm mt-1 ${c.text} opacity-80`}>{messages[level]}</p>
          </div>
        </div>
      </Card>

      {/* Breakdown */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Area Breakdown</h2>
        <div className="space-y-4">
          {Object.entries(results).filter(([k]) => labels[k]).map(([key, val]) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[var(--foreground)]">{labels[key]}</span>
                <span className="text-[var(--muted-foreground)]">{val}/10</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${val * 10}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Suggestions */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Suggested Next Steps</h2>
        <div className="space-y-3">
          {[
            { icon: '💬', text: 'Talk to our AI support chat about how you\'re feeling', page: 'chat' as Page },
            { icon: '📚', text: 'Browse wellness resources tailored to your needs', page: 'resources' as Page },
            { icon: '👩‍⚕️', text: 'Book a session with a counselor', page: 'booking' as Page },
          ].map(s => (
            <button key={s.text} onClick={() => setPage(s.page)} className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--muted)] transition-colors text-left">
              <span className="text-xl">{s.icon}</span>
              <span className="text-sm text-[var(--foreground)]">{s.text}</span>
            </button>
          ))}
        </div>
      </Card>

      <p className="text-xs text-center text-[var(--muted-foreground)]">
        This summary is not a clinical assessment. In crisis? <button onClick={() => setPage('emergency')} className="text-red-500 underline">Get immediate help</button>
      </p>
    </div>
  );
}

interface ChatMessage { id: number; role: 'user' | 'ai'; text: string; }

function AIChatPage({ setPage }: { setPage: (p: Page) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, role: 'ai', text: "Hi, I'm Mia — MindBridge's AI support companion. I'm here to listen without judgment. What's on your mind today?" }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now(), role: 'user', text: input.trim() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = getAIResponse(userMsg.text);
      setMessages(m => [...m, { id: Date.now() + 1, role: 'ai', text: reply }]);
      setTyping(false);
    }, 1200 + Math.random() * 600);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setPage('dashboard')} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">←</button>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold">M</div>
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white"></div>
          </div>
          <div>
            <p className="font-semibold text-[var(--foreground)]">Mia · AI Support</p>
            <p className="text-xs text-green-500">Always available · Private & confidential</p>
          </div>
        </div>
        <div className="ml-auto">
          <button onClick={() => setPage('emergency')} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">🆘 Crisis</button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 py-2">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} fade-up`}>
            {m.role === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0 mt-1">M</div>
            )}
            <div className={`max-w-xs sm:max-w-sm lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-[var(--primary)] text-white rounded-br-sm' : 'bg-white border border-[var(--border)] text-[var(--foreground)] rounded-bl-sm'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex items-end gap-2 fade-up">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-xs font-bold shrink-0">M</div>
            <div className="bg-white border border-[var(--border)] px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-[var(--muted-foreground)]" style={{ animation: `bounce 1s ${i * 0.15}s infinite` }}></div>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
        {["I'm feeling anxious", "Struggling to sleep", "Academic pressure", "Feeling lonely"].map(s => (
          <button key={s} onClick={() => { setInput(s); }} className="shrink-0 px-3 py-1.5 rounded-full border border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors whitespace-nowrap">{s}</button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type how you're feeling…"
          className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="px-4 py-3 rounded-xl bg-[var(--primary)] text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          ↑
        </button>
      </div>

      <p className="text-xs text-center text-[var(--muted-foreground)] mt-2">
        Mia is an AI, not a licensed therapist. <button onClick={() => setPage('counselors')} className="underline">Book a real counselor</button> for clinical support.
      </p>

      <style>{`@keyframes bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-5px); } }`}</style>
    </div>
  );
}

function ResourcesPage({ setPage }: { setPage: (p: Page) => void }) {
  const [filter, setFilter] = useState('All');
  const cats = ['All', 'Anxiety', 'Mindfulness', 'Sleep', 'Depression', 'Relationships', 'Focus'];
  const filtered = filter === 'All' ? resources : resources.filter(r => r.category === filter);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl text-[var(--foreground)]">Wellness Resources</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">Evidence-based content curated by our mental health team.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {cats.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === c ? 'bg-[var(--primary)] text-white' : 'bg-white border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(r => (
          <Card key={r.id} className="p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium mb-4 ${r.color}`}>
              {r.icon} {r.category}
            </div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] leading-snug mb-2">{r.title}</h3>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-[var(--muted-foreground)]">{r.type} · {r.duration}</span>
              <button className="text-xs text-[var(--primary)] font-medium hover:underline">Read →</button>
            </div>
          </Card>
        ))}
      </div>

      {/* Featured */}
      <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-[var(--accent)]/10 to-[var(--primary)]/10 border border-[var(--border)]">
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-1">Need personalized support?</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">Our counselors can create a tailored wellness plan just for you.</p>
        <button onClick={() => setPage('counselors')} className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity">Find a Counselor</button>
      </div>
    </div>
  );
}

function CounselorDirectory({ setPage, setCounselorId }: { setPage: (p: Page) => void; setCounselorId: (id: number) => void }) {
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const specs = ['All', 'Anxiety', 'Depression', 'Trauma', 'Mindfulness', 'Academic Stress'];
  const filtered = counselors.filter(c =>
    (specialty === 'All' || c.specialties.includes(specialty)) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.specialties.some(s => s.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl text-[var(--foreground)]">Find a Counselor</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">Licensed professionals, all vetted by our university mental health board.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or specialty…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
        <select
          value={specialty}
          onChange={e => setSpecialty(e.target.value)}
          className="px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          {specs.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {filtered.map(c => (
          <Card key={c.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex gap-4">
              <div className="relative shrink-0">
                <img src={c.image} alt={c.name} className="w-16 h-16 rounded-full object-cover bg-[var(--muted)]" />
                {c.available && <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-400 border-2 border-white"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-[var(--foreground)]">{c.name}</p>
                  <span className="text-xs text-[var(--muted-foreground)] shrink-0">⭐ {c.rating}</span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{c.title}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {c.specialties.map(s => <Badge key={s} color="teal">{s}</Badge>)}
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { setCounselorId(c.id); setPage('counselor-profile'); }} className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">View Profile</button>
                  <button onClick={() => setPage('booking')} className={`text-xs px-3 py-1.5 rounded-lg text-white transition-opacity ${c.available ? 'bg-[var(--primary)] hover:opacity-90' : 'bg-[var(--muted-foreground)] cursor-not-allowed'}`} disabled={!c.available}>
                    {c.available ? 'Book Session' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CounselorProfile({ setPage, counselorId }: { setPage: (p: Page) => void; counselorId: number }) {
  const c = counselors.find(c => c.id === counselorId) || counselors[0];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={() => setPage('counselors')} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors mb-6 flex items-center gap-1">← Back to Directory</button>

      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="relative shrink-0">
            <img src={c.image} alt={c.name} className="w-24 h-24 rounded-2xl object-cover bg-[var(--muted)]" />
            {c.available && <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-white"></div>}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl text-[var(--foreground)]">{c.name}</h1>
            <p className="text-[var(--muted-foreground)] mt-0.5">{c.title}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-[var(--muted-foreground)]">
              <span>⭐ {c.rating} ({c.reviews} reviews)</span>
              <span>·</span>
              <span className={c.available ? 'text-green-600' : 'text-gray-400'}>{c.available ? '● Available' : '● Unavailable'}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {c.specialties.map(s => <Badge key={s} color="teal">{s}</Badge>)}
            </div>
          </div>
          <div className="shrink-0">
            <button onClick={() => setPage('booking')} className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:opacity-90 transition-opacity">
              Book Session
            </button>
          </div>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-5 mb-6">
        <Card className="p-5">
          <h2 className="font-semibold text-[var(--foreground)] mb-3">About</h2>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
            {c.name} has over 8 years of experience working with university students navigating academic pressure, identity, and life transitions. They take a warm, collaborative approach rooted in evidence-based therapies.
          </p>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold text-[var(--foreground)] mb-3">Approach</h2>
          <div className="space-y-2">
            {['Cognitive Behavioral Therapy (CBT)', 'Mindfulness-Based Therapy', 'Person-Centered Approach', 'Solution-Focused Therapy'].map(a => (
              <div key={a} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"></div>
                {a}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5 mb-6">
        <h2 className="font-semibold text-[var(--foreground)] mb-4">Available Slots</h2>
        <div className="flex flex-wrap gap-2">
          {c.availability.map(slot => (
            <button key={slot} onClick={() => setPage('booking')} className="px-4 py-2 rounded-xl border border-[var(--primary)] text-[var(--primary)] text-sm hover:bg-[var(--primary)] hover:text-white transition-colors">
              {slot}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold text-[var(--foreground)] mb-4">Student Reviews</h2>
        <div className="space-y-4">
          {[
            { name: 'Anonymous Student', rating: 5, text: 'Dr. Osei helped me develop tools to manage my exam anxiety. I feel so much more in control now.' },
            { name: 'Anonymous Student', rating: 5, text: 'The sessions are a safe space where I can be honest. I always leave feeling heard and supported.' },
          ].map((r, i) => (
            <div key={i} className="p-4 rounded-xl bg-[var(--muted)]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{'⭐'.repeat(r.rating)}</span>
                <span className="text-xs text-[var(--muted-foreground)]">{r.name}</span>
              </div>
              <p className="text-sm text-[var(--foreground)]">{r.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function BookingPage({ setPage }: { setPage: (p: Page) => void }) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState({ counselor: '', date: '', time: '', type: '' });
  const [confirmed, setConfirmed] = useState(false);
  const times = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
  const types = [{ id: 'video', label: 'Video Call', icon: '📹' }, { id: 'in-person', label: 'In-Person', icon: '🏛️' }, { id: 'phone', label: 'Phone Call', icon: '📞' }];

  const handleConfirm = () => { setConfirmed(true); };

  if (confirmed) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center text-4xl mx-auto mb-6">✅</div>
        <h1 className="text-3xl text-[var(--foreground)] mb-3">Appointment Confirmed!</h1>
        <p className="text-[var(--muted-foreground)] mb-2">Your session has been booked. You'll receive a confirmation email shortly.</p>
        <Card className="p-5 my-6 text-left">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Counselor</span><span className="font-medium">{selected.counselor || 'Dr. Amara Osei'}</span></div>
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Date</span><span className="font-medium">{selected.date || 'Monday, 23 Sept'}</span></div>
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Time</span><span className="font-medium">{selected.time || '10:00 AM'}</span></div>
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Format</span><span className="font-medium capitalize">{selected.type || 'Video Call'}</span></div>
          </div>
        </Card>
        <button onClick={() => setPage('dashboard')} className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <button onClick={() => setPage('counselors')} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors mb-6 flex items-center gap-1">← Back to Directory</button>
      <h1 className="text-3xl text-[var(--foreground)] mb-2">Book an Appointment</h1>
      <p className="text-[var(--muted-foreground)] mb-8">Choose your preferences below.</p>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step >= s ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>{s}</div>
            {s < 3 && <div className={`h-0.5 w-12 transition-colors ${step > s ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}></div>}
          </div>
        ))}
        <div className="ml-3 text-sm text-[var(--muted-foreground)]">{['Counselor & Type', 'Date & Time', 'Confirm'][step - 1]}</div>
      </div>

      {step === 1 && (
        <Card className="p-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-4">Select Session Type</h2>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {types.map(t => (
              <button key={t.id} onClick={() => setSelected(s => ({ ...s, type: t.id }))} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${selected.type === t.id ? 'border-[var(--primary)] bg-teal-50' : 'border-[var(--border)] hover:bg-[var(--muted)]'}`}>
                <span className="text-2xl">{t.icon}</span>
                <span className="text-xs font-medium text-[var(--foreground)]">{t.label}</span>
              </button>
            ))}
          </div>
          <h2 className="font-semibold text-[var(--foreground)] mb-4">Select Counselor</h2>
          <div className="space-y-3">
            {counselors.filter(c => c.available).map(c => (
              <button key={c.id} onClick={() => setSelected(s => ({ ...s, counselor: c.name }))} className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors text-left ${selected.counselor === c.name ? 'border-[var(--primary)] bg-teal-50' : 'border-[var(--border)] hover:bg-[var(--muted)]'}`}>
                <img src={c.image} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{c.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{c.specialties.join(', ')}</p>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(2)} disabled={!selected.counselor || !selected.type} className="mt-6 w-full py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-40">
            Next →
          </button>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-4">Select Date</h2>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {['Mon 22', 'Tue 23', 'Wed 24', 'Thu 25', 'Fri 26', 'Mon 29', 'Tue 30', 'Wed 1'].map(d => (
              <button key={d} onClick={() => setSelected(s => ({ ...s, date: d }))} className={`p-2.5 rounded-xl text-xs font-medium border-2 transition-colors ${selected.date === d ? 'border-[var(--primary)] bg-teal-50 text-[var(--primary)]' : 'border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)]'}`}>
                {d}
              </button>
            ))}
          </div>
          <h2 className="font-semibold text-[var(--foreground)] mb-4">Select Time</h2>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {times.map(t => (
              <button key={t} onClick={() => setSelected(s => ({ ...s, time: t }))} className={`py-2.5 rounded-xl text-xs font-medium border-2 transition-colors ${selected.time === t ? 'border-[var(--primary)] bg-teal-50 text-[var(--primary)]' : 'border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)]'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-semibold hover:bg-[var(--muted)] transition-colors">← Back</button>
            <button onClick={() => setStep(3)} disabled={!selected.date || !selected.time} className="flex-1 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-40">Next →</button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="p-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-4">Confirm Your Booking</h2>
          <div className="bg-[var(--muted)] rounded-xl p-4 space-y-3 mb-4">
            {[
              ['Counselor', selected.counselor],
              ['Date', selected.date],
              ['Time', selected.time],
              ['Format', types.find(t => t.id === selected.type)?.label || ''],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">{k}</span>
                <span className="font-semibold text-[var(--foreground)]">{v}</span>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Any notes for your counselor? (optional)</label>
            <textarea rows={3} placeholder="E.g., I've been struggling with exam stress lately…" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mb-4">✅ Your notes are private and only visible to your counselor.</p>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-semibold hover:bg-[var(--muted)] transition-colors">← Back</button>
            <button onClick={handleConfirm} className="flex-1 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity">Confirm Booking</button>
          </div>
        </Card>
      )}
    </div>
  );
}

function TrackerPage({ setPage, moodHistory, setMoodHistory }: { setPage: (p: Page) => void; moodHistory: MoodEntry[]; setMoodHistory: (h: MoodEntry[]) => void }) {
  const [newMood, setNewMood] = useState(5);
  const [newNote, setNewNote] = useState('');
  const [logged, setLogged] = useState(false);

  const handleLog = () => {
    const entry: MoodEntry = {
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      mood: newMood,
      note: newNote,
    };
    setMoodHistory([entry, ...moodHistory]);
    setLogged(true);
    setNewNote('');
  };

  const moodEmoji = (m: number) => m >= 8 ? '😊' : m >= 6 ? '🙂' : m >= 4 ? '😐' : '😔';
  const moodColor = (m: number) => m >= 8 ? 'bg-teal-100 text-teal-700' : m >= 6 ? 'bg-blue-100 text-blue-700' : m >= 4 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

  const avg = moodHistory.length ? (moodHistory.reduce((s, e) => s + e.mood, 0) / moodHistory.length).toFixed(1) : '—';
  const best = moodHistory.length ? Math.max(...moodHistory.map(e => e.mood)) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl text-[var(--foreground)]">Mood & Wellbeing Tracker</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">Track your emotional patterns and celebrate your progress.</p>
      </div>

      {/* Log today */}
      {!logged ? (
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-1">How are you feeling right now?</h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-5">Log today's mood to build your history.</p>
          <div className="text-center mb-4">
            <span className="text-5xl">{moodEmoji(newMood)}</span>
            <p className="text-3xl font-bold text-[var(--primary)] mt-2" style={{ fontFamily: 'DM Serif Display, serif' }}>{newMood}</p>
          </div>
          <input type="range" min={1} max={10} value={newMood} onChange={e => setNewMood(+e.target.value)} className="w-full mb-2" />
          <div className="flex justify-between text-xs text-[var(--muted-foreground)] mb-4">
            <span>Very low</span><span>Excellent</span>
          </div>
          <textarea
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            rows={2}
            placeholder="Add a note (optional)…"
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)] mb-4"
          />
          <button onClick={handleLog} className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity">
            Log Today's Mood
          </button>
        </Card>
      ) : (
        <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200 mb-6 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-semibold text-teal-700">Mood logged for today!</p>
            <p className="text-sm text-teal-600">Great job checking in with yourself.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Average Mood', value: avg, icon: '📊' },
          { label: 'Best Day', value: best || '—', icon: '🌟' },
          { label: 'Days Tracked', value: moodHistory.length, icon: '📅' },
        ].map(s => (
          <Card key={s.label} className="p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-[var(--foreground)]" style={{ fontFamily: 'DM Serif Display, serif' }}>{s.value}</div>
            <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Visual bar chart */}
      {moodHistory.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-4">Mood Over Time</h2>
          <div className="flex items-end gap-2 h-24">
            {moodHistory.slice(0, 14).reverse().map((e, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg bg-[var(--primary)] transition-all" style={{ height: `${e.mood * 10}%`, opacity: 0.6 + (e.mood / 20) }}></div>
                <span className="text-xs text-[var(--muted-foreground)] hidden sm:block">{e.date.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* History */}
      <Card className="p-6">
        <h2 className="font-semibold text-[var(--foreground)] mb-4">Recent Entries</h2>
        {moodHistory.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)] text-center py-6">No entries yet. Log your first mood above!</p>
        ) : (
          <div className="space-y-3">
            {moodHistory.slice(0, 7).map((e, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--muted)] transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${moodColor(e.mood)}`}>{moodEmoji(e.mood)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--foreground)]">{e.date}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${moodColor(e.mood)}`}>{e.mood}/10</span>
                  </div>
                  {e.note && <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">{e.note}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ProfilePage({ setPage, setLoggedIn }: { setPage: (p: Page) => void; setLoggedIn: (v: boolean) => void }) {
  const [notifications, setNotifications] = useState({ reminders: true, resources: false, appointments: true });
  const [dataSharing, setDataSharing] = useState({ counselor: true, aggregate: false });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl text-[var(--foreground)] mb-8">Profile & Privacy</h1>

      {/* Profile Card */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-2xl font-bold">JD</div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Jane Doe</h2>
            <p className="text-sm text-[var(--muted-foreground)]">jane.doe@university.edu</p>
            <Badge color="teal">Psychology · Year 3</Badge>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[['Full Name', 'Jane Doe'], ['Student ID', 'STU-2024-7821'], ['Faculty', 'Social Sciences'], ['Year', '3rd Year']].map(([l, v]) => (
            <div key={l}>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">{l}</label>
              <input defaultValue={v} className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--foreground)] bg-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
            </div>
          ))}
        </div>
        <button className="mt-4 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity">Save Changes</button>
      </Card>

      {/* Notifications */}
      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-[var(--foreground)] mb-4">Notification Preferences</h2>
        <div className="space-y-4">
          {[
            { key: 'reminders' as const, label: 'Daily Check-In Reminders', desc: 'Gentle nudges to log your mood each day' },
            { key: 'appointments' as const, label: 'Appointment Reminders', desc: 'Alerts 24 hours and 1 hour before sessions' },
            { key: 'resources' as const, label: 'New Resource Alerts', desc: 'When new articles relevant to you are added' },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{n.label}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{n.desc}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${notifications[n.key] ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications[n.key] ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Privacy */}
      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-[var(--foreground)] mb-1">Data & Privacy</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">All your data is encrypted and stored securely. You control what is shared.</p>
        <div className="space-y-4">
          {[
            { key: 'counselor' as const, label: 'Share mood data with my counselor', desc: 'Helps them provide better tailored support' },
            { key: 'aggregate' as const, label: 'Contribute to anonymised research', desc: 'Helps improve student mental health programmes' },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{n.label}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{n.desc}</p>
              </div>
              <button
                onClick={() => setDataSharing(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${dataSharing[n.key] ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${dataSharing[n.key] ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
              </button>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] underline transition-colors">Download my data</button>
          <span className="text-[var(--border)]">·</span>
          <button className="text-sm text-red-500 hover:text-red-700 underline transition-colors">Delete my account</button>
        </div>
      </Card>

      <button onClick={() => { setLoggedIn(false); setPage('home'); }} className="w-full py-3 rounded-xl border-2 border-red-200 text-red-500 font-semibold hover:bg-red-50 transition-colors">Sign Out</button>
    </div>
  );
}

function EmergencyPage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Alert banner */}
      <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-200 mb-8 flex items-start gap-3">
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white text-2xl">🆘</div>
          <div className="absolute inset-0 rounded-full bg-red-400 pulse-ring"></div>
        </div>
        <div>
          <h1 className="text-xl font-bold text-red-700">Emergency Support</h1>
          <p className="text-sm text-red-600 mt-1">If you're in immediate danger or having thoughts of self-harm, please contact emergency services or a crisis line now.</p>
        </div>
      </div>

      {/* Emergency contacts */}
      <div className="space-y-4 mb-8">
        {[
          { icon: '🚨', title: 'Emergency Services', sub: 'For immediate physical danger', phone: '999 / 112', color: 'border-red-200 bg-red-50', textColor: 'text-red-700', btnColor: 'bg-red-500 hover:bg-red-600' },
          { icon: '📞', title: 'Samaritans 24/7 Crisis Line', sub: 'Free, confidential listening support', phone: '116 123', color: 'border-orange-200 bg-orange-50', textColor: 'text-orange-700', btnColor: 'bg-orange-500 hover:bg-orange-600' },
          { icon: '💬', title: 'Crisis Text Line', sub: 'Text HELLO to 85258 · 24/7', phone: 'Text 85258', color: 'border-amber-200 bg-amber-50', textColor: 'text-amber-700', btnColor: 'bg-amber-500 hover:bg-amber-600' },
          { icon: '🏫', title: 'University Counselling Emergency', sub: 'On-campus emergency mental health support', phone: '+44 1234 567 890', color: 'border-blue-200 bg-blue-50', textColor: 'text-blue-700', btnColor: 'bg-blue-500 hover:bg-blue-600' },
        ].map(c => (
          <div key={c.title} className={`p-5 rounded-2xl border-2 ${c.color}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{c.icon}</span>
              <div className="flex-1">
                <p className={`font-semibold ${c.textColor}`}>{c.title}</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{c.sub}</p>
              </div>
              <a href={`tel:${c.phone.replace(/\s/g, '')}`} className={`shrink-0 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-colors ${c.btnColor}`}>
                {c.phone}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Safety plan */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">While You Wait — Grounding Techniques</h2>
        <div className="space-y-4">
          {[
            { title: 'Box Breathing', steps: 'Breathe in for 4 counts → Hold for 4 → Breathe out for 4 → Hold for 4. Repeat 4 times.' },
            { title: '5-4-3-2-1 Grounding', steps: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.' },
            { title: 'Safe Place Visualisation', steps: 'Close your eyes. Imagine a place where you feel completely safe and calm. Stay there for 2–3 minutes.' },
          ].map(g => (
            <div key={g.title} className="p-4 rounded-xl bg-[var(--muted)]">
              <p className="font-medium text-[var(--foreground)] mb-1">{g.title}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{g.steps}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* You are not alone */}
      <div className="text-center py-6">
        <p className="text-[var(--muted-foreground)] text-sm leading-relaxed max-w-md mx-auto">
          You are not alone. Reaching out — even to this page — is a courageous step. Help is here.
        </p>
        <div className="flex justify-center gap-3 mt-4">
          <button onClick={() => setPage('chat')} className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:opacity-90 transition-opacity">Talk to AI Support</button>
          <button onClick={() => setPage('booking')} className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-semibold text-sm hover:bg-[var(--muted)] transition-colors">Book a Counselor</button>
        </div>
      </div>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [loggedIn, setLoggedIn] = useState(true);
  const [checkInResults, setCheckInResults] = useState<Record<string, number>>({});
  const [counselorId, setCounselorId] = useState(1);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([
    { date: '20 Sep', mood: 7, note: 'Had a good study session' },
    { date: '19 Sep', mood: 5, note: 'Feeling a bit overwhelmed' },
    { date: '18 Sep', mood: 8, note: 'Great day with friends' },
    { date: '17 Sep', mood: 4, note: 'Didn\'t sleep well' },
    { date: '16 Sep', mood: 6, note: '' },
    { date: '15 Sep', mood: 7, note: 'Finished my assignment' },
    { date: '14 Sep', mood: 9, note: 'Weekend! Feeling refreshed' },
  ]);

  const nav = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <NavBar page={page} setPage={nav} loggedIn={loggedIn} />

      {page === 'home' && <HomePage setPage={nav} />}
      {page === 'login' && <LoginPage setPage={nav} setLoggedIn={setLoggedIn} />}
      {page === 'dashboard' && loggedIn && <Dashboard setPage={nav} />}
      {page === 'checkin' && loggedIn && <CheckInPage setPage={nav} setCheckInResults={setCheckInResults} />}
      {page === 'checkin-results' && loggedIn && <CheckInResults setPage={nav} results={checkInResults} />}
      {page === 'chat' && loggedIn && <AIChatPage setPage={nav} />}
      {page === 'resources' && loggedIn && <ResourcesPage setPage={nav} />}
      {page === 'counselors' && loggedIn && <CounselorDirectory setPage={nav} setCounselorId={setCounselorId} />}
      {page === 'counselor-profile' && loggedIn && <CounselorProfile setPage={nav} counselorId={counselorId} />}
      {page === 'booking' && loggedIn && <BookingPage setPage={nav} />}
      {page === 'tracker' && loggedIn && <TrackerPage setPage={nav} moodHistory={moodHistory} setMoodHistory={setMoodHistory} />}
      {page === 'profile' && loggedIn && <ProfilePage setPage={nav} setLoggedIn={setLoggedIn} />}
      {page === 'emergency' && <EmergencyPage setPage={nav} />}
    </div>
  );
}
