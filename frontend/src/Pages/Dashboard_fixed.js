import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getTutorApplications } from '../services/api';
import { getStoredTutorStudentId } from '../utils/tutorStorage';

const Dashboard = () => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);
  const [stats, setStats]     = useState({ totalResources: 0, totalModules: 0, recentActivity: 0 });
  const [eligibleStudentId, setEligibleStudentId] = useState('');
  const [isApprovedTutor, setIsApprovedTutor] = useState(false);
  const navigate = useNavigate();

  const normalize = (value) => String(value || '').trim().toLowerCase();
  const normalizeId = (value) => normalize(value).replace(/[^a-z0-9]/g, '');
  const normalizeName = (value) => normalize(value).replace(/\s+/g, ' ');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token) { navigate('/login'); return; }
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); }
      catch {
        try { setUser(JSON.parse(decodeURIComponent(storedUser))); }
        catch { navigate('/login'); return; }
      }
    }
    fetchDashboardData();
  }, [navigate]);

  useEffect(() => {
    const resolveTutorEligibility = async () => {
      if (!user || normalize(user.role) !== 'student') {
        setIsApprovedTutor(false);
        setEligibleStudentId('');
        return;
      }

      try {
        const userEmail = normalize(user.email);
        const userFullName = normalizeName(`${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`);
        const userStudentIdNormalized = normalizeId(user?.studentId || user?.profile?.studentId || '');

        const res = await getTutorApplications();
        const apps = res.data?.data || [];

        const mine = apps.filter((app) => {
          const appEmail = normalize(app?.email);
          const appStudentIdNormalized = normalizeId(app?.studentId);
          const appStudentName = normalizeName(app?.studentName);
          return (userEmail && appEmail === userEmail)
            || (userStudentIdNormalized && appStudentIdNormalized === userStudentIdNormalized)
            || (userFullName && appStudentName === userFullName);
        });

        const approved = mine.find((app) => normalize(app?.status) === 'approved');
        if (approved) {
          setIsApprovedTutor(true);
          setEligibleStudentId(
            String(
              approved?.studentId
                || user?.studentId
                || user?.profile?.studentId
                || getStoredTutorStudentId()
                || ''
            ).trim()
          );
        } else {
          setIsApprovedTutor(false);
          setEligibleStudentId('');
        }
      } catch {
        setIsApprovedTutor(false);
        setEligibleStudentId('');
      }
    };

    resolveTutorEligibility();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setNotices([
        { id: 1, title: 'Welcome to LearnBridge!', content: 'Your academic resource management platform is ready. Explore modules, submit resources, and collaborate with peers.', type: 'info', date: new Date().toISOString(), priority: 'high' },
        { id: 2, title: 'New Module Available', content: 'Advanced Web Development has been added to curriculum. Check out the latest resources and materials.', type: 'success', date: new Date(Date.now() - 86400000).toISOString(), priority: 'medium' },
        { id: 3, title: 'System Maintenance', content: 'Scheduled maintenance this weekend from 2 AM to 4 AM. The platform may be temporarily unavailable.', type: 'warning', date: new Date(Date.now() - 172800000).toISOString(), priority: 'low' },
      ]);
      setStats({ totalResources: 156, totalModules: 24, recentActivity: 12 });
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (ds) => {
    const diff = Math.ceil(Math.abs(new Date() - new Date(ds)) / 864e5);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7)  return diff + ' days ago';
    return new Date(ds).toLocaleDateString();
  };

  const getInitials = () => {
    const f = user?.profile?.firstName?.[0] || '';
    const l = user?.profile?.lastName?.[0]  || '';
    return (f + l).toUpperCase() || (user?.username?.[0] || 'U').toUpperCase();
  };

  const roleLabel = { admin: 'Administrator', resourceManager: 'Resource Manager', coordinator: 'Coordinator', student: 'Student' };

  const getQuickActions = () => {
    const base = [
      { title: 'Courses',          desc: 'Browse faculties & modules', link: '/hpage',           color: '#0ea5a5', bg: '#f0fdfa', border: '#99f6e4' },
      { title: 'Browse Resources', desc: 'Explore study materials',  link: '/resources',       color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
      { title: 'Submit Resource',  desc: 'Share your materials',     link: '/submit-resource',  color: '#059669', bg: '#f0fdf4', border: '#a7f3d0' },
    ];

    if (normalize(user?.role) === 'student' && isApprovedTutor && eligibleStudentId) {
      base.unshift({
        title: 'Create Session',
        desc: 'Start your approved tutoring session',
        link: `/tutor/create-session`,
        color: '#094886',
        bg: '#eff6ff',
        border: '#93c5fd',
        state: { studentId: eligibleStudentId },
      });
      base.unshift({
        title: 'My Ratings',
        desc: 'View student feedback and ratings',
        link: `/tutor/ratings`,
        color: '#b45309',
        bg: '#fffbeb',
        border: '#fcd34d',
      });
    }

    if (['admin','resourceManager','coordinator'].includes(user?.role)) {
      base.unshift(
        { title: 'Manage Modules',   desc: 'Create & edit modules', link: '/manage-modules',   color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
        { title: 'Manage Resources', desc: 'Review submissions',    link: '/manage-resources', color: '#7c3aed', bg: '#faf5ff', border: '#ddd6fe' },
      );
    }
    return base;
  };

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', background:'#f0f4f8', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <style>{'@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap"); @keyframes sp{to{transform:rotate(360deg)}}'}</style>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:44, height:44, border:'3px solid #e2e8f0', borderTopColor:'#2563eb', borderRadius:'50%', animation:'sp 0.7s linear infinite', margin:'0 auto 14px' }} />
          <p style={{ color:'#64748b', fontFamily:"'DM Sans',sans-serif" }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const noticeTypes = {
    info:    { color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe', leftBar:'#2563eb' },
    success: { color:'#059669', bg:'#f0fdf4', border:'#a7f3d0', leftBar:'#059669' },
    warning: { color:'#d97706', bg:'#fffbeb', border:'#fde68a', leftBar:'#d97706' },
    error:   { color:'#dc2626', bg:'#fef2f2', border:'#fecaca', leftBar:'#dc2626' },
  };

  return (
    <div style={{ minHeight:'100vh', background:'#f0f4f8', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{'@import url("https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap"); *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}'}</style>
      <ToastContainer position="top-right" toastStyle={{ fontFamily:"'DM Sans',sans-serif" }} />

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'2rem 1.5rem' }}>

        {/* HERO */}
        <div style={{ background:'linear-gradient(135deg,#094886 0%,#1a6dbf 50%,#2563eb 100%)', borderRadius:22, padding:'2rem 2.4rem', color:'white', position:'relative', overflow:'hidden', boxShadow:'0 6px 24px rgba(9,72,134,0.22)', marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1.5rem', flexWrap:'wrap', position:'relative', zIndex:1 }}>
            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:20, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.20)', fontSize:'0.78rem', fontWeight:600, fontFamily:"'Sora',sans-serif", marginBottom:10 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#93c5fd', boxShadow:'0 0 6px #93c5fd' }} />
                Academic Dashboard
              </div>
              <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(1.5rem,3vw,2rem)', fontWeight:800, lineHeight:1.2, marginBottom:6 }}>
                Welcome back, <span style={{ color:'#93c5fd' }}>{user?.profile?.firstName || 'Student'}</span>! 👋
              </h1>
              <p style={{ fontSize:'0.9rem', color:'rgba(255,255,255,0.68)', lineHeight:1.6 }}>Here's what's happening in your academic journey today.</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10, flexShrink:0 }}>
              <Link
                to="/user-notices"
                style={{
                  width:44,
                  height:44,
                  borderRadius:12,
                  background:'rgba(255,255,255,0.14)',
                  border:'1.5px solid rgba(255,255,255,0.30)',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  color:'white',
                  textDecoration:'none',
                  boxShadow:'0 2px 10px rgba(9,72,134,0.2)',
                  transition:'transform 0.15s, background 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
                title="View notifications"
                aria-label="View notifications"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </Link>

              <div style={{ background:'rgba(255,255,255,0.12)', border:'1.5px solid rgba(255,255,255,0.22)', borderRadius:16, padding:'16px 20px', display:'flex', alignItems:'center', gap:14, backdropFilter:'blur(10px)' }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(255,255,255,0.18)', border:'2px solid rgba(255,255,255,0.35)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Sora',sans-serif", fontSize:'1.1rem', fontWeight:800, color:'white' }}>{getInitials()}</div>
                <div>
                  <p style={{ fontFamily:"'Sora',sans-serif", fontSize:'0.95rem', fontWeight:700, color:'white' }}>{[user?.profile?.firstName, user?.profile?.lastName].filter(Boolean).join(' ') || user?.username}</p>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:4, padding:'3px 10px', borderRadius:20, background:'rgba(255,255,255,0.15)', fontSize:'0.74rem', fontWeight:600, fontFamily:"'Sora',sans-serif", color:'rgba(255,255,255,0.90)' }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background:'#93c5fd', display:'inline-block' }} />
                    {roleLabel[user?.role] || user?.role}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
          {[
            { num: stats.totalResources, label:'Total Resources',   color:'#2563eb', bg:'#eff6ff' },
            { num: stats.totalModules,   label:'Available Modules', color:'#059669', bg:'#f0fdf4' },
            { num: stats.recentActivity, label:'Recent Activities', color:'#7c3aed', bg:'#faf5ff' },
          ].map((s, i) => (
            <div key={i} style={{ background:'white', borderRadius:16, padding:'1.2rem 1.4rem', display:'flex', alignItems:'center', gap:14, boxShadow:'0 2px 8px rgba(9,72,134,0.06)', transition:'transform 0.15s', cursor:'default' }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
              <div style={{ width:46, height:46, borderRadius:13, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'1.4rem' }}>
                {i===0?'📖':i===1?'📚':'🔥'}
              </div>
              <div>
                <p style={{ fontFamily:"'Sora',sans-serif", fontSize:'1.6rem', fontWeight:800, color:'#0f1e35', lineHeight:1 }}>{s.num}</p>
                <p style={{ fontSize:'0.80rem', color:'#94a3b8', fontWeight:500, marginTop:3 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 2-COL */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.2rem', marginBottom:'1.5rem' }}>

          {/* Notices */}
          <div style={{ background:'white', borderRadius:18, boxShadow:'0 2px 8px rgba(9,72,134,0.06)', overflow:'hidden' }}>
            <div style={{ padding:'1.1rem 1.4rem 0', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
              <span style={{ fontFamily:"'Sora',sans-serif", fontSize:'0.95rem', fontWeight:700, color:'#0f1e35' }}>📢 Notices & Announcements</span>
              <button style={{ fontSize:'0.80rem', fontWeight:600, color:'#2563eb', background:'none', border:'none', cursor:'pointer', fontFamily:"'Sora',sans-serif" }}>View All</button>
            </div>
            <div style={{ padding:'0 1.4rem 1.4rem' }}>
              {notices.map(n => {
                const nc = noticeTypes[n.type] || noticeTypes.info;
                return (
                  <div key={n.id} style={{ display:'flex', gap:10, padding:'11px 13px', borderRadius:12, border:'1.5px solid '+nc.border, borderLeft:'4px solid '+nc.leftBar, background:nc.bg, marginBottom:8, transition:'transform 0.15s', cursor:'default' }}
                    onMouseEnter={e => e.currentTarget.style.transform='translateX(2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform='translateX(0)'}>
                    <div style={{ fontSize:'1.1rem', flexShrink:0 }}>
                      {n.type==='success'?'✅':n.type==='warning'?'⚠️':n.type==='error'?'❌':'ℹ️'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontFamily:"'Sora',sans-serif", fontSize:'0.83rem', fontWeight:700, color:'#0f1e35', marginBottom:3 }}>{n.title}</p>
                      <p style={{ fontSize:'0.80rem', color:'#64748b', lineHeight:1.5, marginBottom:5 }}>{n.content}</p>
                      <span style={{ fontSize:'0.72rem', color:'#94a3b8' }}>{formatDate(n.date)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background:'white', borderRadius:18, boxShadow:'0 2px 8px rgba(9,72,134,0.06)', overflow:'hidden' }}>
            <div style={{ padding:'1.1rem 1.4rem 0', marginBottom:'1rem' }}>
              <span style={{ fontFamily:"'Sora',sans-serif", fontSize:'0.95rem', fontWeight:700, color:'#0f1e35' }}>🚀 Quick Actions</span>
            </div>
            <div style={{ padding:'0 1.4rem 1.4rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {getQuickActions().map((a, i) => (
                  <Link key={i} to={a.link} state={a.state} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, padding:'1.1rem 0.8rem', borderRadius:14, border:'1.5px solid #f1f5f9', borderTop:'3px solid transparent', background:'#fafbfc', textDecoration:'none', transition:'all 0.2s', cursor:'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(9,72,134,0.08)'; e.currentTarget.style.borderTopColor=a.color; }}
                    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderTopColor='transparent'; }}>
                    <div style={{ width:44, height:44, borderRadius:13, display:'flex', alignItems:'center', justifyContent:'center', background:a.bg, border:'1.5px solid '+a.border, fontSize:'1.2rem' }}>
                      {a.title.includes('Create Session')?'🗓️':a.title.includes('Ratings')?'⭐':a.title.includes('Courses')?'🎓':a.title.includes('Browse')?'📚':a.title.includes('Submit')?'📤':a.title.includes('Module')?'⚙️':'📁'}
                    </div>
                    <p style={{ fontFamily:"'Sora',sans-serif", fontSize:'0.84rem', fontWeight:700, color:'#0f1e35', textAlign:'center' }}>{a.title}</p>
                    <p style={{ fontSize:'0.76rem', color:'#94a3b8', textAlign:'center', lineHeight:1.4 }}>{a.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ background:'white', borderRadius:18, boxShadow:'0 2px 8px rgba(9,72,134,0.06)', overflow:'hidden' }}>
          <div style={{ padding:'1.1rem 1.5rem 0', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.4rem' }}>
            <span style={{ fontFamily:"'Sora',sans-serif", fontSize:'0.95rem', fontWeight:700, color:'#0f1e35' }}>📈 Recent Activity</span>
            <button style={{ fontSize:'0.80rem', fontWeight:600, color:'#2563eb', background:'none', border:'none', cursor:'pointer', fontFamily:"'Sora',sans-serif" }}>View All</button>
          </div>
          <div style={{ paddingBottom:'0.4rem' }}>
            {[
              { bg:'#eff6ff', emoji:'📤', text:'New resource uploaded', detail:'JavaScript Fundamentals',  time:'2 hours ago' },
              { bg:'#f0fdf4', emoji:'📚', text:'New module created',    detail:'Machine Learning Basics',   time:'5 hours ago' },
              { bg:'#faf5ff', emoji:'👤', text:'New user joined',       detail:'John Doe',                  time:'1 day ago'   },
            ].map((a, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom: i<2?'1px solid #f8fafc':'none', transition:'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background='#fafbfe'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <div style={{ width:38, height:38, borderRadius:11, background:a.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'1.1rem' }}>{a.emoji}</div>
                <p style={{ flex:1, fontSize:'0.86rem', color:'#475569' }}>{a.text}: <strong style={{ color:'#0f1e35', fontWeight:600 }}>{a.detail}</strong></p>
                <span style={{ fontSize:'0.76rem', color:'#94a3b8', whiteSpace:'nowrap', flexShrink:0 }}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;