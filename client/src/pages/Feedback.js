import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { submitFeedbackAPI, getUserFeedbacksAPI, getUserServicesAPI } from '../services/api';
import toast from 'react-hot-toast';

const inp = { width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #334155', background:'#0f172a', color:'#f1f5f9', fontSize:14, outline:'none' };
const lbl = { display:'block', fontSize:13, fontWeight:500, color:'#94a3b8', marginBottom:8 };

const StarRating = ({ value, onChange }) => (
  <div style={{display:'flex',gap:8}}>
    {[1,2,3,4,5].map(star => (
      <button key={star} type="button" onClick={() => onChange(star)}
        style={{background:'none',border:'none',cursor:'pointer',fontSize:36,color:star<=value?'#fbbf24':'#334155',transition:'transform 0.1s',lineHeight:1}}
        onMouseEnter={e => e.currentTarget.style.transform='scale(1.2)'}
        onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>★</button>
    ))}
  </div>
);

const Feedback = () => {
  const [services, setServices] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [form, setForm] = useState({ serviceId:'', rating:0, comment:'' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [errors, setErrors] = useState({});

  const loadData = useCallback(async () => {
    setFetching(true);
    try {
      const [svcRes, fbRes] = await Promise.all([
        getUserServicesAPI(),  // ← user route, no 403!
        getUserFeedbacksAPI(page)
      ]);
      setServices(svcRes.data);
      setFeedbacks(fbRes.data.feedbacks);
      setPagination(fbRes.data);
    } catch (err) {
      toast.error('Failed to load data');
      console.error(err);
    } finally {
      setFetching(false);
    }
  }, [page]);

  useEffect(() => { loadData(); }, [loadData]);

  const validate = () => {
    const e = {};
    if (!form.serviceId) e.serviceId = 'Please select a service';
    if (!form.rating) e.rating = 'Please give a rating';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await submitFeedbackAPI(form);
      toast.success('Feedback submitted! 🎉');
      setForm({ serviceId:'', rating:0, comment:'' });
      setPage(1);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const getPrediction = (r) => {
    if (r >= 4) return { label:'AI Prediction: Positive 🎉', color:'#4ade80' };
    if (r === 3) return { label:'AI Prediction: Neutral 😐', color:'#fbbf24' };
    return { label:'AI Prediction: Negative 😞', color:'#f87171' };
  };

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:'#0f172a'}}>
      <Sidebar role="user" />
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <Navbar title="Submit Feedback" />
        <main style={{flex:1,overflowY:'auto',padding:24,display:'flex',flexDirection:'column',gap:20}}>

          {/* Submit Form */}
          <div style={{background:'#1e293b',borderRadius:16,padding:28,border:'1px solid #334155',maxWidth:640}}>
            <h3 style={{color:'white',fontWeight:700,fontSize:18,marginBottom:24}}>Submit Feedback</h3>
            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:20}}>

              <div>
                <label style={lbl}>Select Service</label>
                <select value={form.serviceId} onChange={e => setForm({...form,serviceId:e.target.value})}
                  style={{...inp,borderColor:errors.serviceId?'#ef4444':'#334155'}}>
                  <option value="">-- Select a service --</option>
                  {services.map(svc => (
                    <option key={svc._id} value={svc._id}>{svc.name} ({svc.category})</option>
                  ))}
                </select>
                {fetching && <p style={{color:'#64748b',fontSize:12,marginTop:4}}>⏳ Loading services...</p>}
                {!fetching && services.length === 0 && <p style={{color:'#f87171',fontSize:12,marginTop:4}}>No services available</p>}
                {errors.serviceId && <p style={{color:'#ef4444',fontSize:12,marginTop:4}}>{errors.serviceId}</p>}
              </div>

              <div>
                <label style={lbl}>Rating</label>
                <StarRating value={form.rating} onChange={r => setForm({...form,rating:r})} />
                {errors.rating && <p style={{color:'#ef4444',fontSize:12,marginTop:4}}>{errors.rating}</p>}
                {form.rating > 0 && (
                  <p style={{color:getPrediction(form.rating).color,fontSize:13,marginTop:8,fontWeight:600}}>
                    {getPrediction(form.rating).label}
                  </p>
                )}
              </div>

              <div>
                <label style={lbl}>Comment (optional)</label>
                <textarea value={form.comment} onChange={e => setForm({...form,comment:e.target.value})}
                  placeholder="Share your experience..." rows={3}
                  style={{...inp,resize:'none'}} />
              </div>

              <button type="submit" disabled={loading || fetching}
                style={{padding:'13px',background:loading?'#1d4ed8':'#3b82f6',color:'white',border:'none',borderRadius:10,fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 12px rgba(59,130,246,0.3)'}}>
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>

          {/* History */}
          <div style={{background:'#1e293b',borderRadius:16,padding:24,border:'1px solid #334155'}}>
            <h3 style={{color:'white',fontWeight:700,fontSize:18,marginBottom:16}}>My Feedback History</h3>
            {fetching ? (
              <p style={{color:'#64748b',fontSize:14}}>Loading...</p>
            ) : feedbacks.length === 0 ? (
              <p style={{color:'#64748b',fontSize:14}}>No feedback submitted yet.</p>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {feedbacks.map(fb => (
                  <div key={fb._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',background:'#0f172a',borderRadius:12,border:'1px solid #334155'}}>
                    <div>
                      <p style={{color:'white',fontWeight:600,fontSize:14}}>{fb.service?.name || 'Unknown'}</p>
                      <p style={{color:'#64748b',fontSize:12,marginTop:2}}>{fb.comment || 'No comment'}</p>
                      <p style={{color:'#475569',fontSize:11,marginTop:4}}>{new Date(fb.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
                      <span style={{color:'#fbbf24',fontSize:18}}>{'⭐'.repeat(fb.rating)}</span>
                      <span style={{padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:600,
                        background:fb.status==='resolved'?'#14532d':fb.status==='reviewed'?'#1e3a5f':'#422006',
                        color:fb.status==='resolved'?'#4ade80':fb.status==='reviewed'?'#60a5fa':'#fbbf24'}}>
                        {fb.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {pagination.pages > 1 && (
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:16,paddingTop:16,borderTop:'1px solid #334155'}}>
                <p style={{color:'#64748b',fontSize:13}}>Page {pagination.page} of {pagination.pages}</p>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                    style={{padding:'6px 14px',borderRadius:8,border:'1px solid #334155',background:'#0f172a',color:'#94a3b8',cursor:'pointer',fontSize:13}}>Prev</button>
                  <button onClick={() => setPage(p => Math.min(pagination.pages,p+1))} disabled={page===pagination.pages}
                    style={{padding:'6px 14px',borderRadius:8,border:'1px solid #334155',background:'#0f172a',color:'#94a3b8',cursor:'pointer',fontSize:13}}>Next</button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Feedback;
