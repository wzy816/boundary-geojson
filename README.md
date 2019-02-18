# 地图行政区域边界合并

## 描述

-   根据行政区域名称，生成区域边界geojson
-   获取多个边界的坐标，生成geojson
-   根据自定义类别合并多个边界，生成geojson
-   支持两类地图数据，高德地图(amap)和百度地图(bmap)
-   推荐使用高德数据

## 行政区划

### 参考数据源

-   [国家统计局](http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2017/index.html)
-   [2018年11月中华人民共和国县以上行政区划代码](http://www.mca.gov.cn/article/sj/xzqh/2018/)
-   [Administrative-divisions-of-China pcas](https://github.com/modood/Administrative-divisions-of-China)
-   [中华人民共和国县级以上行政区列表 mca](https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%8D%8E%E4%BA%BA%E6%B0%91%E5%85%B1%E5%92%8C%E5%9B%BD%E5%8E%BF%E7%BA%A7%E4%BB%A5%E4%B8%8A%E8%A1%8C%E6%94%BF%E5%8C%BA%E5%88%97%E8%A1%A8)

### 百度地图特例

以下部分行政区划在百度地图数据中有不同的定义，请求接口时请替换

| 行政区划名称          | 百度地图数据名称 |
| --------------- | -------- |
| 文山市             | 文山       |
| 那曲市             | 那曲       |
| 积石山保安族东乡族撒拉族自治县 | 积石山      |

## 部署

[docker hub](https://hub.docker.com/r/zhiyang/boundary-geojson)

```bash
# pull image
docker pull zhiyang/boundary-geojson:latest

# run
docker run -d --restart=always -p 3000:3000 zhiyang/boundary-geojson:latest
```

## 接口

所有接口需添加参数`type=amap`(表示采用高度地图数据)或`type=bmap`(表示采用百度地图数据)，以下为amap为例。
部署环境以localhost为例，端口3000

### 获取所有可用行政区划名称接口

#### 请求示例

```curl
curl -X GET 'http://localhost:3000/api/all?type=bmap'
```

#### 返回部分示例

```json
[
    "丁青县",
    "七台河市",
    "七星"
]
```

### 获取未合并的单个或多个行政区划的 geojson 接口

#### 请求示例

```curl
curl -X POST \
  'http://localhost:3000/api/unmerged?type=amap' \
  -H 'Content-Type: application/json' \
  -d '["石家庄市","邯郸市"]'
```

#### 返回示例

```json
{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[115.324713,38.248152],[115.323697,38.235615],[115.323388,38.230719],[115.324713,38.248152]]]]},"properties":{"name":"石家庄市"}},{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[113.794941,36.994985],[113.80502,37.002263],[113.813149,37.00628],[113.821337,37.008889],[113.794941,36.994985]]]]},"properties":{"name":"邯郸市"}}]}
```

### 获取合并的含自定义分类信息多个行政区划的 geojson 接口

#### 请求示例

```curl
curl -X POST \
  'http://localhost:3000/api/merged?type=amap' \
  -H 'Content-Type: application/json' \
  -d '{
	"类别一": ["上海市",
		"南通市"
	],
	"类别二": ["北京市",
		"秦皇岛市"
	]
}
'
```

### 如何使用 curl 提交 json 文件

将分类信息保存到`input.json`，输入geojson文件为`output.json`。

```curl
curl -X POST \
  'http://localhost:3000/api/merged?type=amap' \
  -H 'Content-Type: application/json' \
  -d '@./input.json' \
  > ./output.json
```

#### 返回示例

```json
{"type": "FeatureCollection","features": [{"type": "Feature","geometry": {"type": "MultiPolygon","coordinates": [[[[121.778859,31.310198],[121.764248,31.315309],[121.751166,31.337799],[121.727939,31.354803],[121.590378,31.427544],[121.572251,31.436067],[121.537418,31.466701],[121.510135,31.482575],[121.52113,31.493972],[121.567342,31.483506],[121.585567,31.454671],[121.673842,31.427748],[121.697193,31.423992],[121.742179,31.407206],[121.774137,31.386985],[121.792379,31.363304],[121.796479,31.335419],[121.794069,31.319547],[121.778859,31.310198]]]]},"properties": {"name": "类别一"}},{"type": "Feature","geometry": {"type": "MultiPolygon","coordinates": [[[[119.854252,39.988478],[119.872377,39.960596],[119.872492,39.955854],[119.862412,39.951536],[119.842704,39.95587],[119.835505,39.964442],[119.837607,39.97545],[119.830146,39.972994],[119.829405,39.965419],[119.827152,39.965684],[119.828121,39.97573],[119.835614,39.979318],[119.838988,39.984269],[119.829679,39.981834],[119.826819,39.978262],[119.816883,39.978203],[119.854252,39.988478]]]]},"properties": {"name": "类别二"}}]}
```

## 使用 geojson

-   [geojson.io](http://geojson.io/)
-   [mapshaper.org](https://mapshaper.org/)
-   [Echarts demo](https://ecomfe.github.io/echarts-examples/public/editor.html?c=map-HK)
