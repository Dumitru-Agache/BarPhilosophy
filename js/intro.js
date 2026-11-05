(() => {
    const root = document.documentElement;
    const overlay = document.querySelector('.intro-logo');
    const logo = overlay?.querySelector('img');
    const target = document.querySelector('.site-header .logo img');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let cancelled = false;
    let activeAnimation;
    let cleanupTimer;

    function finish() {
        cancelled = true;
        activeAnimation?.cancel();
        clearTimeout(cleanupTimer);
        clearTimeout(window.bpIntroFallback);
        root.classList.remove('intro-pending', 'intro-revealing');
        overlay?.remove();
        window.removeEventListener('resize', finish);
        window.removeEventListener('pagehide', finish);
        window.removeEventListener('hashchange', finish);
        motion.removeEventListener('change', finish);
    }

    if (!root.classList.contains('intro-pending') || !logo || !target || !logo.animate) {
        finish();
        return;
    }
    window.addEventListener('resize', finish);
    window.addEventListener('pagehide', finish);
    window.addEventListener('hashchange', finish);
    motion.addEventListener('change', finish);

    async function play() {
        try {
            // A bounded wait prevents slow images from blocking access to the page.
            const hero = new Image();
            hero.src = 'assets/images/hero.png';
            await Promise.race([
                Promise.allSettled([logo.decode(), target.decode(), hero.decode()]),
                new Promise(resolve => setTimeout(resolve, 1000))
            ]);
            if (cancelled || !root.classList.contains('intro-pending')) return finish();
            if (!logo.naturalWidth) return finish();

            activeAnimation = logo.animate([
                {filter:'brightness(1) drop-shadow(0 0 0 transparent)'},
                {filter:'brightness(1.7) drop-shadow(0 0 22px rgba(242,140,40,.9))', offset:.5},
                {filter:'brightness(1) drop-shadow(0 0 0 transparent)'}
            ], {duration:750, easing:'ease-in-out'});
            await activeAnimation.finished;
            if (cancelled) return;

            const from = overlay.getBoundingClientRect();
            const to = target.getBoundingClientRect();
            if (!to.width || !to.height) return finish();
            // Freeze the starting box; animate directly to the real navbar logo.
            Object.assign(overlay.style, {
                left:`${from.left}px`, top:`${from.top}px`,
                width:`${from.width}px`, height:`${from.height}px`, transform:'none'
            });
            activeAnimation = overlay.animate([
                {transform:'translate(0,0) scale(1,1)'},
                {transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width},${to.height/from.height})`}
            ], {duration:1100, easing:'cubic-bezier(.65,0,.25,1)', fill:'forwards'});
            overlay.style.transformOrigin = 'top left';
            await activeAnimation.finished;
            if (cancelled || !root.classList.contains('intro-pending')) return finish();

            root.classList.replace('intro-pending', 'intro-revealing');
            overlay.remove();
            cleanupTimer = setTimeout(finish, 2700);
        } catch (_) {
            finish();
        }
    }
    play();
})();
