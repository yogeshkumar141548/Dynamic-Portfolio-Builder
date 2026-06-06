import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, orderBy, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyArb86FC6-vIX9OQ7ir1adDEmtc27Ksq4k",
  authDomain: "dynamic-portfolio-builde-11c0f.firebaseapp.com",
  projectId: "dynamic-portfolio-builde-11c0f",
  storageBucket: "dynamic-portfolio-builde-11c0f.firebasestorage.app",
  messagingSenderId: "634500340453",
  appId: "1:634500340453:web:75641ec2eb46c5003fd20c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUid = null;
let uploadedImageUrl = ""; 
let cropperInstance = null; // Statically locked global reference
let activeSelectedTheme = "t1";

function getPortfolioUrl(slug) {
    if (window.location.origin.includes("github.io")) {
        return `${window.location.origin}/Dynamic-Portfolio-Builder/portfolio.html?user=${slug}`;
    }
    return `portfolio.html?user=${slug}`;
}

onAuthStateChanged(auth, (user) => {
    if (user) { 
        currentUid = user.uid; 
        loadExistingUserData(currentUid); 
        streamRecruiterMessages(currentUid); 
    } else { 
        window.location.href = "index.html"; 
    }
});

// DOM TARGET LAYOUT ELEMENTS
const form = document.getElementById('portfolioForm');
const skillsInputsContainer = document.getElementById('skills-container-inputs');
const experienceContainer = document.getElementById('experienceContainer');
const projectsContainer = document.getElementById('projectsContainer');
const imageInput = document.getElementById('imageInput');
const uploadStatus = document.getElementById('uploadStatus');
const dashAvatarPreview = document.getElementById('dashAvatarPreview');
const cropPopupOverlay = document.getElementById('cropPopupOverlay');
const cropRawImageTarget = document.getElementById('cropRawImageTarget');

const templateCards = document.querySelectorAll('.template-card');
const proceedToFormBtn = document.getElementById('proceedToFormBtn');
const templateSelectionSection = document.getElementById('templateSelectionSection');
const dashboardDataWorkflowLayout = document.getElementById('dashboardDataWorkflowLayout');
const changeTemplateBtn = document.getElementById('changeTemplateBtn');

// STEP SWITCH ROUTINES
templateCards.forEach(card => {
    card.addEventListener('click', () => {
        templateCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        activeSelectedTheme = card.getAttribute('data-template');
        proceedToFormBtn.disabled = false;
    });
});

proceedToFormBtn.addEventListener('click', () => {
    templateSelectionSection.classList.add('hidden');
    dashboardDataWorkflowLayout.classList.remove('hidden');
    changeTemplateBtn.classList.remove('hidden');
    updateLivePreviewCanvas();
});

changeTemplateBtn.addEventListener('click', () => {
    dashboardDataWorkflowLayout.classList.add('hidden');
    changeTemplateBtn.classList.add('hidden');
    templateSelectionSection.classList.remove('hidden');
});

// DYNAMIC ROW GENERATORS
document.getElementById('addSkillRowBtn').addEventListener('click', () => { appendSkillInputRow(); });
document.getElementById('addExpBtn').addEventListener('click', () => { appendExperienceInputRow(); });
document.getElementById('addProjectBtn').addEventListener('click', () => { appendProjectInputRow(); });

window.removeFieldNode = function(btn) {
    if(btn && btn.parentElement) { 
        btn.parentElement.remove(); 
        updateLivePreviewCanvas();
    }
};

function appendSkillInputRow(data = {name: '', value: '90'}) {
    const div = document.createElement('div'); div.className = 'dynamic-row';
    div.innerHTML = `
        <input type="text" placeholder="Skill (e.g., HTML)" value="${data.name}" required style="flex-grow:1;">
        <input type="number" placeholder="%" value="${data.value}" min="0" max="100" style="width:75px;" required>
        <button type="button" class="btn-danger-node" onclick="removeFieldNode(this)">X</button>
    `;
    skillsInputsContainer.appendChild(div);
    div.querySelectorAll('input').forEach(i => i.addEventListener('input', updateLivePreviewCanvas));
}

