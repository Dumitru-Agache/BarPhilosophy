const navLinks = document.querySelectorAll(".nav-link");

const observedSections = [...navLinks]
    .map((link) => {
        const sectionId = link.getAttribute("href");
        return document.querySelector(sectionId);
    })
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

observedSections.forEach((section) => {
    sectionObserver.observe(section);
});

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

    keyboard: {
        enabled: true
    }
});

    const menuButton = document.querySelector(".mobile-menu-button");
    const mobileMenu = document.querySelector(".mobile-menu");
    const mobileMenuLinks = document.querySelectorAll(".mobile-menu a");

    if (menuButton && mobileMenu) {

        menuButton.addEventListener("click", () => {
            const menuIsOpen = mobileMenu.classList.toggle("open");

            menuButton.classList.toggle("active", menuIsOpen);
            menuButton.setAttribute("aria-expanded", menuIsOpen);
        });

        mobileMenuLinks.forEach(link => {
            link.addEventListener("click", () => {
                mobileMenu.classList.remove("open");
                menuButton.classList.remove("active");
                menuButton.setAttribute("aria-expanded", "false");
            });
        });

        document.addEventListener("click", event => {
            const clickedInsideNavbar = event.target.closest(".navbar");

            if (!clickedInsideNavbar) {
                mobileMenu.classList.remove("open");
                menuButton.classList.remove("active");
                menuButton.setAttribute("aria-expanded", "false");
            }
        });
    }
