'use strict'
const Router = require('koa-router');
const router = new Router();

const {
  list_all,
  find_coordinate,
  convert_to_geojson,
  dissolve2_simplify_geojson,
  dissolve2_geojson
} = require('./boundary.js')

// list all valid boundary data by type(amap or bmap)
router.get('/api/all', async(ctx, next) => {
  const type = ctx.request.query.type
  const boundary_names = list_all(type)
  ctx.status = 200
  ctx.body = boundary_names
})

// get geojson of multiple boundaries as a feature collection
router.post('/api/unmerged', async(ctx, next) => {
  const data = ctx.request.body
  const {
    type
  } = ctx.request.query
  if (!data || !Array.isArray(data) || data.length === 0) {
    ctx.status = 400
    ctx.body = 'Invalid request body'
    return
  }
  const coordinates = data.map(name => ({
    name: name,
    MultiPolygon: find_coordinate(type, name)
  }))
  ctx.status = 200
  ctx.body = convert_to_geojson(coordinates)
})

// get geojson of a categorized boundary definition
// simplified if type is amap
router.post('/api/merged', async(ctx, next) => {
  const data = ctx.request.body
  const {
    type
  } = ctx.request.query
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    ctx.status = 400
    ctx.body = 'Invalid request body'
    return
  }
  const categories = Object.keys(data)
  const ps = categories.map(category => {
    const coordinates = data[category].map(name => ({
      name: name,
      MultiPolygon: find_coordinate(type, name)
    }))
    if (type === 'bmap') {
      return dissolve2_geojson(convert_to_geojson(coordinates))
    } else if (type === 'amap') {
      return dissolve2_simplify_geojson(convert_to_geojson(coordinates))
    }
  })
  return Promise.all(ps).then(results => {
    ctx.status = 200
    ctx.body = {
      type: "FeatureCollection",
      features: results.map((geo, index) => ({
        type: "Feature",
        geometry: geo["geometries"][0],
        properties: {
          name: categories[index]
        }
      }))
    }
  })
})

module.exports = router
