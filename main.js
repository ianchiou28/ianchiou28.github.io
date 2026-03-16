// YouTube Background Music Setup
let ytPlayer;
let ytPlayerReady = false;
let playRequested = false;
const bgMusicState = { volume: 50 };

// Load the IFrame Player API code asynchronously
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('youtube-audio', {
        height: '10',
        width: '10',
        videoId: 'LcwIMiaW-Tk',
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'loop': 1,
            'playlist': 'LcwIMiaW-Tk',
            'playsinline': 1
        },
        events: {
            'onReady': (event) => {
                ytPlayerReady = true;
                event.target.setVolume(bgMusicState.volume);
                event.target.unMute();
                
                // If user already clicked before YT was ready, play now
                if (playRequested) {
                    event.target.playVideo();
                }
            },
            'onStateChange': (event) => {
                // If the video somehow pauses or fails to start and playback was requested, keep retrying or forcing volume
                if (playRequested && event.data !== YT.PlayerState.PLAYING && event.data !== YT.PlayerState.BUFFERING) {
                    event.target.playVideo();
                }
            }
        }
    });
};

function setBgMusicVolume(targetVol, duration) {
    if (!ytPlayerReady || !ytPlayer || !ytPlayer.setVolume) return;
    gsap.to(bgMusicState, {
        volume: targetVol,
        duration: duration,
        onUpdate: () => {
            ytPlayer.setVolume(Math.round(bgMusicState.volume));
        }
    });
}

