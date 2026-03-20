/* ═══════════════════════════════════════════════════
   EXTENSIO.AI — SCRIPT.JS
   Landing → Generator page transition + all logic
═══════════════════════════════════════════════════ */

// ─── Page transition ────────────────────────────────
const landingPage   = document.getElementById('landingPage');
const generatorPage = document.getElementById('generatorPage');
const ctaBtn        = document.getElementById('ctaBtn');
const backBtn       = document.getElementById('backBtn');

function showGenerator() {
    landingPage.classList.add('exit');
    setTimeout(() => {
        landingPage.classList.remove('active', 'exit');
        generatorPage.classList.add('active');
        document.getElementById('prompt').focus();
    }, 450);
}

function showLanding() {
    generatorPage.classList.add('exit');
    setTimeout(() => {
        generatorPage.classList.remove('active', 'exit');
        landingPage.classList.add('active');
    }, 450);
}

ctaBtn.addEventListener('click', showGenerator);
backBtn.addEventListener('click', showLanding);

// ─── Animated canvas (particle field) ───────────────
(function initCanvas() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function createParticles() {
        particles = Array.from({ length: 60 }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.2 + 0.3,
            dx: (Math.random() - 0.5) * 0.3,
            dy: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.5 + 0.1
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(167, 139, 250, ${p.opacity})`;
            ctx.fill();

            p.x += p.dx;
            p.y += p.dy;

            if (p.x < 0 || p.x > W) p.dx *= -1;
            if (p.y < 0 || p.y > H) p.dy *= -1;
        });

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.12 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => { resize(); createParticles(); });
    resize();
    createParticles();
    draw();
})();

// ─── Typewriter effect (mockup) ─────────────────────
(function initTypewriter() {
    const el = document.getElementById('typedText');
    if (!el) return;

    const phrases = [
        'Add dark mode to every website',
        'Block distracting social media sites',
        'Highlight all prices on a page',
        'Save text snippets with one click',
        'Show word count on any article',
    ];

    let phraseIdx = 0, charIdx = 0, deleting = false;

    function type() {
        const current = phrases[phraseIdx];

        if (!deleting) {
            el.textContent = current.slice(0, charIdx + 1);
            charIdx++;
            if (charIdx === current.length) {
                deleting = true;
                setTimeout(type, 2000);
                return;
            }
        } else {
            el.textContent = current.slice(0, charIdx - 1);
            charIdx--;
            if (charIdx === 0) {
                deleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
            }
        }

        setTimeout(type, deleting ? 45 : 75);
    }

    // Start after landing animations settle
    setTimeout(type, 1200);
})();

// ─── Char counter ────────────────────────────────────
const promptEl  = document.getElementById('prompt');
const charCount = document.getElementById('charCount');
const counter   = charCount?.closest('.char-counter');

if (promptEl && charCount) {
    promptEl.addEventListener('input', () => {
        const len = promptEl.value.length;
        charCount.textContent = len;
        counter.classList.remove('warn', 'max');
        if (len >= 500) counter.classList.add('max');
        else if (len >= 400) counter.classList.add('warn');
    });
}

// ─── Example chips ───────────────────────────────────
document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
        const val = chip.dataset.prompt;
        if (!promptEl) return;
        promptEl.value = val;
        const len = val.length;
        charCount.textContent = len;
        counter.classList.remove('warn', 'max');
        if (len >= 400) counter.classList.add('warn');
        promptEl.focus();
        // pulse textarea
        promptEl.style.transition = 'border-color 0.1s, box-shadow 0.1s';
        promptEl.style.borderColor = 'rgba(167, 139, 250, 0.6)';
        promptEl.style.boxShadow   = '0 0 0 4px rgba(167, 139, 250, 0.15)';
        setTimeout(() => {
            promptEl.style.borderColor = '';
            promptEl.style.boxShadow   = '';
            promptEl.style.transition  = '';
        }, 800);
    });
});

// ─── Generator logic ─────────────────────────────────
const generateBtn   = document.getElementById('generateBtn');
const statusMessage = document.getElementById('statusMessage');
const statusText    = document.getElementById('statusText');
const statusIcon    = document.getElementById('statusIcon');
const spinner       = document.getElementById('spinner');
const btnText       = document.getElementById('btnText');
const btnIcon       = document.getElementById('btnIcon');

function setStatus(message, type = '', icon = '⏳') {
    statusMessage.className = 'status-message';
    if (type) statusMessage.classList.add(type);
    statusMessage.classList.remove('hidden');
    statusText.textContent = message;
    if (statusIcon) statusIcon.textContent = icon;
}

if (generateBtn) {
    generateBtn.addEventListener('click', async () => {
        const userPrompt = promptEl.value.trim();

        if (!userPrompt) {
            setStatus('Please enter a prompt describing your extension.', 'error', '⚠️');
            promptEl.focus();
            // Shake effect
            promptEl.style.animation = 'none';
            promptEl.offsetHeight;
            promptEl.style.animation = 'shakeInput 0.4s ease';
            return;
        }

        // Disable UI
        generateBtn.disabled = true;
        if (btnText) btnText.textContent = 'Generating…';
        if (btnIcon) btnIcon.classList.add('hidden');
        spinner.classList.remove('hidden');
        setStatus('Sending your idea to the AI… this may take a moment.', '', '🚀');

        try {
            const response = await fetch('http://localhost:5000/generate-extension', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userPrompt })
            });

            if (!response.ok && !response.headers.get('content-type')?.includes('zip')) {
                let errorMsg = 'Failed to generate extension.';
                try {
                    const errData = await response.json();
                    if (errData.error) errorMsg = errData.error;
                } catch (e) {}
                throw new Error(errorMsg);
            }

            const errorJsonHeader = response.headers.get('x-error-json');
            if (errorJsonHeader || !response.ok) {
                setStatus('AI generation had issues — a fallback extension was created instead.', 'error', '⚠️');
            } else {
                setStatus('Packaging your extension…', '', '📦');
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = downloadUrl;

            let filename = 'extension.zip';
            const disposition = response.headers.get('Content-Disposition');
            if (disposition && disposition.includes('attachment')) {
                const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
                if (match && match[1]) filename = match[1].replace(/['"]/g, '');
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);

            setStatus('Extension downloaded successfully! Load it in Chrome via chrome://extensions', 'success', '✅');

        } catch (error) {
            setStatus(error.message, 'error', '❌');
        } finally {
            generateBtn.disabled = false;
            if (btnText) btnText.textContent = 'Generate Extension';
            if (btnIcon) btnIcon.classList.remove('hidden');
            spinner.classList.add('hidden');
        }
    });
}

// ─── Inject shake keyframe dynamically ───────────────
const style = document.createElement('style');
style.textContent = `
@keyframes shakeInput {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-6px); }
    40%      { transform: translateX(6px); }
    60%      { transform: translateX(-4px); }
    80%      { transform: translateX(4px); }
}
`;
document.head.appendChild(style);