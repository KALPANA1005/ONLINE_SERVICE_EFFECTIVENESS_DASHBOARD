import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ role = 'user' }) => {
  const location = useLocation();
  const userLinks = [
    { to:'/dashboard', label:'Dashboard', icon:'📊' },
    { to:'/feedback', label:'Submit Feedback', icon:'💬' },
    { to:'/profile', label:'My Profile', icon:'👤' },
  ];
  const adminLinks = [
    { to:'/admin', label:'Dashboard', icon:'📊' },
    { to:'/profile', label:'My Profile', icon:'👤' },
  ];
  const links = role === 'admin' ? adminLinks : userLinks;

  return (
    <aside style={{width:220,minHeight:'100vh',background:'#1e293b',borderRight:'1px solid #334155',display:'flex',flexDirection:'column',padding:'20px 12px'}}>
      <nav style={{display:'flex',flexDirection:'column',gap:4}}>
        {links.map(link => {
          const active = location.pathname === link.to;
          return (
            <Link key={link.to} to={link.to} style={{
              display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
              borderRadius:10, textDecoration:'none', fontSize:14, fontWeight:500,
              background: active ? '#3b82f6' : 'transparent',
              color: active ? 'white' : '#94a3b8',
              transition:'all 0.2s'
            }}>
              <span style={{fontSize:18}}>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div style={{marginTop:'auto',padding:'16px 4px',borderTop:'1px solid #334155'}}>
        <p style={{color:'#475569',fontSize:12}}>Service Dashboard v1.0</p>
        <p style={{color:'#475569',fontSize:12,marginTop:4}}>© 2024 All rights reserved</p>
      </div>
    </aside>
  );
};

export default Sidebar;
