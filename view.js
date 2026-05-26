import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, increment, arrayUnion, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

function buildDOM(d) {
    const activeTheme = d.theme || 'light';
    if (activeTheme.startsWith('theme-')) {
        document.body.className = activeTheme;
    } else {
        document.body.className = `theme-${activeTheme}`;
    }
    
    const avatarFrame = document.getElementById('viewAvatar');
    if(avatarFrame) {
        if(d.avatar) { avatarFrame.src = d.avatar; } else { avatarFrame.style.display = 'none'; }
    }

    const nameNode = document.getElementById('viewName');
    if(nameNode) {
        if(d.name) { nameNode.innerText = d.name; document.title = `${d.name} | Professional Identity Matrix`; } else { nameNode.style.display = 'none'; }
    }
    
    const titleNode = document.getElementById('viewTitle');
    if(titleNode) {
        if(d.title) { titleNode.innerText = d.title; } else { titleNode.style.display = 'none'; }
    }

    const bioNode = document.getElementById('viewBio');
    if(bioNode) {
        if(d.bio) { bioNode.innerText = d.bio; } else { bioNode.style.display = 'none'; }
    }

    const contactCard = document.getElementById('contactInfoCard');
    const contactBlock = document.getElementById('contactDetailsBlock');
    if(contactBlock) {
        contactBlock.innerHTML = '';
        let hasContact = false;

        if(d.location) {
            hasContact = true;
            contactBlock.innerHTML += `<div class="contact-item"><i class="contact-icon">📍</i><span>${d.location}</span></div>`;
        }
        if(d.email) {
            hasContact = true;
            contactBlock.innerHTML += `<div class="contact-item"><i class="contact-icon">✉️</i><a href="mailto:${d.email}">${d.email}</a></div>`;
        }
        if(d.phone) {
            hasContact = true;
            contactBlock.innerHTML += `<div class="contact-item"><i class="contact-icon">📞</i><a href="tel:${d.phone}">${d.phone}</a></div>`;
        }

        if(contactCard && hasContact) contactCard.style.display = 'block';
    }

    const deck = document.getElementById('viewSocialDeck');
    if(deck) {
        deck.innerHTML = '';
        if(d.linkedin) deck.innerHTML += `<a href="${d.linkedin}" target="_blank" class="social-pill">LinkedIn</a>`;
        if(d.github) deck.innerHTML += `<a href="${d.github}" target="_blank" class="social-pill">GitHub</a>`;
        if(d.twitter) deck.innerHTML += `<a href="${d.twitter}" target="_blank" class="social-pill">Twitter/X</a>`;
    }

    const sGroup = document.getElementById('techSkillsContainer');
    if(sGroup) {
        sGroup.innerHTML = '';
        if (d.skills && d.skills.trim() !== "") {
            d.skills.split(',').forEach(s => {
                if(s.trim() === "") return;
                const span = document.createElement('span'); span.className = 'badge-pill'; span.innerText = s.trim();
                sGroup.appendChild(span);
            });
        }
    }

    const compGroup = document.getElementById('coreCompetenciesContainer');
    if(compGroup) {
        compGroup.innerHTML = '';
        if(d.coreCompetencies && d.coreCompetencies.length > 0) {
            d.coreCompetencies.forEach(c => {
                const span = document.createElement('span'); span.className = 'badge-pill'; span.innerText = c;
                compGroup.appendChild(span);
            });
        }
    }

    const eduCard = document.getElementById('eduCardView');
    const eduBox = document.getElementById('educationViewBlock');
    if(eduBox) {
        eduBox.innerHTML = '';
        if (d.education && d.education.length > 0) {
            if(eduCard) eduCard.style.display = 'block';
            d.education.forEach(e => {
                const block = document.createElement('div'); block.className = 'list-item';
                block.innerHTML = `<div class="list-title">${e.degree}</div><div class="list-subtitle">${e.institute}</div><div class="list-meta">${e.timeline}</div>`;
                eduBox.appendChild(block);
            });
        }
    }

    const certCard = document.getElementById('certCardView');
    const certBox = document.getElementById('certificationsViewBlock');
    if(certBox) {
        certBox.innerHTML = '';
        if(d.certifications && d.certifications.length > 0) {
            if(certCard) certCard.style.display = 'block';
            d.certifications.forEach(c => {
                const block = document.createElement('div'); block.className = 'list-item';
                block.innerHTML = `<div class="list-title">${c.title}</div><div class="list-subtitle">${c.issuer}</div>`;
                certBox.appendChild(block);
            });
        }
    }

    const expBox = document.getElementById('experienceTimeline');
    if(expBox) {
        expBox.innerHTML = '';
        if (d.experiences && d.experiences.length > 0) {
            d.experiences.forEach(ex => {
                const block = document.createElement('div'); block.className = 'timeline-item';
                block.innerHTML = `<div class="timeline-dot"></div><span class="timeline-duration">${ex.timeline}</span><div class="timeline-role">${ex.role}</div><div class="timeline-company">${ex.company}</div><p class="timeline-desc">${ex.description}</p>`;
                expBox.appendChild(block);
            });
        } else {
            document.querySelector('.experience-card')?.remove();
        }
    }

    const pGrid = document.getElementById('projectsGrid');
    if(pGrid) {
        pGrid.innerHTML = '';
        if (d.projects && d.projects.length > 0) {
            const categories = new Set(['all']);
            d.projects.forEach(p => {
                categories.add(p.category.trim());
                const card = document.createElement('div'); card.className = 'filter-item project-card'; card.setAttribute('data-cat', p.category.trim());
                card.innerHTML = `
                    <span class="category-tag">${p.category}</span>
                    <div class="project-title">${p.title}</div>
                    <p class="project-desc">${p.description}</p>
                    ${p.link ? `<a href="${p.link}" target="_blank" class="project-link">Execute Operations ↗</a>` : ''}
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
    if(!fBox) return;
    fBox.innerHTML = '';
    cats.forEach(c => {
        const btn = document.createElement('button'); btn.className = 'filter-btn' + (c === 'all' ? ' active' : ''); btn.innerText = c.toUpperCase(); btn.setAttribute('data-target', c);
        fBox.appendChild(btn);
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const cat = e.target.getAttribute('data-target');
            document.querySelectorAll('.filter-item').forEach(item => {
                item.style.display = (cat === 'all' || item.getAttribute('data-cat') === cat) ? 'flex' : 'none';
            });
        });
    });
}

function setupContactForm(ownerUid) {
    const cForm = document.getElementById('contactForm');
    if(!cForm) return;
    cForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const ack = document.getElementById('contactAck');
        if(ack) { ack.innerText = "Transmitting message..."; ack.style.color = "var(--accent)"; }
        try {
            await addDoc(collection(db, "messages"), {
                portfolioOwnerId: ownerUid, name: document.getElementById('senderName').value, email: document.getElementById('senderEmail').value, message: document.getElementById('senderMsg').value, timestamp: serverTimestamp()
            });
            if(ack) { ack.style.color = '#10b981'; ack.innerText = "Message sent successfully!"; }
            e.target.reset();
        } catch(err) { if(ack) { ack.style.color = '#dc2626'; ack.innerText = "Transmission failed. Please try again."; } }
    });
}

function renderErrorSplash(msg) {
    document.body.innerHTML = `<div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; background:#f8fafc; font-family:sans-serif; padding:20px; text-align:center;"><div style="background:white; border:1px solid #e2e8f0; padding:40px; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.03); max-width:500px;"><h2 style="color:#0f172a; margin-top:0;">Portfolio Interface Management</h2><p style="color:#64748b; line-height:1.6; font-size:15px;">${msg}</p></div></div>`;
}

const pdfBtn = document.getElementById('downloadPdfBtn');
if(pdfBtn) {
    pdfBtn.addEventListener('click', () => {
        const actionBar = document.getElementById('actionBar');
        if(actionBar) actionBar.style.display = 'none';
        html2pdf().set({ margin: 0.3, filename: 'Portfolio.pdf', html2canvas: { scale: 2 } }).from(document.getElementById('portfolioContent')).save().then(() => { if(actionBar) actionBar.style.display = 'block'; });
    });
}

initializeRouting();