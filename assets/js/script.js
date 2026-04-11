document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function (event) {
      const hash = this.hash;

      if (hash && document.querySelector(hash)) {
        event.preventDefault();

        document.querySelector(hash).scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        history.pushState(null, "", hash);
      }
    });
  });

  const hamburger = document.querySelector(".hamburger");
  const nav = document.querySelector("nav");

  if (hamburger && nav) {
    hamburger.addEventListener("click", function () {
      nav.classList.toggle("active");

      const expanded = this.getAttribute("aria-expanded") === "true";
      this.setAttribute("aria-expanded", String(!expanded));
    });
  }
});
