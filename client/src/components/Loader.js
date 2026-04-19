import React from 'react';
const Loader = () => (
  <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#0f172a'}}>
    <div style={{width:48,height:48,border:'4px solid #1e293b',borderTop:'4px solid #3b82f6',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}></div>
    <p style={{marginTop:16,color:'#94a3b8',fontSize:14}}>Loading...</p>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);
export default Loader;
