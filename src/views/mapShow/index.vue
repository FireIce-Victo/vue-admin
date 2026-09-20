<template>
  <div class="map">
    <div ref="mapBox" class="map-box"></div>
    <div class="map-action">
      <div class="action flex-center p-1">
        <el-button class="action-btn" link @click="addMarker()">添加标记</el-button>
        <span class="line"></span>
        <el-button class="action-btn" link @click="drawTrack()">绘制轨迹</el-button>
        <span class="line"></span>
        <el-button class="action-btn" link @click="clearAllFeatures">清除标记与轨迹</el-button>
      </div>
    </div>
    <!-- <div class="controls">
      
      
    </div> -->
  </div>
</template>

<script setup>
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { XYZ } from 'ol/source';
import { onMounted, ref } from 'vue';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { LineString, Point } from 'ol/geom';
import { Style, Fill, Stroke, Text, Circle } from 'ol/style';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { defaults } from 'ol/control';

const mapBox = ref(null); // 地图容器DOM
let map; // 地图实例
let vectorSource = new VectorSource(); // 矢量数据源
let vectorLayer = null; // 矢量图层

// 初始化地图
const initMap = () => {
  const mapUrl = 'https://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}';
  // 基本图层
  const layer = new TileLayer({
    source: new XYZ({
      url: mapUrl
    })
  });

  // 矢量图层
  vectorLayer = new VectorLayer({
    source: vectorSource
  });
  map = new Map({
    target: mapBox.value,
    layers: [layer, vectorLayer],
    view: new View({
      center: fromLonLat([114.298572, 30.584355]),
      zoom: 12
    }),
    controls: defaults({
      attribution: false,
      rotate: false,
      zoom: false
    })
  });
};

onMounted(() => {
  if (mapBox.value) {
    initMap();
  }
});

/**
 * 添加标记点
 * @param lon 经度
 * @param lat  纬度
 * @param label 文本标签
 */
const addMarker = (lon = 114.305, lat = 30.593, label = '点') => {
  if (!map) return;

  const feature = new Feature({
    geometry: new Point(fromLonLat([lon, lat]))
  });

  feature.setStyle(
    new Style({
      image: new Circle({
        radius: 8,
        fill: new Fill({ color: 'red' }),
        stroke: new Stroke({ color: 'white', width: 2 })
      }),
      text: new Text({
        text: label,
        offsetY: -15,
        font: '12px sans-serif',
        fill: new Fill({ color: '#333' }),
        stroke: new Stroke({ color: '#fff', width: 3 })
      })
    })
  );

  vectorSource.addFeature(feature);
};

/**
 * 绘制轨迹
 * @param coordinates 坐标数组
 */
const drawTrack = (
  coordinates = [
    [114.316, 30.581], // 武昌洪山广场
    [114.305, 30.593], // 汉口江汉路
    [114.418, 30.511], // 光谷广场
    [114.357, 30.539]
  ]
) => {
  if (!map) return;

  const pointsData = coordinates.map(([lon, lat]) => fromLonLat([lon, lat]));

  const feature = new Feature({
    geometry: new LineString(pointsData)
  });

  feature.setStyle(
    new Style({
      stroke: new Stroke({
        color: '#00AAFF',
        width: 4,
        lineDash: [8, 4]
      })
    })
  );

  vectorSource.addFeature(feature);
};

/**
 * 添加自定义图层
 * @param url 瓦片url
 * @param layerName 名称
 */
const addCustomLayer = (url, layerName = '自定义地图') => {
  if (!map) return;

  const customLayer = new TileLayer({
    source: new XYZ({ url: url }),
    properties: { name: layerName }
  });

  map.addLayer(customLayer);
};

/**
 * 清除所有的矢量标记
 */
const clearAllFeatures = () => {
  vectorSource.clear();
};
</script>

<style scoped lang="scss">
.map {
  position: relative;
  height: 100%;

  .map-box {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }

  .map-action {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
    min-width: 300px;

    .action {
      background: white;
      position: relative;
      border-radius: 4px;

      .line {
        height: 10px;
        border-left: 1px dashed #829BB8;
      }

      .action-btn {
        padding: 5px;
        margin: 0 5px;
        color: #829BB8;

        .item-icon {
          color: #409EFF;
        }

        &:hover {
          color: #409EFF;
        }

        &.is-disabled {
          color: #33445b;

          .item-icon {
            color: #33445b;
          }
        }
      }
    }
  }
}
</style>
