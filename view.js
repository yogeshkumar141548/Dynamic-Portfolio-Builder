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
        if (slugSnap.exists()) targetUid = slugSnap.data().uid;
    } else if (userIdParam) {
        targetUid = userIdParam;
    }

    if (targetUid) {
        await updateDoc(doc(db, "portfolios", targetUid), { viewsCount: increment(1) }).catch(() => {});
        fetchAndBuildPortfolio(targetUid);
    } else {
        renderErrorSplash("Portfolio routing parameter configuration is invalid or missing.");
    }
}

async function fetchAndBuildPortfolio(uid) {
    try {
        const snapshot = await getDoc(doc(db, "portfolios", uid));
        if (snapshot.exists()) {
            const data = snapshot.data();
            if (data.isMaintenanceActive) {
                document.body.innerHTML = `<div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; text-align:center; background:#0f172a; color:#f8fafc; font-family:sans-serif; padding:20px;"><h2>🚧 Node Under Maintenance</h2><p style="color:#94a3b8;">The profile dashboard owner is running deployment script optimizations.</p></div>`;
                return;
            }
            buildDOM(data);
            setupContactForm(uid);
        } else { renderErrorSplash("Profile document data node unverified."); }
    } catch (err) { console.error(err); renderErrorSplash("Handshake timeout across processing nodes."); }
}

function buildDOM(d) {
    // 1. Dynamic Master Template Class Binding Engine
    const currentTemplate = d.template || 'minimalist';
    document.body.className = `theme-${d.theme || 'light'} render-${currentTemplate}`;
    
    // Identity Synchronization
    const avatarFrame = document.getElementById('viewAvatar');
    if (d.avatar && d.avatar !== "https://via.placeholder.com/150" && d.avatar.trim() !== "") {
        avatarFrame.src = d.avatar;
    } else {
        avatarFrame.src = "https://via.placeholder.com/150";
        document.body.classList.add('has-no-image');
    }

    document.getElementById('viewName').innerText = d.name || 'Anonymous Portfolio';
    document.getElementById('viewTitle').innerText = d.title || '';
    document.getElementById('viewBio').innerText = d.bio || '';

    // Contact Details Engine Block Sync
    const contactInfoCard = document.getElementById('contactInfoCard');
    const contactDetailsBlock = document.getElementById('contactDetailsBlock');
    if (contactDetailsBlock) {
        contactDetailsBlock.innerHTML = '';
        let hasContact = false;
        if (d.email) { contactDetailsBlock.innerHTML += `<div class="contact-item"><i class="contact-icon">✉️</i> <a href="mailto:${d.email}">${d.email}</a></div>`; hasContact = true; }
        if (d.phone) { contactDetailsBlock.innerHTML += `<div class="contact-item"><i class="contact-icon">📞</i> <a href="tel:${d.phone}">${d.phone}</a></div>`; hasContact = true; }
        if (d.location) { contactDetailsBlock.innerHTML += `<div class="contact-item"><i class="contact-icon">📍</i> <span>${d.location}</span></div>`; hasContact = true; }
        if(contactInfoCard) contactInfoCard.style.display = hasContact ? 'block' : 'none';
    }

    // Social Links Render Deck
    const socialDeck = document.getElementById('viewSocialDeck');
    if (socialDeck) {
        socialDeck.innerHTML = '';
        if(d.linkedin) socialDeck.innerHTML += `<a href="${d.linkedin}" target="_blank" class="social-pill">LinkedIn</a>`;
        if(d.github) socialDeck.innerHTML += `<a href="${d.github}" target="_blank" class="social-pill">GitHub</a>`;
        if(d.twitter) socialDeck.innerHTML += `<a href="${d.twitter}" target="_blank" class="social-pill">Twitter/X</a>`;
    }

    // Template 3 Specific: Render Progress Bar Skill Metrics
    const skillsMatrixCard = document.getElementById('skillsMatrixCard');
    const skillsMatrixRenderBlock = document.getElementById('skillsMatrixRenderBlock');
    if(skillsMatrixRenderBlock) {
        skillsMatrixRenderBlock.innerHTML = '';
        if(currentTemplate === 'matrix' && d.skillsMatrix && d.skillsMatrix.length > 0) {
            skillsMatrixCard.style.display = 'block';
            d.skillsMatrix.forEach(sm => {
                skillsMatrixRenderBlock.innerHTML += `
                    <div class="matrix-skill-row">
                        <div class="matrix-skill-meta"><span>${sm.name}</span><span>${sm.percentage}%</span></div>
                        <div class="progress-bar-track"><div class="progress-bar-fill" style="width: ${sm.percentage}%"></div></div>
                    </div>`;
            });
        } else { skillsMatrixCard.style.display = 'none'; }
    }

    // Standard Array Compilers
    mapStringBadges(d.skills, 'techSkillsContainer', 'techSkillsCard');
    mapArrayBadges(d.coreCompetencies, 'coreCompetenciesContainer', 'coreCompCard');

    // Education Compiler
    const eduBlock = document.getElementById('educationViewBlock');
    const eduCardView = document.getElementById('eduCardView');
    if (eduBlock && eduCardView) {
        eduBlock.innerHTML = '';
        if (d.education && d.education.length > 0) {
            eduCardView.style.display = 'block';
            d.education.forEach(edu => {
                eduBlock.innerHTML += `<div class="list-item"><div class="list-title">${edu.degree}</div><div class="list-subtitle">${edu.school}</div><div class="list-meta">${edu.duration}</div></div>`;
            });
        } else { eduCardView.style.display = 'none'; }
    }

    // Certifications Compiler
    const certBlock = document.getElementById('certificationsViewBlock');
    const certCardView = document.getElementById('certCardView');
    if (certBlock && certCardView) {
        certBlock.innerHTML = '';
        if (d.certifications && d.certifications.length > 0) {
            certCardView.style.display = 'block';
            d.certifications.forEach(c => {
                certBlock.innerHTML += `<div class="list-item"><div class="list-title">${c.title}</div><div class="list-subtitle">Issued by: ${c.issuer}</div></div>`;
            });
        } else { certCardView.style.display = 'none'; }
    }

    // Experience Timeline Compiler
    const timeline = document.getElementById('experienceTimeline');
    if (timeline) {
        timeline.innerHTML = '';
        if (d.experiences && d.experiences.length > 0) {
            d.experiences.forEach(j => {
                const div = document.createElement('div'); div.className = 'timeline-item';
                div.innerHTML = `<div class="timeline-dot"></div><div class="timeline-duration">${j.duration}</div><h4 class="timeline-role">${j.role}</h4><h5 class="timeline-company">${j.company}</h5><p class="timeline-desc" style="white-space:pre-wrap;">${j.desc || ''}</p>`;
                timeline.appendChild(div);
            });
        } else { document.getElementById('expCardWrapper').style.display = 'none'; }
    }

    // Projects Engine Grid Compiler
    const grid = document.getElementById('projectsGrid');
    const filterContainer = document.getElementById('dynamicFilters');
    if (grid) {
        grid.innerHTML = ''; if(filterContainer) filterContainer.innerHTML = '';
        if (d.projects && d.projects.length > 0) {
            const uniqueCats = [...new Set(d.projects.map(p => (p.category || 'Other').toLowerCase().trim()))];
            if (filterContainer) {
                filterContainer.innerHTML = `<button class="filter-btn active" data-filter="all">All Modules</button>`;
                uniqueCats.forEach(cat => { filterContainer.innerHTML += `<button class="filter-btn" data-filter="${cat}">${cat}</button>`; });
            }
            d.projects.forEach(p => {
                const catValue = (p.category || 'Other').toLowerCase().trim();
                const card = document.createElement('div'); card.className = 'project-card filter-item';
                card.setAttribute('data-cat', catValue);
                card.innerHTML = `<span class="category-tag">${p.category}</span><h4 class="project-title">${p.title}</h4><p class="project-desc" style="white-space:pre-wrap;">${p.desc || ''}</p>${p.link ? `<a href="${p.link}" target="_blank" class="project-link">Explore Variant Execution ↗</a>` : ''}`;
                grid.appendChild(card);
            });
            setupFilters();
        } else { document.getElementById('projCardWrapper').style.display = 'none'; }
    }
}

