const glanceSearch = {
    searchUrl: 'https://duckduckgo.com/?q={QUERY}',
    autofocus: false,
    target: '_blank',
    placeholder: 'Type here to search…',
    bangs: [
        { title: '', shortcut: '', url: '' },       // duplicate as needed
    ]
};
const showBangSuggest = true;                       // Suggests the search bang list
const searchSuggestEndpoint = '';
const pagesSlug = [                                 // Other page search may or may not work due to limitations, and can be slow
    // 'home-page',
    // 'page-1',
    // 'page-2',
];
const cleanupOtherPages = true;                     // Warning: setting this to false is like having (# of pagesSlug) tabs opened all at once
const glimpseKey = '';
const waitForGlance = true;
const detectUrl = true;                             // Make sure to set to false if https://github.com/glanceapp/glance/issues/229 is addressed.
const mobileBottomSearch = true;
const resizeOnSoftKeyboardOpen = false;             // Read Glimpse's README
const autoClose = false;                            // Closes Glimpse on search submit
const preserveQuery = true;                         // Preserves search query