import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { getAdminDashboardAPI, getAllUsersAPI, createUserAPI, updateUserAPI, deleteUserAPI, getAllServicesAPI, createServiceAPI, updateServiceAPI, deleteServiceAPI, getAllFeedbacksAPI, updateFeedbackStatusAPI, exportCSVAPI } from '../services/api';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend);

const card = { background:'#1e293b', borderRadius:16, padding:20, border:'1px solid #334155', display:'flex', alignItems:'center', gap:14 };
const iconBox = { width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 };
const inp = { width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #334155', background:'#0f172a', color:'#f1f5f9', fontSize:13, outline:'none' };
const tabBtn = (active) => ({ padding:'8px 18px', borderRadius:10, border:'none', background:active?'#3b82f6':'transparent', color:active?'white':'#64748b', fontSize:13, fontWeight:600, cursor:'pointer' });
const actionBtn = (color) => ({ padding:'4px 10px', borderRadius:6, border:'none', background:color==='blue'?'rgba(59,130,246,0.15)':'rgba(239,68,68,0.15)', color:color==='blue'?'#60a5fa':'#f87171', fontSize:12, cursor:'pointer', fontWeight:500 });

const AdminDashboard = () => {
  const [tab, setTab] = useState('overview');
  const [dashData, setDashData] = useState(null);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [userForm, setUserForm] = useState({ name:'', email:'', password:'', role:'user' });
  const [serviceForm, setServiceForm] = useState({ name:'', description:'', category:'General', status:'active' });
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 5;

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [d, u, s, f] = await Promise.all([getAdminDashboardAPI(), getAllUsersAPI(), getAllServicesAPI(), getAllFeedbacksAPI()]);
      setDashData(d.data); setUsers(u.data); setServices(s.data); setFeedbacks(f.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleExport = async () => {
    try {
      const res = await exportCSVAPI();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'report.csv'; a.click();
      toast.success('CSV exported!');
    } catch { toast.error('Export failed'); }
  };

  const openUserModal = (u = null) => {
    setEditingUser(u);
    setUserForm(u ? { name:u.name, email:u.email, password:'', role:u.role } : { name:'', email:'', password:'', role:'user' });
    setShowUserModal(true);
  };
  const saveUser = async () => {
    try {
      if (editingUser) { const r = await updateUserAPI(editingUser._id, userForm); setUsers(users.map(u => u._id===editingUser._id ? r.data : u)); toast.success('Updated'); }
      else { const r = await createUserAPI(userForm); setUsers([r.data, ...users]); toast.success('Created'); }
      setShowUserModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };
  const delUser = async (id) => {
    if (!window.confirm('Delete user?')) return;
    try { await deleteUserAPI(id); setUsers(users.filter(u => u._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const openServiceModal = (s = null) => {
    setEditingService(s);
    setServiceForm(s ? { name:s.name, description:s.description||'', category:s.category, status:s.status } : { name:'', description:'', category:'General', status:'active' });
    setShowServiceModal(true);
  };
  const saveService = async () => {
    try {
      if (editingService) { const r = await updateServiceAPI(editingService._id, serviceForm); setServices(services.map(s => s._id===editingService._id ? r.data : s)); toast.success('Updated'); }
      else { const r = await createServiceAPI(serviceForm); setServices([r.data, ...services]); toast.success('Created'); }
      setShowServiceModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };
  const delService = async (id) => {
    if (!window.confirm('Delete service?')) return;
    try { await deleteServiceAPI(id); setServices(services.filter(s => s._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };
  const updateFb = async (id, status) => {
    try { await updateFeedbackStatusAPI(id, status); setFeedbacks(feedbacks.map(f => f._id===id ? {...f,status} : f)); toast.success('Updated'); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <Loader />;

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  const paginated = filteredUsers.slice((currentPage-1)*PER_PAGE, currentPage*PER_PAGE);
  const totalPages = Math.ceil(filteredUsers.length / PER_PAGE);

  const donutData = {
    labels:['Positive','Neutral','Negative'],
    datasets:[{ data:[dashData?.sentimentData?.positive||0,dashData?.sentimentData?.neutral||0,dashData?.sentimentData?.negative||0], backgroundColor:['#22c55e','#f59e0b','#ef4444'], borderWidth:0 }]
  };

  const modalStyle = { position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20 };
  const modalBox = { background:'#1e293b',borderRadius:20,padding:32,width:'100%',maxWidth:440,border:'1px solid #334155',boxShadow:'0 30px 60px rgba(0,0,0,0.8)' };

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:'#0f172a'}}>
      <Sidebar role="admin" />
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <Navbar title="Admin Dashboard" />
        <main style={{flex:1,overflowY:'auto',padding:24,display:'flex',flexDirection:'column',gap:20}}>

          {/* Tabs */}
          <div style={{display:'flex',gap:4,background:'#1e293b',padding:6,borderRadius:14,width:'fit-content',border:'1px solid #334155'}}>
            {['overview','users','services','feedback'].map(t => (
              <button key={t} style={tabBtn(tab===t)} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
            ))}
          </div>

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div style={{display:'flex',flexDirection:'column',gap:20}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14}}>
                {[
                  { icon:'👥', label:'Total Users', val:dashData?.stats?.totalUsers||0, bg:'rgba(59,130,246,0.15)' },
                  { icon:'✅', label:'Active Users', val:dashData?.stats?.activeUsers||0, bg:'rgba(34,197,94,0.15)' },
                  { icon:'🛠️', label:'Total Services', val:dashData?.stats?.totalServices||0, bg:'rgba(168,85,247,0.15)' },
                  { icon:'💬', label:'Total Feedback', val:dashData?.stats?.totalFeedback||0, bg:'rgba(245,158,11,0.15)' },
                ].map(s => (
                  <div key={s.label} style={card}>
                    <div style={{...iconBox,background:s.bg}}>{s.icon}</div>
                    <div>
                      <p style={{color:'#64748b',fontSize:12}}>{s.label}</p>
                      <p style={{color:'white',fontSize:26,fontWeight:800}}>{s.val}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <div style={{background:'#1e293b',borderRadius:16,padding:24,border:'1px solid #334155'}}>
                  <h3 style={{color:'white',fontWeight:700,marginBottom:16}}>Sentiment Analysis</h3>
                  <Doughnut data={donutData} options={{plugins:{legend:{labels:{color:'#94a3b8'}}}}} />
                </div>
                <div style={{background:'#1e293b',borderRadius:16,padding:24,border:'1px solid #334155'}}>
                  <h3 style={{color:'white',fontWeight:700,marginBottom:16}}>Recent Users</h3>
                  {dashData?.recentUsers?.map(u => (
                    <div key={u._id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:34,height:34,background:'#3b82f6',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:13,fontWeight:700}}>{u.name.charAt(0)}</div>
                        <div>
                          <p style={{color:'white',fontSize:13,fontWeight:600}}>{u.name}</p>
                          <p style={{color:'#64748b',fontSize:12}}>{u.email}</p>
                        </div>
                      </div>
                      <span style={{padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:600,background:u.isActive?'#14532d':'#450a0a',color:u.isActive?'#4ade80':'#f87171'}}>{u.isActive?'Active':'Inactive'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{display:'flex',justifyContent:'flex-end'}}>
                <button onClick={handleExport} style={{padding:'10px 20px',background:'#16a34a',color:'white',border:'none',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer'}}>📥 Export CSV</button>
              </div>
            </div>
          )}

          {/* USERS */}
          {tab === 'users' && (
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div style={{display:'flex',gap:12,justifyContent:'space-between'}}>
                <input value={search} onChange={e=>{setSearch(e.target.value);setCurrentPage(1);}} placeholder="Search users..." style={{...inp,maxWidth:300}} />
                <button onClick={()=>openUserModal()} style={{padding:'10px 18px',background:'#3b82f6',color:'white',border:'none',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>+ Add User</button>
              </div>
              <div style={{background:'#1e293b',borderRadius:16,border:'1px solid #334155',overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr style={{background:'#0f172a'}}>
                      {['Name','Email','Role','Status','Actions'].map(h => (
                        <th key={h} style={{padding:'12px 16px',textAlign:'left',color:'#64748b',fontSize:12,fontWeight:600,letterSpacing:'0.05em'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map(u => (
                      <tr key={u._id} style={{borderTop:'1px solid #334155'}}>
                        <td style={{padding:'12px 16px',color:'white',fontSize:14,fontWeight:500}}>{u.name}</td>
                        <td style={{padding:'12px 16px',color:'#94a3b8',fontSize:13}}>{u.email}</td>
                        <td style={{padding:'12px 16px'}}><span style={{padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:600,background:u.role==='admin'?'#4c1d95':'#1e3a5f',color:u.role==='admin'?'#c4b5fd':'#60a5fa'}}>{u.role}</span></td>
                        <td style={{padding:'12px 16px'}}><span style={{padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:600,background:u.isActive?'#14532d':'#450a0a',color:u.isActive?'#4ade80':'#f87171'}}>{u.isActive?'Active':'Inactive'}</span></td>
                        <td style={{padding:'12px 16px'}}>
                          <div style={{display:'flex',gap:6}}>
                            <button style={actionBtn('blue')} onClick={()=>openUserModal(u)}>Edit</button>
                            <button style={actionBtn('red')} onClick={()=>delUser(u._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!paginated.length && <tr><td colSpan={5} style={{padding:'30px',textAlign:'center',color:'#64748b'}}>No users found</td></tr>}
                  </tbody>
                </table>
                {totalPages > 1 && (
                  <div style={{padding:'12px 16px',borderTop:'1px solid #334155',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <p style={{color:'#64748b',fontSize:13}}>Page {currentPage} of {totalPages}</p>
                    <div style={{display:'flex',gap:8}}>
                      <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} style={{padding:'6px 14px',borderRadius:8,border:'1px solid #334155',background:'#0f172a',color:'#94a3b8',cursor:'pointer',fontSize:13}}>Prev</button>
                      <button onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages} style={{padding:'6px 14px',borderRadius:8,border:'1px solid #334155',background:'#0f172a',color:'#94a3b8',cursor:'pointer',fontSize:13}}>Next</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SERVICES */}
          {tab === 'services' && (
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div style={{display:'flex',justifyContent:'flex-end'}}>
                <button onClick={()=>openServiceModal()} style={{padding:'10px 18px',background:'#3b82f6',color:'white',border:'none',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer'}}>+ Add Service</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
                {services.map(svc => (
                  <div key={svc._id} style={{background:'#1e293b',borderRadius:16,padding:20,border:'1px solid #334155'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                      <div>
                        <h4 style={{color:'white',fontWeight:700,fontSize:15}}>{svc.name}</h4>
                        <p style={{color:'#64748b',fontSize:12,marginTop:2}}>{svc.category}</p>
                      </div>
                      <span style={{padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600,background:svc.status==='active'?'#14532d':svc.status==='maintenance'?'#422006':'#450a0a',color:svc.status==='active'?'#4ade80':svc.status==='maintenance'?'#fbbf24':'#f87171'}}>{svc.status}</span>
                    </div>
                    <p style={{color:'#64748b',fontSize:13,marginBottom:14,minHeight:36}}>{svc.description||'No description'}</p>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{color:'#475569',fontSize:12}}>Requests: {svc.totalRequests}</span>
                      <div style={{display:'flex',gap:6}}>
                        <button style={actionBtn('blue')} onClick={()=>openServiceModal(svc)}>Edit</button>
                        <button style={actionBtn('red')} onClick={()=>delService(svc._id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
                {!services.length && <p style={{color:'#64748b',fontSize:14,padding:20}}>No services. Add one!</p>}
              </div>
            </div>
          )}

          {/* FEEDBACK */}
          {tab === 'feedback' && (
            <div style={{background:'#1e293b',borderRadius:16,border:'1px solid #334155',overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'#0f172a'}}>
                    {['User','Service','Rating','Sentiment','Status','Action'].map(h => (
                      <th key={h} style={{padding:'12px 16px',textAlign:'left',color:'#64748b',fontSize:12,fontWeight:600}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map(fb => (
                    <tr key={fb._id} style={{borderTop:'1px solid #334155'}}>
                      <td style={{padding:'12px 16px',color:'white',fontSize:13}}>{fb.user?.name||'N/A'}</td>
                      <td style={{padding:'12px 16px',color:'#94a3b8',fontSize:13}}>{fb.service?.name||'N/A'}</td>
                      <td style={{padding:'12px 16px',color:'#fbbf24'}}>{'⭐'.repeat(fb.rating)}</td>
                      <td style={{padding:'12px 16px'}}><span style={{padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:600,background:fb.sentiment==='positive'?'#14532d':fb.sentiment==='negative'?'#450a0a':'#422006',color:fb.sentiment==='positive'?'#4ade80':fb.sentiment==='negative'?'#f87171':'#fbbf24'}}>{fb.sentiment}</span></td>
                      <td style={{padding:'12px 16px'}}><span style={{padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:600,background:fb.status==='resolved'?'#14532d':fb.status==='reviewed'?'#1e3a5f':'#422006',color:fb.status==='resolved'?'#4ade80':fb.status==='reviewed'?'#60a5fa':'#fbbf24'}}>{fb.status}</span></td>
                      <td style={{padding:'12px 16px'}}>
                        <select value={fb.status} onChange={e=>updateFb(fb._id,e.target.value)}
                          style={{padding:'5px 8px',borderRadius:8,border:'1px solid #334155',background:'#0f172a',color:'#e2e8f0',fontSize:12,outline:'none',cursor:'pointer'}}>
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {!feedbacks.length && <tr><td colSpan={6} style={{padding:'30px',textAlign:'center',color:'#64748b'}}>No feedback yet</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* USER MODAL */}
      {showUserModal && (
        <div style={modalStyle} onClick={e => e.target===e.currentTarget && setShowUserModal(false)}>
          <div style={modalBox}>
            <h3 style={{color:'white',fontWeight:800,fontSize:18,marginBottom:24}}>{editingUser?'Edit User':'Add User'}</h3>
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {[['name','Name','text'],['email','Email','email'],['password','Password','password']].map(([k,l,t]) => (
                <div key={k}>
                  <label style={{display:'block',fontSize:13,color:'#94a3b8',marginBottom:6}}>{l}{k==='password'&&editingUser?' (blank = keep)':''}</label>
                  <input type={t} value={userForm[k]} onChange={e=>setUserForm({...userForm,[k]:e.target.value})} style={inp} />
                </div>
              ))}
              <div>
                <label style={{display:'block',fontSize:13,color:'#94a3b8',marginBottom:6}}>Role</label>
                <select value={userForm.role} onChange={e=>setUserForm({...userForm,role:e.target.value})} style={inp}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:24}}>
              <button onClick={()=>setShowUserModal(false)} style={{flex:1,padding:'11px',borderRadius:10,border:'1px solid #334155',background:'transparent',color:'#94a3b8',cursor:'pointer',fontSize:14}}>Cancel</button>
              <button onClick={saveUser} style={{flex:1,padding:'11px',borderRadius:10,border:'none',background:'#3b82f6',color:'white',cursor:'pointer',fontSize:14,fontWeight:700}}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* SERVICE MODAL */}
      {showServiceModal && (
        <div style={modalStyle} onClick={e => e.target===e.currentTarget && setShowServiceModal(false)}>
          <div style={modalBox}>
            <h3 style={{color:'white',fontWeight:800,fontSize:18,marginBottom:24}}>{editingService?'Edit Service':'Add Service'}</h3>
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {[['name','Service Name','text'],['description','Description','text'],['category','Category','text']].map(([k,l,t]) => (
                <div key={k}>
                  <label style={{display:'block',fontSize:13,color:'#94a3b8',marginBottom:6}}>{l}</label>
                  <input type={t} value={serviceForm[k]} onChange={e=>setServiceForm({...serviceForm,[k]:e.target.value})} style={inp} />
                </div>
              ))}
              <div>
                <label style={{display:'block',fontSize:13,color:'#94a3b8',marginBottom:6}}>Status</label>
                <select value={serviceForm.status} onChange={e=>setServiceForm({...serviceForm,status:e.target.value})} style={inp}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:24}}>
              <button onClick={()=>setShowServiceModal(false)} style={{flex:1,padding:'11px',borderRadius:10,border:'1px solid #334155',background:'transparent',color:'#94a3b8',cursor:'pointer',fontSize:14}}>Cancel</button>
              <button onClick={saveService} style={{flex:1,padding:'11px',borderRadius:10,border:'none',background:'#3b82f6',color:'white',cursor:'pointer',fontSize:14,fontWeight:700}}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
