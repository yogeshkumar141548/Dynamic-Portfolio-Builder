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
let cropper = null; // Active cropping tracking reference variables logic

// GitHub pages path directory prefix automated adjustments logic mapping
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
const imageInput = document.getElementById('imageInput');
const uploadStatus = document.getElementById('uploadStatus');
const dashAvatarPreview = document.getElementById('dashAvatarPreview');
const prevAvatar = document.getElementById('prevAvatar');

// HUD popup nodes declarations updates pointers
const cropPopupOverlay = document.getElementById('cropPopupOverlay');
const cropRawImageTarget = document.getElementById('cropRawImageTarget');

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        cropRawImageTarget.src = event.target.result;
        cropPopupOverlay.style.display = 'flex'; // Triggers display workspace HUD open

        if (cropper) {
            cropper.destroy();
        }

        // Lock boundaries strictly to circular aspect ratio parameters (1:1 standard grids)
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

// Crop handler buttons trigger bindings maps parameters securely
document.getElementById('btnExecuteCrop').addEventListener('click', () => {
    if (cropper) {
        const canvas = cropper.getClippedCanvas({
            width: 280,
            height: 280
        });

        if (canvas) {
            uploadedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
            dashAvatarPreview.src = uploadedImageUrl;
            prevAvatar.src = uploadedImageUrl;
            
            uploadStatus.innerText = "Local circular cropping parameters synchronized successfully.";
            uploadStatus.style.color = "#10b981";
        }
        
        cropper.destroy();
        cropper = null;
        cropPopupOverlay.style.display = 'none';
    }
});

document.getElementById('btnCancelCrop').addEventListener('click', () => {
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    cropPopupOverlay.style.display = 'none';
    imageInput.value = ""; // Erases staging stream indices parameters
    uploadStatus.innerText = "Staging cancelled.";
    uploadStatus.style.color = "#ef4444";
});


document.getElementById('addProjectBtn').addEventListener('click', () => { addProjectFieldGroup(); });
document.getElementById('addExpBtn').addEventListener('click', () => { addExperienceFieldGroup(); });
document.getElementById('addEduBtn').addEventListener('click', () => { addEducationFieldGroup(); });
document.getElementById('addCertBtn').addEventListener('click', () => { addCertFieldGroup(); });

// Global structural dynamically generated node templates builders loop links securely
window.removeFieldNode = function(btn) {
    if(btn && btn.parentElement) {
        btn.parentElement.remove();
    }
};

function addEducationFieldGroup(data = {degree:'', school:'', duration:''}) {
    const div = document.createElement('div'); div.className = 'entry-box';
    div.innerHTML = `<input type="text" class="edu-degree" placeholder="Degree / Qualification (e.g., BCA)" value="${data.degree}" required><input type="text" class="edu-school" placeholder="Institution / University Name" value="${data.school}" required><input type="text" class="edu-duration" placeholder="Duration Frame (e.g., 2023 - 2026)" value="${data.duration}" required><button type="button" class="btn-danger" style="padding:2px 6px; font-size:11px; position:absolute; top:10px; right:10px; border-radius:3px;" onclick="removeFieldNode(this)">X</button>`;
    educationContainer.appendChild(div);
}

function addCertFieldGroup(data = {title:'', issuer:''}) {
    const div = document.createElement('div'); div.className = 'entry-box';
    div.innerHTML = `<input type="text" class="cert-title" placeholder="Certification / License Title" value="${data.title}" required><input type="text" class="cert-issuer" placeholder="Issuing Authority" value="${data.issuer}" required><button type="button" class="btn-danger" style="padding:2px 6px; font-size:11px; position:absolute; top:10px; right:10px; border-radius:3px;" onclick="removeFieldNode(this)">X</button>`;
    certsContainer.appendChild(div);
}

