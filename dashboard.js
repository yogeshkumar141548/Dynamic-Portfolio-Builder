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
let cropper = null; 

let existingAvatarUrl = "https://via.placeholder.com/150";

function getPortfolioUrl(slug) {
    if (window.location.origin.includes("github.io")) {
        return `${window.location.origin}/Dynamic-Portfolio-Builder/portfolio.html?user=${slug}`;
    }
    return `portfolio.html?user=${slug}`;
}

onAuthStateChanged(auth, (user) => {
    if (user) { currentUid = user.uid; loadExistingUserData(currentUid); streamRecruiterMessages(currentUid); } 
    else { window.location.href = "index.html"; }
});

const form = document.getElementById('portfolioForm');
const projectsContainer = document.getElementById('projectsContainer');
const experienceContainer = document.getElementById('experienceContainer');
const educationContainer = document.getElementById('educationContainer');
const certsContainer = document.getElementById('certsContainer');
const skillsMatrixContainer = document.getElementById('skillsMatrixContainer');
const imageInput = document.getElementById('imageInput');
const uploadStatus = document.getElementById('uploadStatus');
const dashAvatarPreview = document.getElementById('dashAvatarPreview');
const prevAvatar = document.getElementById('prevAvatar');

const cropPopupOverlay = document.getElementById('cropPopupOverlay');
const cropRawImageTarget = document.getElementById('cropRawImageTarget');
const templateEngineSelect = document.getElementById('templateEngineSelect');
const matrixSectionFields = document.getElementById('matrixSectionFields');

// Dynamic Template Dropdown UI Handler Logic
templateEngineSelect.addEventListener('change', (e) => {
    if(e.target.value === 'matrix') {
        matrixSectionFields.style.display = 'block';
    } else {
        matrixSectionFields.style.display = 'none';
    }
});

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        cropRawImageTarget.src = event.target.result;
        cropPopupOverlay.style.display = 'flex'; 

        if (cropper) {
            cropper.destroy();
        }

        cropper = new Cropper(cropRawImageTarget, {
            aspectRatio: 1,
            viewMode: 1,
            background: false,
            autoCropArea: 1,
            responsive: true
        });
    };
    reader.readAsDataURL(file);
});

document.getElementById('btnExecuteCrop').addEventListener('click', () => {
    if (cropper) {
        const canvas = cropper.getClippedCanvas({ width: 300, height: 300 });
        if (canvas) {
            uploadedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
            dashAvatarPreview.src = uploadedImageUrl;
            prevAvatar.src = uploadedImageUrl;
            uploadStatus.innerText = "Image cropped successfully!";
            uploadStatus.style.color = "#10b981";
        }
        cropper.destroy(); cropper = null; cropPopupOverlay.style.display = 'none';
    }
});

document.getElementById('btnCancelCrop').addEventListener('click', () => {
    if (cropper) { cropper.destroy(); cropper = null; }
    cropPopupOverlay.style.display = 'none'; imageInput.value = "";
});

document.getElementById('addProjectBtn').addEventListener('click', () => { addProjectFieldGroup(); });
document.getElementById('addExpBtn').addEventListener('click', () => { addExperienceFieldGroup(); });
document.getElementById('addEduBtn').addEventListener('click', () => { addEducationFieldGroup(); });
document.getElementById('addCertBtn').addEventListener('click', () => { addCertFieldGroup(); });
document.getElementById('addMatrixSkillBtn').addEventListener('click', () => { addMatrixSkillFieldGroup(); });

window.removeFieldNode = function(btn) {
    if(btn && btn.parentElement) btn.parentElement.remove();
};

function addMatrixSkillFieldGroup(data = {name:'', percentage:'80'}) {
    const div = document.createElement('div'); div.className = 'entry-box';
    div.innerHTML = `<input type="text" class="mat-skill-name" placeholder="Skill Name (e.g. AutoCAD)" value="${data.name}" required><input type="number" class="mat-skill-pct" placeholder="Proficiency Percentage (e.g. 90)" min="1" max="100" value="${data.percentage}" required><button type="button" class="btn-danger" style="padding:2px 6px; font-size:11px; position:absolute; top:10px; right:10px;" onclick="removeFieldNode(this)">X</button>`;
    skillsMatrixContainer.appendChild(div);
}

