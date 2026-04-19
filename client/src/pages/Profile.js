import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { updateProfileAPI } from '../services/api';
import toast from 'react-hot-toast';

const inp = { width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #334155', background:'#0f172a', color:'#f1f5f9', fontSize:14, outline:'none' };
const lbl = { display:'block', fontSize:13, fontWeight:500, color:'#94a3b8', marginBottom:8 };

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [form, setForm] = useState({ name:user.name||'', email:user.email||'', password:'', confirmPassword:'' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name required';
    if (!form.email) e.email = 'Email required';
    if (form.password && form.password.length < 6) e.password = 'Min 6 characters';
    if (form.password && form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { name:form.name, email:form.email };
      if (form.password) payload.password = form.password;
      const { data } = await updateProfileAPI(payload);
      localStorage.setItem('user', JSON.stringify({ ...user, ...data }));
      toast.success('Profile updated!');
      setForm(p => ({ ...p, password:'', confirmPassword:'' }));
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  const fields = [
    { key:'name', label:'Full Name', type:'text' },
    { key:'email', label:'Email Address', type:'email' },
    { key:'password', label:'New Password (optional)', type:'password', ph:'Leave blank to keep current' },
    { key:'confirmPassword', label:'Confirm Password', type:'password', ph:'••••••••' },
  ];

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:'#0f172a'}}>
      <Sidebar role={user.role} />
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <Navbar title="My Profile" />
        <main style={{flex:1,overflowY:'auto',padding:24}}>
          <div style={{maxWidth:560,margin:'0 auto',display:'flex',flexDirection:'column',gap:20}}>

            {/* Avatar Card */}
            <div style={{background:'#1e293b',borderRadius:16,padding:24,border:'1px solid #334155',display:'flex',alignItems:'center',gap:20}}>
              <div style={{width:64,height:64,background:'#3b82f6',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:800,color:'white',flexShrink:0,boxShadow:'0 8px 24px rgba(59,130,246,0.4)'}}>
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h2 style={{color:'white',fontSize:20,fontWeight:800}}>{user.name}</h2>
                <p style={{color:'#64748b',fontSize:14,marginTop:4}}>{user.email}</p>
                <span style={{display:'inline-block',marginTop:8,padding:'3px 12px',borderRadius:20,fontSize:12,fontWeight:600,background:user.role==='admin'?'#4c1d95':'#1e3a5f',color:user.role==='admin'?'#c4b5fd':'#60a5fa'}}>{user.role}</span>
              </div>
            </div>

            {/* Edit Form */}
            <div style={{background:'#1e293b',borderRadius:16,padding:28,border:'1px solid #334155'}}>
              <h3 style={{color:'white',fontWeight:700,fontSize:18,marginBottom:24}}>Edit Profile</h3>
              <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:18}}>
                {fields.map(({ key, label, type, ph }) => (
                  <div key={key}>
                    <label style={lbl}>{label}</label>
                    <input type={type} value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})}
                      placeholder={ph} style={{...inp,borderColor:errors[key]?'#ef4444':'#334155'}} />
                    {errors[key] && <p style={{color:'#ef4444',fontSize:12,marginTop:4}}>{errors[key]}</p>}
                  </div>
                ))}
                <button type="submit" disabled={loading}
                  style={{padding:'13px',background:'#3b82f6',color:'white',border:'none',borderRadius:10,fontSize:15,fontWeight:700,cursor:'pointer',marginTop:4}}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
