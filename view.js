import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
let allProjects = [];

async function initPortfolioView() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('user');

    if (!slug) {
        document.body.innerHTML = '<div class="placeholder-text">Error: No portfolio identifier specified in the route routing link.</div>';
        return;
    }

    try {
        const slugSnap = await getDoc(doc(db, "slugs", slug));
        if (!slugSnap.exists()) {
            document.body.innerHTML = '<div class="placeholder-text">Error 404: Portfolio Profile Routing Link Matrix not found.</div>';
            return;
        }

        targetOwnerId = slugSnap.data().ownerId;
        const portfolioSnap = await getDoc(doc(db, "portfolios", targetOwnerId));

        if (portfolioSnap.exists()) {
            const data = portfolioSnap.data();
            
            if (data.isMaintenanceActive) {
                document.body.innerHTML = '<div class="placeholder-text">🔒 Under Maintenance. This portfolio is temporarily offline for analytical optimization configurations.</div>';
                return;
            }

            renderPortfolioData(data);
            incrementViewCounter(targetOwnerId);
        }
    } catch (err) {
        console.error("Critical Execution Context Interrupted:", err);
    }
}

function renderPortfolioData(data) {
    document.body.className = data.theme || 'theme-light';
    
    document.getElementById('ownerName').innerText = data.name || 'Professional Identity';
    document.getElementById('ownerTitle').innerText = data.title || 'Designation Architecture';
    document.getElementById('ownerLocation').innerText = data.location ? `📍 ${data.location}` : '';
    document.getElementById('ownerBio').innerText = data.bio || '';
    
    if (data.avatar) {
        document.getElementById('portfolioAvatar').src = data.avatar;
    } else {
        document.querySelector('.hero-section').classList.add('has-no-image');
    }

    const emailLink = document.getElementById('metaEmail');
    if (data.email) { emailLink.innerText = data.email; emailLink.href = `mailto:${data.email}`; } 
    else { document.getElementById('emailRow').style.display = 'none'; }

    const phoneLink = document.getElementById('metaPhone');
    if (data.phone) { phoneLink.innerText = data.phone; phoneLink.href = `tel:${data.phone}`; } 
    else { document.getElementById('phoneRow').style.display = 'none'; }

    setupSocialLink('linkLinkedin', data.linkedin);
    setupSocialLink('linkGithub', data.github);
    setupSocialLink('linkTwitter', data.twitter);

    const eduContainer = document.getElementById('educationTimeline');
    eduContainer.innerHTML = '';
    if (data.education && data.education.length > 0) {
        data.education.forEach(item => {
            const div = document.createElement('div'); div.className = 'list-item';
            div.innerHTML = `
                <div class="list-title">${item.degree}</div>
                <div class="list-subtitle">${item.institute}</div>
                <div class="list-meta">${item.timeline}</div>
            `;
            eduContainer.appendChild(div);
        });
    } else {
        eduContainer.innerHTML = '<p class="placeholder-text">No educational logs reported.</p>';
    }

    const skillsContainer = document.getElementById('techSkillsContainer');
    skillsContainer.innerHTML = '';
    if (data.skills) {
        data.skills.split(',').forEach(skill => {
            if (skill.trim()) {
                const span = document.createElement('span'); span.className = 'badge-pill';
                span.innerText = skill.trim();
                skillsContainer.appendChild(span);
            }
        });
    }

    const expContainer = document.getElementById('experienceTimeline');
    expContainer.innerHTML = '';
    if (data.experiences && data.experiences.length > 0) {
        data.experiences.forEach(item => {
            const div = document.createElement('div'); div.className = 'timeline-item';
            div.innerHTML = `
                <div class="timeline-dot"></div>
                <span class="timeline-duration">${item.timeline}</span>
                <div class="timeline-role">${item.role}</div>
                <div class="timeline-company">${item.company}</div>
                <p class="timeline-desc">${item.description}</p>
            `;
            expContainer.appendChild(div);
        });
    } else {
        expContainer.innerHTML = '<p class="placeholder-text">No operational milestones logged.</p>';
    }

    allProjects = data.projects || [];
    renderProjects(allProjects);
    buildFilters(allProjects);
}

function setupSocialLink(id, val) {
    const el = document.getElementById(id);
    if (val) el.href = val; else el.style.display = 'none';
}

function renderProjects(projects) {
    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = '';
    if (projects.length === 0) {
        grid.innerHTML = '<p class="placeholder-text" style="grid-column: 1/-1;">No projects match your filter configuration criteria.</p>';
        return;
    }
    projects.forEach(p => {
        const div = document.createElement('div'); div.className = 'project-card';
        div.innerHTML = `
            <span class="category-tag">${p.category || 'General'}</span>
            <h4 class="project-title">${p.title}</h4>
            <p class="project-desc">${p.description}</p>
            ${p.link ? `<a href="${p.link}" target="_blank" class="project-link">🔗 Track Deployment Pipeline</a>` : ''}
        `;
        grid.appendChild(div);
    });
}

function buildFilters(projects) {
    const container = document.getElementById('dynamicFilters');
    container.innerHTML = '';
    if (projects.length === 0) return;

    const categories = ['All', ...new Set(projects.map(p => p.category || 'General'))];
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `filter-btn ${cat === 'All' ? 'active' : ''}`;
        btn.innerText = cat;
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (cat === 'All') renderProjects(allProjects);
            else renderProjects(allProjects.filter(p => (p.category || 'General') === cat));
        });
        container.appendChild(btn);
    });
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

document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const ack = document.getElementById('contactAck');
    ack.innerText = "Transmitting secure packets to cloud framework...";
    
    const payload = {
        portfolioOwnerId: targetOwnerId,
        name: document.getElementById('senderName').value.trim(),
        email: document.getElementById('senderEmail').value.trim(),
        message: document.getElementById('senderMsg').value.trim(),
        timestamp: new Date().toISOString()
    };

    try {
        await addDoc(collection(db, "messages"), payload);
        ack.style.color = "green";
        ack.innerText = "✓ Record synchronized. Mailbox route operating optimally.";
        document.getElementById('contactForm').reset();
    } catch(err) {
        ack.style.color = "red";
        ack.innerText = "Transmission loss. Cloud matrix denied packet entry.";
    }
});

document.getElementById('downloadPdfBtn').addEventListener('click', () => {
    const element = document.getElementById('portfolioContent');
    const actionBar = document.getElementById('actionBar');
    
    const opt = {
        margin:       [10, 10, 10, 10],
        filename:     'Professional-CV.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
});

window.addEventListener('DOMContentLoaded', initPortfolioView);
