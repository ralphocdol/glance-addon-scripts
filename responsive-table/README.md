[⇐ addon-script list](../#addon-scripts)

![preview1](preview/preview1.webp)
![preview2](preview/preview2.webp)

# Dependency
- [CREATE_ELEMENT](../global-functions/CREATE_ELEMENT.js) *(required)*

# How to load
Read the main [README.md](https://github.com/ralphocdol/glance-addon-scripts/blob/main/README.md#loading-script) on how to properly load this.
```html
  <link rel="preload" href="/assets/glance-addon-scripts/responsive-table/style.css?v=1" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <script defer src="/assets/glance-addon-scripts/responsive-table/script.js?v=1"></script>
```

# Limitations
This is a client-only implementation—**no server-side support**—because of how Glance is structured and how scripts are delivered.

> [!WARNING]
>
> Large datasets are **strongly discouraged**. All data is stored and queried directly from the DOM, which may impact performance.
>
> Pagination limits what's shown, but the full dataset remains in your browser. This can lead to major slowdowns or even browser crashes.
>
> Performance is acceptable with up to ~50–100 entries on most systems. Beyond that, behavior may vary depending on device and data complexity.

# Usage
## Structure Layout
```html
<template responsive-table>           <!-- Main table container -->
  <div table-pagination-options />    <!-- Required, pagination options -->
  <div table-header>                  <!-- Table header container -->
    <div>Header 1</div>               <!-- Each column header -->
  </div>
  <div table-body>                    <!-- Row items container -->
    <div table-row>                   <!-- Container of each cell of the row -->
      <div>Item 1</div>               <!-- The Cell item, must match header count -->
    </div>
  </div>
</template>
```

## Structure Info
`responsive-table`

Will be the fragment container for your data-table.

**Child Elements**
- `table-pagination-options`
  
    **Attributes**
    - `min-height`: minimum height of the table as `number`, this should prevent layout shifting. Can be unset but defaults to 120. Gets converted to a `px`
    - `min-height-mobile`: similar to `min-height` but for mobile.
    - `page-size`: visible rows per page.
    - `page-size-mobile`: same with `page-size` but for mobile view.
    - `total-entries`: Array Length of the Table, this should be set in the custom-api template
  

- `table-header`

    **Attributes (per column)**
    - `sortable`: Enables sorting on the column.
    - `data-width`: Defines the column's proportional width (e.g., `3` for `3fr`).
    - `data-sort-direction`: Sets the default sort order to `asc`ending or `desc`ending. These are mutually exclusive—only one of them should be used. If both are present, only the first column with the attribute takes effect.

- `table-body`: Contains the list of data rows.

    **Child Elements**
    - `table-row`: Represents a single data row, must have and index value from the loop of data

        **Attributes (per cell)**
        - `data-show-on-mobile`: By default, every cell is collapsed on mobile. Set this to make them visible instead.
        - `data-as-mobile-title`: Marks this cell as the row's title on mobile views.
        - `data-as-collapsed-column`: Moves this cell into a collapsible section on desktop views.
        - `data-to-sort`: Useful when a cell contains complex DOM that interferes with normal sorting behavior.

All rows must maintain the same number of cells as defined in the header.


## Example
```html
<div responsive-table>
  <div table-pagination-options
    min-height="497"
    min-height-mobile="605.5"
    page-size="10"
    page-size-mobile="5"
    total-entries="30"
  ></div>
  <div table-header>
    <div sortable>ID</div>
    <div sortable data-width="3">Name</div>
    <div sortable>Price</div>
    <div sortable data-sort-direction="asc">Availability</div>
  </div>
  <div table-body>
    <div table-row="1">
      <div>1</div>
      <div data-as-mobile-title>item_1</div>
      <div data-as-collapsed-column>$10.00</div>
      <div data-show-on-mobile class="color-positive">Available</div>
    </div>
    <div table-row="2">
      <div>2</div>
      <div data-as-mobile-title>item_2</div>
      <div data-as-collapsed-column>$15.00</div>
      <div data-show-on-mobile class="color-negative">Out of stock</div>
    </div>
  </div>
</div>
```

### Example Widgets
- [Beszel System Table](https://github.com/ralphocdol/glance-custom-widgets/tree/main/custom-api/beszel-system-table)
- [OMV Drives Table](https://github.com/ralphocdol/glance-custom-widgets/tree/main/custom-api/omv-drives-table)
- [ProxmoxVE VM/LXC Table](https://github.com/ralphocdol/glance-custom-widgets/tree/main/custom-api/proxmox-ve-table)