function appendExperienceInputRow(data = {title: '', timeline: ''}) {
    const div = document.createElement('div'); div.className = 'dynamic-row'; div.style.flexDirection = 'column';
    div.innerHTML = `
        <input type="text" placeholder="Job Role / Company Context" value="${data.title}" required style="margin-bottom:5px;">
        <div style="display:flex; gap:10px; width:100%;">
            <input type="text" placeholder="Duration Frame" value="${data.timeline}" required style="flex-grow:1;">
            <button type="button" class="btn-danger-node" onclick="removeFieldNode(this)">Remove</button>
        </div>
    `;
    experienceContainer.appendChild(div);
    div.querySelectorAll('input').forEach(i => i.addEventListener('input', updateLivePreviewCanvas));
}

function appendProjectInputRow(data = {title: '', description: ''}) {
    const div = document.createElement('div'); div.className = 'dynamic-row'; div.style.flexDirection = 'column';
    div.innerHTML = `
        <input type="text" placeholder="Project Workspace Title" value="${data.title}" required style="margin-bottom:5px;">
        <div style="display:flex; gap:10px; width:100%;">
            <input type="text" placeholder="Short Framework Description" value="${data.description}" required style="flex-grow:1;">
            <button type="button" class="btn-danger-node" onclick="removeFieldNode(this)">Remove</button>
        </div>
    `;
    projectsContainer.appendChild(div);
    div.querySelectorAll('input').forEach(i => i.addEventListener('input', updateLivePreviewCanvas));
}

