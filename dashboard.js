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

onAuthStateChanged(auth, (user) => {
    // FIXED: GitHub Pages path redirection fixed
    if (user) { currentUid = user.uid; loadExistingUserData(currentUid); streamRecruiterMessages(currentUid); } 
    else { window.location.href = "./index.html"; }
});

const form = document.getElementById('portfolioForm');
const projectsContainer = document.getElementById('projectsContainer');
const experienceContainer = document.getElementById('experienceContainer');
const educationContainer = document.getElementById('educationContainer');
const certsContainer = document.getElementById('certsContainer');
const imageInput = document.getElementById('imageInput');
const uploadStatus = document.getElementById('uploadStatus');
const dashAvatarPreview = document.getElementById('dashAvatarPreview');
const prevAvatar = document.getElementById('prevAvatar');

// AUTOMATIC CANVAS IMAGE COMPRESSION ENGINE
imageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const localPreviewUrl = URL.createObjectURL(file);
    dashAvatarPreview.src = localPreviewUrl;
    if(prevAvatar) prevAvatar.src = localPreviewUrl;

    uploadStatus.innerText = "⚡ Processing and compressing image asset...";
    uploadStatus.style.color = "#2563eb";

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const MAX_WIDTH = 300;
            const MAX_HEIGHT = 300;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            } else {
                if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            uploadedImageUrl = canvas.toDataURL('image/jpeg', 0.6);
            
            dashAvatarPreview.src = uploadedImageUrl;
            if(prevAvatar) prevAvatar.src = uploadedImageUrl;
            
            uploadStatus.innerText = "✅ Image compressed successfully! Size optimized to safe zone.";
            uploadStatus.style.color = "#10b981";
        };
    };
    reader.readAsDataURL(file);
});

document.getElementById('addProjectBtn').addEventListener('click', () => { addProjectFieldGroup(); });
document.getElementById('addExpBtn').addEventListener('click', () => { addExperienceFieldGroup(); });
document.getElementById('addEduBtn').addEventListener('click', () => { addEducationFieldGroup(); });
document.getElementById('addCertBtn').addEventListener('click', () => { addCertFieldGroup(); });

function addEducationFieldGroup(data = {degree:'', school:'', duration:''}) {
    const div = document.createElement('div'); div.className = 'entry-box';
    div.innerHTML = `<input type="text" class="edu-degree" placeholder="Degree / Qualification (e.g., BCA)" value="${data.degree || ''}" required><input type="text" class="edu-school" placeholder="Institution / University Name" value="${data.school || data.institute || ''}" required><input type="text" class="edu-duration" placeholder="Duration Frame (e.g., 2023 - 2026)" value="${data.duration || data.timeline || ''}" required><button type="button" class="btn-danger" style="padding:2px 6px; font-size:11px; position:absolute; top:10px; right:10px; border-radius:3px;" onclick="this.parentElement.remove()">X</button>`;
    educationContainer.appendChild(div);
}

function addCertFieldGroup(data = {title:'', issuer:''}) {
    const div = document.createElement('div'); div.className = 'entry-box';
    div.innerHTML = `<input type="text" class="cert-title" placeholder="Certification / License Title" value="${data.title || ''}" required><input type="text" class="cert-issuer" placeholder="Issuing Authority" value="${data.issuer || ''}" required><button type="button" class="btn-danger" style="padding:2px 6px; font-size:11px; position:absolute; top:10px; right:10px; border-radius:3px;" onclick="this.parentElement.remove()">X</button>`;
    certsContainer.appendChild(div);
}

function addExperienceFieldGroup(data = {role:'', company:'', duration:'', desc:''}) {
    const div = document.createElement('div'); div.className = 'entry-box';
    div.innerHTML = `<input type="text" class="exp-role" placeholder="Job Title" value="${data.role || ''}" required><input type="text" class="exp-company" placeholder="Company Name" value="${data.company || ''}" required><input type="text" class="exp-duration" placeholder="Duration" value="${data.duration || data.timeline || ''}" required><textarea class="exp-desc" placeholder="Job Responsibilities">${data.desc || data.description || ''}</textarea><button type="button" class="btn-danger" style="padding:2px 6px; font-size:11px; position:absolute; top:10px; right:10px; border-radius:3px;" onclick="this.parentElement.remove()">X</button>`;
    experienceContainer.appendChild(div);
}

