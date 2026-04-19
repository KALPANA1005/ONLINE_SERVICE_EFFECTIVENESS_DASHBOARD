import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { getUserDashboardAPI } from '../services/api';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

const card = { background:'#1e293b', borderRadius:16, padding:24, border:'1px solid #334155', display:'flex', alignItems:'center', gap:16 };
const iconBox = { width:48, height:48, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 };

const UserDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    getUserDashboardAPI()
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const barData = {
    labels: data?.monthlyFeedback?.map(m => m.month) || ['Jan','Feb','Mar','Apr','May','Jun'],
    datasets: [{ label:'Feedbacks', data: data?.monthlyFeedback?.map(m => m.count) || [0,0,0,0,0,0], backgroundColor:'rgba(59,130,246,0.8)', borderRadius:6 }]
  };
  const pieData = {
    labels: ['Positive','Neutral','Negative'],
    datasets: [{ data:[data?.sentimentData?.positive||0, data?.sentimentData?.neutral||0, data?.sentimentData?.negative||0], backgroundColor:['#22c55e','#f59e0b','#ef4444'], borderWidth:0 }]
  };
  const lineData = {
    labels: data?.monthlyFeedback?.map(m => m.month) || [],
    datasets: [{ label:'Trend', data: data?.monthlyFeedback?.map(m => m.count) || [], borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,0.1)', fill:true, tension:0.4 }]
  };
  const chartOpts = { responsive:true, plugins:{ legend:{ display:false } }, scales:{ x:{ ticks:{color:'#94a3b8'}, grid:{color:'#334155'} }, y:{ ticks:{color:'#94a3b8'}, grid:{color:'#334155'} } } };

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:'#0f172a'}}>
      <Sidebar role="user" />
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <Navbar title="My Dashboard" />
        <main style={{flex:1,overflowY:'auto',padding:24,display:'flex',flexDirection:'column',gap:20}}>

          {/* Welcome Banner */}
          <div style={{background:'linear-gradient(135deg,#3b82f6,#1d4ed8)',borderRadius:16,padding:'24px 28px',color:'white'}}>
            <h2 style={{fontSize:22,fontWeight:800}}>Welcome back, {user.name}! 👋</h2>
            <p style={{color:'#bfdbfe',marginTop:6,fontSize:14}}>Here's your activity overview</p>
          </div>

          {/* Stat Cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16}}>
            <div style={card}>
              <div style={{...iconBox,background:'rgba(59,130,246,0.15)'}}>🛠️</div>
              <div>
                <p style={{color:'#64748b',fontSize:13}}>Total Services</p>
                <p style={{color:'white',fontSize:28,fontWeight:800}}>{data?.totalServices || 0}</p>
              </div>
            </div>
            <div style={card}>
              <div style={{...iconBox,background:'rgba(34,197,94,0.15)'}}>💬</div>
              <div>
                <p style={{color:'#64748b',fontSize:13}}>Feedback Submitted</p>
                <p style={{color:'white',fontSize:28,fontWeight:800}}>{data?.feedbackSubmitted || 0}</p>
              </div>
            </div>
            <div style={card}>
              <div style={{...iconBox,background:'rgba(245,158,11,0.15)'}}>⭐</div>
              <div>
                <p style={{color:'#64748b',fontSize:13}}>Avg Rating</p>
                <p style={{color:'white',fontSize:28,fontWeight:800}}>{data?.avgRating || 0}</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}>
            <div style={{background:'#1e293b',borderRadius:16,padding:24,border:'1px solid #334155'}}>
              <h3 style={{color:'white',fontWeight:700,marginBottom:16}}>Monthly Feedback</h3>
              <Bar data={barData} options={chartOpts} />
            </div>
            <div style={{background:'#1e293b',borderRadius:16,padding:24,border:'1px solid #334155'}}>
              <h3 style={{color:'white',fontWeight:700,marginBottom:16}}>Sentiment</h3>
              <Pie data={pieData} options={{responsive:true, plugins:{legend:{labels:{color:'#94a3b8'}}}}} />
            </div>
          </div>

          <div style={{background:'#1e293b',borderRadius:16,padding:24,border:'1px solid #334155'}}>
            <h3 style={{color:'white',fontWeight:700,marginBottom:16}}>Activity Trend</h3>
            <Line data={lineData} options={chartOpts} />
          </div>

          {/* Recent Feedback */}
          <div style={{background:'#1e293b',borderRadius:16,padding:24,border:'1px solid #334155'}}>
            <h3 style={{color:'white',fontWeight:700,marginBottom:16}}>Recent Feedback</h3>
            {!data?.recentFeedbacks?.length ? (
              <p style={{color:'#64748b',fontSize:14}}>No feedback submitted yet. <a href="/feedback" style={{color:'#3b82f6'}}>Submit one →</a></p>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {data.recentFeedbacks.map(fb => (
                  <div key={fb._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',background:'#0f172a',borderRadius:10,border:'1px solid #334155'}}>
                    <div>
                      <p style={{color:'white',fontSize:14,fontWeight:600}}>{fb.service?.name || 'Unknown'}</p>
                      <p style={{color:'#64748b',fontSize:12,marginTop:2}}>{fb.comment || 'No comment'}</p>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <span style={{color:'#fbbf24'}}>{'⭐'.repeat(fb.rating)}</span>
                      <span style={{padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:600,background:fb.status==='resolved'?'#14532d':fb.status==='reviewed'?'#1e3a5f':'#422006',color:fb.status==='resolved'?'#4ade80':fb.status==='reviewed'?'#60a5fa':'#fbbf24'}}>{fb.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
