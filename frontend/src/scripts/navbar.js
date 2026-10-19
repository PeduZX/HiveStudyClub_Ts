const loginButton = document.querySelector(".btnLogin");
if (loginButton) {
  const token = localStorage.getItem("token");
  const nome = localStorage.getItem("nome");
  loginButton.textContent = token && nome ? nome : "Faça Login";
  loginButton.href = token && nome ? "perfil.html" : "login.html";
}
const siteHeader = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const navDrawer = document.getElementById("navDrawer");
const menuOverlay = document.getElementById("menuOverlay");
const menuCloseBtn = document.getElementById("menuCloseBtn");
const menuToggleIcon = document.getElementById("menuToggleIcon");

if (siteHeader && menuToggle && navDrawer && menuOverlay && menuCloseBtn && menuToggleIcon) {
  window.addEventListener("scroll", () => {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 20);
  });

  function closeMenu() {
    navDrawer.classList.remove("is-open");
    menuOverlay.classList.remove("is-open");
    menuToggleIcon.className = "ri-menu-3-line";
    document.body.style.overflow = "";
  }

  function openMenu() {
    navDrawer.classList.add("is-open");
    menuOverlay.classList.add("is-open");
    menuToggleIcon.className = "ri-close-line";
    document.body.style.overflow = "hidden";
  }

  menuToggle.addEventListener("click", () =>
    navDrawer.classList.contains("is-open") ? closeMenu() : openMenu(),
  );
  menuCloseBtn.addEventListener("click", closeMenu);
  menuOverlay.addEventListener("click", closeMenu);
}
