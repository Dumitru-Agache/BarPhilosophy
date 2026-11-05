const navLinks = document.querySelectorAll(".nav-link");

const observedSections = [...navLinks]
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

function setActiveLink(sectionId) {
    navLinks.forEach((link) => {
        const isCurrentSection = link.getAttribute("href") === `#${sectionId}`;
        link.classList.toggle("active", isCurrentSection);
        if (isCurrentSection) {
            link.setAttribute("aria-current", "location");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

const sectionObserver = new IntersectionObserver(
    (entries) => {
        const visibleSections = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visibleSections.length === 0) return;
        setActiveLink(visibleSections[0].target.id);
    },
    {
        root: null,
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5]
    }
);

observedSections.forEach((section) => sectionObserver.observe(section));

// Swiper emits this click only for a tap/click, not for a drag gesture.
function advanceGalleryOnImageClick(swiper, event) {
    if (!event.target.closest?.(".swiper-slide img")) return;
    if (!swiper.allowClick || swiper.animating) return;

    if (!swiper.params.loop && swiper.isEnd) {
        swiper.slideTo(0);
    } else {
        swiper.slideNext();
    }
}

if (typeof Swiper !== "undefined") {
    if (document.querySelector(".about-swiper")) {
        const aboutSwiper = new Swiper(".about-swiper", {
            loop: true,
            speed: 1000,
            slidesPerView: 1,
            spaceBetween: 0,
            grabCursor: true,
            autoplay: {
                delay: 3500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            pagination: {
                el: ".about-swiper .swiper-pagination",
                clickable: true,
                dynamicBullets: true
            },
            navigation: {
                nextEl: ".about-swiper .swiper-button-next",
                prevEl: ".about-swiper .swiper-button-prev"
            },
            keyboard: { enabled: true },
            on: { click: advanceGalleryOnImageClick }
        });
    }

    // Services: Swiper on mobile, original CSS mosaic on desktop.
    const mobileGalleryQuery = window.matchMedia("(max-width: 768px)");
    const serviceSwipers = new Map();

    function syncServiceSwipers() {
        if (mobileGalleryQuery.matches) {
            document.querySelectorAll(".service-swiper").forEach((gallery) => {
                if (serviceSwipers.has(gallery)) return;

                const wrapper = gallery.querySelector(".swiper-wrapper");
                // Clear the native scrolling position before Swiper takes over.
                if (wrapper) wrapper.scrollLeft = 0;

                const swiper = new Swiper(gallery, {
                    slidesPerView: 1,
                    spaceBetween: 12,
                    speed: 450,
                    loop: false,
                    grabCursor: true,
                    watchOverflow: true,
                    on: { click: advanceGalleryOnImageClick },
                    pagination: {
                        el: gallery.querySelector(".swiper-pagination"),
                        clickable: true
                    },
                    a11y: {
                        enabled: true,
                        paginationBulletMessage: "Mergi la fotografia {{index}}",
                        slideLabelMessage: "Fotografia {{index}} din {{slidesLength}}"
                    }
                });

                serviceSwipers.set(gallery, swiper);
            });
        } else {
            serviceSwipers.forEach((swiper) => swiper.destroy(true, true));
            serviceSwipers.clear();
        }
    }

    syncServiceSwipers();
    mobileGalleryQuery.addEventListener("change", syncServiceSwipers);
}

const menuButton = document.querySelector(".mobile-menu-button");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileMenuLinks = document.querySelectorAll(".mobile-menu a");

if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
        const menuIsOpen = mobileMenu.classList.toggle("open");
        menuButton.classList.toggle("active", menuIsOpen);
        menuButton.setAttribute("aria-expanded", menuIsOpen);
    });

    mobileMenuLinks.forEach((link) => {
        link.addEventListener("click", () => {
            mobileMenu.classList.remove("open");
            menuButton.classList.remove("active");
            menuButton.setAttribute("aria-expanded", "false");
        });
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".navbar")) {
            mobileMenu.classList.remove("open");
            menuButton.classList.remove("active");
            menuButton.setAttribute("aria-expanded", "false");
        }
    });
}

// Mobile package tabs; all three offers remain visible on desktop.
const packageSelector = document.querySelector(".package-selector");
if (packageSelector) {
    const packageTabs = [...packageSelector.querySelectorAll("[data-package]")];
    const packagePanels = packageTabs.map(tab => document.getElementById(tab.getAttribute("aria-controls")));
    const packageMedia = window.matchMedia("(max-width: 768px)");
    let selectedPackage = "signature";

    function renderPackageSelection() {
        const mobile = packageMedia.matches;
        packageSelector.hidden = !mobile;
        packageSelector.setAttribute("role", "tablist");
        packageTabs.forEach((tab, index) => {
            const selected = tab.dataset.package === selectedPackage;
            tab.setAttribute("role", "tab");
            tab.setAttribute("aria-selected", String(selected));
            tab.tabIndex = selected ? 0 : -1;
            const panel = packagePanels[index];
            panel.hidden = mobile && !selected;
            if (mobile) {
                panel.setAttribute("role", "tabpanel");
                panel.setAttribute("aria-labelledby", tab.id);
                panel.tabIndex = 0;
            } else {
                panel.removeAttribute("role");
                panel.removeAttribute("tabindex");
                panel.setAttribute("aria-labelledby", `title-${tab.dataset.package}`);
            }
        });
    }

    packageTabs.forEach((tab, index) => {
        tab.addEventListener("click", () => {
            selectedPackage = tab.dataset.package;
            renderPackageSelection();
        });
        tab.addEventListener("keydown", event => {
            let next;
            if (event.key === "ArrowRight") next = (index + 1) % packageTabs.length;
            else if (event.key === "ArrowLeft") next = (index - 1 + packageTabs.length) % packageTabs.length;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = packageTabs.length - 1;
            else return;
            event.preventDefault();
            selectedPackage = packageTabs[next].dataset.package;
            renderPackageSelection();
            packageTabs[next].focus();
        });
    });
    packageMedia.addEventListener("change", renderPackageSelection);
    renderPackageSelection();
}
