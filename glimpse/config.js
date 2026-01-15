const glimpseConfig = {
  glanceSearch: {
    searchUrl: 'https://duckduckgo.com/?q={QUERY}',
    autofocus: false,
    target: '_blank',
    placeholder: 'Type here to search…',
    bangs: [
      { title: 'DuckDuckGo', shortcut: '!ddg', url: 'https://duckduckgo.com/?q={QUERY}', rawQuery: false }, // duplicate as needed
    ],
  },
  showBangSuggest: true, // Suggests the search bang list
  searchSuggestEndpoint: '',
  pagesSlug: [
    // Other page search may or may not work due to limitations, and can be slow
    // 'home-page',
    // 'page-1',
    // 'page-2',
  ],
  cleanupOtherPages: true, // Warning: setting this to false is like having (# of pagesSlug) tabs opened all at once
  glimpseKey: '',
  waitForGlance: true,
  detectUrl: true, // Make sure to set to false if https://github.com/glanceapp/glance/issues/229 is addressed.
  mobileBottomSearch: true,
  resizeOnSoftKeyboardOpen: false, // Read Glimpse's README
  autoClose: false, // Closes Glimpse on search submit
  preserveQuery: true, // Preserves search query
};
