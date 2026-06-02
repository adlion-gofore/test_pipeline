"use strict";
(() => {
  // <stdin>
  (function() {
    document.querySelectorAll(".codeblock__copy").forEach(function(btn) {
      btn.addEventListener("click", function() {
        var block = btn.closest(".codeblock");
        var code = block ? block.querySelector("code") : null;
        if (!code) return;
        navigator.clipboard.writeText(code.innerText).then(function() {
          btn.classList.add("codeblock__copy--done");
          setTimeout(function() {
            btn.classList.remove("codeblock__copy--done");
          }, 2e3);
        });
      });
    });
  })();
})();
