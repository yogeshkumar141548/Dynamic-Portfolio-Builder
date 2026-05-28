import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const urlParams = new URLSearchParams(window.location.search);
const userIdParam = urlParams.get('id');
const userSlugParam = urlParams.get('user');
let targetUid = null;

async function initializeRouting() {
    if (userSlugParam) {
        const slugSnap = await getDoc(doc(db, "slugs", userSlugParam.trim().toLowerCase()));
        if (slugSnap.exists()) {
            targetUid = slugSnap.data().ownerId;
        } else {
            renderErrorSplash("Selected custom domain router configuration link not verified on active networks.");
            return;
        }
    } else if (userIdParam) {
        targetUid = userIdParam;
    }

    if (targetUid) {
        await updateDoc(doc(db, "portfolios", targetUid), { views: increment(1) }).catch(() => {});
        fetchAndBuildPortfolio(targetUid);
    } else {
        renderErrorSplash("Identity mapping argument structural query arrays missing from link access layer.");
    }
}

async function fetchAndBuildPortfolio(uid) {
    try {
        const snapshot = await getDoc(doc(db, "portfolios", uid));
        if (snapshot.exists()) {
            const data = snapshot.data();
            if (data.isMaintenanceActive) {
                renderErrorSplash("🚧 This portfolio node is currently under active structural maintenance optimizations. Please retry later.");
                return;
            }
            buildDOM(data);
            setupContactForm(uid);
        } else {
            renderErrorSplash("The requested profile asset structure database cluster does not match any current nodes.");
        }
    } catch (err) {
        console.error(err);
        renderErrorSplash("Infrastructural execution timeout fault handling database parameters.");
    }
}

// Global Core DOM Rendering Pipeline Framework
function buildDOM(d) {
    // --- FIXED: THEME CLASS DYNAMICALLY ENFORCED ON THE BODY CONTAINER ---
    if (d.theme) {
        document.body.className = d.theme;
    } else {
        document.body.className = 'theme-light';
    }
    
    // Core Parameters Toggling visibility natively if empty
    const avatarFrame = document.getElementById('portfolioAvatar');
    if(d.avatar) { avatarFrame.src = d.avatar; } else { avatarFrame.style.display = 'none'; }

    const nameNode = document.getElementById('ownerName');
    if(d.name) { nameNode.innerText = d.name; document.title = `${d.name} | Professional Identity Matrix`; } else { nameNode.style.display = 'none'; }
    
    const titleNode = document.getElementById('ownerTitle');
    if(d.title) { titleNode.innerText = d.title; } else { titleNode.style.display = 'none'; }

    const locNode = document.getElementById('ownerLocation');
    if(d.location) { locNode.innerHTML = `📍 ${d.location}`; } else { locNode.style.display = 'none'; }

    const bioNode = document.getElementById('ownerBio');
    if(d.bio) { bioNode.innerText = d.bio; } else { bioNode.style.display = 'none'; }

    // Dynamic Context Channels Toggles
    const emNode = document.getElementById('metaEmail');
    if(d.email) { emNode.innerText = d.email; emNode.href = `mailto:${d.email}`; } else { document.getElementById('emailRow')?.remove(); }
    
    const phNode = document.getElementById('metaPhone');
    if(d.phone) { phNode.innerText = d.phone; phNode.href = `tel:${d.phone}`; } else { document.getElementById('phoneRow')?.remove(); }

    const liNode = document.getElementById('linkLinkedin');
    if(d.linkedin) { liNode.href = d.linkedin; } else { liNode?.remove(); }

    const ghNode = document.getElementById('linkGithub');
    if(d.github) { ghNode.href = d.github; } else { ghNode?.remove(); }

    const twNode = document.getElementById('linkTwitter');
    if(d.twitter) { twNode.href = d.twitter; } else { twNode?.remove(); }

    // Skills Badges Array Processing
    const sGroup = document.getElementById('techSkillsContainer');
    if (sGroup) {
        sGroup.innerHTML = '';
        if (d.skills && d.skills.trim() !== "") {
            d.skills.split(',').forEach(s => {
                if(s.trim() === "") return;
                const span = document.createElement('span'); span.className = 'skill-badge-item'; span.innerText = s.trim();
                sGroup.appendChild(span);
            });
        } else {
            document.querySelector('.skills-card-aside')?.remove();
        }
    }

    // Education Modules
    const eduBox = document.getElementById('educationTimeline');
    if (eduBox) {
        eduBox.innerHTML = '';
        if (d.education && d.education.length > 0) {
            d.education.forEach(e => {
                const block = document.createElement('div'); block.className = 'timeline-node-block';
                block.innerHTML = `<h5>${e.degree}</h5><p class="institution-meta-str">${e.institute}</p><span class="node-duration-span">${e.timeline}</span>`;
                eduBox.appendChild(block);
            });
        } else {
            document.querySelector('.education-card-aside')?.remove();
        }
    }

    // Experience Cards
    const expBox = document.getElementById('experienceTimeline');
    if (expBox) {
        expBox.innerHTML = '';
        if (d.experiences && d.experiences.length > 0) {
            d.experiences.forEach(ex => {
                const block = document.createElement('div'); block.className = 'timeline-node-block';
                block.innerHTML = `<h5>${ex.role}</h5><p class="institution-meta-str">${ex.company}</p><span class="node-duration-span">${ex.timeline}</span><p style="margin-top:10px; font-size:14px; line-height:1.6; white-space:pre-wrap;">${ex.description}</p>`;
                expBox.appendChild(block);
            });
        } else {
            document.querySelector('.experience-card')?.remove();
        }
    }

    // Projects Engineering Arrays
    const pGrid = document.getElementById('projectsGrid');
    if (pGrid) {
        pGrid.innerHTML = '';
        if (d.projects && d.projects.length > 0) {
            const categories = new Set(['all']);
            d.projects.forEach(p => {
                categories.add(p.category.trim());
                const card = document.createElement('div'); card.className = 'filter-item project-display-card'; card.setAttribute('data-cat', p.category.trim());
                card.innerHTML = `
                    <span class="project-tag-pill">${p.category}</span>
                    <h4>${p.title}</h4>
                    <p style="font-size:13.5px; line-height:1.5; color:var(--text-muted); flex-grow:1; white-space:pre-wrap;">${p.description}</p>
                    ${p.link ? `<a href="${p.link}" target="_blank" class="project-redirect-anchor">Execute Operations ↗</a>` : ''}
                `;
                pGrid.appendChild(card);
            });
            buildFilters(Array.from(categories));
        } else {
            document.querySelector('.projects-card')?.remove();
        }
    }
}

