[⇐ addon-script list](../#addon-scripts)

Adding `<script></script>` in the `custom-api` template property or in the `html` source property does not work as of now, as the script will not load. Additionally, there is currently no way to automatically refresh widgets independently, with this, you can now load a script.

> [!Caution]
>
> Using API queries like `fetch` with API keys within the script is possible but it WILL expose them in the browser.

# How to load
```html
  <script defer src="/assets/path-to-addon-script/html-script-loader/script.js?v=1"></script>
```

# Usage
The template should have the attribute `html-script`.

Add a script like so below your `custom-api`'s template property or `html`'s source property.
```javascript
<script html-script>
  // your script should be in here
</script>
```

### Basic example
```yml
- type: custom-api
  url: https://domain.com/api
  headers:
    Accept: application/json
  template: | #gohtml
    <script html-script>
      const updateClock = () => {
          const now = new Date();
          document.getElementById('clock').textContent = now.toLocaleTimeString();
      };

      updateClock();
      setInterval(updateClock, 1000);
    </script>
    <div id="clock"></div>
```

### Example with API query
```yml
- type: custom-api
  cache: 6h
  css-class: custom-widget-test # as your main class element to make sure you don't update anything else
  template: | #gohtml
    <script html-script>
      setInterval(async () => {
        const mainElement = document.querySelector('.custom-widget-test');
        if (mainElement && mainElement.length === 0) return;
        const targetElement = mainElement.querySelector('.target-class');
        try {
          const response = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random');
          const data = await response.json();
          targetElement.querySelector('.custom-text').innerText = data.text;
        } catch (error) {
          console.error({ from: 'custom-widget-test.yml', error });
        }
      }, 300000); // every 5mins, change depending on the API's rate limit
    </script>
    <div class="target-class">
        <p class="size-h4 color-paragraph custom-text">{{ .JSON.String "text" }}</p>
    </div>
```