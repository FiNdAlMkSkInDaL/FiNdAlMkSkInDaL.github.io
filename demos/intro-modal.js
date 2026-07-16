/**
 * Project intro modal — show once on load; dismiss on any click or key.
 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    // Garden shell already shows the intro — skip when embedded
    try {
      if (window.self !== window.top) {
        var embedded = document.getElementById("introModal");
        if (embedded) embedded.hidden = true;
        return;
      }
    } catch (e) {
      var embeddedCatch = document.getElementById("introModal");
      if (embeddedCatch) embeddedCatch.hidden = true;
      return;
    }

    var modal = document.getElementById("introModal");
    if (!modal || modal.hidden) return;

    var reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var dismissed = false;

    function dismiss(e) {
      if (dismissed) return;
      dismissed = true;

      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      window.removeEventListener("pointerdown", dismiss, true);
      window.removeEventListener("keydown", dismiss, true);
      window.removeEventListener("touchstart", dismiss, true);

      if (reduceMotion) {
        modal.hidden = true;
        return;
      }

      modal.classList.add("is-leaving");
      var done = false;
      function finish() {
        if (done) return;
        done = true;
        modal.hidden = true;
        modal.classList.remove("is-leaving");
      }
      modal.addEventListener("animationend", finish, { once: true });
      // Safety if animationend doesn't fire
      setTimeout(finish, 280);
    }

    // Capture phase so the first interaction only dismisses, not the UI under it
    window.addEventListener("pointerdown", dismiss, true);
    window.addEventListener("keydown", dismiss, true);
    // Older mobile Safari fallback
    window.addEventListener("touchstart", dismiss, { capture: true, passive: false });
  });
})();
