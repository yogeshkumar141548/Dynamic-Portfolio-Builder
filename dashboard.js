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
let uploadedImageUrl = ""; // क्रॉप की हुई नई इमेज का डेटा यहाँ रहेगा
let cropperInstance = null; 
let existingAvatarUrl = "https://via.placeholder.com/150"; // डेटाबेस से आई पुरानी इमेज

function generateLiveLink(slug) {
    const origin = window.location.origin;
    if (origin.includes("github.io")) {
        return `${origin}/Dynamic-Portfolio-Builder/portfolio.html?user=${slug}`;
    } else {
        return `${origin}/portfolio.html?user=${slug}`;
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUid = user.uid;
        document.getElementById('userEmailDisplay').innerText = user.email;
        fetchPortfolioData(user.uid);
        streamRecruiterMessages(user.uid);
    } else {
        window.location.href = "index.html";
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    signOut(auth).then(() => { window.location.href = "index.html"; });
});

const form = document.getElementById('portfolioForm');
if (form) {
    form.addEventListener('input', () => {
        if(document.getElementById('prevName')) document.getElementById('prevName').innerText = document.getElementById('fullName').value || "Professional Name";
        if(document.getElementById('prevTitle')) document.getElementById('prevTitle').innerText = document.getElementById('jobTitle').value || "Headline Structure";
        if(document.getElementById('prevBio')) document.getElementById('prevBio').innerText = document.getElementById('bio').value || "Summary framework context output canvas.";
    });
}

const avatarUploadInput = document.getElementById('avatarUpload');
const cropperModalOverlay = document.getElementById('cropperModalOverlay');
const cropperRawImageFrame = document.getElementById('cropperRawImageFrame');

if (avatarUploadInput) {
    avatarUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                cropperRawImageFrame.src = event.target.result;
                cropperModalOverlay.style.display = 'flex'; 

                if (cropperInstance) cropperInstance.destroy();

                cropperInstance = new Cropper(cropperRawImageFrame, {
                    aspectRatio: 1,
                    viewMode: 1,
                    background: false,
                    autoCropArea: 1,
                    responsive: true
                });
            };
            reader.readAsDataURL(file);
        }
    });
}

// यहाँ पर क्रॉप सेटिंग्स को लॉक किया जा रहा है और वैरिएबल अपडेट हो रहा है
const cropBtn = document.getElementById('btnExecuteCropOperation');
if (cropBtn) {
    cropBtn.addEventListener('click', () => {
        if (cropperInstance) {
            const canvas = cropperInstance.getClippedCanvas({ width: 300, height: 300 });
            if (canvas) {
                uploadedImageUrl = canvas.toDataURL('image/jpeg', 0.9); // क्रॉप किया हुआ डेटा सेव हुआ
                existingAvatarUrl = uploadedImageUrl; // डेटा ओवरराइड रोकने के लिए इसे भी अपडेट किया
                if(document.getElementById('prevAvatar')) document.getElementById('prevAvatar').src = uploadedImageUrl; 
            }
            cropperInstance.destroy();
            cropperInstance = null;
            cropperModalOverlay.style.display = 'none';
        }
    });
}

const cancelCropBtn = document.getElementById('btnCancelCropOperation');
if (cancelCropBtn) {
    cancelCropBtn.addEventListener('click', () => {
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
        cropperModalOverlay.style.display = 'none';
        avatarUploadInput.value = ""; 
    });
}

function appendEducationNode(data = {}) {
    const parent = document.getElementById('educationContainer');
    if (!parent) return;
    const div = document.createElement('div'); div.className = 'dynamic-item-row';
    div.innerHTML = `
        <div class="dynamic-fields-container">
            <div class="input-grid">
                <input type="text" class="edu-inst" placeholder="Institution / University" value="${data.institute || ''}">
                <input type="text" class="edu-deg" placeholder="Degree / Qualification" value="${data.degree || ''}">
                <input type="text" class="edu-time" placeholder="Timeline e.g., 2022 - 2026" value="${data.timeline || ''}">
            </div>
        </div>
        <button type="button" class="btn-remove-node">🗑️</button>
    `;
    div.querySelector('.btn-remove-node').addEventListener('click', () => div.remove());
    parent.appendChild(div);
}