function mapStringBadges(str, id, cardId) {
    const c = document.getElementById(id); const card = document.getElementById(cardId);
    if(c) {
        c.innerHTML = '';
        if(str && str.trim().length > 0) {
            if(card) card.style.display = 'block';
            str.split(',').forEach(item => { if(item.trim()) { const s = document.createElement('span'); s.className = 'badge-pill'; s.innerText = item.trim(); c.appendChild(s); } });
        } else { if(card) card.style.display = 'none'; }
    }
}

function mapArrayBadges(arr, id, cardId) {
    const c = document.getElementById(id); const card = document.getElementById(cardId);
    if(c) {
        c.innerHTML = '';
        if(arr && arr.length && arr.some(item => item.trim().length > 0)) {
            if(card) card.style.display = 'block';
            arr.forEach(item => { if(item.trim()) { const s = document.createElement('span'); s.className = 'badge-pill'; s.innerText = item.trim(); c.appendChild(s); } });
        } else { if(card) card.style.display = 'none'; }
    }
}

function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelector('.filter-btn.active').classList.remove('active'); e.target.classList.add('active');
            const cat = e.target.getAttribute('data-filter');
            document.querySelectorAll('.filter-item').forEach(item => { item.style.display = (cat === 'all' || item.getAttribute('data-cat') === cat) ? 'flex' : 'none'; });
        });
    });
}

function setupContactForm(ownerUid) {
    const formElement = document.getElementById('contactForm');
    if(formElement) {
        formElement.addEventListener('submit', async (e) => {
            e.preventDefault(); const ack = document.getElementById('contactAck'); ack.innerText = "Transmitting metrics encapsulation...";
            try {
                await addDoc(collection(db, "messages"), { portfolioOwnerId: ownerUid, name: document.getElementById('senderName').value, email: document.getElementById('senderEmail').value, message: document.getElementById('senderMsg').value, timestamp: serverTimestamp() });
                ack.style.color = '#10b981'; ack.innerText = "Transmission successful!"; e.target.reset();
            } catch(err) { ack.style.color = '#dc2626'; ack.innerText = "Transmission failed."; }
        });
    }
}

function renderErrorSplash(msg) {
    document.body.innerHTML = `<div style="display:flex; justify-content:center; align-items:center; height:100vh; background:#f8fafc; font-family:sans-serif;"><div style="background:white; border:1px solid #e2e8f0; padding:40px; border-radius:12px; max-width:500px; text-align:center;"><h2>Interface Controller Blocked</h2><p>${msg}</p></div></div>`;
}

document.getElementById('downloadPdfBtn').addEventListener('click', () => {
    document.getElementById('actionBar').style.display = 'none';
    html2pdf().set({ margin: 0.3, filename: 'Portfolio.pdf', html2canvas: { scale: 2 } }).from(document.getElementById('portfolioContent')).save().then(() => { document.getElementById('actionBar').style.display = 'flex'; });
});

initializeRouting();