function addEducationFieldGroup(data = {degree:'', school:'', duration:''}) {
    const div = document.createElement('div'); div.className = 'entry-box';
    div.innerHTML = `<input type="text" class="edu-degree" placeholder="Degree (e.g. BCA)" value="${data.degree}" required><input type="text" class="edu-school" placeholder="School/University" value="${data.school}" required><input type="text" class="edu-duration" placeholder="Duration (e.g. 2023 - 2026)" value="${data.duration}" required><button type="button" class="btn-danger" style="padding:2px 6px; font-size:11px; position:absolute; top:10px; right:10px;" onclick="removeFieldNode(this)">X</button>`;
    educationContainer.appendChild(div);
}

function addCertFieldGroup(data = {title:'', issuer:''}) {
    const div = document.createElement('div'); div.className = 'entry-box';
    div.innerHTML = `<input type="text" class="node-cert-title" placeholder="Certification Title" value="${data.title}" required><input type="text" class="node-cert-issuer" placeholder="Issuing Authority" value="${data.issuer}" required><button type="button" class="btn-danger" style="padding:2px 6px; font-size:11px; position:absolute; top:10px; right:10px;" onclick="removeFieldNode(this)">X</button>`;
    certsContainer.appendChild(div);
}

function addExperienceFieldGroup(data = {role:'', company:'', duration:'', desc:''}) {
    const div = document.createElement('div'); div.className = 'entry-box';
    div.innerHTML = `<input type="text" class="exp-role" placeholder="Job Title" value="${data.role}" required><input type="text" class="exp-company" placeholder="Company Name" value="${data.company}" required><input type="text" class="exp-duration" placeholder="Duration" value="${data.duration}" required><textarea class="exp-desc" placeholder="Responsibilities">${data.desc}</textarea><button type="button" class="btn-danger" style="padding:2px 6px; font-size:11px; position:absolute; top:10px; right:10px;" onclick="removeFieldNode(this)">X</button>`;
    experienceContainer.appendChild(div);
}

function addProjectFieldGroup(data = {title:'', category:'', link:'', desc:''}) {
    const div = document.createElement('div'); div.className = 'entry-box';
    div.innerHTML = `<input type="text" class="proj-title" placeholder="Project Title" value="${data.title || ''}" required><input type="text" class="proj-category" placeholder="Category" value="${data.category || data.cat || ''}" required><input type="url" class="proj-link" placeholder="Repository Link" value="${data.link || ''}"><textarea class="proj-desc" placeholder="Description">${data.desc || ''}</textarea><button type="button" class="btn-danger" style="padding:2px 6px; font-size:11px; position:absolute; top:10px; right:10px;" onclick="removeFieldNode(this)">X</button>`;
    projectsContainer.appendChild(div);
}

form.addEventListener('input', () => {
    document.getElementById('prevName').innerText = document.getElementById('fullName').value;
    document.getElementById('prevTitle').innerText = document.getElementById('jobTitle').value;
    document.getElementById('prevBio').innerText = document.getElementById('bio').value;
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUid) return;
    const sBtn = document.getElementById('submitFormBtn');
    sBtn.innerText = "Synchronizing data configuration blueprint..."; sBtn.disabled = true;
    const slug = document.getElementById('customSlug').value.toLowerCase().replace(/[^a-z0-9.-]/g, "");

    const payload = {
        isMaintenanceActive: document.getElementById('maintenanceToggle').checked,
        template: templateEngineSelect.value,
        theme: document.getElementById('themeSelect').value,
        slug: slug,
        avatar: uploadedImageUrl || existingAvatarUrl || "https://via.placeholder.com/150",
        name: document.getElementById('fullName').value.trim(),
        title: document.getElementById('jobTitle').value.trim(),
        bio: document.getElementById('bio').value.trim(),
        phone: document.getElementById('phoneNumber').value.trim(),
        email: document.getElementById('publicEmail').value.trim(), 
        location: document.getElementById('location').value.trim(),
        linkedin: document.getElementById('linkedinUrl').value.trim(),
        github: document.getElementById('githubUrl').value.trim(),
        twitter: document.getElementById('twitterUrl').value.trim(),
        skills: document.getElementById('techSkills').value.trim(), 
        coreCompetencies: document.getElementById('coreCompetencies').value.split(',').map(s=>s.trim()).filter(s=>s.length > 0),
        skillsMatrix: Array.from(document.querySelectorAll('#skillsMatrixContainer .entry-box')).map(el => ({ name: el.querySelector('.mat-skill-name').value, percentage: el.querySelector('.mat-skill-pct').value })),
        education: Array.from(document.querySelectorAll('#educationContainer .entry-box')).map(edu => ({ degree: edu.querySelector('.edu-degree').value, school: edu.querySelector('.edu-school').value, duration: edu.querySelector('.edu-duration').value })),
        experiences: Array.from(document.querySelectorAll('#experienceContainer .entry-box')).map(e => ({ role: e.querySelector('.exp-role').value, company: e.querySelector('.exp-company').value, duration: e.querySelector('.exp-duration').value, desc: e.querySelector('.exp-desc').value })),
        certifications: Array.from(document.querySelectorAll('#certsContainer .entry-box')).map(c => ({ title: c.querySelector('.node-cert-title').value, issuer: c.querySelector('.node-cert-issuer').value })),
        projects: Array.from(document.querySelectorAll('#projectsContainer .entry-box')).map(p => ({ title: p.querySelector('.proj-title').value, category: p.querySelector('.proj-category').value, link: p.querySelector('.proj-link').value, desc: p.querySelector('.proj-desc').value }))
    };

    try {
        await setDoc(doc(db, "portfolios", currentUid), payload, { merge: true });
        await setDoc(doc(db, "slugs", slug), { uid: currentUid });
        document.getElementById('livePortfolioLink').href = getPortfolioUrl(slug);
        document.getElementById('livePortfolioLink').style.display = 'block';
        alert("Portfolio parameters synchronized cleanly!");
    } catch (err) { console.error(err); } finally { sBtn.innerText = "Save & Publish Portfolio Data"; sBtn.disabled = false; }
});