function addProjectFieldGroup(data = {title:'', cat:'', link:'', desc:''}) {
    const div = document.createElement('div'); div.className = 'entry-box';
    div.innerHTML = `<input type="text" class="proj-title" placeholder="Project Title" value="${data.title || ''}" required><input type="text" class="proj-category" placeholder="Category" value="${data.cat || data.category || ''}" required><input type="url" class="proj-link" placeholder="Repository URL" value="${data.link || ''}"><textarea class="proj-desc" placeholder="Component Details">${data.desc || data.description || ''}</textarea><button type="button" class="btn-danger" style="padding:2px 6px; font-size:11px; position:absolute; top:10px; right:10px; border-radius:3px;" onclick="this.parentElement.remove()">X</button>`;
    projectsContainer.appendChild(div);
}

form.addEventListener('input', () => {
    if(document.getElementById('prevName')) document.getElementById('prevName').innerText = document.getElementById('fullName').value;
    if(document.getElementById('prevTitle')) document.getElementById('prevTitle').innerText = document.getElementById('jobTitle').value;
    if(document.getElementById('prevBio')) document.getElementById('prevBio').innerText = document.getElementById('bio').value;
    const skillsContainer = document.getElementById('prevSkills');
    if(skillsContainer) {
        skillsContainer.innerHTML = '';
        document.getElementById('techSkills').value.split(',').forEach(s => {
            if(s.trim()) {
                const b = document.createElement('span'); b.className = 'badge'; b.innerText = s.trim();
                skillsContainer.appendChild(b);
            }
        });
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUid) return;
    
    const saveBtn = document.getElementById('submitFormBtn');
    saveBtn.innerText = "Synchronizing Data Matrix...";
    saveBtn.disabled = true;

    const slug = document.getElementById('customSlug').value.toLowerCase().replace(/[^a-z0-9.-]/g, "");
    const finalAvatar = uploadedImageUrl || dashAvatarPreview.src || "https://via.placeholder.com/150";

    const payload = {
        isMaintenanceActive: document.getElementById('maintenanceToggle').checked,
        theme: document.getElementById('themeSelect').value,
        slug: slug,
        avatar: finalAvatar,
        name: document.getElementById('fullName').value,
        title: document.getElementById('jobTitle').value,
        bio: document.getElementById('bio').value,
        phone: document.getElementById('phoneNumber').value.trim(),
        email: document.getElementById('publicEmail').value.trim(), 
        location: document.getElementById('location').value.trim(),
        linkedin: document.getElementById('linkedinUrl').value.trim(),
        github: document.getElementById('githubUrl').value.trim(),
        twitter: document.getElementById('twitterUrl').value.trim(),
        skills: document.getElementById('techSkills').value, 
        coreCompetencies: document.getElementById('coreCompetencies').value.split(',').map(s=>s.trim()).filter(s=>s.length > 0),
        education: Array.from(document.querySelectorAll('#educationContainer .entry-box')).map(edu => ({ 
            degree: edu.querySelector('.edu-degree').value, 
            institute: edu.querySelector('.edu-school').value, 
            timeline: edu.querySelector('.edu-duration').value 
        })),
        experiences: Array.from(document.querySelectorAll('#experienceContainer .entry-box')).map(e => ({ 
            role: e.querySelector('.exp-role').value, 
            company: e.querySelector('.exp-company').value, 
            timeline: e.querySelector('.exp-duration').value, 
            description: e.querySelector('.exp-desc').value 
        })),
        certifications: Array.from(document.querySelectorAll('#certsContainer .entry-box')).map(c => ({ 
            title: c.querySelector('.cert-title').value, 
            issuer: c.querySelector('.cert-issuer').value 
        })),
        projects: Array.from(document.querySelectorAll('#projectsContainer .entry-box')).map(p => ({ 
            title: p.querySelector('.proj-title').value, 
            category: p.querySelector('.proj-category').value, 
            link: p.querySelector('.proj-link').value, 
            description: p.querySelector('.proj-desc').value 
        }))
    };

    try {
        await setDoc(doc(db, "portfolios", currentUid), payload, { merge: true });
        await setDoc(doc(db, "slugs", slug), { ownerId: currentUid }); 
        
        const liveLink = document.getElementById('livePortfolioLink');
        if(liveLink) {
            liveLink.href = `portfolio.html?user=${slug}`;
            liveLink.style.display = 'block';
        }

        saveBtn.innerText = "Update & Save Portfolio Data";
        if(document.getElementById('systemModeBanner')) document.getElementById('systemModeBanner').style.display = 'block';

        alert("Portfolio parameters synchronized cleanly!");
    } catch (err) { 
        console.error("Database Save Failure:", err); 
        alert("Firestore Payload Size Overflow: Database entry dropped. Try uploading a compressed or smaller image!");
    } finally {
        saveBtn.disabled = false;
    }
});

