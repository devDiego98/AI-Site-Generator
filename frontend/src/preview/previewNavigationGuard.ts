/**
 * Injected into the preview iframe so links do not unload the preview document.
 * - href="#" with onClick (SPA nav) — preventDefault only so React handlers still run.
 * - href="#section" — scroll in-page without unloading srcDoc.
 * - Path URLs (/page) and http(s) links are blocked.
 */
export const PREVIEW_NAVIGATION_GUARD_SCRIPT = `
(function () {
  function isHashLink(href) {
    if (href == null) return false;
    var value = String(href).trim();
    return value === '#' || value.charAt(0) === '#';
  }

  function shouldBlockNavigation(href) {
    if (href == null) return false;
    var value = String(href).trim();
    if (!value || value === '#') return false;
    if (value.charAt(0) === '#') return false;
    if (/^mailto:/i.test(value) || /^tel:/i.test(value)) return false;
    if (/^(https?:|javascript:)/i.test(value)) return true;
    if (value.charAt(0) === '/') return true;
    if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) return true;
    return false;
  }

  document.addEventListener(
    'click',
    function (event) {
      var target = event.target;
      if (!target || !target.closest) return;
      var anchor = target.closest('a[href]');
      if (!anchor) return;
      var href = anchor.getAttribute('href');
      if (href == null) return;

      if (isHashLink(href)) {
        event.preventDefault();
        var id = String(href).trim().slice(1);
        if (!id) {
          return;
        }
        event.stopPropagation();
        var el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      if (!shouldBlockNavigation(href)) return;
      event.preventDefault();
      event.stopPropagation();
    },
    true,
  );
})();
`.trim()
