import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', phone: '', bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'firstName' || name === 'lastName') {
      const lettersOnly = value.replace(/[^A-Za-z]/g, '');
      setFormData({ ...formData, [name]: lettersOnly });
      return;
    }

    if (name === 'phone') {
      const numericOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, phone: numericOnly });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (!/^\d{10}$/.test(formData.phone)) { toast.error('Phone number must contain exactly 10 digits'); return; }
    setLoading(true);
    try {
      const { confirmPassword, ...registrationData } = formData;
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/register`,
        registrationData
      );
      if (response.data.success) {
        toast.success('Registration successful! Redirecting…');
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const getStrength = (pw) => {
    if (!pw) return { score: 0, label: '', color: '#e2e8f0' };
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    if (s <= 1) return { score: s, label: 'Weak',        color: '#ef4444' };
    if (s <= 2) return { score: s, label: 'Fair',        color: '#f59e0b' };
    if (s <= 3) return { score: s, label: 'Good',        color: '#3b82f6' };
    if (s <= 4) return { score: s, label: 'Strong',      color: '#22c55e' };
    return             { score: s, label: 'Very Strong', color: '#059669' };
  };
  const strength = getStrength(formData.password);

  const EyeIcon = ({ open }) => open ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rg-root { min-height: 100vh; display: flex; font-family: 'DM Sans', sans-serif; background: #f0f4f8; }

        /* LEFT */
        .rg-left {
          position: relative; width: 44%;
          background: linear-gradient(150deg, #062d55 0%, #094886 45%, #1a6dbf 80%, #2563eb 100%);
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          padding: 3rem 2.5rem; overflow: hidden; color: white;
        }
        .rg-left::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 65% 55% at 20% 20%, rgba(37,99,235,0.22) 0%, transparent 70%),
                      radial-gradient(ellipse 55% 65% at 80% 80%, rgba(9,72,134,0.28) 0%, transparent 70%);
          pointer-events: none;
        }
        .rg-ring1, .rg-ring2 { position: absolute; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.08); pointer-events: none; }
        .rg-ring1 { width: 500px; height: 500px; top: -150px; left: -150px; animation: rg-spin 38s linear infinite; }
        .rg-ring2 { width: 320px; height: 320px; bottom: -90px; right: -70px; animation: rg-spin 26s linear infinite reverse; }
        @keyframes rg-spin { to { transform: rotate(360deg); } }
        .rg-dots { position: absolute; top: 44px; right: 44px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 9px; opacity: 0.15; pointer-events: none; }
        .rg-dot { width: 4px; height: 4px; background: white; border-radius: 50%; }
        .rg-glow { position: absolute; width: 300px; height: 300px; background: radial-gradient(circle, rgba(37,99,235,0.28) 0%, transparent 70%); bottom: -50px; left: 50%; transform: translateX(-50%); pointer-events: none; }

        .rg-brand { display: flex; align-items: center; margin-bottom: 2.8rem; z-index: 1; }
        .rg-brand-image { width: 180px; height: 54px; object-fit: contain; display: block; }
        .rg-headline { font-family: 'Sora', sans-serif; font-size: 2.4rem; font-weight: 800; line-height: 1.18; text-align: center; margin-bottom: 1.1rem; z-index: 1; }
        .rg-headline span { color: #93c5fd; }
        .rg-sub { font-size: 0.91rem; color: rgba(255,255,255,0.66); text-align: center; line-height: 1.72; max-width: 310px; z-index: 1; margin-bottom: 2.4rem; }
        .rg-perks { display: flex; flex-direction: column; gap: 10px; z-index: 1; width: 100%; max-width: 300px; }
        .rg-perk { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.13); border-radius: 12px; font-size: 0.83rem; color: rgba(255,255,255,0.86); backdrop-filter: blur(4px); }
        .rg-perk-check { width: 20px; height: 20px; border-radius: 50%; background: rgba(147,197,253,0.20); border: 1px solid rgba(147,197,253,0.40); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

        /* RIGHT */
        .rg-right { flex: 1; display: flex; align-items: flex-start; justify-content: center; padding: 2rem; background: #f8fafc; overflow-y: auto; }
        .rg-card { width: 100%; max-width: 480px; background: white; border-radius: 24px; padding: 2.4rem; box-shadow: 0 4px 6px -1px rgba(9,72,134,0.07), 0 20px 60px -10px rgba(9,72,134,0.13), 0 0 0 1px rgba(9,72,134,0.05); animation: rg-cardIn 0.5s cubic-bezier(0.16,1,0.3,1) both; margin: auto 0; }
        @keyframes rg-cardIn { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: translateY(0); } }

        .rg-title { font-family: 'Sora', sans-serif; font-size: 1.55rem; font-weight: 700; color: #0f1e35; margin-bottom: 0.3rem; }
        .rg-subtitle { font-size: 0.88rem; color: #64748b; margin-bottom: 1.8rem; }
        .rg-subtitle a { color: #2563eb; font-weight: 500; text-decoration: none; }
        .rg-subtitle a:hover { text-decoration: underline; }

        .rg-sec { font-family: 'Sora', sans-serif; font-size: 0.74rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.9px; display: flex; align-items: center; gap: 8px; margin: 1rem 0 0.9rem; }
        .rg-sec::after { content: ''; flex: 1; height: 1px; background: #f1f5f9; }

        .rg-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .rg-field { margin-bottom: 1rem; }
        .rg-field label { display: block; font-size: 0.82rem; font-weight: 500; color: #374151; margin-bottom: 5px; }
        .rg-req { color: #2563eb; }
        .rg-opt { font-size: 0.70rem; color: #94a3b8; font-weight: 400; background: #f1f5f9; padding: 1px 6px; border-radius: 6px; margin-left: 4px; }

        .rg-wrap { position: relative; }
        .rg-ico { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; display: flex; pointer-events: none; }
        .rg-ico-at { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 0.84rem; font-weight: 600; font-family: 'Sora', sans-serif; pointer-events: none; }

        .rg-input { width: 100%; padding: 10px 12px 10px 38px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 0.88rem; font-family: 'DM Sans', sans-serif; color: #1e293b; background: #f8fafc; outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; }
        .rg-input:focus { border-color: #2563eb; background: white; box-shadow: 0 0 0 4px rgba(37,99,235,0.10); }
        .rg-textarea { width: 100%; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 0.88rem; font-family: 'DM Sans', sans-serif; color: #1e293b; background: #f8fafc; outline: none; resize: none; line-height: 1.6; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; }
        .rg-textarea:focus { border-color: #2563eb; background: white; box-shadow: 0 0 0 4px rgba(37,99,235,0.10); }

        .rg-eye { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8; display: flex; padding: 2px; transition: color 0.2s; }
        .rg-eye:hover { color: #2563eb; }

        .rg-strength { margin-top: 6px; display: flex; align-items: center; gap: 8px; }
        .rg-bars { display: flex; gap: 3px; flex: 1; }
        .rg-bar { flex: 1; height: 4px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
        .rg-bar-fill { height: 100%; border-radius: 999px; transition: width 0.3s, background 0.3s; }
        .rg-str-label { font-size: 0.72rem; font-weight: 700; font-family: 'Sora', sans-serif; flex-shrink: 0; min-width: 62px; text-align: right; }

        .rg-msg { font-size: 0.74rem; margin-top: 4px; font-weight: 500; display: flex; align-items: center; gap: 4px; }

        .rg-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #094886 0%, #2563eb 100%); color: white; border: none; border-radius: 12px; font-family: 'Sora', sans-serif; font-size: 0.93rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 14px rgba(37,99,235,0.30); transition: transform 0.15s, box-shadow 0.15s, opacity 0.2s; display: flex; align-items: center; justify-content: center; gap: 7px; margin-top: 1.2rem; }
        .rg-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 7px 22px rgba(37,99,235,0.38); }
        .rg-btn:active:not(:disabled) { transform: translateY(0); }
        .rg-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .rg-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.30); border-top-color: white; border-radius: 50%; animation: rg-spin 0.65s linear infinite; display: inline-block; }

        .rg-terms { font-size: 0.75rem; color: #94a3b8; text-align: center; margin-top: 1rem; line-height: 1.6; }
        .rg-terms a { color: #2563eb; text-decoration: none; font-weight: 500; }
        .rg-terms a:hover { text-decoration: underline; }

        @media (max-width: 768px) {
          .rg-left { display: none; }
          .rg-right { background: #f0f4f8; padding: 1.5rem 1rem; }
          .rg-grid2 { grid-template-columns: 1fr; }
        }
      `}</style>

      <ToastContainer position="top-right" toastStyle={{ fontFamily: "'DM Sans', sans-serif" }} />

      <div className="rg-root">

        {/* LEFT PANEL */}
        <div className="rg-left">
          <div className="rg-ring1" /><div className="rg-ring2" />
          <div className="rg-glow" />
          <div className="rg-dots">{Array.from({ length: 30 }).map((_, i) => <div className="rg-dot" key={i} />)}</div>

          <div className="rg-brand">
            <img src="/Logof.png" alt="Register logo" className="rg-brand-image" />
          </div>

          <h1 className="rg-headline">Start Your<br /><span>Learning</span><br />Journey Today</h1>
          <p className="rg-sub">Join thousands of students and educators sharing knowledge and building a stronger academic community.</p>

          <div className="rg-perks">
            {['Access 1,000+ approved resources','Upload & share your materials','Collaborate with peers & educators','Track your learning progress'].map((p, i) => (
              <div key={i} className="rg-perk">
                <div className="rg-perk-check">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>
                </div>
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="rg-right">
          <div className="rg-card">
            <h2 className="rg-title">Create your account 🚀</h2>
            <p className="rg-subtitle">Already have an account?&nbsp;<Link to="/login">Sign in here</Link></p>

            <form onSubmit={handleSubmit}>

              {/* ── Personal Info ── */}
              <div className="rg-sec">Personal Information</div>

              <div className="rg-grid2">
                <div className="rg-field">
                  <label>First Name <span className="rg-req">*</span></label>
                  <div className="rg-wrap">
                    <span className="rg-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
                    <input className="rg-input" type="text" name="firstName" required value={formData.firstName} onChange={handleChange} placeholder="John" />
                  </div>
                </div>
                <div className="rg-field">
                  <label>Last Name <span className="rg-req">*</span></label>
                  <div className="rg-wrap">
                    <span className="rg-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
                    <input className="rg-input" type="text" name="lastName" required value={formData.lastName} onChange={handleChange} placeholder="Doe" />
                  </div>
                </div>
              </div>

              <div className="rg-field">
                <label>Phone <span className="rg-req">*</span></label>
                <div className="rg-wrap">
                  <span className="rg-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.32 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 6.36 6.36l.96-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>
                  <input className="rg-input" type="tel" name="phone" required inputMode="numeric" pattern="\d{10}" maxLength={10} value={formData.phone} onChange={handleChange} placeholder="0770000000" />
                </div>
              </div>

              <div className="rg-field">
                <label>Bio <span className="rg-opt">optional</span></label>
                <textarea className="rg-textarea" name="bio" rows={2} value={formData.bio} onChange={handleChange} placeholder="Tell us a little about yourself…" />
              </div>

              {/* ── Account Details ── */}
              <div className="rg-sec">Account Details</div>

              <div className="rg-field">
                <label>Username <span className="rg-req">*</span></label>
                <div className="rg-wrap">
                  <span className="rg-ico-at">@</span>
                  <input className="rg-input" type="text" name="username" required value={formData.username} onChange={handleChange} placeholder="johndoe" />
                </div>
              </div>

              <div className="rg-field">
                <label>Email Address <span className="rg-req">*</span></label>
                <div className="rg-wrap">
                  <span className="rg-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
                  <input className="rg-input" type="email" name="email" autoComplete="email" required value={formData.email} onChange={handleChange} placeholder="you@example.com" />
                </div>
              </div>

              <div className="rg-grid2">
                {/* Password */}
                <div className="rg-field">
                  <label>Password <span className="rg-req">*</span></label>
                  <div className="rg-wrap">
                    <span className="rg-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                    <input className="rg-input" style={{ paddingRight: 38 }} type={showPassword ? 'text' : 'password'} name="password" required value={formData.password} onChange={handleChange} placeholder="Min. 6 chars" />
                    <button type="button" className="rg-eye" onClick={() => setShowPassword(!showPassword)}><EyeIcon open={showPassword} /></button>
                  </div>
                  {formData.password && (
                    <div className="rg-strength">
                      <div className="rg-bars">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className="rg-bar">
                            <div className="rg-bar-fill" style={{ width: strength.score >= i ? '100%' : '0%', background: strength.color }} />
                          </div>
                        ))}
                      </div>
                      <span className="rg-str-label" style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <div className="rg-field">
                  <label>Confirm Password <span className="rg-req">*</span></label>
                  <div className="rg-wrap">
                    <span className="rg-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                    <input
                      className="rg-input" style={{ paddingRight: 38, borderColor: formData.confirmPassword && formData.confirmPassword !== formData.password ? '#fca5a5' : undefined }}
                      type={showConfirm ? 'text' : 'password'} name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter"
                    />
                    <button type="button" className="rg-eye" onClick={() => setShowConfirm(!showConfirm)}><EyeIcon open={showConfirm} /></button>
                  </div>
                  {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                    <p className="rg-msg" style={{ color: '#dc2626' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      Passwords don't match
                    </p>
                  )}
                  {formData.confirmPassword && formData.confirmPassword === formData.password && formData.password.length >= 6 && (
                    <p className="rg-msg" style={{ color: '#059669' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>
                      Passwords match
                    </p>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button type="submit" className="rg-btn" disabled={loading}>
                {loading ? (
                  <><span className="rg-spinner" /> Creating account…</>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="8.5" cy="7" r="4"/>
                      <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                    Create Account
                  </>
                )}
              </button>

              <p className="rg-terms">
                By creating an account you agree to our&nbsp;
                <Link to="/terms">Terms of Service</Link> and&nbsp;
                <Link to="/privacy">Privacy Policy</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;