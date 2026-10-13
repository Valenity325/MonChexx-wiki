// The MonChexx wiki: the doll list's role filter (tools/wiki/build.py).
(function () {
  var buttons = document.querySelectorAll(".filter");
  var cards = document.querySelectorAll(".card");
  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      var role = button.getAttribute("data-role");
      buttons.forEach(function (other) {
        other.setAttribute("aria-pressed", other === button ? "true" : "false");
      });
      cards.forEach(function (card) {
        var roles = (card.getAttribute("data-roles") || "").split("/");
        card.hidden = role !== "" && roles.indexOf(role) < 0;
      });
    });
  });
})();

// The language menu closes when a tap lands anywhere else.
document.addEventListener("click", function (event) {
  document.querySelectorAll("details.languages[open]").forEach(function (menu) {
    if (!menu.contains(event.target)) {
      menu.removeAttribute("open");
    }
  });
});

// A language picked from the menu is the one the wiki's address opens next
// time (the root page reads it back); a browser that keeps nothing just
// goes by its own languages.
document.querySelectorAll(".language-menu a[lang]").forEach(function (link) {
  link.addEventListener("click", function () {
    try {
      localStorage.setItem("monchexx-wiki-language", link.getAttribute("lang"));
    } catch (error) {}
  });
});