function addExperienceFieldGroup(data = {role:'', company:'', duration:'', desc:''}) {
    const div = document.createElement('div'); div.className = 'entry-box';
    div.innerHTML = `<input type="text" class="exp-role" placeholder="Job Title" value="${data.role}" required><input type="text" class="exp-company" placeholder="Company Name" value="${data.company}" required><input type="text" class="exp-duration" placeholder="Duration" value="${data.duration}" required><textarea class="exp-desc" placeholder="Job Responsibilities">${data.desc}</textarea><button type="button" class="btn-danger" style="padding:2px 6px; font-size:11px; position:absolute; top:10px; right:10px; border-radius:3px;" onclick="removeFieldNode(this)">X</button>`;
    experienceContainer.appendChild(div);
}

function addProjectFieldGroup(data = {title:'', cat:'', link:'', desc:''}) {
    const div = document.createElement('div'); div.className = 'entry-box';
    div.innerHTML = `<input type="text" class="proj-title" placeholder="Project Title" value="${data.title}" required><input type="text" class="proj-category" placeholder="Category" value="${data.cat}" required><input type="url" class="proj-link" placeholder="Repository URL" value="${data.link}"><textarea class="proj-desc" placeholder="Component Details">${data.desc}</textarea><button type="button" class="btn-danger" style="padding:2px 6px; font-size:11px; position:absolute; top:10px; right:10px; border-radius:3px;" onclick="removeFieldNode(this)">X</button>`;
    projectsContainer.appendChild(div);
}