// REALTIME COMPILER CANVAS LOGIC MATCHING T1-T9 BLUEPRINTS
function updateLivePreviewCanvas() {
    const canvas = document.getElementById('portfolio-canvas');
    if(!canvas) return;
    canvas.className = `portfolio-canvas canvas-${activeSelectedTheme}`;

    const name = document.getElementById('fullName').value || 'Your Full Name';
    const role = document.getElementById('jobTitle').value || 'Professional Title Architecture';
    const about = document.getElementById('bio').value || 'Brief profile statement payloads.';
    const email = document.getElementById('publicEmail').value || 'your@domain.com';
    const phone = document.getElementById('phoneNumber').value || '+91 0000000000';
    const location = document.getElementById('location').value || 'City, India';
    const avatarImgSrc = uploadedImageUrl || dashAvatarPreview.src || "https://via.placeholder.com/150";

    let skillsHTML = '';
    document.querySelectorAll('#skills-container-inputs .dynamic-row').forEach(row => {
        const inputs = row.querySelectorAll('input');
        if(inputs[0] && inputs[0].value) {
            skillsHTML += `<div style="margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; font-size:12px;">
                    <span><strong>${inputs[0].value}</strong></span><span>${inputs[1].value}%</span>
                </div>
                <div class="bar-skill"><div class="bar-fill" style="width:${inputs[1].value}%"></div></div>
            </div>`;
        }
    });

    let expHTML = '';
    document.querySelectorAll('#experienceContainer .dynamic-row').forEach(row => {
        const inputs = row.querySelectorAll('input');
        if(inputs[0] && inputs[0].value) {
            expHTML += `<div style="margin-bottom:12px;">
                <strong style="font-size:14px; display:block; color:inherit;">${inputs[0].value}</strong>
                <span style="font-size:12px; opacity:0.8;">${inputs[1] ? inputs[1].value : ''}</span>
            </div>`;
        }
    });

    let projectsHTML = '';
    document.querySelectorAll('#projectsContainer .dynamic-row').forEach(row => {
        const inputs = row.querySelectorAll('input');
        if(inputs[0] && inputs[0].value) {
            projectsHTML += `<div class="p-card">
                <h4 style="font-size:14px; margin-bottom:3px;">${inputs[0].value}</h4>
                <p style="font-size:12px; opacity:0.8; line-height:1.4;">${inputs[1] ? inputs[1].value : ''}</p>
            </div>`;
        }
    });

    if (activeSelectedTheme === 't1') {
        canvas.innerHTML = `
            <div class="left-col">
                <img src="${avatarImgSrc}" style="width:90px; height:90px; border-radius:50%; object-fit:cover; margin-bottom:15px; border:2px solid #fff;">
                <h3 style="font-size:14px; margin-bottom:8px; border-bottom:1px solid #bbb;">IDENTITY INFO</h3>
                <p style="font-size:12px; line-height:1.6; margin-bottom:20px;">📍 ${location}<br>📞 ${phone}<br>✉️ ${email}</p>
                <h3 style="font-size:14px; margin-bottom:8px; border-bottom:1px solid #bbb;">CAPABILITIES</h3>
                ${skillsHTML}
            </div>
            <div class="right-col">
                <div class="header-block"><h1>${name}</h1><p style="letter-spacing:1px; font-size:13px; color:#475569; font-weight:600; margin-top:2px;">${role}</p></div>
                <h3 style="font-size:14px; margin-bottom:10px; border-bottom:1px solid #bbb;">TIMELINE TRACK</h3>${expHTML}
                <h3 style="font-size:14px; margin-top:20px; margin-bottom:10px; border-bottom:1px solid #bbb;">SHOWCASE NODES</h3>${projectsHTML}
            </div>`;
    } 
    else if (activeSelectedTheme === 't2') {
        canvas.innerHTML = `
            <div class="left-strip">
                <img src="${avatarImgSrc}" style="width:80px; height:80px; border-radius:50%; object-fit:cover; margin-bottom:20px; border:2px solid #fff;">
                <h2 style="font-size:22px; color:#38bdf8; margin-bottom:25px;">RESUME</h2>
                <h3 style="font-size:13px; color:#38bdf8; margin-bottom:10px; border:none;">SKILLS MATRIX</h3>${skillsHTML}
                <div style="margin-top:auto; font-size:11px; opacity:0.9; line-height:1.7;">
                    <p><strong>Contact Matrix:</strong></p><p>${email}</p><p>${phone}</p><p>${location}</p>
                </div>
            </div>
            <div class="right-strip">
                <h1>${name}</h1><p style="color:#06b6d4; font-weight:600; margin-bottom:15px; font-size:15px;">${role}</p>
                <h3 style="color:#1e3a8a; font-size:14px; margin-bottom:6px;">EXECUTIVE STATEMENT</h3><p style="font-size:13px; color:#475569; margin-bottom:20px; line-height:1.5;">${about}</p>
                <h3 style="color:#1e3a8a; font-size:14px; margin-bottom:10px;">EXPERIENCE TRACK</h3>${expHTML}
                <h3 style="color:#1e3a8a; font-size:14px; margin-top:15px; margin-bottom:10px;">PROJECT SHOWCASE</h3>${projectsHTML}
            </div>`;
    }
    else if (activeSelectedTheme === 't3') {
        canvas.innerHTML = `
            <div class="header-t3">
                <div><h1>${name}</h1><p style="font-size:15px; color:#3b82f6; font-weight:600;">${role}</p></div>
                <div style="text-align:right; font-size:12px; color:#64748b; line-height:1.5;"><p>✉️ ${email}</p><p>📞 ${phone}</p><p>📍 ${location}</p></div>
            </div>
            <p style="font-size:13px; color:#475569; margin-bottom:20px; font-style:italic;">${about}</p>
            <div class="grid-2">
                <div><div class="section-h">Work Milestones</div>${expHTML}</div>
                <div><div class="section-h">Skills Architecture</div>${skillsHTML}<div class="section-h" style="margin-top:15px;">Pipeline Projects</div>${projectsHTML}</div>
            </div>`;
    }
    else if (activeSelectedTheme === 't4') {
        canvas.innerHTML = `
            <div class="top-head">
                <img src="${avatarImgSrc}" style="width:75px; height:75px; border-radius:50%; object-fit:cover; margin-bottom:10px; border:2px solid #cbd5e1;">
                <h1>${name}</h1><p style="font-size:15px; color:#4a5568; font-weight:500; margin-top:3px;">${role}</p>
                <p style="font-size:12px; color:#718096; margin-top:5px;">✉️ ${email} | 📞 ${phone} | 📍 ${location}</p>
            </div>
            <div class="main-layout">
                <div><h3>Professional Journey</h3>${expHTML}<h3>Interactive Showcase</h3>${projectsHTML}</div>
                <div><h3>Core Competencies</h3>${skillsHTML}<h3>Profile Brief</h3><p style="font-size:12px; color:#4a5568; line-height:1.6;">${about}</p></div>
            </div>`;
    }
    else if (activeSelectedTheme === 't5') {
        canvas.innerHTML = `
            <div class="top-teal">
                <div><h1>${name}</h1><p style="font-size:15px; opacity:0.9; margin-top:4px;">${role}</p></div>
                <div style="text-align:right; font-size:12px; opacity:0.9;"><p>${email}</p><p>${phone}</p><p>${location}</p></div>
            </div>
            <div class="main-body">
                <div><h3>Abstract Bio</h3><p style="font-size:13px; line-height:1.5; margin-bottom:15px;">${about}</p><h3>Professional Logging</h3>${expHTML}</div>
                <div><h3>Skills Framework</h3>${skillsHTML}<h3 style="margin-top:20px;">Deployments Matrix</h3>${projectsHTML}</div>
            </div>`;
    }
    else if (activeSelectedTheme === 't6') {
        canvas.innerHTML = `
            <div class="header-area">
                <div><h1 style="font-size:26px; color:#0284c7;">${name}</h1><p style="font-size:14px; color:#64748b;">${role}</p></div>
                <div style="text-align:right; font-size:11px; color:#475569; line-height:1.5;"><p>${email}</p><p>${phone}</p><p>${location}</p></div>
            </div>
            <div class="two-column">
                <div><h3>Employment Frameworks</h3>${expHTML}<h3>Project Showcase Portfolio</h3>${projectsHTML}</div>
                <div><h3>Executive Target Statement</h3><p style="font-size:12.5px; line-height:1.5; color:#475569; margin-bottom:15px;">${about}</p><h3>Expertise Level</h3>${skillsHTML}</div>
            </div>`;
    }
    else if (activeSelectedTheme === 't7') {
        canvas.innerHTML = `
            <h1>${name}</h1><p style="font-size:15px; opacity:0.9; margin-top:3px;">${role}</p>
            <p style="font-size:12px; opacity:0.8; margin-top:4px;">✉️ ${email} • 📞 ${phone} • 📍 ${location}</p>
            <div class="inner-white-card">
                <h3 style="margin-top:0;">Profile Objective</h3><p style="font-size:13px; color:#475569; line-height:1.5; margin-bottom:15px;">${about}</p>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                    <div><h3>Experience Channels</h3>${expHTML}</div>
                    <div><h3>Capabilities Matrix</h3>${skillsHTML}<h3 style="margin-top:15px;">Project Nodes</h3>${projectsHTML}</div>
                </div>
            </div>`;
    }
    else if (activeSelectedTheme === 't8') {
        canvas.innerHTML = `
            <div class="hero-section-t8">
                <div><h1 style="font-size:28px;">${name}</h1><p style="color:#38bdf8; font-size:14px; font-weight:600;">${role}</p></div>
                <div style="text-align:right; font-size:11px; opacity:0.8; line-height:1.5;"><p>${email}</p><p>${phone}</p><p>${location}</p></div>
            </div>
            <div class="content-grid">
                <div><h3>Executive Brief</h3><p style="font-size:12px; line-height:1.5; opacity:0.9;">${about}</p></div>
                <div><h3>Journey Timeline</h3>${expHTML}</div>
                <div><h3>Expertise Grid</h3>${skillsHTML}<h3 style="margin-top:15px;">Deployments</h3>${projectsHTML}</div>
            </div>`;
    }
    else if (activeSelectedTheme === 't9') {
        canvas.innerHTML = `
            <div class="hero-banner">
                <div><h1>${name}</h1><p style="color:#a7f3d0; font-size:15px;">${role}</p></div>
                <div style="text-align:right; font-size:12px; color:#a7f3d0; line-height:1.5;"><p>📍 ${location}</p><p>${phone}</p></div>
            </div>
            <div class="showcase-area">
                <div><h3>Abstract Target Brief</h3><p style="font-size:12.5px; color:#374151; line-height:1.5; margin-bottom:15px;">${about}</p><h3>Work History Logging</h3>${expHTML}</div>
                <div><h3>Core Framework distribution</h3>${skillsHTML}<h3 style="margin-top:20px;">Showcase Cards System</h3><div class="project-card-grid">${projectsHTML}</div></div>
            </div>`;
    }
}

