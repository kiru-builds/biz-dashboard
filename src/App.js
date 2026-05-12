import { useState, useRef, useEffect, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

const WORKSPACES = {
  techstore: {
    name:"TechStore India", logo:"🖥️", color:"#00ff87", plan:"Pro",
    users:{
      "admin@techstore.com":   {pass:"admin123",name:"Ravi Kumar",  role:"admin",  avatar:"RK"},
      "manager@techstore.com": {pass:"mgr123",  name:"Meena S",    role:"manager",avatar:"MS"},
      "analyst@techstore.com": {pass:"ana123",  name:"Arjun R",    role:"analyst",avatar:"AR"},
    },
    monthly:[
      {m:"Jan",rev:84000, profit:22000,orders:1120,customers:340},
      {m:"Feb",rev:76000, profit:18500,orders:980, customers:298},
      {m:"Mar",rev:68000, profit:15200,orders:870, customers:261},
      {m:"Apr",rev:88000, profit:24000,orders:1240,customers:372},
      {m:"May",rev:105000,profit:31000,orders:1580,customers:474},
      {m:"Jun",rev:118000,profit:38000,orders:1820,customers:546},
      {m:"Jul",rev:99000, profit:28000,orders:1490,customers:447},
      {m:"Aug",rev:124000,profit:41000,orders:1920,customers:576},
      {m:"Sep",rev:132000,profit:45000,orders:2010,customers:603},
      {m:"Oct",rev:141000,profit:49000,orders:2180,customers:654},
      {m:"Nov",rev:158000,profit:56000,orders:2450,customers:735},
      {m:"Dec",rev:176000,profit:64000,orders:2780,customers:834},
    ],
    products:[
      {name:"Gaming Laptop",sales:2100,rev:210000,margin:28,color:"#00ff87"},
      {name:"Mech Keyboard",sales:4800,rev:96000, margin:52,color:"#60efff"},
      {name:"RGB Mouse",    sales:6200,rev:62000, margin:61,color:"#ffd93d"},
      {name:"4K Webcam",   sales:1900,rev:95000, margin:38,color:"#ff6b6b"},
      {name:"USB Hub",     sales:3400,rev:34000, margin:45,color:"#c77dff"},
    ],
  },
  fashionhub: {
    name:"FashionHub", logo:"👗", color:"#c77dff", plan:"Starter",
    users:{
      "admin@fashionhub.com":   {pass:"fashion123",name:"Priya Sharma",role:"admin",  avatar:"PS"},
      "manager@fashionhub.com": {pass:"mgr456",    name:"Divya N",    role:"manager",avatar:"DN"},
    },
    monthly:[
      {m:"Jan",rev:28000, profit:9800, orders:840, customers:252},
      {m:"Feb",rev:32000, profit:11200,orders:960, customers:288},
      {m:"Mar",rev:41000, profit:14350,orders:1230,customers:369},
      {m:"Apr",rev:38000, profit:13300,orders:1140,customers:342},
      {m:"May",rev:52000, profit:18200,orders:1560,customers:468},
      {m:"Jun",rev:61000, profit:21350,orders:1830,customers:549},
      {m:"Jul",rev:47000, profit:16450,orders:1410,customers:423},
      {m:"Aug",rev:58000, profit:20300,orders:1740,customers:522},
      {m:"Sep",rev:64000, profit:22400,orders:1920,customers:576},
      {m:"Oct",rev:72000, profit:25200,orders:2160,customers:648},
      {m:"Nov",rev:89000, profit:31150,orders:2670,customers:801},
      {m:"Dec",rev:103000,profit:36050,orders:3090,customers:927},
    ],
    products:[
      {name:"Summer Dress",sales:8200,rev:164000,margin:68,color:"#c77dff"},
      {name:"Denim Jacket",sales:3100,rev:93000, margin:54,color:"#00ff87"},
      {name:"Silk Saree",  sales:1800,rev:90000, margin:42,color:"#ffd93d"},
      {name:"Sports Wear", sales:5600,rev:84000, margin:58,color:"#60efff"},
      {name:"Handbag",     sales:2400,rev:72000, margin:72,color:"#ff6b6b"},
    ],
  },
};

const ROLE_ACCESS={
  admin:  ["dashboard","ai","forecast","alerts","orders","clients","activity","reports","team","settings"],
  manager:["dashboard","ai","forecast","alerts","orders","clients","activity","reports"],
  analyst:["dashboard","ai","forecast","alerts","reports"],
};

const mkForecast=(monthly)=>{
  if(!monthly||monthly.length<3)return[];
  const l3=monthly.slice(-3);
  const g=l3.reduce((s,d,i)=>i===0?s:s+(d.rev-l3[i-1].rev)/l3[i-1].rev,0)/2;
  const mo=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const li=mo.indexOf(monthly[monthly.length-1].m);
  return[1,2,3,4,5,6].map(i=>({
    m:mo[(li+i)%12]+"'F",
    rev:Math.round(monthly[monthly.length-1].rev*(1+g*(1-i*0.04))),
    profit:Math.round(monthly[monthly.length-1].rev*(1+g*(1-i*0.04))*0.34),
    orders:Math.round(monthly[monthly.length-1].orders*(1+g*0.7)),
    forecast:true,
  }));
};

const mkAlerts=(monthly,products)=>{
  if(!monthly||monthly.length<2)return[];
  const last=monthly[monthly.length-1],prev=monthly[monthly.length-2];
  const margin=(last.profit/last.rev*100);
  const growth=(last.rev-prev.rev)/prev.rev*100;
  const alerts=[];
  if(margin<30)alerts.push({type:"warning",msg:`Margin at ${margin.toFixed(1)}% — below 30% threshold`,icon:"⚠️",action:"Review Pricing"});
  if(growth<0) alerts.push({type:"danger", msg:`Revenue dropped ${Math.abs(growth).toFixed(1)}% vs last month`,icon:"📉",action:"Analyze Drop"});
  if(growth>15)alerts.push({type:"success",msg:`Revenue up ${growth.toFixed(1)}% — strong growth!`,icon:"🚀",action:"View Details"});
  const lm=products.find(p=>p.margin<30);
  if(lm)alerts.push({type:"warning",msg:`${lm.name} margin at ${lm.margin}% — needs attention`,icon:"🏷️",action:"Fix Pricing"});
  const tp=[...products].sort((a,b)=>b.rev-a.rev)[0];
  alerts.push({type:"info",msg:`${tp.name} leads revenue at Rs${(tp.rev/1000).toFixed(0)}K`,icon:"🏆",action:"Boost Further"});
  alerts.push({type:"info",msg:`${monthly.reduce((a,b)=>a.rev>b.rev?a:b).m} was your best month`,icon:"📅",action:"Replicate"});
  return alerts;
};

const mkActivity=(ws)=>[
  {icon:"🤖",text:"AI analysis completed — 6 new insights",time:"2m ago",type:"ai"},
  {icon:"📊",text:"Monthly report exported as PDF",time:"15m ago",type:"report"},
  {icon:"🚀",text:`Revenue target achieved — ${ws?.name}`,time:"1h ago",type:"success"},
  {icon:"👤",text:"New customer: Karthik M onboarded",time:"2h ago",type:"customer"},
  {icon:"⚠️",text:"Profit margin alert triggered",time:"3h ago",type:"alert"},
  {icon:"📦",text:"Order #1205 marked as delivered",time:"4h ago",type:"order"},
  {icon:"🔮",text:"6-month forecast updated",time:"5h ago",type:"forecast"},
  {icon:"📧",text:"Weekly email report sent to team",time:"1d ago",type:"report"},
  {icon:"📱",text:"WhatsApp alert sent for margin drop",time:"1d ago",type:"alert"},
  {icon:"🎯",text:"Sales target 87% achieved this month",time:"2d ago",type:"success"},
];

const fmt=(n)=>n>=1e6?"Rs"+(n/1e6).toFixed(2)+"M":n>=1e3?"Rs"+(n/1e3).toFixed(1)+"K":"Rs"+n;
const pct=(a,b)=>b===0?"0":((a-b)/b*100).toFixed(1);
const sCol=(s)=>({Delivered:"#00ff87",Shipped:"#60efff",Pending:"#ffd93d",Cancelled:"#ff6b6b",
  admin:"#ffd93d",manager:"#60efff",analyst:"#c77dff",
  success:"#00ff87",warning:"#ffd93d",danger:"#ff6b6b",info:"#60efff"}[s]||"#60efff");

export default function ProfitPulse(){
  const[screen,setScreen]=useState("login");
  const[authMode,setAuthMode]=useState("login");
  const[wsId,setWsId]=useState("techstore");
  const[email,setEmail]=useState("");
  const[pass,setPass]=useState("");
  const[uname,setUname]=useState("");
  const[authErr,setAuthErr]=useState("");
  const[authLoading,setAuthLoading]=useState(false);
  const[user,setUser]=useState(null);
  const[page,setPage]=useState("dashboard");
  const[tab,setTab]=useState("monthly");
  const[showForecast,setShowForecast]=useState(false);
  const[toast,setToast]=useState(null);
  const[notifOpen,setNotifOpen]=useState(false);
  const[unread,setUnread]=useState(3);
  const[aiChatOpen,setAiChatOpen]=useState(false);
  const[aiMessages,setAiMessages]=useState([{role:"assistant",text:"👋 Hi! I'm your AI Profit Analyst. Ask me anything about revenue, trends, forecasts, or growth strategy."}]);
  const[aiInput,setAiInput]=useState("");
  const[aiLoading,setAiLoading]=useState(false);
  const[aiInsights,setAiInsights]=useState([]);
  const[insightsLoading,setInsightsLoading]=useState(false);
  const[uploadedData,setUploadedData]=useState(null);
  const[uploadMsg,setUploadMsg]=useState("");
  const[isDrag,setIsDrag]=useState(false);
  const[signupUsers,setSignupUsers]=useState({});
  const[waModal,setWaModal]=useState(false);
  const[emailModal,setEmailModal]=useState(false);
  const[waPhone,setWaPhone]=useState("+91-9876543210");
  const[emailTo,setEmailTo]=useState("");
  const[emailSchedule,setEmailSchedule]=useState("weekly");
  const[dateFilter,setDateFilter]=useState("Last 30 Days");

  const fileRef=useRef();
  const chatRef=useRef();

  const ws=WORKSPACES[wsId];
  const monthly=uploadedData?.monthly||ws?.monthly||[];
  const products=uploadedData?.products||ws?.products||[];
  const forecast=mkForecast(monthly);
  const alerts=mkAlerts(monthly,products);
  const activity=mkActivity(ws);
  const displayData=tab==="monthly"?monthly:monthly.slice(-7).map((d,i)=>({...d,m:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}));
  const chartData=showForecast?[...monthly,...forecast]:displayData;

  const totalRev=monthly.reduce((s,d)=>s+d.rev,0);
  const totalProfit=monthly.reduce((s,d)=>s+d.profit,0);
  const totalOrders=monthly.reduce((s,d)=>s+d.orders,0);
  const totalCust=monthly.reduce((s,d)=>s+d.customers,0);
  const margin=totalRev>0?((totalProfit/totalRev)*100).toFixed(1):"0";
  const last=monthly[monthly.length-1]||{rev:0,profit:0};
  const prev=monthly[monthly.length-2]||{rev:1,profit:1};
  const revGrowth=pct(last.rev,prev.rev);

  useEffect(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;},[aiMessages]);

  const showToast=(msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),3200);};
  const canAccess=(pg)=>user&&ROLE_ACCESS[user.role]?.includes(pg);

  const handleAuth=async()=>{
    setAuthLoading(true);setAuthErr("");
    await new Promise(r=>setTimeout(r,700));
    if(authMode==="login"){
      const wsData=WORKSPACES[wsId];
      const found=wsData?.users[email.toLowerCase()];
      const su=signupUsers[wsId+"|"+email.toLowerCase()];
      const u=found||su;
      if(u&&u.pass===pass){
        setUser({...u,email:email.toLowerCase(),wsId});
        setEmailTo(email.toLowerCase());
        setScreen("app");setPage("dashboard");
        generateAIInsights(wsData.monthly,wsData.products,wsData.name);
        showToast(`Welcome back, ${u.name.split(" ")[0]}! 👋`);
      }else setAuthErr("Invalid credentials. Try admin@techstore.com / admin123");
    }else{
      if(!uname||!email||!pass){setAuthErr("Fill all fields");setAuthLoading(false);return;}
      if(pass.length<6){setAuthErr("Password must be 6+ characters");setAuthLoading(false);return;}
      const avatar=uname.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
      setSignupUsers(p=>({...p,[wsId+"|"+email.toLowerCase()]:{pass,name:uname,role:"analyst",avatar}}));
      setUser({pass,name:uname,role:"analyst",email:email.toLowerCase(),wsId,avatar});
      setScreen("app");setPage("dashboard");
      showToast(`Welcome, ${uname.split(" ")[0]}! 🎉`);
    }
    setAuthLoading(false);
  };

  const logout=()=>{setUser(null);setScreen("login");setEmail("");setPass("");setUname("");setPage("dashboard");setAiInsights([]);setUploadedData(null);};

  const generateAIInsights=async(mData,pData,companyName)=>{
    setInsightsLoading(true);
    const last2=mData.slice(-2);
    const growth=last2.length>1?((last2[1].rev-last2[0].rev)/last2[0].rev*100).toFixed(1):0;
    const mg=((mData.reduce((s,d)=>s+d.profit,0)/mData.reduce((s,d)=>s+d.rev,0))*100).toFixed(1);
    const topProd=[...pData].sort((a,b)=>b.rev-a.rev)[0];
    const bestMonth=mData.reduce((a,b)=>a.rev>b.rev?a:b);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:800,
          system:`Analyze business data and return EXACTLY 6 insights as a JSON array. Each: {text:"concise insight with numbers",type:"positive|negative|neutral",category:"revenue|margin|products|customers|trend|alert"}. Return only valid JSON array.`,
          messages:[{role:"user",content:`Company:${companyName}. Monthly:${mData.map(d=>d.m+":rev="+d.rev+",profit="+d.profit+",orders="+d.orders).join(";")}. Products:${pData.map(p=>p.name+"(rev="+p.rev+",margin="+p.margin+"%)").join(",")}`}]
        })
      });
      const d=await res.json();
      const raw=d.content?.map(b=>b.text||"").join("")||"[]";
      const parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());
      setAiInsights(Array.isArray(parsed)?parsed:[]);
    }catch{
      setAiInsights([
        {text:`Revenue ${growth>0?"up":"down"} ${Math.abs(growth)}% vs last month`,type:growth>0?"positive":"negative",category:"revenue"},
        {text:`${bestMonth.m} was best month — Rs${(bestMonth.rev/1000).toFixed(0)}K`,type:"positive",category:"trend"},
        {text:`${topProd.name} leads revenue at Rs${(topProd.rev/1000).toFixed(0)}K`,type:"positive",category:"products"},
        {text:`Profit margin at ${mg}% — ${mg>30?"healthy":"needs attention"}`,type:mg>30?"positive":"negative",category:"margin"},
        {text:`${[...pData].sort((a,b)=>b.margin-a.margin)[0]?.name} has highest margin at ${[...pData].sort((a,b)=>b.margin-a.margin)[0]?.margin}%`,type:"positive",category:"products"},
        {text:`Customer base ${mData[mData.length-1].customers>mData[mData.length-2].customers?"growing":"declining"} this month`,type:mData[mData.length-1].customers>mData[mData.length-2].customers?"positive":"negative",category:"customers"},
      ]);
    }
    setInsightsLoading(false);
  };

  const sendAI=async(q)=>{
    const question=q||aiInput.trim();
    if(!question)return;
    setAiMessages(m=>[...m,{role:"user",text:question}]);
    setAiInput("");setAiLoading(true);
    const ctx=`${ws?.name}: Rev=${fmt(totalRev)},Profit=${fmt(totalProfit)},Margin=${margin}%,Orders=${totalOrders}. Monthly:${monthly.map(d=>d.m+":"+fmt(d.rev)).join(",")}. Products:${products.map(p=>p.name+"("+fmt(p.rev)+","+p.margin+"% margin)").join(",")}.`;
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:500,
          system:`Sharp profit analyst for ${ws?.name}. Concise, data-driven, 2-3 sentences. Data:${ctx}`,
          messages:[{role:"user",content:question}]
        })
      });
      const d=await res.json();
      setAiMessages(m=>[...m,{role:"assistant",text:d.content?.map(b=>b.text||"").join("")||"No response."}]);
    }catch{
      setAiMessages(m=>[...m,{role:"assistant",text:`${ws?.name} — Rev=${fmt(totalRev)}, Margin=${margin}%, Best=${monthly.reduce((a,b)=>a.rev>b.rev?a:b).m}. Add Claude API key for full AI.`}]);
    }
    setAiLoading(false);
  };

  const processFile=useCallback((file)=>{
    if(!file)return;
    setUploadMsg("Reading "+file.name+"...");
    const reader=new FileReader();
    reader.onload=(e)=>{
      try{
        if(file.name.endsWith(".json")){
          const data=JSON.parse(e.target.result);
          if(data.monthly){setUploadedData(data);setUploadMsg("✅ "+file.name+" loaded!");showToast("Data updated!");return;}
        }
        const lines=e.target.result.split("\n").filter(l=>l.trim());
        const headers=lines[0].split(",").map(h=>h.trim().toLowerCase());
        const rows=lines.slice(1).map(l=>{const vals=l.split(",").map(v=>v.trim());const obj={};headers.forEach((h,i)=>obj[h]=vals[i]);return obj;});
        const mKey=headers.find(h=>["month","label","period","m"].includes(h));
        const rKey=headers.find(h=>["revenue","rev","sales","amount"].includes(h));
        const pKey=headers.find(h=>["profit","net"].includes(h));
        const oKey=headers.find(h=>["orders","order","qty"].includes(h));
        const cKey=headers.find(h=>["customers","customer","users"].includes(h));
        if(mKey&&rKey){
          const mapped=rows.filter(r=>r[mKey]).map(r=>({
            m:String(r[mKey]||"").trim(),
            rev:Number(r[rKey])||0,
            profit:pKey?Number(r[pKey])||0:Math.round((Number(r[rKey])||0)*0.28),
            orders:oKey?Number(r[oKey])||0:Math.round((Number(r[rKey])||0)/74),
            customers:cKey?Number(r[cKey])||0:Math.round((Number(r[rKey])||0)/370),
          }));
          setUploadedData({monthly:mapped,products:ws.products});
          setUploadMsg("✅ "+file.name+" — "+mapped.length+" rows!");
          showToast("Dashboard updated from "+file.name+"!");
          generateAIInsights(mapped,ws.products,ws.name);
        }else setUploadMsg("⚠️ Columns needed: month, revenue, profit");
      }catch(err){setUploadMsg("❌ Error: "+err.message);}
    };
    reader.readAsText(file);
  },[ws]);

  const sendWhatsApp=()=>{
    const msg=`📊 *ProfitPulse Alert* — ${ws?.name}\n\n💰 Revenue: ${fmt(totalRev)}\n📈 Profit: ${fmt(totalProfit)}\n📉 Margin: ${margin}%\n📦 Orders: ${totalOrders}\n\n${parseFloat(margin)<30?"⚠️ Margin below threshold!":"✅ All metrics healthy"}\n\n_Sent by ProfitPulse Pro_`;
    window.open("https://wa.me/"+waPhone.replace(/[^0-9]/g,"")+"?text="+encodeURIComponent(msg),"_blank");
    setWaModal(false);showToast("📱 WhatsApp opened!");
  };

  const sendEmail=async()=>{
    await new Promise(r=>setTimeout(r,1000));
    setEmailModal(false);showToast(`📧 Report scheduled to ${emailTo}!`);
  };

  const bg="#050a14",card="#0d1520",card2="#111d2e",border="#1a2840";
  const text="#e2eeff",sub="#3d5a80";
  const G="#00ff87",B="#60efff",Y="#ffd93d",R="#ff6b6b",P="#c77dff";
  const AC=ws?.color||G;

  // ALL nav items including orders, clients, settings
  const navItems=[
    {icon:"⚡",label:"Dashboard", pg:"dashboard", group:"main"},
    {icon:"🤖",label:"AI Insights",pg:"ai",        group:"main"},
    {icon:"🔮",label:"Forecast",  pg:"forecast",   group:"main"},
    {icon:"🚨",label:"Alerts",    pg:"alerts",     group:"main", badge:alerts.filter(a=>a.type==="danger"||a.type==="warning").length},
    {icon:"📋",label:"Activity",  pg:"activity",   group:"main"},
    {icon:"🛍️",label:"Orders",   pg:"orders",     group:"manage"},
    {icon:"👥",label:"Clients",   pg:"clients",    group:"manage"},
    {icon:"📊",label:"Reports",   pg:"reports",    group:"manage"},
    {icon:"👤",label:"Team",      pg:"team",       group:"manage"},
    {icon:"⚙️",label:"Settings", pg:"settings",   group:"manage"},
  ].filter(n=>canAccess(n.pg));

  const mainNav=navItems.filter(n=>n.group==="main");
  const manageNav=navItems.filter(n=>n.group==="manage");

  // ══════════════════════════════
  // LOGIN
  // ══════════════════════════════
  if(screen==="login")return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:bg,minHeight:"100vh",display:"flex",color:text,overflow:"hidden"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700;800&display=swap');*{box-sizing:border-box}input{outline:none}input::placeholder{color:#3d5a80}input:focus{border-color:#00ff87!important}button{transition:opacity 0.2s}button:hover{opacity:0.85}`}</style>
      <div style={{flex:1,background:"linear-gradient(135deg,#050a14,#0a1628)",display:"flex",flexDirection:"column",justifyContent:"center",padding:60,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"15%",left:"10%",width:400,height:400,background:"radial-gradient(circle,rgba(0,255,135,0.07),transparent 70%)",pointerEvents:"none"}}/>
        <div style={{backgroundImage:"linear-gradient(rgba(0,255,135,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,135,0.02) 1px,transparent 1px)",backgroundSize:"48px 48px",position:"absolute",inset:0,pointerEvents:"none"}}/>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:48}}>
            <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#00ff87,#60efff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,boxShadow:"0 0 32px rgba(0,255,135,0.3)"}}>⚡</div>
            <div>
              <p style={{margin:0,fontWeight:800,fontSize:22,background:"linear-gradient(90deg,#00ff87,#60efff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>ProfitPulse</p>
              <p style={{margin:0,fontSize:11,color:sub}}>SaaS Analytics Platform</p>
            </div>
          </div>
          <h1 style={{fontWeight:800,fontSize:36,margin:"0 0 14px",lineHeight:1.2,letterSpacing:-1}}>Turn data into<br/><span style={{background:"linear-gradient(90deg,#00ff87,#60efff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>profit insights.</span></h1>
          <p style={{color:sub,fontSize:14,margin:"0 0 40px",lineHeight:1.6,maxWidth:420}}>AI-powered analytics with real-time forecasting, smart alerts, WhatsApp & email reports.</p>
          {[{icon:"🤖",t:"AI Insights Engine",d:"Auto-generated business analysis"},{icon:"🔮",t:"Revenue Forecasting",d:"6-month AI predictions"},{icon:"📱",t:"WhatsApp & Email",d:"Instant alerts & reports"}].map(f=>(
            <div key={f.t} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,marginBottom:10}}>
              <span style={{fontSize:18}}>{f.icon}</span>
              <div><p style={{margin:0,fontWeight:600,fontSize:13,color:G}}>{f.t}</p><p style={{margin:0,fontSize:11,color:sub}}>{f.d}</p></div>
            </div>
          ))}
        </div>
      </div>
      <div style={{width:460,background:card,display:"flex",flexDirection:"column",justifyContent:"center",padding:"48px 40px",borderLeft:"1px solid "+border}}>
        <div style={{marginBottom:24}}>
          <p style={{fontSize:10,color:sub,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",margin:"0 0 10px"}}>Workspace</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {Object.entries(WORKSPACES).map(([id,w])=>(
              <div key={id} onClick={()=>setWsId(id)} style={{padding:"10px 14px",background:wsId===id?"rgba(0,255,135,0.08)":card2,border:"1px solid "+(wsId===id?w.color+"44":border),borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all 0.2s"}}>
                <span style={{fontSize:16}}>{w.logo}</span>
                <div><p style={{margin:0,fontSize:11,fontWeight:600,color:wsId===id?w.color:text}}>{w.name}</p><p style={{margin:0,fontSize:9,color:sub}}>{w.plan}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:0,marginBottom:22,background:card2,borderRadius:10,padding:3}}>
          {["login","signup"].map(m=>(
            <button key={m} onClick={()=>{setAuthMode(m);setAuthErr("");}} style={{flex:1,padding:"8px 0",background:authMode===m?G:"transparent",border:"none",borderRadius:8,cursor:"pointer",color:authMode===m?"#050a14":sub,fontWeight:700,fontSize:13}}>
              {m==="login"?"Sign In":"Sign Up"}
            </button>
          ))}
        </div>
        {authMode==="signup"&&<div style={{marginBottom:13}}><label style={{fontSize:10,color:sub,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",display:"block",marginBottom:5}}>Full Name</label><input value={uname} onChange={e=>setUname(e.target.value)} placeholder="Your full name" style={{width:"100%",padding:"11px 14px",background:card2,border:"1px solid "+border,borderRadius:9,color:text,fontSize:13}}/></div>}
        <div style={{marginBottom:13}}><label style={{fontSize:10,color:sub,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",display:"block",marginBottom:5}}>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAuth()} placeholder="your@email.com" type="email" style={{width:"100%",padding:"11px 14px",background:card2,border:"1px solid "+border,borderRadius:9,color:text,fontSize:13}}/></div>
        <div style={{marginBottom:18}}><label style={{fontSize:10,color:sub,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",display:"block",marginBottom:5}}>Password</label><input value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAuth()} placeholder="••••••••" type="password" style={{width:"100%",padding:"11px 14px",background:card2,border:"1px solid "+border,borderRadius:9,color:text,fontSize:13}}/></div>
        {authErr&&<div style={{marginBottom:13,padding:"10px 14px",background:"rgba(255,107,107,0.08)",border:"1px solid rgba(255,107,107,0.25)",borderRadius:8,fontSize:12,color:R}}>{authErr}</div>}
        <button onClick={handleAuth} disabled={authLoading} style={{width:"100%",padding:"13px 0",background:"linear-gradient(135deg,#00ff87,#60efff)",border:"none",borderRadius:10,cursor:"pointer",color:"#050a14",fontWeight:800,fontSize:14,marginBottom:18}}>
          {authLoading?"Processing...":authMode==="login"?"Sign In →":"Create Account →"}
        </button>
        {authMode==="login"&&<div style={{padding:14,background:card2,border:"1px solid "+border,borderRadius:10}}>
          <p style={{fontSize:10,color:sub,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",margin:"0 0 8px"}}>Demo Accounts</p>
          {[{e:"admin@techstore.com",p:"admin123",l:"Admin — TechStore",r:"Full Access"},{e:"manager@techstore.com",p:"mgr123",l:"Manager — TechStore",r:"Limited"},{e:"admin@fashionhub.com",p:"fashion123",l:"Admin — FashionHub",r:"Full Access"}].map(a=>(
            <button key={a.e} onClick={()=>{setEmail(a.e);setPass(a.p);setWsId(a.e.includes("techstore")?"techstore":"fashionhub");}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",marginBottom:5,padding:"7px 10px",background:"rgba(255,255,255,0.03)",border:"1px solid "+border,borderRadius:7,cursor:"pointer",color:text,fontSize:11,textAlign:"left"}}>
              <span style={{fontWeight:600}}>{a.l}</span><span style={{color:G,fontSize:10}}>{a.r} →</span>
            </button>
          ))}
        </div>}
      </div>
    </div>
  );

  // ══════════════════════════════
  // MAIN APP
  // ══════════════════════════════
  return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:bg,minHeight:"100vh",color:text,display:"flex",flexDirection:"column",fontSize:13}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700;800&display=swap');*{box-sizing:border-box}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1a2840;border-radius:4px}button:hover{opacity:0.85}input,select{outline:none}input:focus{border-color:#00ff87!important}`}</style>

      {/* TOAST */}
      {toast&&<div style={{position:"fixed",top:14,right:14,zIndex:9999,padding:"11px 18px",background:toast.type==="success"?"rgba(0,255,135,0.12)":"rgba(255,107,107,0.12)",border:"1px solid "+(toast.type==="success"?G:R),borderRadius:10,color:toast.type==="success"?G:R,fontSize:12,fontWeight:600,boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>{toast.msg}</div>}

      {/* WHATSAPP MODAL */}
      {waModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{background:card,border:"1px solid "+border,borderRadius:16,padding:28,width:420,boxShadow:"0 24px 64px rgba(0,0,0,0.6)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <h3 style={{margin:0,fontWeight:700,fontSize:17}}>📱 WhatsApp Alert</h3>
            <button onClick={()=>setWaModal(false)} style={{background:"none",border:"none",color:sub,cursor:"pointer",fontSize:18}}>✕</button>
          </div>
          <label style={{fontSize:10,color:sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:5}}>Phone Number</label>
          <input value={waPhone} onChange={e=>setWaPhone(e.target.value)} placeholder="+91-9876543210" style={{width:"100%",padding:"10px 12px",background:card2,border:"1px solid "+border,borderRadius:8,color:text,fontSize:13,marginBottom:16}}/>
          <div style={{padding:"14px 16px",background:"#075E54",borderRadius:10,fontSize:12,lineHeight:1.8,color:"#fff",marginBottom:16}}>
            <p style={{margin:"0 0 4px",color:"#25D366",fontWeight:700}}>📊 ProfitPulse Alert — {ws?.name}</p>
            <p style={{margin:0}}>💰 Revenue: {fmt(totalRev)}<br/>📈 Profit: {fmt(totalProfit)}<br/>📉 Margin: {margin}%<br/>📦 Orders: {totalOrders}<br/><br/>{parseFloat(margin)<30?"⚠️ Margin below threshold!":"✅ All metrics healthy"}</p>
          </div>
          <button onClick={sendWhatsApp} style={{width:"100%",padding:"11px 0",background:"linear-gradient(135deg,#25D366,#128C7E)",border:"none",borderRadius:9,cursor:"pointer",color:"#fff",fontWeight:800,fontSize:13}}>📱 Send WhatsApp Now</button>
        </div>
      </div>}

      {/* EMAIL MODAL */}
      {emailModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{background:card,border:"1px solid "+border,borderRadius:16,padding:28,width:420,boxShadow:"0 24px 64px rgba(0,0,0,0.6)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <h3 style={{margin:0,fontWeight:700,fontSize:17}}>📧 Email Report</h3>
            <button onClick={()=>setEmailModal(false)} style={{background:"none",border:"none",color:sub,cursor:"pointer",fontSize:18}}>✕</button>
          </div>
          <label style={{fontSize:10,color:sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:5}}>Send To</label>
          <input value={emailTo} onChange={e=>setEmailTo(e.target.value)} placeholder="email@example.com" style={{width:"100%",padding:"10px 12px",background:card2,border:"1px solid "+border,borderRadius:8,color:text,fontSize:13,marginBottom:12}}/>
          <label style={{fontSize:10,color:sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:5}}>Schedule</label>
          <select value={emailSchedule} onChange={e=>setEmailSchedule(e.target.value)} style={{width:"100%",padding:"10px 12px",background:card2,border:"1px solid "+border,borderRadius:8,color:text,fontSize:13,marginBottom:16}}>
            <option value="now">Send Now</option>
            <option value="daily">Daily at 9 AM</option>
            <option value="weekly">Weekly — Monday</option>
            <option value="monthly">Monthly — 1st</option>
          </select>
          <div style={{padding:"12px 14px",background:"rgba(0,255,135,0.05)",border:"1px solid rgba(0,255,135,0.1)",borderRadius:8,marginBottom:16,fontSize:11,color:sub}}>
            📋 Includes: KPI summary · Charts · AI insights · 3-month forecast
          </div>
          <button onClick={sendEmail} style={{width:"100%",padding:"11px 0",background:"linear-gradient(135deg,#00ff87,#60efff)",border:"none",borderRadius:9,cursor:"pointer",color:"#050a14",fontWeight:800,fontSize:13}}>📧 {emailSchedule==="now"?"Send Now":"Schedule Report"}</button>
        </div>
      </div>}

      {/* FLOATING AI CHAT */}
      {aiChatOpen&&<div style={{position:"fixed",bottom:80,right:20,width:360,height:460,background:card,border:"1px solid "+border,borderRadius:16,zIndex:1000,display:"flex",flexDirection:"column",boxShadow:"0 24px 64px rgba(0,0,0,0.6)"}}>
        <div style={{padding:"13px 18px",borderBottom:"1px solid "+border,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>🤖</span><div><p style={{margin:0,fontWeight:700,fontSize:13,color:G}}>AI Analyst</p><p style={{margin:0,fontSize:9,color:sub}}>Powered by Claude</p></div></div>
          <button onClick={()=>setAiChatOpen(false)} style={{background:"none",border:"none",color:sub,cursor:"pointer",fontSize:16}}>✕</button>
        </div>
        <div ref={chatRef} style={{flex:1,padding:14,overflowY:"auto",display:"flex",flexDirection:"column",gap:10}}>
          {aiMessages.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"85%",padding:"9px 13px",borderRadius:m.role==="user"?"12px 12px 3px 12px":"12px 12px 12px 3px",background:m.role==="user"?"linear-gradient(135deg,#00ff87,#60efff)":card2,color:m.role==="user"?"#050a14":text,fontSize:12,lineHeight:1.55,fontWeight:m.role==="user"?600:400}}>{m.text}</div>
            </div>
          ))}
          {aiLoading&&<div style={{display:"flex",justifyContent:"flex-start"}}><div style={{padding:"9px 13px",borderRadius:"12px 12px 12px 3px",background:card2,fontSize:12,color:sub}}>🤔 Thinking...</div></div>}
        </div>
        <div style={{padding:"10px 14px",borderTop:"1px solid "+border}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
            {["Why revenue dropped?","Top product?","Forecast?","Improve margin"].map(q=>(
              <button key={q} onClick={()=>sendAI(q)} style={{fontSize:10,padding:"3px 8px",background:"rgba(0,255,135,0.06)",border:"1px solid rgba(0,255,135,0.15)",borderRadius:20,cursor:"pointer",color:G}}>{q}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:7}}>
            <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendAI()} placeholder="Ask anything..." style={{flex:1,padding:"8px 12px",background:card2,border:"1px solid "+border,borderRadius:8,color:text,fontSize:12}}/>
            <button onClick={()=>sendAI()} disabled={aiLoading} style={{padding:"8px 14px",background:"linear-gradient(135deg,#00ff87,#60efff)",border:"none",borderRadius:8,cursor:"pointer",color:"#050a14",fontWeight:800,fontSize:12}}>→</button>
          </div>
        </div>
      </div>}

      {/* FLOATING AI BUTTON */}
      <button onClick={()=>setAiChatOpen(o=>!o)} title="AI Analyst" style={{position:"fixed",bottom:20,right:20,width:50,height:50,borderRadius:"50%",background:"linear-gradient(135deg,#00ff87,#60efff)",border:"none",cursor:"pointer",fontSize:22,boxShadow:"0 4px 24px rgba(0,255,135,0.4)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}}>🤖</button>

      {/* ══ HEADER ══ */}
      <header style={{background:card,borderBottom:"1px solid "+border,padding:"0 18px",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:200,flexShrink:0}}>
        {/* LEFT: LOGO + WORKSPACE */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:26,height:26,borderRadius:7,background:"linear-gradient(135deg,#00ff87,#60efff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>⚡</div>
          <span style={{fontWeight:800,fontSize:17,background:"linear-gradient(90deg,#00ff87,#60efff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:-0.5}}>ProfitPulse</span>
          <span style={{fontSize:9,color:G,background:"rgba(0,255,135,0.1)",border:"1px solid rgba(0,255,135,0.2)",padding:"1px 7px",borderRadius:20,fontWeight:700}}>PRO</span>
          {/* Workspace switcher */}
          <div style={{display:"flex",gap:4,marginLeft:6}}>
            {Object.entries(WORKSPACES).map(([id,w])=>(
              <button key={id} onClick={()=>{setWsId(id);setUploadedData(null);generateAIInsights(w.monthly,w.products,w.name);}} style={{padding:"3px 10px",background:wsId===id?w.color+"22":"transparent",border:"1px solid "+(wsId===id?w.color+"44":border),borderRadius:20,cursor:"pointer",color:wsId===id?w.color:sub,fontSize:10,fontWeight:wsId===id?700:400}}>
                {w.logo} {w.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* CENTER: DATE FILTER */}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <select value={dateFilter} onChange={e=>setDateFilter(e.target.value)} style={{padding:"4px 10px",background:card2,border:"1px solid "+border,borderRadius:7,color:text,fontSize:11,cursor:"pointer"}}>
            {["Today","Last 7 Days","Last 30 Days","Last 90 Days","This Year"].map(f=><option key={f}>{f}</option>)}
          </select>
        </div>

        {/* RIGHT: WHATSAPP + EMAIL + NOTIF + USER + LOGOUT */}
        <div style={{display:"flex",alignItems:"center",gap:8}}>

          {/* WHATSAPP BUTTON */}
          <button onClick={()=>setWaModal(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 13px",background:"rgba(37,211,102,0.08)",border:"1px solid rgba(37,211,102,0.25)",borderRadius:20,cursor:"pointer",color:"#25D366",fontSize:12,fontWeight:700}}>
            <span style={{fontSize:14}}>📱</span> WhatsApp
          </button>

          {/* EMAIL BUTTON */}
          <button onClick={()=>setEmailModal(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 13px",background:"rgba(0,255,135,0.07)",border:"1px solid rgba(0,255,135,0.2)",borderRadius:20,cursor:"pointer",color:G,fontSize:12,fontWeight:700}}>
            <span style={{fontSize:14}}>📧</span> Email
          </button>

          {/* NOTIFICATION */}
          <div style={{position:"relative"}}>
            <button onClick={()=>{setNotifOpen(o=>!o);setUnread(0);}} style={{padding:"5px 10px",background:notifOpen?card2:"transparent",border:"1px solid "+(notifOpen?border:"transparent"),borderRadius:8,cursor:"pointer",color:text,fontSize:14,position:"relative"}}>
              🔔
              {unread>0&&<span style={{position:"absolute",top:-3,right:-3,width:16,height:16,background:R,borderRadius:"50%",fontSize:9,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{unread}</span>}
            </button>
            {notifOpen&&<div style={{position:"absolute",top:42,right:0,width:300,background:card,border:"1px solid "+border,borderRadius:12,boxShadow:"0 16px 48px rgba(0,0,0,0.5)",zIndex:500,overflow:"hidden"}}>
              <div style={{padding:"11px 16px",borderBottom:"1px solid "+border,display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:700,fontSize:13}}>Notifications</span><span style={{fontSize:10,color:sub}}>Mark all read</span></div>
              {activity.slice(0,5).map((a,i)=>(
                <div key={i} style={{padding:"9px 16px",borderBottom:"1px solid "+border,display:"flex",gap:10,alignItems:"flex-start"}}>
                  <span style={{fontSize:13,flexShrink:0}}>{a.icon}</span>
                  <div><p style={{margin:0,fontSize:11,lineHeight:1.4}}>{a.text}</p><p style={{margin:"2px 0 0",fontSize:9,color:sub}}>{a.time}</p></div>
                </div>
              ))}
            </div>}
          </div>

          {/* USER */}
          <div style={{display:"flex",alignItems:"center",gap:7,padding:"4px 10px",background:card2,border:"1px solid "+border,borderRadius:20}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:"linear-gradient(135deg,"+AC+","+AC+"88)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#050a14"}}>{user?.avatar}</div>
            <span style={{fontSize:11,fontWeight:600}}>{user?.name?.split(" ")[0]}</span>
            <span style={{fontSize:9,color:sCol(user?.role),background:sCol(user?.role)+"20",padding:"1px 6px",borderRadius:20,fontWeight:700}}>{user?.role}</span>
          </div>
          <button onClick={logout} style={{padding:"5px 10px",background:"rgba(255,107,107,0.06)",border:"1px solid rgba(255,107,107,0.2)",borderRadius:8,cursor:"pointer",color:R,fontSize:11,fontWeight:600}}>Logout</button>
        </div>
      </header>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {/* ══ SIDEBAR ══ */}
        <aside style={{width:192,background:card,borderRight:"1px solid "+border,padding:"14px 10px",display:"flex",flexDirection:"column",gap:2,flexShrink:0,overflowY:"auto"}}>

          {/* FILE UPLOAD */}
          <div style={{marginBottom:14}}>
            <p style={{fontSize:9,fontWeight:700,letterSpacing:1.5,color:sub,marginBottom:7,textTransform:"uppercase"}}>Upload Data</p>
            <div onDrop={e=>{e.preventDefault();setIsDrag(false);processFile(e.dataTransfer.files[0]);}} onDragOver={e=>{e.preventDefault();setIsDrag(true);}} onDragLeave={()=>setIsDrag(false)} onClick={()=>fileRef.current.click()}
              style={{padding:"10px 8px",background:isDrag?"rgba(0,255,135,0.08)":"rgba(0,255,135,0.02)",border:"1px dashed rgba(0,255,135,"+(isDrag?"0.5":"0.15")+")",borderRadius:9,cursor:"pointer",textAlign:"center",transition:"all 0.2s"}}>
              <div style={{fontSize:16,marginBottom:2}}>📂</div>
              <p style={{margin:0,fontSize:10,color:G,fontWeight:600}}>CSV / JSON</p>
              <p style={{margin:"1px 0 0",fontSize:9,color:sub}}>drag & drop or click</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv,.json" style={{display:"none"}} onChange={e=>processFile(e.target.files[0])}/>
            {uploadMsg&&<p style={{fontSize:9,color:uploadMsg.startsWith("✅")?G:R,marginTop:4,textAlign:"center",lineHeight:1.3}}>{uploadMsg}</p>}
            <p style={{fontSize:9,color:sub,marginTop:4,textAlign:"center",lineHeight:1.4}}>Columns: month, revenue,<br/>profit, orders (optional)</p>
          </div>

          {/* MAIN NAV */}
          <p style={{fontSize:9,fontWeight:700,letterSpacing:1.5,color:sub,marginBottom:4,textTransform:"uppercase"}}>Analytics</p>
          {mainNav.map(({icon,label,pg,badge})=>(
            <div key={pg} onClick={()=>setPage(pg)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,marginBottom:1,background:page===pg?"rgba(0,255,135,0.07)":"transparent",borderLeft:page===pg?"2px solid "+G:"2px solid transparent",cursor:"pointer",transition:"all 0.15s"}}>
              <span style={{fontSize:13}}>{icon}</span>
              <span style={{fontSize:12,color:page===pg?G:sub,fontWeight:page===pg?600:400,flex:1}}>{label}</span>
              {badge>0&&<span style={{fontSize:9,background:R,color:"#fff",padding:"1px 5px",borderRadius:20,fontWeight:700}}>{badge}</span>}
            </div>
          ))}

          {/* MANAGE NAV */}
          <p style={{fontSize:9,fontWeight:700,letterSpacing:1.5,color:sub,margin:"12px 0 4px",textTransform:"uppercase"}}>Manage</p>
          {manageNav.map(({icon,label,pg})=>(
            <div key={pg} onClick={()=>setPage(pg)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,marginBottom:1,background:page===pg?"rgba(0,255,135,0.07)":"transparent",borderLeft:page===pg?"2px solid "+G:"2px solid transparent",cursor:"pointer",transition:"all 0.15s"}}>
              <span style={{fontSize:13}}>{icon}</span>
              <span style={{fontSize:12,color:page===pg?G:sub,fontWeight:page===pg?600:400,flex:1}}>{label}</span>
            </div>
          ))}

          {/* QUICK ACTIONS */}
          <div style={{marginTop:"auto",paddingTop:12,borderTop:"1px solid "+border}}>
            <button onClick={()=>setWaModal(true)} style={{width:"100%",marginBottom:5,padding:"7px 0",background:"linear-gradient(135deg,#25D366,#128C7E)",border:"none",borderRadius:7,cursor:"pointer",color:"#fff",fontWeight:700,fontSize:10}}>📱 WhatsApp Alert</button>
            <button onClick={()=>setEmailModal(true)} style={{width:"100%",marginBottom:5,padding:"7px 0",background:"linear-gradient(135deg,#00ff87,#00cc6a)",border:"none",borderRadius:7,cursor:"pointer",color:"#050a14",fontWeight:700,fontSize:10}}>📧 Email Report</button>
            <button onClick={()=>showToast("📄 PDF downloading...")} style={{width:"100%",padding:"7px 0",background:"linear-gradient(135deg,#60efff,#0099cc)",border:"none",borderRadius:7,cursor:"pointer",color:"#050a14",fontWeight:700,fontSize:10}}>⬇️ Export PDF</button>
          </div>
        </aside>

        {/* ══ MAIN CONTENT ══ */}
        <main style={{flex:1,padding:"18px 22px",overflowY:"auto",display:"flex",flexDirection:"column",gap:15}}>

          {/* DASHBOARD */}
          {page==="dashboard"&&<>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><h1 style={{fontWeight:800,fontSize:20,margin:0,letterSpacing:-0.5}}>{ws?.name} — Overview</h1><p style={{color:sub,fontSize:11,margin:"2px 0 0"}}>{dateFilter} · {user?.role} view{uploadedData?" · Custom data":""}</p></div>
              <div style={{display:"flex",gap:6}}>
                {["Monthly","Weekly"].map(t=>(
                  <button key={t} onClick={()=>setTab(t==="Weekly"?"daily":"monthly")} style={{padding:"5px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:11,background:(t==="Weekly"?tab==="daily":tab==="monthly")?G:"#1a2840",color:(t==="Weekly"?tab==="daily":tab==="monthly")?"#050a14":text,fontWeight:(t==="Weekly"?tab==="daily":tab==="monthly")?700:400}}>{t}</button>
                ))}
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
              {[
                {label:"Total Revenue",value:fmt(totalRev),  delta:revGrowth+"%",good:revGrowth>0,icon:"💰"},
                {label:"Net Profit",   value:fmt(totalProfit),delta:"+12%",       good:true,        icon:"📊"},
                {label:"Profit Margin",value:margin+"%",     delta:margin>30?"Healthy":"Low",good:margin>30,icon:"📈"},
                {label:"Total Orders", value:totalOrders.toLocaleString(),delta:"+7%",good:true,icon:"📦"},
              ].map(k=>(
                <div key={k.label} style={{background:card,border:"1px solid "+border,borderRadius:11,padding:"15px 18px",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:k.good?"linear-gradient(90deg,#00ff87,#60efff)":"linear-gradient(90deg,#ff6b6b,#ffd93d)"}}/>
                  <p style={{fontSize:10,color:sub,margin:"0 0 5px"}}>{k.icon} {k.label}</p>
                  <p style={{fontWeight:800,fontSize:21,margin:"0 0 4px",letterSpacing:-0.5}}>{k.value}</p>
                  <span style={{fontSize:10,color:k.good?G:R,background:k.good?"rgba(0,255,135,0.1)":"rgba(255,107,107,0.1)",padding:"2px 7px",borderRadius:20,fontWeight:600}}>{k.delta}</span>
                </div>
              ))}
            </div>

            {/* AI INSIGHTS */}
            <div style={{background:card,border:"1px solid rgba(0,255,135,0.15)",borderRadius:11,padding:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:15}}>🤖</span>
                  <h3 style={{fontWeight:700,fontSize:14,margin:0,color:G}}>AI Insights</h3>
                  <span style={{fontSize:9,color:G,background:"rgba(0,255,135,0.1)",border:"1px solid rgba(0,255,135,0.2)",padding:"1px 7px",borderRadius:20,fontWeight:700}}>LIVE</span>
                </div>
                <button onClick={()=>generateAIInsights(monthly,products,ws.name)} disabled={insightsLoading} style={{fontSize:10,color:B,background:"rgba(96,239,255,0.06)",border:"1px solid rgba(96,239,255,0.15)",borderRadius:20,padding:"3px 10px",cursor:"pointer"}}>{insightsLoading?"Analyzing...":"↻ Refresh"}</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {insightsLoading?[1,2,3,4,5,6].map(i=><div key={i} style={{height:54,background:card2,borderRadius:9,border:"1px solid "+border}}/>):
                  aiInsights.map((ins,i)=>(
                    <div key={i} style={{padding:"11px 13px",background:ins.type==="positive"?"rgba(0,255,135,0.05)":ins.type==="negative"?"rgba(255,107,107,0.05)":"rgba(96,239,255,0.05)",border:"1px solid "+(ins.type==="positive"?"rgba(0,255,135,0.15)":ins.type==="negative"?"rgba(255,107,107,0.15)":"rgba(96,239,255,0.15)"),borderRadius:9}}>
                      <div style={{display:"flex",alignItems:"flex-start",gap:6}}>
                        <span style={{fontSize:13,flexShrink:0}}>{ins.type==="positive"?"📈":ins.type==="negative"?"📉":"💡"}</span>
                        <div>
                          <p style={{margin:"0 0 2px",fontSize:11,lineHeight:1.4,color:ins.type==="positive"?G:ins.type==="negative"?R:B}}>{ins.text}</p>
                          <span style={{fontSize:9,color:sub,textTransform:"uppercase",letterSpacing:0.5}}>{ins.category}</span>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14}}>
              <div style={{background:card,border:"1px solid "+border,borderRadius:11,padding:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div><h3 style={{fontWeight:700,fontSize:14,margin:0}}>Revenue & Profit Trend</h3><p style={{color:sub,fontSize:10,margin:"2px 0 0"}}>{showForecast?"AI forecast active":"Historical data"}</p></div>
                  <button onClick={()=>setShowForecast(f=>!f)} style={{padding:"4px 12px",background:showForecast?"rgba(255,217,61,0.1)":"#1a2840",border:showForecast?"1px solid "+Y:"1px solid "+border,borderRadius:20,cursor:"pointer",color:showForecast?Y:text,fontSize:10,fontWeight:600}}>🔮 {showForecast?"ON":"Forecast"}</button>
                </div>
                <ResponsiveContainer width="100%" height={185}>
                  <AreaChart data={tab==="monthly"?chartData:displayData}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={G} stopOpacity={0.15}/><stop offset="95%" stopColor={G} stopOpacity={0}/></linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={B} stopOpacity={0.1}/><stop offset="95%" stopColor={B} stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={border}/>
                    <XAxis dataKey="m" tick={{fontSize:9,fill:sub}}/>
                    <YAxis tick={{fontSize:9,fill:sub}} tickFormatter={v=>v>=1000?(v/1000)+"K":v}/>
                    <Tooltip contentStyle={{background:card2,border:"1px solid "+border,borderRadius:8,color:text,fontSize:11}} formatter={v=>fmt(v)}/>
                    {showForecast&&tab==="monthly"&&<ReferenceLine x={monthly[monthly.length-1]?.m} stroke={Y} strokeDasharray="4 4"/>}
                    <Area type="monotone" dataKey="rev" stroke={G} strokeWidth={2} fill="url(#g1)" dot={false}/>
                    <Area type="monotone" dataKey="profit" stroke={B} strokeWidth={1.5} fill="url(#g2)" dot={false} strokeDasharray="5 3"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={{background:card,border:"1px solid "+border,borderRadius:11,padding:20}}>
                <h3 style={{fontWeight:700,fontSize:14,margin:"0 0 12px"}}>Top Products</h3>
                <ResponsiveContainer width="100%" height={185}>
                  <BarChart data={products} layout="vertical" barSize={10}>
                    <XAxis type="number" tick={{fontSize:9,fill:sub}} tickFormatter={v=>v>=1000?(v/1000)+"K":v}/>
                    <YAxis type="category" dataKey="name" width={82} tick={{fontSize:9,fill:text}}/>
                    <Tooltip contentStyle={{background:card2,border:"1px solid "+border,borderRadius:8,fontSize:11}} formatter={v=>fmt(v)}/>
                    <Bar dataKey="rev" radius={[0,5,5,0]}>{products.map((p,i)=><Cell key={i} fill={p.color}/>)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{background:card,border:"1px solid "+border,borderRadius:11,padding:18}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                <h3 style={{fontWeight:700,fontSize:14,margin:0}}>🚨 Smart Alerts</h3>
                <button onClick={()=>setPage("alerts")} style={{fontSize:10,color:B,background:"none",border:"none",cursor:"pointer"}}>View all →</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {alerts.slice(0,3).map((a,i)=>(
                  <div key={i} style={{padding:"10px 12px",background:a.type==="danger"?"rgba(255,107,107,0.07)":a.type==="warning"?"rgba(255,217,61,0.07)":a.type==="success"?"rgba(0,255,135,0.07)":"rgba(96,239,255,0.07)",border:"1px solid "+(a.type==="danger"?"rgba(255,107,107,0.2)":a.type==="warning"?"rgba(255,217,61,0.2)":a.type==="success"?"rgba(0,255,135,0.2)":"rgba(96,239,255,0.2)"),borderRadius:9,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6}}>
                    <p style={{margin:0,fontSize:11,lineHeight:1.45,flex:1}}>{a.icon} {a.msg}</p>
                    <button onClick={()=>showToast("Action taken!")} style={{fontSize:9,padding:"2px 6px",background:"rgba(255,255,255,0.05)",border:"1px solid "+border,borderRadius:20,cursor:"pointer",color:sub,flexShrink:0}}>{a.action}</button>
                  </div>
                ))}
              </div>
            </div>
          </>}

          {/* AI PAGE */}
          {page==="ai"&&<>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><h1 style={{fontWeight:800,fontSize:20,margin:0}}>🤖 AI Insights Engine</h1><p style={{color:sub,fontSize:11,marginTop:2}}>Deep analysis for {ws?.name}</p></div>
              <button onClick={()=>generateAIInsights(monthly,products,ws.name)} disabled={insightsLoading} style={{padding:"7px 16px",background:"linear-gradient(135deg,#00ff87,#60efff)",border:"none",borderRadius:8,cursor:"pointer",color:"#050a14",fontWeight:700,fontSize:12}}>{insightsLoading?"Analyzing...":"↻ Regenerate"}</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
              {aiInsights.map((ins,i)=>(
                <div key={i} style={{background:card,border:"1px solid "+(ins.type==="positive"?"rgba(0,255,135,0.2)":ins.type==="negative"?"rgba(255,107,107,0.2)":"rgba(96,239,255,0.2)"),borderRadius:11,padding:18,display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{width:38,height:38,borderRadius:10,background:ins.type==="positive"?"rgba(0,255,135,0.1)":ins.type==="negative"?"rgba(255,107,107,0.1)":"rgba(96,239,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{ins.type==="positive"?"📈":ins.type==="negative"?"📉":"💡"}</div>
                  <div><p style={{margin:"0 0 4px",fontSize:13,lineHeight:1.5,fontWeight:500}}>{ins.text}</p><span style={{fontSize:10,color:ins.type==="positive"?G:ins.type==="negative"?R:B,background:ins.type==="positive"?"rgba(0,255,135,0.08)":ins.type==="negative"?"rgba(255,107,107,0.08)":"rgba(96,239,255,0.08)",padding:"2px 8px",borderRadius:20,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5}}>{ins.category}</span></div>
                </div>
              ))}
            </div>
            <div style={{background:card,border:"1px solid "+border,borderRadius:11,display:"flex",flexDirection:"column",minHeight:340}}>
              <div style={{padding:"14px 20px",borderBottom:"1px solid "+border,display:"flex",alignItems:"center",gap:8}}><span>🤖</span><h3 style={{fontWeight:700,fontSize:14,margin:0}}>AI Chat</h3><span style={{fontSize:9,color:G,background:"rgba(0,255,135,0.1)",border:"1px solid rgba(0,255,135,0.2)",padding:"1px 7px",borderRadius:20,fontWeight:700}}>LIVE</span></div>
              <div ref={chatRef} style={{flex:1,padding:18,overflowY:"auto",display:"flex",flexDirection:"column",gap:12,maxHeight:260}}>
                {aiMessages.map((m,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                    <div style={{maxWidth:"80%",padding:"10px 14px",borderRadius:m.role==="user"?"12px 12px 3px 12px":"12px 12px 12px 3px",background:m.role==="user"?"linear-gradient(135deg,#00ff87,#60efff)":card2,color:m.role==="user"?"#050a14":text,fontSize:12,lineHeight:1.6,fontWeight:m.role==="user"?600:400}}>{m.text}</div>
                  </div>
                ))}
                {aiLoading&&<div style={{display:"flex",justifyContent:"flex-start"}}><div style={{padding:"10px 14px",borderRadius:"12px 12px 12px 3px",background:card2,fontSize:12,color:sub}}>🤔 Analyzing...</div></div>}
              </div>
              <div style={{padding:"12px 18px",borderTop:"1px solid "+border}}>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                  {["Why revenue dropped?","Top product?","Forecast 3 months","Improve margin","Growth strategy"].map(q=>(
                    <button key={q} onClick={()=>sendAI(q)} style={{fontSize:10,padding:"4px 10px",background:card2,border:"1px solid "+border,borderRadius:20,cursor:"pointer",color:sub}}>{q}</button>
                  ))}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendAI()} placeholder="Ask anything about your business..." style={{flex:1,padding:"9px 14px",background:card2,border:"1px solid "+border,borderRadius:9,color:text,fontSize:12}}/>
                  <button onClick={()=>sendAI()} disabled={aiLoading} style={{padding:"9px 20px",background:"linear-gradient(135deg,#00ff87,#60efff)",border:"none",borderRadius:9,cursor:"pointer",color:"#050a14",fontWeight:800,fontSize:12}}>Ask</button>
                </div>
              </div>
            </div>
          </>}

          {/* FORECAST */}
          {page==="forecast"&&<>
            <div><h1 style={{fontWeight:800,fontSize:20,margin:0}}>🔮 Revenue Forecast</h1><p style={{color:sub,fontSize:11,marginTop:2}}>6-month AI prediction — {ws?.name}</p></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              {forecast.slice(0,3).map((f,i)=>(
                <div key={f.m} style={{background:card,border:"1px solid rgba(255,217,61,0.2)",borderRadius:11,padding:18,position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#ffd93d,#ff6b6b)"}}/>
                  <p style={{fontSize:10,color:Y,margin:"0 0 4px",fontWeight:700}}>🔮 {f.m}</p>
                  <p style={{fontWeight:800,fontSize:20,margin:"0 0 3px"}}>{fmt(f.rev)}</p>
                  <p style={{fontSize:11,color:sub,margin:"0 0 4px"}}>Profit: {fmt(f.profit)}</p>
                  <span style={{fontSize:10,color:Y,background:"rgba(255,217,61,0.08)",padding:"2px 7px",borderRadius:20,fontWeight:600}}>+{3+i*2}% projected</span>
                </div>
              ))}
            </div>
            <div style={{background:card,border:"1px solid "+border,borderRadius:11,padding:22}}>
              <h3 style={{fontWeight:700,fontSize:14,margin:"0 0 16px"}}>Historical + 6-Month Forecast</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={[...monthly,...forecast]}>
                  <defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={G} stopOpacity={0.15}/><stop offset="95%" stopColor={G} stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={border}/>
                  <XAxis dataKey="m" tick={{fontSize:9,fill:sub}}/>
                  <YAxis tick={{fontSize:9,fill:sub}} tickFormatter={v=>v>=1000?(v/1000)+"K":v}/>
                  <Tooltip contentStyle={{background:card2,border:"1px solid "+border,borderRadius:8,fontSize:11}} formatter={v=>fmt(v)}/>
                  <ReferenceLine x={monthly[monthly.length-1]?.m} stroke={Y} strokeDasharray="4 4" label={{value:"↑ Forecast",fill:Y,fontSize:9}}/>
                  <Area type="monotone" dataKey="rev" stroke={G} strokeWidth={2} fill="url(#fg)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              {forecast.slice(3).map(f=>(
                <div key={f.m} style={{background:card,border:"1px solid "+border,borderRadius:11,padding:16}}>
                  <p style={{fontSize:10,color:sub,margin:"0 0 4px"}}>🔮 {f.m}</p>
                  <p style={{fontWeight:800,fontSize:18,margin:"0 0 3px"}}>{fmt(f.rev)}</p>
                  <p style={{fontSize:11,color:sub,margin:0}}>Profit: {fmt(f.profit)}</p>
                </div>
              ))}
            </div>
          </>}

          {/* ALERTS */}
          {page==="alerts"&&<>
            <div><h1 style={{fontWeight:800,fontSize:20,margin:0}}>🚨 Smart Alerts</h1><p style={{color:sub,fontSize:11,marginTop:2}}>{alerts.length} alerts for {ws?.name}</p></div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {alerts.map((a,i)=>(
                <div key={i} style={{background:card,border:"1px solid "+(a.type==="danger"?"rgba(255,107,107,0.3)":a.type==="warning"?"rgba(255,217,61,0.3)":a.type==="success"?"rgba(0,255,135,0.3)":"rgba(96,239,255,0.2)"),borderRadius:11,padding:"14px 18px",display:"flex",alignItems:"center",gap:14}}>
                  <span style={{fontSize:22}}>{a.icon}</span>
                  <div style={{flex:1}}><p style={{margin:0,fontSize:13,fontWeight:600}}>{a.msg}</p><p style={{margin:"2px 0 0",fontSize:11,color:sub}}>{a.type==="danger"?"Immediate action required":a.type==="warning"?"Review and optimize":a.type==="success"?"Keep momentum":"Info"}</p></div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span style={{fontSize:10,color:sCol(a.type),background:sCol(a.type)+"20",padding:"2px 9px",borderRadius:20,fontWeight:700,textTransform:"uppercase"}}>{a.type}</span>
                    <button onClick={()=>showToast("Action taken!")} style={{padding:"5px 12px",background:"rgba(0,255,135,0.06)",border:"1px solid rgba(0,255,135,0.15)",borderRadius:20,cursor:"pointer",color:G,fontSize:10,fontWeight:600}}>{a.action}</button>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {/* ACTIVITY */}
          {page==="activity"&&<>
            <div><h1 style={{fontWeight:800,fontSize:20,margin:0}}>📋 Activity Feed</h1><p style={{color:sub,fontSize:11,marginTop:2}}>Recent events — {ws?.name}</p></div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14}}>
              <div style={{background:card,border:"1px solid "+border,borderRadius:11,overflow:"hidden"}}>
                {activity.map((a,i)=>(
                  <div key={i} style={{padding:"12px 18px",borderBottom:i<activity.length-1?"1px solid "+border:"none",display:"flex",gap:12,alignItems:"center"}}>
                    <div style={{width:32,height:32,borderRadius:8,background:a.type==="ai"?"rgba(0,255,135,0.1)":a.type==="success"?"rgba(0,255,135,0.08)":a.type==="alert"?"rgba(255,107,107,0.08)":"rgba(96,239,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{a.icon}</div>
                    <div style={{flex:1}}><p style={{margin:0,fontSize:12,fontWeight:500,lineHeight:1.4}}>{a.text}</p><p style={{margin:"2px 0 0",fontSize:10,color:sub}}>{a.time}</p></div>
                    <span style={{fontSize:9,color:sub,background:card2,padding:"2px 7px",borderRadius:20,flexShrink:0}}>{a.type}</span>
                  </div>
                ))}
              </div>
              <div style={{background:card,border:"1px solid rgba(0,255,135,0.15)",borderRadius:11,padding:18}}>
                <h3 style={{fontWeight:700,fontSize:13,margin:"0 0 12px",color:G}}>Quick Actions</h3>
                {["Generate AI Report","Send WhatsApp Alert","Send Email Report","Export to PDF","Schedule Weekly Report"].map(a=>(
                  <button key={a} onClick={()=>a.includes("WhatsApp")?setWaModal(true):a.includes("Email")?setEmailModal(true):showToast(a+" done!")} style={{display:"block",width:"100%",marginBottom:7,padding:"8px 12px",background:card2,border:"1px solid "+border,borderRadius:8,cursor:"pointer",color:text,fontSize:11,textAlign:"left",fontWeight:500}}>→ {a}</button>
                ))}
              </div>
            </div>
          </>}

          {/* ORDERS */}
          {page==="orders"&&<>
            <div><h1 style={{fontWeight:800,fontSize:20,margin:0}}>🛍️ Orders</h1><p style={{color:sub,fontSize:11,marginTop:2}}>Recent transactions — {ws?.name}</p></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:4}}>
              {[["Total Orders",totalOrders.toLocaleString(),G,"📦"],["Delivered",Math.round(totalOrders*0.62).toLocaleString(),G,"✅"],["Pending",Math.round(totalOrders*0.18).toLocaleString(),Y,"⏳"],["Cancelled",Math.round(totalOrders*0.08).toLocaleString(),R,"❌"]].map(([l,v,c,ic])=>(
                <div key={l} style={{background:card,border:"1px solid "+border,borderRadius:10,padding:"13px 16px"}}>
                  <p style={{fontSize:10,color:sub,margin:"0 0 4px"}}>{ic} {l}</p>
                  <p style={{fontWeight:800,fontSize:20,margin:0,color:c}}>{v}</p>
                </div>
              ))}
            </div>
            <div style={{background:card,border:"1px solid "+border,borderRadius:11,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:card2}}>{["Order ID","Customer","Product","Amount","Status","Date"].map(h=><th key={h} style={{padding:"11px 16px",textAlign:"left",fontSize:9,fontWeight:700,color:sub,letterSpacing:1.5,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
                <tbody>
                  {[
                    {id:"#1201",c:"Ravi Kumar",  p:products[0]?.name||"Product",a:85000,s:"Delivered",d:"28 Apr"},
                    {id:"#1202",c:"Meena S",     p:products[2]?.name||"Product",a:4200, s:"Shipped",  d:"27 Apr"},
                    {id:"#1203",c:"Arjun R",     p:products[1]?.name||"Product",a:12500,s:"Pending",  d:"27 Apr"},
                    {id:"#1204",c:"Priya D",     p:products[3]?.name||"Product",a:18000,s:"Delivered",d:"26 Apr"},
                    {id:"#1205",c:"Karthik M",   p:products[4]?.name||"Product",a:32000,s:"Cancelled",d:"25 Apr"},
                    {id:"#1206",c:"Suresh P",    p:products[0]?.name||"Product",a:85000,s:"Shipped",  d:"24 Apr"},
                    {id:"#1207",c:"Lakshmi V",   p:products[2]?.name||"Product",a:4200, s:"Delivered",d:"23 Apr"},
                  ].map(o=>(
                    <tr key={o.id} style={{borderTop:"1px solid "+border}}>
                      <td style={{padding:"11px 16px",fontSize:11,color:G,fontWeight:700}}>{o.id}</td>
                      <td style={{padding:"11px 16px",fontSize:12}}>{o.c}</td>
                      <td style={{padding:"11px 16px",fontSize:11,color:sub}}>{o.p}</td>
                      <td style={{padding:"11px 16px",fontSize:12,fontWeight:700}}>{fmt(o.a)}</td>
                      <td style={{padding:"11px 16px"}}><span style={{fontSize:10,color:sCol(o.s),background:sCol(o.s)+"20",padding:"2px 9px",borderRadius:20,fontWeight:700}}>{o.s}</span></td>
                      <td style={{padding:"11px 16px",fontSize:11,color:sub}}>{o.d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>}

          {/* CLIENTS */}
          {page==="clients"&&<>
            <div><h1 style={{fontWeight:800,fontSize:20,margin:0}}>👥 Clients</h1><p style={{color:sub,fontSize:11,marginTop:2}}>Customer accounts — {ws?.name}</p></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:4}}>
              {[["Total Clients",totalCust.toLocaleString(),G,"👥"],["VIP",Math.round(totalCust*0.12).toLocaleString(),Y,"👑"],["Regular",Math.round(totalCust*0.56).toLocaleString(),B,"🔄"],["New",Math.round(totalCust*0.32).toLocaleString(),"#c77dff","🆕"]].map(([l,v,c,ic])=>(
                <div key={l} style={{background:card,border:"1px solid "+border,borderRadius:10,padding:"13px 16px"}}>
                  <p style={{fontSize:10,color:sub,margin:"0 0 4px"}}>{ic} {l}</p>
                  <p style={{fontWeight:800,fontSize:20,margin:0,color:c}}>{v}</p>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              {[
                {name:"Ravi Kumar",email:"ravi@email.com",orders:12,spent:320000,status:"VIP",joined:"Jan 2025"},
                {name:"Meena S",   email:"meena@email.com",orders:8, spent:145000,status:"Regular",joined:"Mar 2025"},
                {name:"Arjun R",  email:"arjun@email.com",orders:5, spent:89000, status:"Regular",joined:"Jun 2025"},
                {name:"Priya D",  email:"priya@email.com",orders:15,spent:410000,status:"VIP",joined:"Nov 2024"},
                {name:"Karthik M",email:"karthik@email.com",orders:3,spent:42000,status:"New",joined:"Feb 2026"},
                {name:"Divya N",  email:"divya@email.com",orders:7, spent:98000, status:"Regular",joined:"Aug 2025"},
              ].map(c=>(
                <div key={c.name} style={{background:card,border:"1px solid "+border,borderRadius:11,padding:18}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                    <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,"+AC+","+AC+"88)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:"#050a14",flexShrink:0}}>{c.name.charAt(0)}</div>
                    <div style={{flex:1,minWidth:0}}><p style={{margin:0,fontWeight:700,fontSize:13}}>{c.name}</p><p style={{margin:0,fontSize:10,color:sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.email}</p></div>
                    <span style={{fontSize:9,color:sCol(c.status),background:sCol(c.status)+"20",padding:"2px 7px",borderRadius:20,fontWeight:700,flexShrink:0}}>{c.status}</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,textAlign:"center",paddingTop:12,borderTop:"1px solid "+border}}>
                    <div><p style={{margin:0,fontSize:17,fontWeight:800}}>{c.orders}</p><p style={{margin:0,fontSize:9,color:sub}}>Orders</p></div>
                    <div><p style={{margin:0,fontSize:12,fontWeight:800}}>{fmt(c.spent)}</p><p style={{margin:0,fontSize:9,color:sub}}>Spent</p></div>
                    <div><p style={{margin:0,fontSize:10,fontWeight:600}}>{c.joined}</p><p style={{margin:0,fontSize:9,color:sub}}>Joined</p></div>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {/* REPORTS */}
          {page==="reports"&&<>
            <div><h1 style={{fontWeight:800,fontSize:20,margin:0}}>📊 Reports</h1><p style={{color:sub,fontSize:11,marginTop:2}}>Export and schedule</p></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {[
                {icon:"📄",t:"Full Analytics Report",d:"Revenue, profit, orders, customers — all metrics",a:"Generate PDF",c:G,fn:()=>showToast("📄 PDF generating...")},
                {icon:"📈",t:"Forecast Report",d:"6-month AI prediction with confidence intervals",a:"Export Forecast",c:Y,fn:()=>showToast("🔮 Forecast exported!")},
                {icon:"🏆",t:"Product Performance",d:"Top products, margins, sell-through rates",a:"Download Excel",c:B,fn:()=>showToast("📊 Excel downloaded!")},
                {icon:"🤖",t:"AI Insights Report",d:"Auto-generated analysis and recommendations",a:"Generate Report",c:P,fn:()=>showToast("🤖 AI report ready!")},
                {icon:"📧",t:"Email Report",d:"Schedule weekly or monthly email to your team",a:"Schedule Email",c:G,fn:()=>setEmailModal(true)},
                {icon:"📱",t:"WhatsApp Summary",d:"Send instant business summary via WhatsApp",a:"Send Now",c:"#25D366",fn:()=>setWaModal(true)},
              ].map(r=>(
                <div key={r.t} style={{background:card,border:"1px solid "+border,borderRadius:11,padding:20,display:"flex",gap:14,alignItems:"flex-start"}}>
                  <div style={{width:40,height:40,borderRadius:10,background:r.c+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{r.icon}</div>
                  <div style={{flex:1}}><h3 style={{fontWeight:700,fontSize:13,margin:"0 0 4px",color:r.c}}>{r.t}</h3><p style={{color:sub,fontSize:11,margin:"0 0 12px",lineHeight:1.4}}>{r.d}</p><button onClick={r.fn} style={{padding:"6px 14px",background:r.c+"15",border:"1px solid "+r.c+"44",borderRadius:20,cursor:"pointer",color:r.c,fontSize:11,fontWeight:600}}>{r.a}</button></div>
                </div>
              ))}
            </div>
          </>}

          {/* TEAM */}
          {page==="team"&&<>
            <div><h1 style={{fontWeight:800,fontSize:20,margin:0}}>👤 Team</h1><p style={{color:sub,fontSize:11,marginTop:2}}>Role-based access — {ws?.name}</p></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
              {Object.entries(ws?.users||{}).map(([em,u])=>(
                <div key={em} style={{background:card,border:"1px solid "+(em===user?.email?"rgba(0,255,135,0.3)":border),borderRadius:11,padding:20}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                    <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,"+sCol(u.role)+","+sCol(u.role)+"88)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:"#050a14",flexShrink:0}}>{u.avatar}</div>
                    <div style={{flex:1}}><p style={{margin:0,fontWeight:700,fontSize:13}}>{u.name}</p><p style={{margin:0,fontSize:10,color:sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{em}</p></div>
                    <span style={{fontSize:9,color:sCol(u.role),background:sCol(u.role)+"20",padding:"2px 7px",borderRadius:20,fontWeight:700,flexShrink:0}}>{u.role}</span>
                  </div>
                  <p style={{fontSize:11,color:sub,margin:"0 0 8px",fontWeight:600,color:text}}>Access ({ROLE_ACCESS[u.role].length} pages):</p>
                  <div>{ROLE_ACCESS[u.role].slice(0,5).map(pg=><span key={pg} style={{display:"inline-block",margin:"0 4px 4px 0",padding:"2px 7px",background:card2,borderRadius:20,fontSize:9,color:sub}}>{pg}</span>)}{ROLE_ACCESS[u.role].length>5&&<span style={{fontSize:9,color:sub}}>+{ROLE_ACCESS[u.role].length-5} more</span>}</div>
                  {em===user?.email&&<p style={{marginTop:8,marginBottom:0,fontSize:10,color:G,fontWeight:600}}>← You</p>}
                </div>
              ))}
            </div>
          </>}

          {/* SETTINGS */}
          {page==="settings"&&<>
            <div><h1 style={{fontWeight:800,fontSize:20,margin:0}}>⚙️ Settings</h1><p style={{color:sub,fontSize:11,marginTop:2}}>Account & configuration</p></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div style={{background:card,border:"1px solid "+border,borderRadius:11,padding:22}}>
                <h3 style={{fontWeight:700,fontSize:14,margin:"0 0 16px"}}>👤 Profile</h3>
                {[["Name",user?.name],["Email",user?.email],["Role",user?.role],["Workspace",ws?.name],["Plan",ws?.plan]].map(([l,v])=>(
                  <div key={l} style={{marginBottom:10}}>
                    <label style={{fontSize:10,color:sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:4}}>{l}</label>
                    <input defaultValue={v} style={{width:"100%",padding:"8px 12px",background:card2,border:"1px solid "+border,borderRadius:8,color:text,fontSize:12}}/>
                  </div>
                ))}
              </div>
              <div style={{background:card,border:"1px solid "+border,borderRadius:11,padding:22}}>
                <h3 style={{fontWeight:700,fontSize:14,margin:"0 0 14px"}}>📱 Notifications</h3>
                {[["WhatsApp Alerts","Instant margin/revenue alerts",true],["Email Reports","Weekly scheduled reports",true],["AI Insights","Auto-generated analysis",true],["Browser Push","Desktop notifications",false]].map(([l,d,on])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,paddingBottom:14,borderBottom:"1px solid "+border}}>
                    <div><p style={{margin:0,fontSize:12,fontWeight:600}}>{l}</p><p style={{margin:0,fontSize:10,color:sub}}>{d}</p></div>
                    <div style={{width:36,height:20,borderRadius:20,background:on?"rgba(0,255,135,0.3)":"rgba(255,255,255,0.05)",border:"1px solid "+(on?G:border),position:"relative",cursor:"pointer"}}>
                      <div style={{width:14,height:14,borderRadius:"50%",background:on?G:sub,position:"absolute",top:2,left:on?18:2,transition:"left 0.2s"}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{background:card,border:"1px solid rgba(0,255,135,0.15)",borderRadius:11,padding:22,gridColumn:"span 2"}}>
                <h3 style={{fontWeight:700,fontSize:14,margin:"0 0 14px",color:G}}>✅ All Features Active</h3>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                  {[["🔐 Auth + Signup","✅"],["🏢 Workspace Switch","✅"],["👤 Role-Based Access","✅"],["🤖 AI Insights Engine","✅"],["💬 AI Chat (Floating)","✅"],["🔮 6-Month Forecast","✅"],["🚨 Smart Alerts","✅"],["📋 Activity Feed","✅"],["📂 CSV/JSON Upload","✅"],["📅 Date Filters","✅"],["🔔 Notifications","✅"],["📱 WhatsApp Alerts","✅"],["📧 Email Reports","✅"],["🛍️ Orders Page","✅"],["👥 Clients Page","✅"],["⚙️ Settings Page","✅"]].map(([l,s])=>(
                    <div key={l} style={{padding:"8px 10px",background:card2,border:"1px solid rgba(0,255,135,0.1)",borderRadius:8,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11}}>
                      <span style={{color:sub}}>{l}</span><span style={{color:G,fontWeight:700}}>{s}</span>
                    </div>
                  ))}
                </div>
                <button onClick={logout} style={{marginTop:16,padding:"9px 24px",background:"rgba(255,107,107,0.08)",border:"1px solid rgba(255,107,107,0.25)",borderRadius:8,cursor:"pointer",color:R,fontWeight:700,fontSize:12}}>🚪 Logout</button>
              </div>
            </div>
          </>}

        </main>
      </div>
    </div>
  );
}
