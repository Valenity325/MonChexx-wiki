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

// A date (kit.footer) is written as the page's language writes one; a browser
// that cannot keeps the plain 2026-10-14.
document.querySelectorAll("time[data-date]").forEach(function (time) {
  var parts = (time.getAttribute("datetime") || "").split("-");
  try {
    var day = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]));
    time.textContent = new Intl.DateTimeFormat(document.documentElement.lang, { dateStyle: "long", timeZone: "UTC" }).format(day);
  } catch (error) {}
});

// A menu (kit.language_menu) closes when a tap lands anywhere else.
document.addEventListener("click", function (event) {
  document.querySelectorAll("details[data-menu][open]").forEach(function (menu) {
    if (!menu.contains(event.target)) {
      menu.removeAttribute("open");
    }
  });
});

// A word the glossary explains (kit.term) shows its name and short tip in a
// bubble beside it: while a mouse points at it or the keyboard is on it,
// and on a phone, where nothing points, at the first tap -- the bubble then
// has a link to the entry, and a second tap on the word follows the word's
// own. The bubble keeps above the word, below it where the top bar or the
// screen's edge leaves no room, and within the screen's width.
(function () {
  var terms = document.querySelectorAll("a.term[data-tip]");
  if (!terms.length) {
    return;
  }
  var bubble = document.createElement("div");
  bubble.className = "tooltip";
  bubble.id = "term-tooltip";
  bubble.setAttribute("role", "tooltip");
  bubble.hidden = true;
  var title = document.createElement("strong");
  title.className = "tooltip__title";
  var text = document.createElement("span");
  text.className = "tooltip__text";
  var more = document.createElement("a");
  more.className = "tooltip__more";
  more.textContent = document.body.getAttribute("data-term-more") || "";
  bubble.appendChild(title);
  bubble.appendChild(text);
  bubble.appendChild(more);
  document.body.appendChild(bubble);

  var pointing = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var shown = null;
  var leaving = 0;

  function place(term) {
    var box = term.getBoundingClientRect();
    var bar = document.querySelector(".top-bar");
    var ceiling = Math.max(0, bar ? bar.getBoundingClientRect().bottom : 0);
    var edge = 8;
    var gap = 8;
    bubble.style.left = "0px";
    bubble.style.top = "0px";
    var width = bubble.offsetWidth;
    var height = bubble.offsetHeight;
    var middle = box.left + box.width / 2;
    var left = Math.max(edge, Math.min(middle - width / 2, document.documentElement.clientWidth - width - edge));
    var above = box.top - gap - height >= ceiling + edge;
    var top = above ? box.top - gap - height : box.bottom + gap;
    bubble.setAttribute("data-side", above ? "above" : "below");
    bubble.style.setProperty("--arrow", Math.max(12, Math.min(width - 12, middle - left)) + "px");
    bubble.style.left = left + window.scrollX + "px";
    bubble.style.top = top + window.scrollY + "px";
  }

  function show(term) {
    clearTimeout(leaving);
    if (shown && shown !== term) {
      shown.removeAttribute("aria-describedby");
    }
    shown = term;
    title.textContent = term.getAttribute("data-tip-title");
    text.textContent = term.getAttribute("data-tip");
    more.href = term.href;
    bubble.hidden = false;
    term.setAttribute("aria-describedby", bubble.id);
    place(term);
  }

  function hide() {
    clearTimeout(leaving);
    if (shown) {
      shown.removeAttribute("aria-describedby");
    }
    shown = null;
    bubble.hidden = true;
  }

  function hideSoon() {
    clearTimeout(leaving);
    leaving = setTimeout(hide, 150);
  }

  terms.forEach(function (term) {
    var wasShown = false;
    if (pointing) {
      term.addEventListener("mouseenter", function () {
        show(term);
      });
      term.addEventListener("mouseleave", hideSoon);
    }
    term.addEventListener("focus", function () {
      // Only the keyboard's focus: a tap or a click focuses the word too.
      var keyboard = false;
      try {
        keyboard = term.matches(":focus-visible");
      } catch (error) {}
      if (keyboard) {
        show(term);
      }
    });
    term.addEventListener("blur", hideSoon);
    term.addEventListener("pointerdown", function () {
      wasShown = shown === term;
    });
    term.addEventListener("click", function (event) {
      if (!pointing && !wasShown) {
        event.preventDefault();
        show(term);
      }
    });
  });
  bubble.addEventListener("mouseenter", function () {
    clearTimeout(leaving);
  });
  bubble.addEventListener("mouseleave", hideSoon);
  document.addEventListener("click", function (event) {
    if (shown && !bubble.contains(event.target) && !shown.contains(event.target)) {
      hide();
    }
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      hide();
    }
  });
  window.addEventListener("resize", function () {
    if (shown) {
      place(shown);
    }
  });
})();

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
