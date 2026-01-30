[⇐ addon-script list](../#addon-scripts)

No native modal in Glance at the moment though there was a request for it: https://github.com/glanceapp/glance/discussions/190

Until then, this will have to do.

![preview1](preview/preview1.png)
![preview2](preview/preview2.png)

# How to load
```html
  <link rel="preload" href="/assets/glance-addon-scripts/modal/style.css?v=1" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <script defer src="/assets/glance-addon-scripts/modal/script.js?v=1"></script>
```

# Usage
```html
<div custom-modal>
  <!-- <div modal-header>
    Header, can be omitted
  </div> -->
  <div modal-body>
    Body
  </div>
  <!-- <div modal-footer>
    Footer, can be omitted
  </div> -->
  Click me! <!-- Single html tag or plain text as the button -->
</div>
```
## Modal Attributes
| Attribute | Required | Default | Options | Description |
| --------- | -------- | ------- | ------- | ----------- |
| custom-modal | Yes | - | - | Will be used as a modal container |
| dismiss-on-outside-click | No | false | true, false | will allow the modal to be closed when clicked anywhere outside the modal |
| no-dismiss-on-escape-key | No | false | true, false | will prevent the modal to be closed with an `Escape` key |
| modal-no-background | No | false | true, false | will remove the background of the modal |
| width | No | wide-auto | small, medium, wide, full | Sets the width of the modal. Append `-auto` to make it dynamic up to the selected width. |
| height | No | tall-auto | short, medium, tall, full | Sets the "maximum" height of the modal, will automatically use the height depending on the content. Append `-auto` to make it dynamic up to the selected height. |