// 💥 THE 100% BULLETPROOF IMAGE CROPPING FLOW TRIGGER 💥
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0]; 
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        // Purane instances ko standard wipe-clean karega
        if (cropperInstance) { 
            cropperInstance.destroy(); 
            cropperInstance = null; 
        }
        
        cropRawImageTarget.src = event.target.result;
        cropPopupOverlay.style.display = 'flex';
        
        // Dynamic loading rendering calculations bypass fixed
        setTimeout(() => {
            cropperInstance = new Cropper(cropRawImageTarget, { 
                aspectRatio: 1, 
                viewMode: 1, 
                background: false, 
                autoCropArea: 0.9, 
                responsive: true
            });
        }, 100);
    };
    reader.readAsDataURL(file);
});

// Explicit element target handling to absolutely prevent sync drops
document.getElementById('btnExecuteCrop').onclick = function(e) {
    if(e) { e.preventDefault(); e.stopPropagation(); }
    
    if (cropperInstance) {
        // High quality data URL generation
       const canvas = cropperInstance.getCroppedCanvas({
    width: 280,
    height: 280,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high'
});
        if (canvas) {
            const rawBase64 = canvas.toDataURL('image/jpeg', 0.9);
            uploadedImageUrl = rawBase64;
            
            // Apply straight to DOM views without variables drop risk
            document.getElementById('dashAvatarPreview').src = rawBase64;
            
            uploadStatus.innerText = "✓ Staged crop image synchronized successfully."; 
            uploadStatus.style.color = "#10b981";
            
            // Refresh preview matrix layout
            updateLivePreviewCanvas();
        }
        cropperInstance.destroy(); 
        cropperInstance = null;
    }
    cropPopupOverlay.style.display = 'none';
};

