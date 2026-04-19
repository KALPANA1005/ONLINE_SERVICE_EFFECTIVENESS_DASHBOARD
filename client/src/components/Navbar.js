import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const S = {
  nav: { background:'#1e293b', borderBottom:'1px solid #334155', padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 },
  logo: { width:36, height:36, background:'#3b82f6', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:14, marginRight:10 },
  title: { color:'white', fontWeight:700, fontSize:18 },
  right: { display:'flex', alignItems:'center', gap:12 },
  iconBtn: { background:'#334155', border:'none', borderRadius:8, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:16, position:'relative' },
  badge: { position:'absolute', top:4, right:4, width:8, height:8, background:'#ef4444', borderRadius:'50%' },
  userBtn: { display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', padding:'6px 10px', borderRadius:8 },
  avatar: { width:32, height:32, background:'#3b82f6', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:13 },
  userName: { color:'#cbd5e1', fontSize:14, fontWeight:500 },
  logoutBtn: { background:'#7f1d1d', color:'#fca5a5', border:'none', borderRadius:8, padding:'6px 14px', fontSize:13, fontWeight:600, cursor:'pointer' },
  notifBox: { position:'absolute', right:0, top:44, width:280, background:'#1e293b', border:'1px solid #334155', borderRadius:12, boxShadow:'0 20px 40px rgba(0,0,0,0.5)', overflow:'hidden', zIndex:200 },
  notifItem: { padding:'12px 16px', borderBottom:'1px solid #334155', cursor:'pointer' },
  notifMsg: { color:'#e2e8f0', fontSize:13 },
  notifTime: { color:'#64748b', fontSize:11, marginTop:4 },
};

const notifs = [
  { id:1, message:'Your feedback has been reviewed', time:'2 hours ago', unread:true },
  { id:2, message:'New service available: Tax Filing', time:'1 day ago', unread:true },
  { id:3, message:'System maintenance on Sunday', time:'2 days ago', unread:false },
];

const Navbar = ({ title = 'Dashboard' }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out!');
    navigate('/login');
  };

  return (
    <nav style={S.nav}>
      <div style={{display:'flex',alignItems:'center'}}>
        <div style={S.logo}>SD</div>
        <span style={S.title}>{title}</span>
      </div>
      <div style={S.right}>
        <div style={{position:'relative'}}>
          <button style={S.iconBtn} onClick={() => setNotifOpen(!notifOpen)}>
            🔔<span style={S.badge}></span>
          </button>
          {notifOpen && (
            <div style={S.notifBox}>
              <div style={{padding:'12px 16px',borderBottom:'1px solid #334155',fontWeight:600,color:'white',fontSize:14}}>Notifications</div>
              {notifs.map(n => (
                <div key={n.id} style={{...S.notifItem, background: n.unread ? '#0f172a' : 'transparent'}}>
                  <p style={S.notifMsg}>{n.message}</p>
                  <p style={S.notifTime}>{n.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <Link to="/profile" style={{textDecoration:'none'}}>
          <button style={S.userBtn}>
            <div style={S.avatar}>{user.name?.charAt(0)?.toUpperCase() || 'U'}</div>
            <span style={S.userName}>{user.name}</span>
          </button>
        </Link>
        <button style={S.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