form.addEventListener('input', () => {
    document.getElementById('prevName').innerText = document.getElementById('fullName').value;
    document.getElementById('prevTitle').innerText = document.getElementById('jobTitle').value;
    document.getElementById('prevBio').innerText = document.getElementById('bio').value;
    const skillsContainer = document.getElementById('prevSkills');
    skillsContainer.innerHTML = '';
    document.getElementById('techSkills').value.split(',').forEach(s => {
        if(s.trim()) {
            const b = document.createElement('span'); b.className = 'badge'; b.innerText = s.trim();
            skillsContainer.appendChild(b);
        }
    });
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUid) return;
    const sBtn = document.getElementById('submitFormBtn');
    sBtn.innerText = "Synchronizing data configuration payload lines..."; sBtn.disabled = true;

    const slug = document.getElementById('customSlug').value.toLowerCase().replace(/[^a-z0-9.-]/g, "");

    const payload = {
        isMaintenanceActive: document.getElementById('maintenanceToggle').checked,
        theme: document.getElementById('themeSelect').value,
        slug: slug,
        avatar: uploadedImageUrl || dashAvatarPreview.src || "https://via.placeholder.com/150",
        name: document.getElementById('fullName').value.trim(),
        title: document.getElementById('jobTitle').value.trim(),
        bio: document.getElementById('bio').value.trim(),
        phone: document.getElementById('phoneNumber').value.trim(),
        publicEmail: document.getElementById('publicEmail').value.trim(),
        location: document.getElementById('location').value.trim(),
        linkedin: document.getElementById('linkedinUrl').value.trim(),
        github: document.getElementById('githubUrl').value.trim(),
        twitter: document.getElementById('twitterUrl').value.trim(),
        techSkills: document.getElementById('techSkills').value.split(',').map(s=>s.trim()).filter(s=>s.length > 0),
        coreCompetencies: document.getElementById('coreCompetencies').value.split(',').map(s=>s.trim()).filter(s=>s.length > 0),
        education: Array.from(document.querySelectorAll('#educationContainer .entry-box')).map(edu => ({ degree: edu.querySelector('.edu-degree').value, school: edu.querySelector('.edu-school').value, duration: edu.querySelector('.edu-duration').value })),
        experiences: Array.from(document.querySelectorAll('#experienceContainer .entry-box')).map(e => ({ role: e.querySelector('.exp-role').value, company: e.querySelector('.exp-company').value, duration: e.querySelector('.exp-duration').value, desc: e.querySelector('.exp-desc').value })),
        certifications: Array.from(document.querySelectorAll('#certsContainer .entry-box')).map(c => ({ title: c.querySelector('.cert-title').value, issuer: c.querySelector('.cert-issuer').value })),
        projects: Array.from(document.querySelectorAll('#projectsContainer .entry-box')).map(p => ({ title: p.querySelector('.proj-title').value, category: p.querySelector('.proj-category').value, link: p.querySelector('.proj-link').value, desc: p.querySelector('.proj-desc').value }))
    };

    try {
        await setDoc(doc(db, "portfolios", currentUid), payload, { merge: true });
        await setDoc(doc(db, "slugs", slug), { uid: currentUid });
        
        const liveLink = document.getElementById('livePortfolioLink');
        liveLink.href = getPortfolioUrl(slug);
        liveLink.style.display = 'block';

        sBtn.innerText = "Update & Save Portfolio Data";
        document.getElementById('systemModeBanner').style.display = 'block';

        alert("Portfolio parameters synchronized cleanly!");
    } catch (err) { 
        console.error("Database Save Failure:", err); 
        alert("Sync error. Check Firestore connections configurations layers.");
    } finally {
        sBtn.disabled = false;
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
            document.getElementById('publicEmail').value = d.publicEmail || '';
            document.getElementById('location').value = d.location || '';
            
            document.getElementById('linkedinUrl').value = d.linkedin || '';
            document.getElementById('githubUrl').value = d.github || '';
            document.getElementById('twitterUrl').value = d.twitter || '';

            document.getElementById('techSkills').value = d.techSkills ? d.techSkills.join(', ') : '';
            document.getElementById('coreCompetencies').value = d.coreCompetencies ? d.coreCompetencies.join(', ') : '';
            document.getElementById('totalViews').innerText = d.viewsCount || 0;
            
            if (d.avatar && d.avatar !== "https://via.placeholder.com/150") {
                uploadedImageUrl = d.avatar; dashAvatarPreview.src = d.avatar; prevAvatar.src = d.avatar;
            }

            if(d.recentVisits && d.recentVisits.length) document.getElementById('lastActive').innerText = new Date(d.recentVisits[d.recentVisits.length-1]).toLocaleString();
            
            educationContainer.innerHTML = '<h3>Academic Education History</h3>';
            if(d.education) { d.education.forEach(edu => addEducationFieldGroup(edu)); }

            experienceContainer.innerHTML = '<h3>Professional Experience Modules</h3>';
            if(d.experiences) { d.experiences.forEach(e => addExperienceFieldGroup(e)); }
            
            certsContainer.innerHTML = '<h3>Certifications & Technical Licenses</h3>';
            if(d.certifications) { d.certifications.forEach(c => addCertFieldGroup(c)); }

            projectsContainer.innerHTML = '<h3>Interactive Showcase Projects</h3>';
            if(d.projects) { d.projects.forEach(p => addProjectFieldGroup({title:p.title, cat:p.category, link:p.link, desc:p.desc})); }
            
            if(d.slug) {
                const liveLink = document.getElementById('livePortfolioLink');
                liveLink.href = getPortfolioUrl(d.slug);
                liveLink.style.display = 'block';
                document.getElementById('submitFormBtn').innerText = "Update & Save Portfolio Data";
                document.getElementById('systemModeBanner').style.display = 'block';
            }
            form.dispatchEvent(new Event('input'));
        }
    } catch (err) { console.error("Data Fetch Error:", err); }
}

function streamRecruiterMessages(uid) {
    const qBox = query(collection(db, "messages"), where("portfolioOwnerId", "==", uid), orderBy("timestamp", "desc"));
    onSnapshot(qBox, (snap) => {
        const container = document.getElementById('messagesInboxContainer');
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

document.getElementById('logoutBtn').addEventListener('click', () => { signOut(auth).then(()=> window.location.href="index.html"); });
      
