const fs = require('fs')
const geojson = require("geojson");
const mapshaper = require("mapshaper")


const BOUNDARY_JSON_DIR = './data/'

// not used
module.exports.is_valid_type = function(type) {
  const TYPES = ['bmap', 'amap']
  if (TYPES.indexOf(map_type) === -1) {
    return false
  } else {
    return true
  }
}

module.exports.list_all = function(map_type) {
  const files = fs.readdirSync(BOUNDARY_JSON_DIR + map_type + "/")
  const boundaries = files
    .filter(f => f.startsWith(map_type) && f.endsWith('.json'))
    .map(file => file.substring(5, file.length - 5))
  return boundaries
};

module.exports.find_coordinate = function(map_type, name) {
  const path = BOUNDARY_JSON_DIR + map_type + "/" + map_type + '_' + name +
    '.json'
  if (!fs.existsSync(path)) {
    console.log(`${path} does not exists.`)
    return []
  }
  let coordinates = []
  if (map_type === 'bmap') {
    coordinates = JSON.parse(fs.readFileSync(path)).map(coordinate =>
      coordinate.split(';').map(co => [
        parseFloat(co.split(',')[0]), parseFloat(co.split(',')[1])
      ]))

    // if a polygon has three identical points, remove it
    coordinates = coordinates.filter(co => {
      const first = co[0]
      const second = co[1]
      const third = co[2]
      if (first[0] == second[0] && first[1] == second[1] && third[0] ==
        second[0] && third[1] == second[1]) {
        console.log(`${path} has three identical points`)
        return false
      }
      return true
    })

    // for a polygon to render successfully
    // the first and the last one must be the same
    // there might be some exceptions where they are too far away
    // these situations must not be handled here
    coordinates.forEach(co => {
      const first = co[0]
      const last = co[co.length - 1]
      if (first[0] !== last[0] || first[1] !== last[1]) {
        co.push(first)
      }
    })
    return [coordinates]
  } else if (map_type === 'amap') {
    coordinates = JSON.parse(fs.readFileSync(path)).map(coordinate => [
      coordinate.map(co => [co.lng, co.lat])
    ])
    return coordinates
  }
};

module.exports.convert_to_geojson = function(data) {
  return geojson.parse(data, {
    'MultiPolygon': 'MultiPolygon'
  })
}

module.exports.dissolve2_simplify_geojson = function(input) {
  return new Promise((resolve, reject) => {
    mapshaper.applyCommands(
      '-i a.json -clean -dissolve2 -simplify 10% -o', {
        'a.json': input
      },
      function(err, output) {
        err ? reject(err) : resolve(JSON.parse(output['a.json']))
      })
  })
}

module.exports.dissolve2_geojson = function(input) {
  return new Promise((resolve, reject) => {
    mapshaper.applyCommands('-i a.json -clean -dissolve2 -o', {
      'a.json': input
    }, function(err, output) {
      err ? reject(err) : resolve(JSON.parse(output['a.json']))
    })
  })
}