function appendExperienceNode(data = {}) {
    const parent = document.getElementById('experienceContainer');
    if (!parent) return;
    const div = document.createElement('div'); div.className = 'dynamic-item-row';
    div.innerHTML = `
        <div class="dynamic-fields-container">
            <div class="input-grid">
                <input type="text" class="exp-comp" placeholder="Enterprise Name" value="${data.company || ''}">
                <input type="text" class="exp-role" placeholder="Designation Title" value="${data.role || ''}">
                <input type="text" class="exp-time" placeholder="Timeline e.g., 2025 - Present" value="${data.timeline || ''}">
                <textarea class="exp-desc" placeholder="Operational Milestones R&D Tasks">${data.description || ''}</textarea>
            </div>
        </div>
        <button type="button" class="btn-remove-node">🗑️</button>
    `;
    div.querySelector('.btn-remove-node').addEventListener('click', () => div.remove());
    parent.appendChild(div);
}

function appendProjectNode(data = {}) {
    const parent = document.getElementById('projectContainer');
    if (!parent) return;
    const div = document.createElement('div'); div.className = 'dynamic-item-row';
    div.innerHTML = `
        <div class="dynamic-fields-container">
            <div class="input-grid">
                <input type="text" class="proj-title" placeholder="Project Name / Nomenclature" value="${data.title || ''}">
                <input type="text" class="proj-cat" placeholder="Category e.g., Web App, Automation, CAD Model" value="${data.category || ''}">
                <input type="text" class="proj-link" placeholder="Repository Execution Live Deploy Link" value="${data.link || ''}">
                <textarea class="proj-desc" placeholder="Technical stack deployed, algorithms engineered...">${data.description || ''}</textarea>
            </div>
        </div>
        <button type="button" class="btn-remove-node">🗑️</button>
    `;
    div.querySelector('.btn-remove-node').addEventListener('click', () => div.remove());
    parent.appendChild(div);
}

if(document.getElementById('addEducationBtn')) document.getElementById('addEducationBtn').addEventListener('click', () => appendEducationNode());
if(document.getElementById('addExperienceBtn')) document.getElementById('addExperienceBtn').addEventListener('click', () => appendExperienceNode());
if(document.getElementById('addProjectBtn')) document.getElementById('addProjectBtn').addEventListener('click', () => appendProjectNode());

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const sBtn = document.getElementById('submitFormBtn');
        sBtn.innerText = "Transmitting Configurations to Cloud Matrix..."; sBtn.disabled = true;

        let rawSlug = document.getElementById('profileSlug').value.trim().toLowerCase();
        let slug = rawSlug.replace(/[^a-z0-9-_]/g, '-');
        if(!slug) slug = "portfolio-user";

        const education = [];
        document.querySelectorAll('#educationContainer .dynamic-item-row').forEach(row => {
            const inst = row.querySelector('.edu-inst').value.trim();
            if(inst) education.push({ institute: inst, degree: row.querySelector('.edu-deg').value.trim(), timeline: row.querySelector('.edu-time').value.trim() });
        });

        const experiences = [];
        document.querySelectorAll('#experienceContainer .dynamic-item-row').forEach(row => {
            const comp = row.querySelector('.exp-comp').value.trim();
            if(comp) experiences.push({ company: comp, role: row.querySelector('.exp-role').value.trim(), timeline: row.querySelector('.exp-time').value.trim(), description: row.querySelector('.exp-desc').value.trim() });
        });

        const projects = [];
        document.querySelectorAll('#projectContainer .dynamic-item-row').forEach(row => {
            const title = row.querySelector('.proj-title').value.trim();
            if(title) projects.push({ title: title, category: row.querySelector('.proj-cat').value.trim() || 'General', link: row.querySelector('.proj-link').value.trim(), description: row.querySelector('.proj-desc').value.trim() });
        });

        // सुधरा हुआ इमेज लॉजिक: अब क्रॉप की हुई इमेज ही डेटाबेस में जाएगी
        const finalAvatar = uploadedImageUrl || existingAvatarUrl || "";

        const payload = {
            isMaintenanceActive: document.getElementById('maintenanceToggle').checked,
            theme: document.getElementById('themeSelect').value,
            slug: slug,
            avatar: finalAvatar, 
            name: document.getElementById('fullName').value.trim(),
            title: document.getElementById('jobTitle').value.trim(),
            location: document.getElementById('locationStr').value.trim(),
            bio: document.getElementById('bio').value.trim(),
            email: document.getElementById('contactEmail').value.trim(),
            phone: document.getElementById('contactPhone').value.trim(),
            linkedin: document.getElementById('linkedinUrl').value.trim(),
            github: document.getElementById('githubUrl').value.trim(),
            twitter: document.getElementById('twitterUrl').value.trim(),
            skills: document.getElementById('techSkills').value.trim(),
            education,
            experiences,
            projects
        };

        try {
            const slugCheck = await getDoc(doc(db, "slugs", slug));
            if (slugCheck.exists() && slugCheck.data().ownerId !== currentUid) {
                alert("This Custom Routing URL slug is already mapped to another profile matrix.");
                sBtn.innerText = "Save & Publish Portfolio Data"; sBtn.disabled = false;
                return;
            }

            await setDoc(doc(doc(db, "portfolios", currentUid)), payload, { merge: true });
            await setDoc(doc(db, "slugs", slug), { ownerId: currentUid });

            const liveLink = generateLiveLink(slug);
            const linkNode = document.getElementById('livePortfolioLink');
            if (linkNode) { linkNode.href = liveLink; linkNode.style.display = 'block'; }

            alert("Data Sync Successful. Cloud records operating in optimal integrity states.");
        } catch(err) {
            console.error("Transmission Error Cluster Detected:", err);
            alert("Transaction Aborted: Cloud system deployment encountered sync constraints.");
        } finally { // 'finaly' स्पेलिंग मिस्टेक को 'finally' में सुधारा गया
            sBtn.innerText = "Save & Publish Portfolio Data"; sBtn.disabled = false;
        }
    });
}