async function loadExistingUserData(uid) {
    try {
        const snap = await getDoc(doc(db, "portfolios", uid));
        if (snap.exists()) {
            const d = snap.data();
            document.getElementById('maintenanceToggle').checked = d.isMaintenanceActive || false;
            document.getElementById('customSlug').value = d.slug || '';
            document.getElementById('themeSelect').value = d.theme || 'light';
            document.getElementById('fullName').value = d.name || '';
            document.getElementById('jobTitle').value = d.title || '';
            document.getElementById('bio').value = d.bio || '';
            
            document.getElementById('phoneNumber').value = d.phone || '';
            document.getElementById('publicEmail').value = d.email || '';
            document.getElementById('location').value = d.location || '';
            
            document.getElementById('linkedinUrl').value = d.linkedin || '';
            document.getElementById('githubUrl').value = d.github || '';
            document.getElementById('twitterUrl').value = d.twitter || '';

            document.getElementById('techSkills').value = d.skills || '';
            document.getElementById('coreCompetencies').value = d.coreCompetencies ? d.coreCompetencies.join(', ') : '';
            if(document.getElementById('totalViews')) document.getElementById('totalViews').innerText = d.views || 0;
            
            if (d.avatar && d.avatar !== "https://via.placeholder.com/150") {
                uploadedImageUrl = d.avatar; 
                dashAvatarPreview.src = d.avatar; 
                if(prevAvatar) prevAvatar.src = d.avatar;
            }
            
            educationContainer.innerHTML = '<h3>Academic Education History</h3>';
            if(d.education) { d.education.forEach(edu => addEducationFieldGroup(edu)); }

            experienceContainer.innerHTML = '<h3>Professional Experience Modules</h3>';
            if(d.experiences) { d.experiences.forEach(e => addExperienceFieldGroup(e)); }
            
            certsContainer.innerHTML = '<h3>Certifications & Technical Licenses</h3>';
            if(d.certifications) { d.certifications.forEach(c => addCertFieldGroup(c)); }

            projectsContainer.innerHTML = '<h3>Interactive Showcase Projects</h3>';
            if(d.projects) { d.projects.forEach(p => addProjectFieldGroup(p)); }
            
            if(d.slug) {
                const liveLink = document.getElementById('livePortfolioLink');
                if(liveLink) {
                    liveLink.href = `portfolio.html?user=${d.slug}`;
                    liveLink.style.display = 'block';
                }
                document.getElementById('submitFormBtn').innerText = "Update & Save Portfolio Data";
                if(document.getElementById('systemModeBanner')) document.getElementById('systemModeBanner').style.display = 'block';
            }
            form.dispatchEvent(new Event('input'));
        }
    } catch (err) { console.error("Data Fetch Error:", err); }
}

function streamRecruiterMessages(uid) {
    const qBox = query(collection(db, "messages"), where("portfolioOwnerId", "==", uid), orderBy("timestamp", "desc"));
    onSnapshot(qBox, (snap) => {
        const container = document.getElementById('messagesInboxContainer');
        if(!container) return;
        container.innerHTML = '';
        if(snap.empty) { container.innerHTML = '<p class="placeholder-text">Inbound mailbox clean.</p>'; return; }
        snap.forEach(mDoc => {
            const m = mDoc.data();
            const div = document.createElement('div'); div.className = 'inbox-msg-card';
            div.innerHTML = `
                <div class="msg-meta"><strong>${m.name}</strong><a href="mailto:${m.email}">${m.email}</a></div>
                <p style="margin:8px 0; font-size:13px; color:#334155;">${m.message}</p>
                <button class="btn-delete-msg" data-id="${mDoc.id}">🗑️ Purge Entry Record</button>
            `;
            div.querySelector('.btn-delete-msg').addEventListener('click', async (e) => {
                if(confirm("Confirm deletion?")) { await deleteDoc(doc(db, "messages", e.target.getAttribute('data-id'))); }
            });
            container.appendChild(div);
        });
    });
}

// FIXED: Logout relative path redirection fixed
document.getElementById('logoutBtn').addEventListener('click', () => { signOut(auth).then(()=> window.location.href="./index.html"); });