// Wait for DOM
document.addEventListener("DOMContentLoaded", () => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // 1. Generate Stars
    const starsContainer = document.getElementById('stars');
    if (starsContainer) {
        // Generate stars over a larger area to allow for parallax scrolling
        for(let i=0; i<300; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.width = Math.random() * 2 + 'px';
            star.style.height = star.style.width;
            star.style.left = Math.random() * 100 + 'vw';
            // Extend top up to 200vh so when we scroll it up, we don't run out of stars
            star.style.top = Math.random() * 200 + 'vh';
            star.style.animationDuration = (Math.random() * 3 + 1) + 's';
            starsContainer.appendChild(star);
        }
    }

    // 1.5 Generate Clouds
    const cloudsContainer = document.getElementById('clouds-container');
    if (cloudsContainer) {
        // Generate a few cloud layers
        for (let i = 0; i < 15; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'absolute bg-white/10 rounded-full mix-blend-overlay filter blur-[60px] pointer-events-none';
            const size = Math.random() * 400 + 300; // 300 to 700px
            cloud.style.width = size + 'px';
            cloud.style.height = size * 0.4 + 'px';
            cloud.style.left = (Math.random() * 120 - 10) + 'vw';
            cloud.style.top = (Math.random() * 150 - 20) + 'vh'; // spread out
            cloudsContainer.appendChild(cloud);
        }
    }

    // 2. Altimeter, Heading & Smooth Background
    const altimeter = document.getElementById('altimeter');
    const heading = document.getElementById('heading');
    const skyBg = document.getElementById('sky-bg');

    // Text updates
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = maxScroll > 0 ? scrollY / maxScroll : 0;
        
        const alt = Math.floor(scrollPercent * 35000);
        if (altimeter) altimeter.innerText = `ALT: ${alt}FT`;

        if (heading) {
            if (scrollPercent < 0.3) heading.innerText = `HDG: W`;
            else if (scrollPercent < 0.7) heading.innerText = `HDG: SW`;
            else heading.innerText = `HDG: S`;
        }
    });

    // Smooth background color interpolation using GSAP
    if (skyBg) {
        const skyTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5 // Adds a slight smoothing lag to color change
            }
        });

        skyTimeline
            // Projects: Deep night shifting to dark cyan/blue
            .to(skyBg, { backgroundColor: "#1e3a5f", duration: 1 })
            // Competitions: Mystical purple / Northern lights feel
            .to(skyBg, { backgroundColor: "#2b1a3a", duration: 1 })
            // Travel Journal: Slightly warmer, nostalgic
            .to(skyBg, { backgroundColor: "#3a2522", duration: 1 })
            // Hangar & Landing: Early dawn / Earth atmosphere
            .to(skyBg, { backgroundColor: "#1a1614", duration: 1 });
            
        // Parallax for stars
        gsap.to("#stars", {
            y: "-100vh", // Move stars up slower than scroll
            ease: "none",
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 0.5
            }
        });

        // Parallax for clouds
        gsap.to("#clouds-container", {
            y: "-50vh",
            x: "10vw", // slight horizontal drift across the whole scroll
            ease: "none",
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 1
            }
        });
    }

    // 3. Airplane Animations
    
    // Constant floating movement simulating air flow
    // IMPORTANT: Animate ONLY the svg, so it does not conflict with container Y movement
    gsap.to("#plane-container svg", {
        y: "-=15",
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
    });

    // Master Flight Path (Fly steadily from left to right as scrolling down)
    const flightPath = gsap.timeline({
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5 // Added a bit more scrub for smoother non-teleporting reaction
        }
    });

    const isMobile = window.innerWidth < 768;

    flightPath
        // Takeoff
        .fromTo("#plane-container", 
            { x: '-20vw', y: '20vh', rotation: -15 }, 
            { x: '5vw', y: '0vh', rotation: 0, duration: 0.1, ease: "power2.out" }
        )
        // Uniform slow flight towards the right
        .to("#plane-container", {
            x: isMobile ? '70vw' : '40vw', // On mobile, stay on the right edge so it doesn't block text
            y: '5vh',
            duration: 0.7,
            ease: "none" // 匀速
        })
        // Landing (descend smoothly and stay visible)
        .to("#plane-container", {
            x: isMobile ? '75vw' : '55vw', // Keep it nicely on right side, easily visible
            y: '25vh', // Gentle descent relative to center
            rotation: 8, // Slight nose down
            scale: 0.8, 
            duration: 0.2, // Increase duration ratio to make it descend slower
            ease: "power2.inOut" // Smooth landing curve
        });

    // Waypoint Animations (Projects)
    gsap.utils.toArray('.waypoint').forEach((waypoint, i) => {
        gsap.from(waypoint, {
            opacity: 0,
            y: 100,
            duration: 1,
            scrollTrigger: {
                trigger: waypoint,
                start: "top 80%",
                end: "top 50%",
                scrub: 1
            }
        });
        
        // Plane tilt when passing waypoints
        ScrollTrigger.create({
            trigger: waypoint,
            start: "top 60%",
            end: "bottom 40%",
            onEnter: () => gsap.to("#plane-body", {rotation: 10, duration: 1, transformOrigin: "center"}),
            onLeave: () => gsap.to("#plane-body", {rotation: 0, duration: 1, transformOrigin: "center"}),
            onEnterBack: () => gsap.to("#plane-body", {rotation: -10, duration: 1, transformOrigin: "center"}),
            onLeaveBack: () => gsap.to("#plane-body", {rotation: 0, duration: 1, transformOrigin: "center"}),
        });
    });

    // Turbulence Animations (Competitions)
    const createLightningStrike = () => {
        const container = document.getElementById('lightning-container');
        if (!container) return;

        // Random positions for the lightning
        const startX = Math.random() * 80 + 10; // 10vw to 90vw
        const startY = Math.random() * 50 + 10; // 10vh to 60vh

        // Background glow (in-cloud lightning)
        const glow = document.createElement('div');
        glow.style.position = 'absolute';
        glow.style.left = `${startX}vw`;
        glow.style.top = `${startY}vh`;
        glow.style.width = '60vw';
        glow.style.height = '60vh';
        glow.style.transform = 'translate(-50%, -50%)';
        glow.style.background = 'radial-gradient(circle, rgba(200, 220, 255, 0.4) 0%, rgba(200, 220, 255, 0) 70%)';
        glow.style.borderRadius = '50%';
        container.appendChild(glow);

        // Lightning bolt SVG
        const bolt = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        bolt.setAttribute('viewBox', '0 0 100 200');
        bolt.style.position = 'absolute';
        bolt.style.left = `${startX + (Math.random() * 10 - 5)}vw`;
        bolt.style.top = `${startY - 10}vh`;
        bolt.style.width = `${Math.random() * 5 + 5}vw`;
        bolt.style.height = `${Math.random() * 20 + 20}vh`;
        // Generate random jagged path for the bolt
        const points = [
            `50,0`,
            `${Math.random()*40+10},${Math.random()*20+30}`,
            `${Math.random()*40+40},${Math.random()*20+50}`,
            `${Math.random()*40+10},${Math.random()*20+100}`,
            `${Math.random()*40+40},${Math.random()*20+120}`,
            `${Math.random()*80+10},200`
        ].join(' ');
        bolt.innerHTML = `<polyline points="${points}" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="${Math.random()*2 + 1}" stroke-linejoin="miter" style="filter: drop-shadow(0 0 8px white);" />`;
        container.appendChild(bolt);

        // Animate realistic lightning flickering
        const tl = gsap.timeline({
            onComplete: () => {
                glow.remove();
                bolt.remove();
            }
        });

        tl.to([glow, bolt], { opacity: 1, duration: 0.03 })
          .to([glow, bolt], { opacity: 0.1, duration: 0.03 })
          .to([glow, bolt], { opacity: 0.8, duration: 0.03 })
          .to([glow, bolt], { opacity: 0, duration: 0.15 })
          .to([glow, bolt], { opacity: 0.6, duration: 0.03 })
          .to([glow, bolt], { opacity: 0, duration: 0.3 });
    };

    gsap.utils.toArray('.award-cloud').forEach(cloud => {
        gsap.from(cloud, {
            scale: 0.5,
            opacity: 0,
            filter: "blur(10px)",
            scrollTrigger: {
                trigger: cloud,
                start: "top 80%",
                end: "top 50%",
                scrub: 1
            }
        });

        // Simulate turbulence
        ScrollTrigger.create({
            trigger: cloud,
            start: "top 60%",
            end: "bottom 40%",
            onEnter: () => {
                // Realistic lightning strike
                createLightningStrike();
                
                gsap.to("#plane-body", {
                    y: "+=20", x: "+=5", rotation: "random(-5, 5)",
                    duration: 0.1, yoyo: true, repeat: 10 // shake effect
                });
            },
            onEnterBack: () => {
                // Realistic lightning strike
                createLightningStrike();
                
                gsap.to("#plane-body", {
                    y: "+=20", x: "+=5", rotation: "random(-5, 5)",
                    duration: 0.1, yoyo: true, repeat: 10
                });
            }
        });
    });

    // Fade in/out clouds when in competitions section

    // Terminal Entrance Animation & Audio Unlock logic
    const terminalPreloader = document.getElementById('terminal-preloader');
    const terminalContent = document.getElementById('terminal-content');
    const terminalPrompt = document.getElementById('terminal-click-prompt');
    const terminalCursor = document.getElementById('terminal-cursor');

    if (terminalPreloader) {
        let terminalStarted = false;
        terminalPreloader.addEventListener('click', () => {
            if (terminalStarted) return;
            terminalStarted = true;

            // Mark play intent
            playRequested = true;

            // Unlock audio on intentional click
            if (ytPlayerReady && ytPlayer && typeof ytPlayer.playVideo === 'function') {
                try {
                    ytPlayer.unMute();
                    ytPlayer.setVolume(50);
                    ytPlayer.playVideo();
                } catch (e) {
                    console.error("YT Play Error", e);
                }
            }

            // Hide prompts & show cursor
            if (terminalPrompt) gsap.to(terminalPrompt, {opacity: 0, duration: 0.3});
            if (terminalCursor) terminalCursor.classList.remove('hidden');

            const lines = [
                "root@ian-chiou:~# ./init_flight_system.sh --override",
                "[INFO] Booting system core...",
                "[INFO] Mounting virtual drives........ [DONE]",
                "[INFO] Initializing memory banks...... [DONE]",
                "[INFO] Loading telemetry data......... [DONE]",
                " ",
                "       > Checking environmental variables...",
                "       > Wind speed: 12 knots",
                "       > Visibility: Clear",
                "       > Gravity: Nominal",
                " ",
                "[INFO] Engaging primary thrusters..... [DONE]",
                "[INFO] Calibrating altimeter.......... [DONE]",
                "[INFO] Establishing satellite uplink.. [DONE]",
                "[WARN] Minor turbulence detected...... [IGNORED]",
                "[INFO] Deploying aerodynamic surfaces.",
                " ",
                "Rendering structural schematic:",
                " ",
                "                              |",
                "                        --====|====--",
                "                              |",
                "                          .-'---'-.",
                "                        .'_________'.",
                "                       /_/_|__|__|_\\_\\",
                "                      ;'-._       _.-';",
                " ,--------------------|      .-.      |--------------------,",
                "  ``''''--..__  ___   ;       '       ;   ___  __..--''''``",
                "              '-// \\.._\\             /_..// \\-'",
                "                \\_//     '._     _.'     \\\\_/",
                "                `'`          ---          `'`",
                " ",
                "System diagnostics nominal.",
                "Flight sequence successfully initialized.",
                "Clear for takeoff."
            ];

            let lineIndex = 0;
            let charIndex = 0;
            let currentText = "";

            function typeWriter() {
                if (lineIndex < lines.length) {
                    if (charIndex < lines[lineIndex].length) {
                        currentText += lines[lineIndex].charAt(charIndex);
                        terminalContent.innerText = currentText;
                        charIndex++;
                        
                        // Very fast typing speed
                        let delay = Math.random() * 4 + 2; 
                        if (lines[lineIndex].charAt(charIndex - 1) === '.') delay = 20;
                        
                        // If it's rendering the ascii art, print characters almost instantly
                        if (lineIndex >= 18 && lineIndex <= 30) {
                            delay = 1;
                        }
                        
                        setTimeout(typeWriter, delay);
                    } else {
                        currentText += "\n";
                        terminalContent.innerText = currentText;
                        lineIndex++;
                        charIndex = 0;
                        
                        // Pauses between lines
                        let lineDelay = 20;
                        if (lineIndex < lines.length && lines[lineIndex].startsWith("[INFO]")) lineDelay = 70;
                        if (lineIndex < lines.length && lines[lineIndex].startsWith("[WARN]")) lineDelay = 150;
                        if (lineIndex === 1 || lineIndex === 6 || lineIndex === 11) lineDelay = 200;
                        if (lineIndex >= 18 && lineIndex <= 30) lineDelay = 10; // fast ascii render
                        
                        setTimeout(typeWriter, lineDelay);
                    }
                } else {
                    // Finished typing
                    if (terminalCursor) terminalCursor.classList.add('hidden');
                    
                    // Propeller spin up animation
                    gsap.to(["#prop-blade-1", "#prop-blade-2", "#propeller-blur"], {
                        duration: 2, 
                        ease: "power2.in", 
                        rotation: 3600, 
                        svgOrigin: "180 45",
                        onComplete: () => {
                            gsap.to(["#prop-blade-1", "#prop-blade-2", "#propeller-blur"], {
                                duration: 0.1, rotation: "+=360", ease: "none",
                                repeat: -1, svgOrigin: "180 45"
                            });
                        }
                    });

                    setTimeout(() => {
                        // Fade away effect
                        gsap.to(terminalPreloader, {
                            scale: 1.05, opacity: 0, duration: 1.2, ease: "power2.inOut",
                            onComplete: () => {
                                terminalPreloader.style.display = "none";
                                // IMMEDIATELY unlock scroll
                                document.body.classList.remove('overflow-hidden');
                                document.documentElement.classList.remove('overflow-hidden');
                                
                                // Insert the hint text into the takeoff section
                                const takeoffSection = document.querySelector('#takeoff .text-center');
                                if (takeoffSection) {
                                    const hintSpan = document.createElement('div');
                                    hintSpan.className = 'uppercase tracking-[0.3em] text-xs opacity-50 mt-4 animate-bounce';
                                    hintSpan.innerText = '向下滚动 / Scroll to Fly';
                                    takeoffSection.appendChild(hintSpan);
                                }

                                // Refresh ScrollTrigger
                                setTimeout(() => {
                                    ScrollTrigger.refresh();
                                }, 50);
                            }
                        });
                    }, 800);
                }
            }
            
            setTimeout(typeWriter, 300);
        });
    }

    ScrollTrigger.create({
        trigger: "#competitions",
        start: "top 70%",
        end: "bottom 30%",
        onEnter: () => {
            gsap.to("#clouds-container", { opacity: 1, duration: 1.5 });
        },
        onLeave: () => {
            gsap.to("#clouds-container", { opacity: 0, duration: 1.5 });
        },
        onEnterBack: () => {
            gsap.to("#clouds-container", { opacity: 1, duration: 1.5 });
        },
        onLeaveBack: () => {
            gsap.to("#clouds-container", { opacity: 0, duration: 1.5 });
        }
    });

    // Fade out stars during landing/dawn
    gsap.to("#stars", {
        opacity: 0,
        scrollTrigger: {
            trigger: "#landing",
            start: "top bottom",
            end: "center center",
            scrub: true
        }
    });