async function fetchPortfolioData(uid) {
    try {
        const docSnap = await getDoc(doc(db, "portfolios", uid));
        if(docSnap.exists()) {
            const d = docSnap.data();
            if(document.getElementById('maintenanceToggle')) document.getElementById('maintenanceToggle').checked = d.isMaintenanceActive || false;
            if(document.getElementById('themeSelect')) document.getElementById('themeSelect').value = d.theme || 'theme-light';
            if(document.getElementById('profileSlug')) document.getElementById('profileSlug').value = d.slug || '';
            if(d.avatar) { 
                uploadedImageUrl = d.avatar; 
                existingAvatarUrl = d.avatar;
                if(document.getElementById('prevAvatar')) document.getElementById('prevAvatar').src = d.avatar; 
            }
            if(document.getElementById('fullName')) document.getElementById('fullName').value = d.name || '';
            if(document.getElementById('jobTitle')) document.getElementById('jobTitle').value = d.title || '';
            if(document.getElementById('locationStr')) document.getElementById('locationStr').value = d.location || '';
            if(document.getElementById('bio')) document.getElementById('bio').value = d.bio || '';
            if(document.getElementById('contactEmail')) document.getElementById('contactEmail').value = d.email || '';
            if(document.getElementById('contactPhone')) document.getElementById('contactPhone').value = d.phone || '';
            if(document.getElementById('linkedinUrl')) document.getElementById('linkedinUrl').value = d.linkedin || '';
            if(document.getElementById('githubUrl')) document.getElementById('githubUrl').value = d.github || '';
            if(document.getElementById('twitterUrl')) document.getElementById('twitterUrl').value = d.twitter || '';
            if(document.getElementById('techSkills')) document.getElementById('techSkills').value = d.skills || '';
            if(document.getElementById('prevViews')) document.getElementById('prevViews').innerText = d.views || 0;

            const eduCont = document.getElementById('educationContainer');
            const expCont = document.getElementById('experienceContainer');
            const projCont = document.getElementById('projectContainer');

            if(eduCont) eduCont.innerHTML = '';
            if(expCont) expCont.innerHTML = '';
            if(projCont) projCont.innerHTML = '';

            if(d.education) d.education.forEach(item => appendEducationNode(item));
            if(d.experiences) d.experiences.forEach(item => appendExperienceNode(item));
            if(d.projects) d.projects.forEach(item => appendProjectNode(item));

            if (d.slug) {
                const liveLink = generateLiveLink(d.slug);
                const linkNode = document.getElementById('livePortfolioLink');
                if (linkNode) { linkNode.href = liveLink; linkNode.style.display = 'block'; }
            }

            if (form) form.dispatchEvent(new Event('input'));
        }
    } catch (err) { console.error("Data Fetch Error:", err); }
}

function streamRecruiterMessages(uid) {
    const container = document.getElementById('messagesInboxContainer');
    if (!container) return;
    const qBox = query(collection(db, "messages"), where("portfolioOwnerId", "==", uid), orderBy("timestamp", "desc"));
    onSnapshot(qBox, (snap) => {
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
            div.querySelector('.btn-delete-msg').addEventListener('click', async () => {
                if(confirm("Confirm deletion?")) { await deleteDoc(doc(db, "messages", mDoc.id)); }
            });
            container.appendChild(div);
        });
    });
}
