[⇐ addon-script list](../#addon-scripts)

![reddit custom-api](preview/preview1.png)

![reddit custom-api](preview/preview2.png)

This is mainly for `custom-api` and/or "probably" `extension` too. This does not work on native Glance widget.

# How to load
```html
  <script defer src="/assets/path-to-addon-script/tab-notification/script.js?v=1"></script>
```

# Usage
1. Add this the template config
    ```html
    <template class="tab-notification display-none" tab-notification-count="{{ $notificationCount }}" tab-title="New update found..."></template>
    ```
    make sure it's outside any loop, preferably at the very end.
2. `tab-notification-count` attribute can hold a text like "!" paired with `tab-notification-error` attribute to make the background-color negative.
3. `{{ $notificationCount }}` as an example can be inside a loop to count the number of data, preferably inside a condition like if within a certain date
    ```go
    {{ $notificationCount := 0 }}
    {{ range $index, $item := $items }}
        {{ $notificationCount = add $notificationCount 1 }}
    {{ end }}
    ```