import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerAPI } from '../services/api';

const inp = { width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #334155', background:'#0f172a', color:'#f1f5f9', fontSize:14, outline:'none' };
const lbl = { display:'block', fontSize:13, fontWeight:500, color:'#94a3b8', marginBottom:6 };

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name required';
    if (!form.email) e.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await registerAPI({ name:form.name, email:form.email, password:form.password });
      localStorage.setItem('user', JSON.stringify(data));
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const fields = [
    { key:'name', label:'Full Name', type:'text', ph:'John Doe' },
    { key:'email', label:'Email', type:'email', ph:'you@example.com' },
    { key:'password', label:'Password', type:'password', ph:'••••••••' },
    { key:'confirmPassword', label:'Confirm Password', type:'password', ph:'••••••••' },
  ];

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0f172a',padding:20}}>
      <div style={{width:'100%',maxWidth:420}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{width:56,height:56,background:'#3b82f6',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:22,fontWeight:800,color:'white',boxShadow:'0 8px 24px rgba(59,130,246,0.4)'}}>SD</div>
          <h1 style={{color:'white',fontSize:26,fontWeight:800}}>Create Account</h1>
          <p style={{color:'#64748b',marginTop:6,fontSize:14}}>Join the service dashboard</p>
        </div>
        <div style={{background:'#1e293b',borderRadius:20,border:'1px solid #334155',padding:32,boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
            {fields.map(({ key, label, type, ph }) => (
              <div key={key}>
                <label style={lbl}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} placeholder={ph} style={{...inp,borderColor:errors[key]?'#ef4444':'#334155'}} />
                {errors[key] && <p style={{color:'#ef4444',fontSize:12,marginTop:4}}>{errors[key]}</p>}
              </div>
            ))}
            <button type="submit" disabled={loading} style={{padding:'12px',background:'#3b82f6',color:'white',border:'none',borderRadius:10,fontSize:15,fontWeight:700,cursor:'pointer',marginTop:4}}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <p style={{textAlign:'center',marginTop:20,color:'#64748b',fontSize:14}}>
            Have account? <Link to="/login" style={{color:'#3b82f6',textDecoration:'none',fontWeight:600}}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
