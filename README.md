## Realsee Five Plugin - MiniCompassPlugin
指南针组件

``` javascript
const northRad = (((orientation ? orientation : 180) + 90) / 180) * Math.PI;
modelMiniCompass?.appendTo(ref.current as HTMLElement, northRad);
```