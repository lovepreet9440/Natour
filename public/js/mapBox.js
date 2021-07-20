const locations = JSON.parse(document.getElementById('map').dataset.locations)

mapboxgl.accessToken =
    'pk.eyJ1IjoibG92ZXByZWV0OTQ0MCIsImEiOiJja2licXJmYnkwYXI4MnJvNTRtOWpuYWRuIn0.TuyIoiaHCd4kCI0O70RqiQ'
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/lovepreet9440/ckibrhwkm10i619s4b0zw1j6c',
    scrollZoom: false,
})

const bounds = new mapboxgl.LngLatBounds()

locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div')
    el.className = 'marker'

    // Add marker
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom',
    })
        .setLngLat(loc.coordinates)
        .addTo(map)

    new mapboxgl.Popup({ offset: 30 })
        .setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
        .addTo(map)

    // Extents map bounds to include the current location
    bounds.extend(loc.coordinates)
})

map.fitBounds(bounds, {
    padding: {
        top: 200,
        bottom: 150,
        left: 100,
        right: 100,
    },
})

// var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js')

// mapboxgl.accessToken =
//     'pk.eyJ1IjoibG92ZXByZWV0OTQ0MCIsImEiOiJja2licXJmYnkwYXI4MnJvNTRtOWpuYWRuIn0.TuyIoiaHCd4kCI0O70RqiQ'
// var map = new mapboxgl.Map({
//     container: 'map',
//     style: 'mapbox://styles/lovepreet9440/ckibrhwkm10i619s4b0zw1j6c',
// })

// var JavaScript = {
//     load: function (src, callback) {
//         var script = document.createElement('script'),
//             loaded
//         script.setAttribute('src', src)
//         if (callback) {
//             script.onreadystatechange = script.onload = function () {
//                 if (!loaded) {
//                     callback()
//                 }
//                 loaded = true
//             }
//         }
//         document.getElementById('map').appendChild(script)
//     },
// }

// JavaScript.load(
//     'https://api.mapbox.com/mapbox-gl-js/v0.39.1/mapbox-gl.js',
//     function () {
//         mapboxgl.accessToken =
//             'pk.eyJ1IjoibG92ZXByZWV0OTQ0MCIsImEiOiJja2licXJmYnkwYXI4MnJvNTRtOWpuYWRuIn0.TuyIoiaHCd4kCI0O70RqiQ'
//         var map = new mapboxgl.Map({
//             container: 'map',
//             style: 'mapbox://styles/lovepreet9440/ckibrhwkm10i619s4b0zw1j6c',
//         })
//     }
// )