function buildFilters(cats) {
    const fBox = document.getElementById('dynamicFilters');
    if (fBox) {
        fBox.innerHTML = '';
        cats.forEach(c => {
            const btn = document.createElement('button'); btn.className = 'filter-trigger-btn' + (c === 'all' ? ' active-filter' : ''); btn.innerText = c.toUpperCase(); btn.setAttribute('data-target', c);
            fBox.appendChild(btn);
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-trigger-btn').forEach(b => b.classList.remove('active-filter'));
                e.target.classList.add('active-filter');
                const cat = e.target.getAttribute('data-target');
                document.querySelectorAll('.filter-item').forEach(item => {
                    item.style.display = (cat === 'all' || item.getAttribute('data-cat') === cat) ? 'flex' : 'none';
                });
            });
        });
    }
}

function setupContactForm(ownerUid) {
    document.getElementById('contactForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const ack = document.getElementById('contactAck');
        ack.innerText = "Transmitting message..."; ack.style.color = "var(--accent)";
        try {
            await addDoc(collection(db, "messages"), {
                portfolioOwnerId: ownerUid, name: document.getElementById('senderName').value, email: document.getElementById('senderEmail').value, message: document.getElementById('senderMsg').value, timestamp: serverTimestamp()
            });
            ack.style.color = '#10b981'; ack.innerText = "Message sent successfully!"; e.target.reset();
        } catch(err) { ack.style.color = '#dc2626'; ack.innerText = "Transmission failed. Please try again."; }
    });
}

function renderErrorSplash(msg) {
    document.body.innerHTML = `<div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; background:#f8fafc; font-family:sans-serif; padding:20px; text-align:center;"><div style="background:white; border:1px solid #e2e8f0; padding:40px; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.03); max-width:500px;"><h2 style="color:#0f172a; margin-top:0;">Portfolio Interface Management</h2><p style="color:#64748b; line-height:1.6; font-size:15px;">${msg}</p></div></div>`;
}

document.getElementById('downloadPdfBtn').addEventListener('click', () => {
    document.getElementById('actionBar').style.display = 'none';
    html2pdf().set({ margin: 0.3, filename: 'Portfolio.pdf', html2canvas: { scale: 2 } }).from(document.getElementById('portfolioContent')).save().then(() => { document.getElementById('actionBar').style.display = 'block'; });
});

initializeRouting();