// --- Easter Egg 1: Flight Mini Game ---
const planeClickZone = document.getElementById('plane-container');
const gameModal = document.getElementById('flight-game-modal');
const gameCanvas = document.getElementById('gameCanvas');
const scoreDisplay = document.getElementById('game-score-display');
const closeGameBtn = document.getElementById('close-game-btn');
let gameCtx, gameAnimationId;
let planeY = 200, planeVelocity = 0, gravity = 0.3, jump = -6; // 降低了重力和跳跃力度，让控制变平滑
let pipes = [], frameCount = 0, gameScore = 0;
let gameState = 'start'; // 'start', 'playing', 'gameover'

if (planeClickZone && gameModal && gameCanvas) {
    gameCtx = gameCanvas.getContext('2d');
    
    planeClickZone.addEventListener('click', () => {
        gameModal.classList.remove('hidden');
        gameModal.classList.add('flex');
        cancelAnimationFrame(gameAnimationId);
        gameState = 'start';
        drawStartScreen();
    });

    closeGameBtn.addEventListener('click', () => {
        gameModal.classList.add('hidden');
        gameModal.classList.remove('flex');
        cancelAnimationFrame(gameAnimationId);
    });

    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !gameModal.classList.contains('hidden')) {
            e.preventDefault();
            if (gameState === 'start' || gameState === 'gameover') {
                startGame();
            } else if (gameState === 'playing') {
                planeVelocity = jump;
            }
        }
    });
    
    gameCanvas.addEventListener('mousedown', () => {
        if (gameState === 'start' || gameState === 'gameover') {
            startGame();
        } else if (gameState === 'playing') {
            planeVelocity = jump;
        }
    });

    function drawStartScreen() {
        resetGame();
        gameCtx.fillStyle = '#1a1a2e';
        gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        drawGamePlane(100, 200);
        gameCtx.fillStyle = 'rgba(0,0,0,0.5)';
        gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        gameCtx.fillStyle = 'white';
        gameCtx.font = '30px monospace';
        gameCtx.fillText('READY TO FLY?', gameCanvas.width / 2 - 110, gameCanvas.height / 2 - 20);
        gameCtx.font = '20px monospace';
        gameCtx.fillText('Click canvas or press SPACE to Start', gameCanvas.width / 2 - 200, gameCanvas.height / 2 + 30);
    }

    function startGame() {
        resetGame();
        gameState = 'playing';
        planeVelocity = jump;
        updateGame();
    }

    function resetGame() {
        planeY = 200;
        planeVelocity = 0;
        pipes = [];
        frameCount = 0;
        gameScore = 0;
        if(scoreDisplay) scoreDisplay.innerText = `SCORE: ${gameScore}`;
    }

    function drawGamePlane(x, y) {
        gameCtx.save();
        gameCtx.translate(x, y);
        gameCtx.rotate(Math.min(Math.max(planeVelocity * 0.05, -0.5), 0.5));
        
        // Simple plane shape
        gameCtx.fillStyle = 'white';
        gameCtx.beginPath();
        gameCtx.moveTo(20, 0); // nose
        gameCtx.lineTo(-15, -10); // top tail
        gameCtx.lineTo(-15, 10); // bottom tail
        gameCtx.closePath();
        gameCtx.fill();
        
        // Wing
        gameCtx.fillStyle = '#a3b8cc';
        gameCtx.beginPath();
        gameCtx.moveTo(-5, 0);
        gameCtx.lineTo(-15, -20);
        gameCtx.lineTo(-5, -20);
        gameCtx.lineTo(5, 0);
        gameCtx.closePath();
        gameCtx.fill();

        gameCtx.restore();
    }

    function updateGame() {
        if (gameState !== 'playing') return;

        // Physics
        planeVelocity += gravity;
        planeY += planeVelocity;

        // Clear canvas
        gameCtx.fillStyle = '#1a1a2e';
        gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

        // Spawn pipes
        if (frameCount % 150 === 0) { // 放慢了柱子生成的频率 (原来是90)
            let gapPosition = Math.random() * 200 + 50; // Random gap starting y
            // 增大了柱子的缺口间距，降低难度
            pipes.push({ x: gameCanvas.width, topHeight: gapPosition - 80, bottomY: gapPosition + 100 });
        }

        // Update & Draw pipes
        gameCtx.fillStyle = '#4a5568';
        for (let i = pipes.length - 1; i >= 0; i--) {
            let p = pipes[i];
            p.x -= 2; // 降低了管子移动的速度 (原来是3)
            
            // Draw top pipe
            gameCtx.fillRect(p.x, 0, 40, p.topHeight);
            // Draw bottom pipe
            gameCtx.fillRect(p.x, p.bottomY, 40, gameCanvas.height - p.bottomY);

            // Collision detection
            let planeRect = { x: 100 - 15, y: planeY - 10, w: 30, h: 20 };
            let hitTop = planeRect.x < p.x + 40 && planeRect.x + planeRect.w > p.x && planeRect.y < p.topHeight;
            let hitBottom = planeRect.x < p.x + 40 && planeRect.x + planeRect.w > p.x && planeRect.y + planeRect.h > p.bottomY;

            if (hitTop || hitBottom) {
                gameState = 'gameover'; // Game Over
            }

            // Score up
            // 当降速到 2 时判断点也要匹配，否则可能计不到分 (原来是 98，速度为 3 时 100 - 2，现在可以是 100)
            if (p.x === 100 || p.x === 99) {
                gameScore++;
                if(scoreDisplay) scoreDisplay.innerText = `SCORE: ${gameScore}`;
            }

            // Remove off-screen pipes
            if (p.x + 40 < 0) {
                pipes.splice(i, 1);
            }
        }

        // Draw Plane (fixed x = 100)
        drawGamePlane(100, planeY);

        // Floor / Ceiling collision
        if (planeY > gameCanvas.height || planeY < 0) {
            gameState = 'gameover';
        }

        if (gameState === 'playing') {
            frameCount++;
            gameAnimationId = requestAnimationFrame(updateGame);
        } else {
            // Game Over Text
            gameCtx.fillStyle = 'rgba(0,0,0,0.5)';
            gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
            gameCtx.fillStyle = 'red';
            gameCtx.font = '40px monospace';
            gameCtx.fillText('CRASHED', gameCanvas.width / 2 - 80, gameCanvas.height / 2);
            gameCtx.fillStyle = 'white';
            gameCtx.font = '20px monospace';
            gameCtx.fillText('Click canvas or press SPACE to restart', gameCanvas.width / 2 - 200, gameCanvas.height / 2 + 40);
        }
    }
}

