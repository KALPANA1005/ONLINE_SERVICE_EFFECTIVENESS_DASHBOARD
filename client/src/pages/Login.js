import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginAPI } from '../services/api';

const inp = { width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #334155', background:'#0f172a', color:'#f1f5f9', fontSize:14, outline:'none' };
const lbl = { display:'block', fontSize:13, fontWeight:500, color:'#94a3b8', marginBottom:6 };

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await loginAPI(form);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success(`Welcome, ${data.name}!`);
      navigate(data.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const fill = (role) => {
    if (role === 'admin') setForm({ email:'admin@gmail.com', password:'admin123' });
    else setForm({ email:'user@gmail.com', password:'user123' });
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0f172a',padding:20}}>
      <div style={{width:'100%',maxWidth:420}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{width:56,height:56,background:'#3b82f6',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:22,fontWeight:800,color:'white',boxShadow:'0 8px 24px rgba(59,130,246,0.4)'}}>SD</div>
          <h1 style={{color:'white',fontSize:26,fontWeight:800}}>Welcome back</h1>
          <p style={{color:'#64748b',marginTop:6,fontSize:14}}>Sign in to your account</p>
        </div>

        <div style={{display:'flex',gap:10,marginBottom:20}}>
          <button onClick={() => fill('admin')} style={{flex:1,padding:'9px',borderRadius:10,border:'1px solid #334155',background:'#1e293b',color:'#a78bfa',fontSize:13,cursor:'pointer',fontWeight:500}}>🔑 Admin Demo</button>
          <button onClick={() => fill('user')} style={{flex:1,padding:'9px',borderRadius:10,border:'1px solid #334155',background:'#1e293b',color:'#34d399',fontSize:13,cursor:'pointer',fontWeight:500}}>👤 User Demo</button>
        </div>

        <div style={{background:'#1e293b',borderRadius:20,border:'1px solid #334155',padding:32,boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:18}}>
            <div>
              <label style={lbl}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="you@example.com" style={{...inp,borderColor:errors.email?'#ef4444':'#334155'}} />
              {errors.email && <p style={{color:'#ef4444',fontSize:12,marginTop:4}}>{errors.email}</p>}
            </div>
            <div>
              <label style={lbl}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} placeholder="••••••••" style={{...inp,borderColor:errors.password?'#ef4444':'#334155'}} />
              {errors.password && <p style={{color:'#ef4444',fontSize:12,marginTop:4}}>{errors.password}</p>}
            </div>
            <button type="submit" disabled={loading} style={{padding:'12px',background:loading?'#1d4ed8':'#3b82f6',color:'white',border:'none',borderRadius:10,fontSize:15,fontWeight:700,cursor:'pointer',marginTop:4,boxShadow:'0 4px 12px rgba(59,130,246,0.3)'}}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p style={{textAlign:'center',marginTop:20,color:'#64748b',fontSize:14}}>
            No account? <Link to="/register" style={{color:'#3b82f6',textDecoration:'none',fontWeight:600}}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
