import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, addDoc, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyArb86FC6-vIX9OQ7ir1adDEmtc27Ksq4k",
  authDomain: "dynamic-portfolio-builde-11c0f.firebaseapp.com",
  projectId: "dynamic-portfolio-builde-11c0f",
  storageBucket: "dynamic-portfolio-builde-11c0f.firebasestorage.app",
  messagingSenderId: "634500340453",
  appId: "1:634500340453:web:75641ec2eb46c5003fd20c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let targetOwnerId = null;

async function initPortfolioView() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('user');

    if (!slug) {
        document.body.innerHTML = '<div style="font-family:sans-serif; text-align:center; padding:50px; color:#64748b;">Error: No portfolio identifier specified in the routing link.</div>';
        return;
    }

    try {
        const slugSnap = await getDoc(doc(db, "slugs", slug));
        if (!slugSnap.exists()) {
            document.body.innerHTML = '<div style="font-family:sans-serif; text-align:center; padding:50px; color:#64748b;">Error 404: Portfolio Profile Routing Link Matrix not found.</div>';
            return;
        }

        targetOwnerId = slugSnap.data().ownerId;
        const portfolioSnap = await getDoc(doc(db, "portfolios", targetOwnerId));

        if (portfolioSnap.exists()) {
            const data = portfolioSnap.data();
            
            if (data.isMaintenanceActive) {
                document.body.innerHTML = '<div style="font-family:sans-serif; text-align:center; padding:50px; color:#ef4444; font-weight:bold;">🔒 Under Maintenance. This portfolio is temporarily offline for analytical optimization configurations.</div>';
                return;
            }

            renderCompiledTemplate(data);
            incrementViewCounter(targetOwnerId);
        }
    } catch (err) {
        console.error("Critical Execution Context Interrupted:", err);
    }
}