async function loadExistingUserData(uid) {
    try {
        const snap = await getDoc(doc(db, "portfolios", uid));
        if (snap.exists()) {
            const d = snap.data();
            templateEngineSelect.value = d.template || 'minimalist';
            templateEngineSelect.dispatchEvent(new Event('change'));
            
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
            document.getElementById('totalViews').innerText = d.viewsCount || 0;
            
            if (d.avatar && d.avatar !== "https://via.placeholder.com/150") {
                uploadedImageUrl = d.avatar; existingAvatarUrl = d.avatar; dashAvatarPreview.src = d.avatar; prevAvatar.src = d.avatar;
            }

            skillsMatrixContainer.innerHTML = '';
            if(d.skillsMatrix) d.skillsMatrix.forEach(sm => addMatrixSkillFieldGroup(sm));

            educationContainer.innerHTML = '<h3>Academic Education History</h3>';
            if(d.education) d.education.forEach(edu => addEducationFieldGroup(edu));

            experienceContainer.innerHTML = '<h3>Professional Experience Modules</h3>';
            if(d.experiences) d.experiences.forEach(e => addExperienceFieldGroup(e));
            
            certsContainer.innerHTML = '<h3>Certifications & Technical Licenses</h3>';
            if(d.certifications) d.certifications.forEach(c => addCertFieldGroup(c));

            projectsContainer.innerHTML = '<h3>Interactive Showcase Projects</h3>';
            if(d.projects) d.projects.forEach(p => addProjectFieldGroup(p));
            
            if(d.slug) {
                document.getElementById('livePortfolioLink').href = getPortfolioUrl(d.slug);
                document.getElementById('livePortfolioLink').style.display = 'block';
            }
            form.dispatchEvent(new Event('input'));
        }
    } catch (err) { console.error(err); }
}

function streamRecruiterMessages(uid) {
    const qBox = query(collection(db, "messages"), where("portfolioOwnerId", "==", uid), orderBy("timestamp", "desc"));
    onSnapshot(qBox, (snap) => {
        const container = document.getElementById('messagesInboxContainer'); container.innerHTML = '';
        if(snap.empty) { container.innerHTML = '<p class="placeholder-text">Inbound mailbox clean.</p>'; return; }
        snap.forEach(mDoc => {
            const m = mDoc.data();
            const div = document.createElement('div'); div.className = 'inbox-msg-card';
            div.innerHTML = `<div class="msg-meta"><strong>${m.name}</strong><a href="mailto:${m.email}">${m.email}</a></div><p style="margin:8px 0; font-size:13px; color:#334155;">${m.message}</p><button class="btn-danger" style="padding:2px 6px; font-size:10px;" onclick="deleteDoc(doc(db, 'messages', '${mDoc.id}'))">Purge</button>`;
            container.appendChild(div);
        });
    });
}
document.getElementById('logoutBtn').addEventListener('click', () => { signOut(auth).then(()=> window.location.href="index.html"); });