document.getElementById('btnCancelCrop').onclick = function(e) {
    if(e) { e.preventDefault(); e.stopPropagation(); }
    if (cropperInstance) { 
        cropperInstance.destroy(); 
        cropperInstance = null; 
    }
    cropPopupOverlay.style.display = 'none'; 
    imageInput.value = ""; 
    uploadStatus.innerText = "Staging cancelled."; 
    uploadStatus.style.color = "#ef4444";
};

// FORM LIVE COMPILER TRIGGER EVENTS
form.addEventListener('input', updateLivePreviewCanvas);

// FIRESTORE SYNC & SAVE SYSTEM
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUid) return;
    const sBtn = document.getElementById('submitFormBtn');
    sBtn.innerText = "Saving profile config bundle..."; sBtn.disabled = true;

    const slug = document.getElementById('customSlug').value.toLowerCase().replace(/[^a-z0-9.-]/g, "");

    let skillsArray = [];
    document.querySelectorAll('#skills-container-inputs .dynamic-row').forEach(row => {
        const ins = row.querySelectorAll('input');
        if(ins[0] && ins[0].value) { skillsArray.push(`${ins[0].value}:${ins[1].value}`); }
    });

    const payload = {
        isMaintenanceActive: document.getElementById('maintenanceToggle').checked,
        theme: activeSelectedTheme, 
        slug: slug,
        avatar: uploadedImageUrl || dashAvatarPreview.src || "https://via.placeholder.com/150",
        name: document.getElementById('fullName').value.trim(),
        title: document.getElementById('jobTitle').value.trim(),
        bio: document.getElementById('bio').value.trim(),
        phone: document.getElementById('phoneNumber').value.trim(),
        email: document.getElementById('publicEmail').value.trim(), 
        location: document.getElementById('location').value.trim(),
        linkedin: document.getElementById('linkedinUrl').value.trim(),
        github: document.getElementById('githubUrl').value.trim(),
        twitter: document.getElementById('twitterUrl').value.trim(),
        skills: skillsArray.join(','), 
        experiences: Array.from(document.querySelectorAll('#experienceContainer .dynamic-row')).map(row => ({ title: row.querySelectorAll('input')[0].value, timeline: row.querySelectorAll('input')[1].value })),
        projects: Array.from(document.querySelectorAll('#projectsContainer .dynamic-row')).map(row => ({ title: row.querySelectorAll('input')[0].value, description: row.querySelectorAll('input')[1].value }))
    };

    try {
        await setDoc(doc(db, "portfolios", currentUid), payload, { merge: true });
        await setDoc(doc(db, "slugs", slug), { ownerId: currentUid }); 
        
        const liveLink = document.getElementById('livePortfolioLink');
        liveLink.href = getPortfolioUrl(slug); liveLink.style.display = 'block';

        sBtn.innerText = "Save & Publish Portfolio Cloud Data";
        document.getElementById('systemModeBanner').style.display = 'block';
        alert("Portfolio fields synchronized cleanly!");
    } catch (err) { 
        console.error(err); alert("Sync failure context interrupted.");
    } finally { sBtn.disabled = false; }
});

