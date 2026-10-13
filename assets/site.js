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
