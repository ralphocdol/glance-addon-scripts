[⇐ Micro-script list](../#micro-scripts)

Will be used for other scripts that may need a custom settings like [Glimpse](../glimpse).

![desktop](preview/preview1.png)
![mobile](preview/preview2.png)

# Dependency
- [Toast Message](../toast-message) *(required)*
- [CREATE_ELEMENT](../global-functions/CREATE_ELEMENT.js) *(required)*
- [Custom Menu](../custom-menu) *(required)* — adds the launch button
- [Modal](../modal) *(required)* - Used as the element to add contents to

# Usage
Needs to be in the `post-glance.js` of your widget. See other widgets that used this as this can be complicated.

## Structure
```javascript
  window.createCustomSettingsItem?.({
    nameHTML: 'Name of Settings',
    contentObject: [
      { type: 'toggle', name: 'A toggle button', key: 'action-of-the-button', value: true, colOffset: 1 },
      { type: 'text', name: 'A text field', key: 'action-of-its-save-button' value: 'The current value', tooltip: 'If needed' }
    ],
    contentEventListener: {
      // Every function here has access to the following:
      // _SETTING_ELEMENT_ = this is the main element, the parent element
      // _KEY_ = the key of the element, mainly used for class of the parent element
      // 
      // Every function cannot access anything outside of window.createCustomSettingsItem
      // 
      // 
      
      setup: () => {
        // a custom function
        
        // Scripts here are the shared across other eventListeners,
        // this is where you initialize a variable or a functions
        const var1 = 'I am a variable from setup()';
      },
      ready: () => {
        // a custom function
        
        // Scripts here are launched once on load, sure you can add
        // this to the setup() but this is more isolated with IIFE
        // and will not share anything to other events
      },
      cleanup: () => {
        // a custom function

        // This function runs after you click away from this settings.
      },
      click: () => {
        // this is a built in event type and will look and work like 
        // addEventListener('click', () => {});
        
        // This is also isolated with IIFE so it will not share anything 
        // outside this event, similar to other event native to addEventListener
      }
    }
  });
```