// LOAD DATA BACK CHANNELS
async function loadExistingUserData(uid) {
    try {
        const snap = await getDoc(doc(db, "portfolios", uid));
        if (snap.exists()) {
            const d = snap.data();
            document.getElementById('maintenanceToggle').checked = d.isMaintenanceActive || false;
            document.getElementById('customSlug').value = d.slug || '';
            
            if (d.theme) {
                activeSelectedTheme = d.theme;
                const targetCard = document.querySelector(`.template-card[data-template="${d.theme}"]`);
                if(targetCard) { targetCard.classList.add('active'); proceedToFormBtn.disabled = false; }
            }

            document.getElementById('fullName').value = d.name || '';
            document.getElementById('jobTitle').value = d.title || '';
            document.getElementById('bio').value = d.bio || '';
            document.getElementById('publicEmail').value = d.email || '';
            document.getElementById('phoneNumber').value = d.phone || '';
            document.getElementById('location').value = d.location || '';
            document.getElementById('linkedinUrl').value = d.linkedin || '';
            document.getElementById('githubUrl').value = d.github || '';
            document.getElementById('twitterUrl').value = d.twitter || '';
            document.getElementById('totalViews').innerText = d.views || 0;
            
            if (d.avatar && d.avatar !== "https://via.placeholder.com/150") {
                uploadedImageUrl = d.avatar; dashAvatarPreview.src = d.avatar;
            }
            if(d.recentVisits && d.recentVisits.length) {
                document.getElementById('lastActive').innerText = new Date(d.recentVisits[d.recentVisits.length-1]).toLocaleString();
            } else { document.getElementById('lastActive').innerText = "Active Now"; }

            skillsInputsContainer.innerHTML = '';
            if (d.skills) {
                d.skills.split(',').forEach(sk => {
                    const parts = sk.split(':');
                    if(parts[0]) appendSkillInputRow({name: parts[0], value: parts[1] || '90'});
                });
            } else { appendSkillInputRow(); }

            experienceContainer.innerHTML = '';
            if(d.experiences && d.experiences.length) {
                d.experiences.forEach(ex => appendExperienceInputRow({title: ex.title, timeline: ex.timeline}));
            } else { appendExperienceInputRow(); }

            projectsContainer.innerHTML = '';
            if(d.projects && d.projects.length) {
                d.projects.forEach(p => appendProjectInputRow({title: p.title, description: p.description}));
            } else { appendProjectInputRow(); }

            if(d.slug) {
                const liveLink = document.getElementById('livePortfolioLink');
                liveLink.href = getPortfolioUrl(d.slug); liveLink.style.display = 'block';
                document.getElementById('systemModeBanner').style.display = 'block';
            }
            updateLivePreviewCanvas();
        } else {
            appendSkillInputRow(); appendExperienceInputRow(); appendProjectInputRow();
            updateLivePreviewCanvas();
        }
    } catch (err) { console.error(err); }
}

function streamRecruiterMessages(uid) {
    const qBox = query(collection(db, "messages"), where("portfolioOwnerId", "==", uid), orderBy("timestamp", "desc"));
    onSnapshot(qBox, (snap) => {
        const container = document.getElementById('messagesInboxContainer'); container.innerHTML = '';
        if(snap.empty) { container.innerHTML = '<p style="font-size:12px; color:#64748b; font-style:italic; text-align:center;">Inbound mailbox clean.</p>'; return; }
        snap.forEach(mDoc => {
            const m = mDoc.data(); const div = document.createElement('div'); div.className = 'inbox-msg-card';
            div.innerHTML = `
                <div style="font-size:12px; display:flex; justify-content:space-between; border-bottom:1px dashed #e2e8f0; padding-bottom:4px;"><strong>${m.name}</strong><a href="mailto:${m.email}">${m.email}</a></div>
                <p style="margin:6px 0; font-size:12.5px; color:#334155;">${m.message}</p>
                <button style="background:none; border:none; color:#ef4444; font-size:11px; font-weight:600; cursor:pointer;" data-id="${mDoc.id}" class="purge-btn">🗑️ Purge Entry Record</button>
            `;
            div.querySelector('.purge-btn').addEventListener('click', async (e) => {
                if(confirm("Purge message?")) { await deleteDoc(doc(db, "messages", mDoc.id)); }
            });
            container.appendChild(div);
        });
    });
}

document.getElementById('logoutBtn').addEventListener('click', () => { signOut(auth).then(()=> window.location.href="index.html"); });