function renderCompiledTemplate(data) {
    // Dynamic injection targets ko check karke unka layout dynamically change karega
    const themeClass = data.theme || 't1';
    
    // Pure body ko canvas container layout mein map kar dega matching dashboard specs
    document.body.innerHTML = `
        <div class="action-bar" id="actionBar" style="display: flex; justify-content: flex-end; padding: 15px 40px; background: #fff; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 100;">
            <button id="downloadPdfBtn" style="background: #0f172a; color: #fff; padding: 10px 20px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px;">
                Download CV as PDF
            </button>
        </div>
        <div style="display:flex; justify-content:center; padding:40px 20px; background:#e2e8f0; min-height:100vh;">
            <div id="portfolioContent" class="portfolio-canvas canvas-${themeClass}" style="width: 100%; max-width: 750px; background: #fff; min-height: 900px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border-radius: 4px; padding: 35px; box-sizing: border-box; transition: all 0.3s ease;">
                <!-- Target Injected via Canvas Spec Logic -->
            </div>
        </div>
    `;

    const canvas = document.getElementById('portfolioContent');
    const name = data.name || 'Your Full Name';
    const role = data.title || 'Professional Title Architecture';
    const about = data.bio || 'Brief profile statement and objectives summary payload line.';
    const email = data.email || 'your@domain.com';
    const phone = data.phone || '+91 0000000000';
    const location = data.location || 'City, India';
    const avatarImgSrc = data.avatar || "https://via.placeholder.com/150";

    // 1. Process New Skills Format (Data Structure Correction)
    let skillsHTML = '';
    if (data.skills) {
        data.skills.split(',').forEach(sk => {
            const parts = sk.split(':');
            if(parts[0]) {
                const percent = parts[1] || '90';
                skillsHTML += `<div style="margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; font-size:12px; color:inherit;">
                        <span><strong>${parts[0]}</strong></span><span>${percent}%</span>
                    </div>
                    <div class="bar-skill" style="background:rgba(0,0,0,0.1); height:8px; border-radius:4px; margin-top:5px; width:100%; overflow:hidden;">
                        <div class="bar-fill" style="width:${percent}%; height:100%;"></div>
                    </div>
                </div>`;
            }
        });
    }

    // 2. Process Experiences Array Loop Transformation
    let expHTML = '';
    if (data.experiences && data.experiences.length) {
        data.experiences.forEach(ex => {
            if(ex.title) {
                expHTML += `<div style="margin-bottom:12px; text-align:left;">
                    <strong style="font-size:14px; display:block; color:inherit;">${ex.title}</strong>
                    <span style="font-size:12px; opacity:0.8;">${ex.timeline || ''}</span>
                </div>`;
            }
        });
    } else {
        expHTML = '<p style="font-size:12px; color:#64748b; font-style:italic;">No milestones recorded.</p>';
    }

    // 3. Process Showcase Projects
    let projectsHTML = '';
    if (data.projects && data.projects.length) {
        data.projects.forEach(p => {
            if(p.title) {
                projectsHTML += `<div class="p-card" style="background:rgba(0,0,0,0.02); padding:12px; border-radius:8px; margin-bottom:8px; border-left:4px solid currentColor;">
                    <h4 style="font-size:14px; margin-bottom:3px; color:inherit;">${p.title}</h4>
                    <p style="font-size:12px; opacity:0.8; line-height:1.4; color:inherit; margin:0;">${p.description || ''}</p>
                </div>`;
            }
        });
    } else {
        projectsHTML = '<p style="font-size:12px; color:#64748b; font-style:italic;">No projects deployed.</p>';
    }

    // T1 se T9 tak exact framework layouts logic binding
    if (themeClass === 't1') {
        canvas.innerHTML = `
            <div class="left-col" style="width: 40%; background: #e6e6e6; padding: 25px; border-right: 1px dotted #999;">
                <img src="${avatarImgSrc}" style="width:90px; height:90px; border-radius:50%; object-fit:cover; margin-bottom:15px; border:2px solid #fff;">
                <h3 style="font-size:14px; margin-bottom:8px; border-bottom:1px solid #bbb; color:#111;">IDENTITY INFO</h3>
                <p style="font-size:12px; line-height:1.6; margin-bottom:20px; color:#333;">📍 ${location}<br>📞 ${phone}<br>✉️ ${email}</p>
                <h3 style="font-size:14px; margin-bottom:8px; border-bottom:1px solid #bbb; color:#111;">CAPABILITIES</h3>
                ${skillsHTML}
            </div>
            <div class="right-col" style="width: 60%; padding: 25px; color:#333;">
                <div class="header-block" style="background:#fffde6; padding:20px; margin:-25px -25px 25px -25px;">
                    <h1 style="font-family:Georgia, serif; font-size:28px; margin:0;">${name}</h1>
                    <p style="letter-spacing:1px; font-size:13px; color:#475569; font-weight:600; margin-top:2px;">${role}</p>
                </div>
                <h3 style="font-size:14px; margin-bottom:10px; border-bottom:1px solid #bbb; color:#111;">TIMELINE TRACK</h3>${expHTML}
                <h3 style="font-size:14px; margin-top:20px; margin-bottom:10px; border-bottom:1px solid #bbb; color:#111;">SHOWCASE NODES</h3>${projectsHTML}
            </div>`;
        canvas.style.display = "flex";
        canvas.style.padding = "0";
        canvas.style.background = "#f4f4f4";
        canvas.querySelectorAll('.bar-fill').forEach(el => el.style.background = "#f59e0b");
    } 
    else if (themeClass === 't2') {
        canvas.innerHTML = `
            <div class="left-strip" style="width:35%; background:#1e3a8a; color:#fff; padding:25px; display:flex; flex-direction:column;">
                <img src="${avatarImgSrc}" style="width:80px; height:80px; border-radius:50%; object-fit:cover; margin-bottom:20px; border:2px solid #fff;">
                <h2 style="font-size:22px; color:#38bdf8; margin-bottom:25px;">RESUME</h2>
                <h3 style="font-size:13px; color:#38bdf8; margin-bottom:10px; border:none;">SKILLS MATRIX</h3>${skillsHTML}
                <div style="margin-top:auto; font-size:11px; opacity:0.9; line-height:1.7;">
                    <p><strong>Contact Matrix:</strong></p><p>${email}</p><p>${phone}</p><p>${location}</p>
                </div>
            </div>
            <div class="right-strip" style="width:65%; padding:30px; color:#1e293b;">
                <h1 style="color:#1e3a8a; font-size:32px; margin:0;">${name}</h1><p style="color:#06b6d4; font-weight:600; margin-bottom:15px; font-size:15px;">${role}</p>
                <h3 style="color:#1e3a8a; font-size:14px; margin-bottom:6px;">EXECUTIVE STATEMENT</h3><p style="font-size:13px; color:#475569; margin-bottom:20px; line-height:1.5;">${about}</p>
                <h3 style="color:#1e3a8a; font-size:14px; margin-bottom:10px;">EXPERIENCE TRACK</h3>${expHTML}
                <h3 style="color:#1e3a8a; font-size:14px; margin-top:15px; margin-bottom:10px;">PROJECT SHOWCASE</h3>${projectsHTML}
            </div>`;
        canvas.style.display = "flex";
        canvas.style.padding = "0";
        canvas.querySelectorAll('.bar-fill').forEach(el => el.style.background = "#38bdf8");
    }
    else if (themeClass === 't3') {
        canvas.innerHTML = `
            <div class="header-t3" style="display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #3b82f6; padding-bottom:15px; margin-bottom:20px; color:#444;">
                <div><h1 style="color:#1d4ed8; font-size:30px; margin:0;">${name}</h1><p style="font-size:15px; color:#3b82f6; font-weight:600; margin:0;">${role}</p></div>
                <div style="text-align:right; font-size:12px; color:#64748b; line-height:1.5;"><p style="margin:0;">✉️ ${email}</p><p style="margin:0;">📞 ${phone}</p><p style="margin:0;">📍 ${location}</p></div>
            </div>
            <p style="font-size:13px; color:#475569; margin-bottom:20px; font-style:italic;">${about}</p>
            <div class="grid-2" style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:20px;">
                <div><div class="section-h" style="background:#3b82f6; color:white; padding:6px 12px; margin-bottom:15px; font-size:13px; text-transform:uppercase; font-weight:600;">Work Milestones</div>${expHTML}</div>
                <div><div class="section-h" style="background:#3b82f6; color:white; padding:6px 12px; margin-bottom:15px; font-size:13px; text-transform:uppercase; font-weight:600;">Skills Architecture</div>${skillsHTML}<div class="section-h" style="background:#3b82f6; color:white; padding:6px 12px; margin-bottom:15px; font-size:13px; text-transform:uppercase; font-weight:600; margin-top:15px;">Pipeline Projects</div>${projectsHTML}</div>
            </div>`;
        canvas.querySelectorAll('.bar-fill').forEach(el => el.style.background = "#3b82f6");
    }
    else if (themeClass === 't4') {
        canvas.innerHTML = `
            <div class="top-head" style="background:#f7fafc; padding:25px; border-radius:8px; text-align:center; margin-bottom:25px; border-top:5px solid #4a5568;">
                <img src="${avatarImgSrc}" style="width:75px; height:75px; border-radius:50%; object-fit:cover; margin-bottom:10px; border:2px solid #cbd5e1;">
                <h1 style="font-size:28px; color:#2d3748; margin:0;">${name}</h1><p style="font-size:15px; color:#4a5568; font-weight:500; margin-top:3px;">${role}</p>
                <p style="font-size:12px; color:#718096; margin-top:5px;">✉️ ${email} | 📞 ${phone} | 📍 ${location}</p>
            </div>
            <div class="main-layout" style="display:grid; grid-template-columns:2fr 1fr; gap:25px; color:#2d3748;">
                <div><h3 style="border-bottom:2px solid #cbd5e1; padding-bottom:5px; margin-bottom:15px; color:#4a5568; font-size:15px; text-transform:uppercase;">Professional Journey</h3>${expHTML}<h3 style="border-bottom:2px solid #cbd5e1; padding-bottom:5px; margin-bottom:15px; color:#4a5568; font-size:15px; text-transform:uppercase; margin-top:20px;">Interactive Showcase</h3>${projectsHTML}</div>
                <div><h3 style="border-bottom:2px solid #cbd5e1; padding-bottom:5px; margin-bottom:15px; color:#4a5568; font-size:15px; text-transform:uppercase;">Core Competencies</h3>${skillsHTML}<h3 style="border-bottom:2px solid #cbd5e1; padding-bottom:5px; margin-bottom:15px; color:#4a5568; font-size:15px; text-transform:uppercase; margin-top:20px;">Profile Brief</h3><p style="font-size:12px; color:#4a5568; line-height:1.6;">${about}</p></div>
            </div>`;
        canvas.querySelectorAll('.bar-fill').forEach(el => el.style.background = "#4a5568");
    }
    else if (themeClass === 't5') {
        canvas.innerHTML = `
            <div class="top-teal" style="background:#06b6d4; color:white; padding:30px; display:flex; justify-content:space-between; align-items:center;">
                <div><h1 style="font-size:32px; color:white; margin:0;">${name}</h1><p style="font-size:15px; opacity:0.9; margin-top:4px; margin:0;">${role}</p></div>
                <div style="text-align:right; font-size:12px; opacity:0.9;"><p style="margin:0;">${email}</p><p style="margin:0;">${phone}</p><p style="margin:0;">${location}</p></div>
            </div>
            <div class="main-body" style="padding:30px; display:grid; grid-template-columns:1fr 1fr; gap:25px; color:#334155;">
                <div><h3 style="color:#06b6d4; border-bottom:1px solid #e2e8f0; padding-bottom:5px; margin-bottom:15px; text-transform:uppercase; font-size:14px;">Abstract Bio</h3><p style="font-size:13px; line-height:1.5; margin-bottom:15px;">${about}</p><h3 style="color:#06b6d4; border-bottom:1px solid #e2e8f0; padding-bottom:5px; margin-bottom:15px; text-transform:uppercase; font-size:14px;">Professional Logging</h3>${expHTML}</div>
                <div><h3 style="color:#06b6d4; border-bottom:1px solid #e2e8f0; padding-bottom:5px; margin-bottom:15px; text-transform:uppercase; font-size:14px;">Skills Framework</h3>${skillsHTML}<h3 style="color:#06b6d4; border-bottom:1px solid #e2e8f0; padding-bottom:5px; margin-bottom:15px; text-transform:uppercase; font-size:14px; margin-top:20px;">Deployments Matrix</h3>${projectsHTML}</div>
            </div>`;
        canvas.style.padding = "0";
        canvas.querySelectorAll('.bar-fill').forEach(el => el.style.background = "#06b6d4");
    }
    else if (themeClass === 't6') {
        canvas.innerHTML = `
            <div class="header-area" style="display:flex; justify-content:space-between; padding-bottom:15px; border-bottom:2px solid #0284c7; color:#1e293b;">
                <div><h1 style="font-size:26px; color:#0284c7; margin:0;">${name}</h1><p style="font-size:14px; color:#64748b; margin:0;">${role}</p></div>
                <div style="text-align:right; font-size:11px; color:#475569; line-height:1.5;"><p style="margin:0;">✉️ ${email}</p><p style="margin:0;">📞 ${phone}</p><p style="margin:0;">📍 ${location}</p></div>
            </div>
            <div class="two-column" style="display:grid; grid-template-columns:1fr 1fr; gap:25px; margin-top:20px; color:#1e293b;">
                <div><h3 style="color:#0284c7; font-size:15px; margin-bottom:12px; text-transform:uppercase;">Employment Frameworks</h3>${expHTML}<h3 style="color:#0284c7; font-size:15px; margin-bottom:12px; text-transform:uppercase; margin-top:20px;">Project Showcase Portfolio</h3>${projectsHTML}</div>
                <div><h3 style="color:#0284c7; font-size:15px; margin-bottom:12px; text-transform:uppercase;">Executive Target Statement</h3><p style="font-size:12.5px; line-height:1.5; color:#475569; margin-bottom:15px;">${about}</p><h3 style="color:#0284c7; font-size:15px; margin-bottom:12px; text-transform:uppercase;">Expertise Level</h3>${skillsHTML}</div>
            </div>`;
        canvas.style.border = "12px solid #e2e8f0";
        canvas.querySelectorAll('.bar-fill').forEach(el => el.style.background = "#0284c7");
    }
    else if (themeClass === 't7') {
        canvas.innerHTML = `
            <h1 style="font-size:34px; color:white; font-weight:800; margin:0;">${name}</h1><p style="font-size:15px; opacity:0.9; margin-top:3px; color:white; margin-bottom:0;">${role}</p>
            <p style="font-size:12px; opacity:0.8; margin-top:4px; color:white;">✉️ ${email} • 📞 ${phone} • 📍 ${location}</p>
            <div class="inner-white-card" style="background:white; color:#1e293b; padding:25px; border-radius:8px; margin-top:20px;">
                <h3 style="margin-top:0; color:#2563eb; font-size:15px; margin-bottom:12px; border-bottom:2px solid #f1f5f9; padding-bottom:4px; text-transform:uppercase;">Profile Objective</h3><p style="font-size:13px; color:#475569; line-height:1.5; margin-bottom:15px;">${about}</p>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                    <div><h3 style="color:#2563eb; font-size:15px; margin-bottom:12px; border-bottom:2px solid #f1f5f9; padding-bottom:4px; text-transform:uppercase;">Experience Channels</h3>${expHTML}</div>
                    <div><h3 style="color:#2563eb; font-size:15px; margin-bottom:12px; border-bottom:2px solid #f1f5f9; padding-bottom:4px; text-transform:uppercase;">Capabilities Matrix</h3>${skillsHTML}<h3 style="color:#2563eb; font-size:15px; margin-bottom:12px; border-bottom:2px solid #f1f5f9; padding-bottom:4px; text-transform:uppercase; margin-top:15px;">Project Nodes</h3>${projectsHTML}</div>
                </div>
            </div>`;
        canvas.style.background = "#2563eb";
        canvas.querySelectorAll('.bar-fill').forEach(el => el.style.background = "#2563eb");
    }
    else if (themeClass === 't8') {
        canvas.innerHTML = `
            <div class="hero-section-t8" style="padding:30px; background:#111827; display:flex; align-items:center; justify-content:space-between; width:100%; box-sizing:border-box;">
                <div><h1 style="font-size:28px; color:white; margin:0;">${name}</h1><p style="color:#38bdf8; font-size:14px; font-weight:600; margin:0;">${role}</p></div>
                <div style="text-align:right; font-size:11px; opacity:0.8; line-height:1.5; color:white;"><p style="margin:0;">✉️ ${email}</p><p style="margin:0;">📞 ${phone}</p><p style="margin:0;">📍 ${location}</p></div>
            </div>
            <div class="content-grid" style="padding:30px; display:grid; grid-template-columns:repeat(3, 1fr); gap:20px; background:#1e3a8a; flex-grow:1; color:white;">
                <div><h3 style="border-bottom:1px solid rgba(255,255,255,0.2); padding-bottom:5px; margin-bottom:12px; font-size:14px; letter-spacing:1px; text-transform:uppercase;">Executive Brief</h3><p style="font-size:12px; line-height:1.5; opacity:0.9;">${about}</p></div>
                <div><h3 style="border-bottom:1px solid rgba(255,255,255,0.2); padding-bottom:5px; margin-bottom:12px; font-size:14px; letter-spacing:1px; text-transform:uppercase;">Journey Timeline</h3>${expHTML}</div>
                <div><h3 style="border-bottom:1px solid rgba(255,255,255,0.2); padding-bottom:5px; margin-bottom:12px; font-size:14px; letter-spacing:1px; text-transform:uppercase;">Expertise Grid</h3>${skillsHTML}<h3 style="border-bottom:1px solid rgba(255,255,255,0.2); padding-bottom:5px; margin-bottom:12px; font-size:14px; letter-spacing:1px; text-transform:uppercase; margin-top:15px;">Deployments</h3>${projectsHTML}</div>
            </div>`;
        canvas.style.padding = "0";
        canvas.style.display = "flex";
        canvas.style.flexDirection = "column";
        canvas.style.background = "#1e3a8a";
        canvas.querySelectorAll('.bar-fill').forEach(el => el.style.background = "#38bdf8");
    }
    else if (themeClass === 't9') {
        canvas.innerHTML = `
            <div class="hero-banner" style="padding:35px; display:flex; justify-content:space-between; align-items:center; background:radial-gradient(circle, #065f46 0%, #064e3b 100%); color:white;">
                <div><h1 style="font-size:34px; font-weight:900; color:#34d399; margin:0;">${name}</h1><p style="color:#a7f3d0; font-size:15px; margin:0; margin-top:3px;">${role}</p></div>
                <div style="text-align:right; font-size:12px; color:#a7f3d0; line-height:1.5;"><p style="margin:0;">📍 ${location}</p><p style="margin:0;">📞 ${phone}</p></div>
            </div>
            <div class="showcase-area" style="background:#ffffff; color:#111827; padding:35px; border-radius:25px 25px 0 0; flex-grow:1; display:grid; grid-template-columns:1fr 1fr; gap:25px;">
                <div><h3 style="color:#065f46; border-left:4px solid #34d399; padding-left:10px; margin-bottom:15px; font-size:15px; text-transform:uppercase;">Abstract Target Brief</h3><p style="font-size:12.5px; color:#374151; line-height:1.5; margin-bottom:15px;">${about}</p><h3 style="color:#065f46; border-left:4px solid #34d399; padding-left:10px; margin-bottom:15px; font-size:15px; text-transform:uppercase;">Work History Logging</h3>${expHTML}</div>
                <div><h3 style="color:#065f46; border-left:4px solid #34d399; padding-left:10px; margin-bottom:15px; font-size:15px; text-transform:uppercase;">Core Framework distribution</h3>${skillsHTML}<h3 style="color:#065f46; border-left:4px solid #34d399; padding-left:10px; margin-bottom:15px; font-size:15px; text-transform:uppercase; margin-top:20px;">Showcase Cards System</h3><div class="project-card-grid">${projectsHTML}</div></div>
             </div>`;
             
        canvas.style.padding = "0";
        canvas.style.display = "flex";
        canvas.style.flexDirection = "column";
        canvas.style.background = "#064e3b";
        canvas.querySelectorAll('.bar-fill').forEach(el => el.style.background = "#059669");
    }

    else if (themeClass === 't10') {

canvas.innerHTML = `

<div style="
display:flex;
height:100%;
min-height:900px;
background:white;
">

<div style="
width:220px;
background:#163b70;
color:white;
padding:30px;
display:flex;
flex-direction:column;
align-items:center;
">

<img src="${avatarImgSrc}"
style="
width:120px;
height:120px;
border-radius:50%;
object-fit:cover;
border:4px solid white;
margin-bottom:25px;
">

<h2 style="
writing-mode:vertical-rl;
font-size:28px;
letter-spacing:4px;
margin-top:40px;
">
RESUME
</h2>

</div>

<div style="
flex:1;
padding:40px;
color:#333;
">

<h1 style="
font-size:42px;
margin:0;
color:#163b70;
">
${name}
</h1>

<h3 style="
margin-top:5px;
color:#666;
font-weight:500;
">
${role}
</h3>

<hr>

<h3>ABOUT ME</h3>
<p>${about}</p>

<h3>SKILLS</h3>
${skillsHTML}

<h3>EXPERIENCE</h3>
${expHTML}

<h3>PROJECTS</h3>
${projectsHTML}

<h3>CONTACT</h3>

<p>📧 ${email}</p>
<p>📞 ${phone}</p>
<p>📍 ${location}</p>

</div>

</div>
`;

canvas.style.padding = "0";
canvas.style.background = "#ffffff";

canvas.querySelectorAll('.bar-fill')
.forEach(el=>{
el.style.background="#163b70";
});

}
else if (themeClass === 't11') {

canvas.innerHTML = `

<div style="
display:flex;
min-height:900px;
background:white;
">

<div style="
width:280px;
background:#8b5cf6;
color:white;
padding:35px;
">

<img src="${avatarImgSrc}"
style="
width:140px;
height:140px;
border-radius:50%;
object-fit:cover;
border:5px solid white;
display:block;
margin:auto;
">

<h2 style="
text-align:center;
margin-top:20px;
margin-bottom:5px;
">
${name}
</h2>

<p style="
text-align:center;
opacity:0.9;
">
${role}
</p>

<hr>

<h3>CONTACT</h3>

<p>📧 ${email}</p>
<p>📞 ${phone}</p>
<p>📍 ${location}</p>

<hr>

<h3>SKILLS</h3>

${skillsHTML}

</div>

<div style="
flex:1;
padding:40px;
color:#333;
">

<h2 style="color:#8b5cf6;">
ABOUT ME
</h2>

<p>${about}</p>

<h2 style="
color:#8b5cf6;
margin-top:30px;
">
EXPERIENCE
</h2>

${expHTML}

<h2 style="
color:#8b5cf6;
margin-top:30px;
">
PROJECTS
</h2>

${projectsHTML}

</div>

</div>

`;

canvas.style.padding = "0";

canvas.querySelectorAll('.bar-fill')
.forEach(el=>{
el.style.background="#8b5cf6";
});

}else if (themeClass === 't12') {

canvas.innerHTML = `

<div style="background:white;min-height:900px;">

<div style="
background:#0ea5e9;
padding:30px;
color:white;
display:flex;
align-items:center;
gap:20px;
">

<img src="${avatarImgSrc}"
style="
width:120px;
height:120px;
border-radius:50%;
object-fit:cover;
border:4px solid white;
">

<div>
<h1>${name}</h1>
<h3>${role}</h3>
</div>

</div>

<div style="
display:grid;
grid-template-columns:1fr 1fr;
gap:30px;
padding:30px;
">

<div>

<h3>EDUCATION</h3>

${projectsHTML}

<h3 style="margin-top:30px;">
SKILLS
</h3>

${skillsHTML}

</div>

<div>

<h3>EXPERIENCE</h3>

${expHTML}

<h3 style="margin-top:30px;">
ABOUT
</h3>

<p>${about}</p>

</div>

</div>

<div style="
padding:20px 30px;
border-top:1px solid #ddd;
">

📧 ${email}
📞 ${phone}
📍 ${location}

</div>

</div>

`;

canvas.style.padding = "0";

canvas.querySelectorAll('.bar-fill')
.forEach(el=>{
el.style.background="#0ea5e9";
});

}

else if (themeClass === 'T13') {

canvas.innerHTML = `

<div style="
background:white;
padding:40px;
min-height:100vh;
">

<div style="
text-align:center;
margin-bottom:40px;
">

<img src="${avatarImgSrc}"
style="
width:140px;
height:140px;
border-radius:50%;
object-fit:cover;
border:6px solid #38bdf8;
">

<h1>${name}</h1>

<h3 style="color:#38bdf8;">
${role}
</h3>

</div>

<div style="
display:grid;
grid-template-columns:1fr 1fr;
gap:40px;
">

<div>

<h2 style="color:#38bdf8;">
🎓 Education
</h2>

${projectsHTML}

<h2 style="
margin-top:30px;
color:#38bdf8;
">
⭐ Skills
</h2>

${skillsHTML}

</div>

<div>

<h2 style="color:#38bdf8;">
💼 Experience
</h2>

${expHTML}

<h2 style="
margin-top:30px;
color:#38bdf8;
">
👤 About
</h2>

<p>${about}</p>

</div>

</div>

<div style="
margin-top:40px;
padding-top:20px;
border-top:2px solid #e2e8f0;
display:flex;
justify-content:space-between;
">

<span>📧 ${email}</span>

<span>📞 ${phone}</span>

<span>📍 ${location}</span>

</div>

</div>

`;

canvas.style.padding = "0";

canvas.querySelectorAll('.bar-fill')
.forEach(el=>{
el.style.background="#38bdf8";
});

}

    // Attach PDF compilation listener independently
    const pdfBtn = document.getElementById('downloadPdfBtn');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', () => {
            const element = document.getElementById('portfolioContent');
            const opt = {
                margin:       [10, 10, 10, 10],
                filename:     `${name.replace(/\s+/g, '-')}-CV.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, logging: false },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
        });
    }
}

async function incrementViewCounter(uid) {
    const docRef = doc(db, "portfolios", uid);
    try {
        await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(docRef);
            if (sfDoc.exists()) {
                const newViews = (sfDoc.data().views || 0) + 1;
                transaction.update(docRef, { views: newViews });
            }
        });
    } catch (e) { console.error("Telemetry failure: ", e); }
}

window.addEventListener('DOMContentLoaded', initPortfolioView);