// --- Easter Egg 2: Ultimate Question (42) ---
const answerInput = document.getElementById('ultimate-answer');
const submitBtn = document.getElementById('submit-answer');
const rewardModal = document.getElementById('reward-modal');
const closeRewardBtn = document.getElementById('close-reward-btn');

if (answerInput && submitBtn && rewardModal) {
    submitBtn.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keypress', (e) => {
         if(e.key === 'Enter') checkAnswer();
    });

    function checkAnswer() {
        if (answerInput.value.trim() === '42') {
            triggerConfetti();
            rewardModal.classList.remove('hidden');
            rewardModal.classList.add('flex');
            
            // trigger fade inside
            setTimeout(() => {
                rewardModal.classList.remove('opacity-0');
                rewardModal.classList.add('opacity-100');
                document.getElementById('reward-content').classList.remove('scale-90');
                document.getElementById('reward-content').classList.add('scale-100');
            }, 50);
            
            answerInput.value = ''; // clear
        } else {
            // Wrong answer shake
            answerInput.classList.add('translate-x-2');
            answerInput.style.borderColor = 'red';
            answerInput.style.color = 'red';
            setTimeout(() => {
                answerInput.classList.remove('translate-x-2');
                answerInput.style.borderColor = '';
                answerInput.style.color = '';
            }, 300);
        }
    }

    if (closeRewardBtn) {
        closeRewardBtn.addEventListener('click', () => {
             rewardModal.classList.remove('opacity-100');
             rewardModal.classList.add('opacity-0');
             setTimeout(() => {
                 rewardModal.classList.add('hidden');
                 rewardModal.classList.remove('flex');
                 document.getElementById('reward-content').classList.add('scale-90');
                 document.getElementById('reward-content').classList.remove('scale-100');
             }, 1000);
        });
    }
}

function triggerConfetti() {
    // Simple DOM confetti
    for(let i=0; i<50; i++) {
        let conf = document.createElement('div');
        conf.className = 'absolute z-[10001] w-3 h-3 rounded-full';
        conf.style.backgroundColor = ['#ff0', '#0f0', '#00f', '#f00', '#f0f'][Math.floor(Math.random()*5)];
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.top = '-10vh';
        document.body.appendChild(conf);
        
        gsap.to(conf, {
            y: '110vh',
            x: `+=${Math.random() * 200 - 100}`,
            rotation: Math.random() * 720,
            duration: Math.random() * 2 + 2,
            ease: "power1.out",
            onComplete: () => conf.remove()
        });
    }
}

});