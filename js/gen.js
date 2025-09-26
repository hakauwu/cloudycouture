import { showNotification } from "./notification.js";

document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loaderSection");
  const links = document.querySelectorAll("a");

  function showLoader() {
    if (loader) loader.style.display = "flex";
  }
  function hideLoader() {
    if (loader) loader.style.display = "none";
  }

  links.forEach(link => {
    link.addEventListener("click", e => {
      const href = link.getAttribute("href");

      if (href && href !== "#" && !href.startsWith("javascript")) {
        showLoader();
      }
    });
  });

  window.addEventListener("load", hideLoader);

  window.showLoader = showLoader;
  window.hideLoader = hideLoader;
});
