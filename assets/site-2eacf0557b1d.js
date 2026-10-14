// The MonChexx wiki's behaviours (tools/wiki/build.py). Each finds what it
// works on by data attributes the kit writes (tools/wiki/kit.py), so a new
// list, filter or menu needs no new script.

// A filter bar (kit.filter_bar) shows only the items whose data-<facet>
// holds the pressed button's value; the first button shows them all.
document.querySelectorAll("[data-filter]").forEach(function (bar) {
  var facet = bar.getAttribute("data-filter");
  var buttons = bar.querySelectorAll("[data-filter-value]");
  var items = document.querySelectorAll("[data-" + facet + "]");
  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      var value = button.getAttribute("data-filter-value");
      buttons.forEach(function (other) {
        other.setAttribute("aria-pressed", other === button ? "true" : "false");
      });
      items.forEach(function (item) {
        var values = (item.getAttribute("data-" + facet) || "").split("/");
        item.hidden = value !== "" && values.indexOf(value) < 0;
      });
    });
  });
});

// A row that slides sideways when it holds more than fits (the top bar's
// sections in a language with long words, on a phone) keeps its current
// item in view and says on which side of the screen there is more --
// data-more="left", "right" or "both" -- for the stylesheet to fade it.
document.querySelectorAll("[data-scroll-row]").forEach(function (row) {
  function mark() {
    var hidden = row.scrollWidth - row.clientWidth;
    // How far the row is slid from where it starts: from the left in a
    // left-to-right language, from the right (scrollLeft below 0) in Arabic.
    var slid = Math.abs(row.scrollLeft);
    var left = getComputedStyle(row).direction === "rtl" ? hidden - slid : slid;
    var more = (left > 1 ? "left" : "") + (left < hidden - 1 ? "right" : "");
    if (more === "leftright") {
      more = "both";
    }
    if (more) {
      row.setAttribute("data-more", more);
    } else {
      row.removeAttribute("data-more");
    }
  }
  var current = row.querySelector("[aria-current]");
  if (current && row.scrollWidth > row.clientWidth) {
    current.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  mark();
  row.addEventListener("scroll", mark, { passive: true });
  window.addEventListener("resize", mark);
});

// A menu (kit.language_menu) closes when a tap lands anywhere else.
document.addEventListener("click", function (event) {
  document.querySelectorAll("details[data-menu][open]").forEach(function (menu) {
    if (!menu.contains(event.target)) {
      menu.removeAttribute("open");
    }
  });
});

// A language picked from the menu is the one the wiki's address opens next
// time (the root page reads it back); a browser that keeps nothing just
// goes by its own languages.
document.querySelectorAll("[data-remember-language]").forEach(function (link) {
  link.addEventListener("click", function () {
    try {
      localStorage.setItem("monchexx-wiki-language", link.getAttribute("lang"));
    } catch (error) {}
  });
});
