/**
 * Fuse.js v7.0.0 - Lightweight fuzzy-search (http://fusejs.io)
 *
 * Copyright (c) 2023 Kiro Risk (http://kiro.me)
 * All Rights Reserved. Apache Software License 2.0
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/*
  PaperMod v8+
  License: MIT https://github.com/adityatelange/hugo-PaperMod/blob/master/LICENSE
  Copyright (c) 2020 nanxiaobei and adityatelange
  Copyright (c) 2021-2025 adityatelange
 */

(() => {
  let fuseInstance, firstResult, lastResult;
  const config = {
    distance: 1000,
    isCaseSensitive: false,
    keys: ["title", "permalink", "summary", "content"],
    location: 0,
    minMatchCharLength: 0,
    shouldSort: true,
    threshold: 0.4,
  };

  const searchResults = document.getElementById("searchResults");
  const searchInput = document.getElementById("searchInput");
  let activeElement = null;
  let hasResults = false;

  // Load the search index on window load
  window.onload = function () {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data) {
            const fuseOptions = {
              distance: 100,
              threshold: 0.4,
              ignoreLocation: true,
              keys: ["title", "permalink", "summary", "content"],
            };

            // Merge custom config if available
            const options = config
              ? {
                  isCaseSensitive: config.isCaseSensitive ?? false,
                  includeScore: config.includeScore ?? false,
                  includeMatches: config.includeMatches ?? false,
                  minMatchCharLength: config.minMatchCharLength ?? 1,
                  shouldSort: config.shouldSort ?? true,
                  findAllMatches: config.findAllMatches ?? false,
                  keys: config.keys ?? ["title", "permalink", "summary", "content"],
                  location: config.location ?? 0,
                  threshold: config.threshold ?? 0.4,
                  distance: config.distance ?? 100,
                  ignoreLocation: config.ignoreLocation ?? true,
                }
              : fuseOptions;

            fuseInstance = new Fuse(data, options);
          }
        } else {
          console.error(xhr.responseText);
        }
      }
    };
    xhr.open("GET", "../index.json");
    xhr.send();
  };

  // Focus handling for search results
  function focusElement(element) {
    document.querySelectorAll(".focus").forEach((el) => el.classList.remove("focus"));
    if (element) {
      element.focus();
      document.activeElement = activeElement = element;
      element.parentElement.classList.add("focus");
    } else {
      document.activeElement.parentElement.classList.add("focus");
    }
  }

  // Clear search results
  function clearSearch() {
    hasResults = false;
    searchResults.innerHTML = searchInput.value = "";
    searchInput.focus();
  }

  // Handle search input
  searchInput.onkeyup = function () {
    if (fuseInstance) {
      let results;
      if (config) {
        results = fuseInstance.search(this.value.trim(), { limit: config.limit });
      } else {
        results = fuseInstance.search(this.value.trim());
      }

      if (results.length !== 0) {
        let resultHTML = "";
        results.forEach((result) => {
          resultHTML += `
            <li class="post-entry">
              <header class="entry-header">${result.item.title} &raquo;</header>
              <a href="${result.item.permalink}" aria-label="${result.item.title}"></a>
            </li>`;
        });
        searchResults.innerHTML = resultHTML;
        hasResults = true;
        firstResult = searchResults.firstChild;
        lastResult = searchResults.lastChild;
      } else {
        hasResults = false;
        searchResults.innerHTML = "";
      }
    }
  };

  // Clear search on "search" event
  searchInput.addEventListener("search", function () {
    if (!this.value) clearSearch();
  });

  // Keyboard navigation for search results
  document.onkeydown = function (event) {
    const key = event.key;
    const active = document.activeElement;
    const isInSearchBox = document.getElementById("searchbox").contains(active);

    if (active === searchInput) {
      document.querySelectorAll(".focus").forEach((el) => el.classList.remove("focus"));
    } else if (activeElement) {
      active = activeElement;
    }

    if (key === "Escape") {
      clearSearch();
    } else if (!hasResults || !isInSearchBox) {
      return;
    } else if (key === "ArrowDown") {
      event.preventDefault();
      if (active === searchInput) {
        focusElement(searchResults.firstChild.lastChild);
      } else if (active.parentElement !== lastResult) {
        focusElement(active.parentElement.nextSibling.lastChild);
      }
    } else if (key === "ArrowUp") {
      event.preventDefault();
      if (active.parentElement === firstResult) {
        focusElement(searchInput);
      } else if (active !== searchInput) {
        focusElement(active.parentElement.previousSibling.lastChild);
      }
    } else if (key === "ArrowRight" && active.click) {
      active.click();
    }
  };
})();