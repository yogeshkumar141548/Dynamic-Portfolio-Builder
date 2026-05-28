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
let cropperInstance = null; 

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

// Real-time Preview Engine Hooks
const form = document.getElementById('portfolioForm');
form.addEventListener('input', () => {
    document.getElementById('prevName').innerText = document.getElementById('fullName').value || "Professional Name";
    document.getElementById('prevTitle').innerText = document.getElementById('jobTitle').value || "Headline Structure";
    document.getElementById('prevBio').innerText = document.getElementById('bio').value || "Summary framework context output canvas.";
});

// --- ADVANCED IMAGE CROPPING SYSTEM ENGINE HANDLERS ---
const avatarUploadInput = document.getElementById('avatarUpload');
const cropperModalOverlay = document.getElementById('cropperModalOverlay');
const cropperRawImageFrame = document.getElementById('cropperRawImageFrame');

avatarUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            cropperRawImageFrame.src = event.target.result;
            cropperModalOverlay.style.display = 'flex'; 

            if (cropperInstance) {
                cropperInstance.destroy();
            }

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

// Apply Crop Layout Operation handler
document.getElementById('btnExecuteCropOperation').addEventListener('click', () => {
    if (cropperInstance) {
        const canvas = cropperInstance.getClippedCanvas({
            width: 300,
            height: 300
        });

        if (canvas) {
            uploadedImageUrl = canvas.toDataURL('image/jpeg', 0.9); 
            document.getElementById('prevAvatar').src = uploadedImageUrl; 
        }
        
        cropperInstance.destroy();
        cropperInstance = null;
        cropperModalOverlay.style.display = 'none';
    }
});

// Cancel UI sequence handler
document.getElementById('btnCancelCropOperation').addEventListener('click', () => {
    if (cropperInstance) {
        cropperInstance.destroy();
        cropperInstance = null;
    }
    cropperModalOverlay.style.display = 'none';
    avatarUploadInput.value = ""; 
});


// Dynamic Injections Methods
function appendEducationNode(data = {}) {
    const parent = document.getElementById('educationContainer');
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

document.getElementById('addEducationBtn').addEventListener('click', () => appendEducationNode());
document.getElementById('addExperienceBtn').addEventListener('click', () => appendExperienceNode());
document.getElementById('addProjectBtn').addEventListener('click', () => appendProjectNode());

// Form Processing Submissions Engine
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

    const payload = {
        isMaintenanceActive: document.getElementById('maintenanceToggle').checked,
        theme: document.getElementById('themeSelect').value,
        slug: slug,
        avatar: uploadedImageUrl || document.getElementById('prevAvatar').src || "",
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
            alert("This Custom Routing URL slug is already mapped to another profile matrix. Please pick an alternative slug identifier string.");
            sBtn.innerText = "Save & Publish Portfolio Data"; sBtn.disabled = false;
            return;
        }

        await setDoc(doc(db, "portfolios", currentUid), payload, { merge: true });
        await setDoc(doc(db, "slugs", slug), { ownerId: currentUid });

        const liveLink = `${window.location.origin}/portfolio.html?user=${slug}`;
        const linkNode = document.getElementById('livePortfolioLink');
        linkNode.href = liveLink; linkNode.style.display = 'block';

        alert("Data Sync Successful. Cloud records operating in optimal integrity states.");
    } catch(err) {
        console.error("Transmission Error Cluster Detected:", err);
        alert("Transaction Aborted: Cloud system deployment encountered sync constraints.");
    } finally {
        sBtn.innerText = "Save & Publish Portfolio Data"; sBtn.disabled = false;
    }
});

async function fetchPortfolioData(uid) {
    try {
        const docSnap = await getDoc(doc(db, "portfolios", uid));
        if(docSnap.exists()) {
            const d = docSnap.data();
            document.getElementById('maintenanceToggle').checked = d.isMaintenanceActive || false;
            document.getElementById('themeSelect').value = d.theme || 'theme-light';
            document.getElementById('profileSlug').value = d.slug || '';
            if(d.avatar) { uploadedImageUrl = d.avatar; document.getElementById('prevAvatar').src = d.avatar; }
            document.getElementById('fullName').value = d.name || '';
            document.getElementById('jobTitle').value = d.title || '';
            document.getElementById('locationStr').value = d.location || '';
            document.getElementById('bio').value = d.bio || '';
            document.getElementById('contactEmail').value = d.email || '';
            document.getElementById('contactPhone').value = d.phone || '';
            document.getElementById('linkedinUrl').value = d.linkedin || '';
            document.getElementById('githubUrl').value = d.github || '';
            document.getElementById('twitterUrl').value = d.twitter || '';
            document.getElementById('techSkills').value = d.skills || '';
            document.getElementById('prevViews').innerText = d.views || 0;

            // Clear containers to prevent duplicate appends on refresh loops
            document.getElementById('educationContainer').innerHTML = '';
            document.getElementById('experienceContainer').innerHTML = '';
            document.getElementById('projectContainer').innerHTML = '';

            if(d.education) d.education.forEach(item => appendEducationNode(item));
            if(d.experiences) d.experiences.forEach(item => appendExperienceNode(item));
            if(d.projects) d.projects.forEach(item => appendProjectNode(item));

            if (d.slug) {
                const liveLink = `${window.location.origin}/portfolio.html?user=${d.slug}`;
                const linkNode = document.getElementById('livePortfolioLink');
                linkNode.href = liveLink; linkNode.style.display = 'block';
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
                if(confirm("Confirm deletion?")) { await deleteDoc(doc(db, "messages", mDoc.id)); }
            });
            container.appendChild(div);
        });
    });
}
