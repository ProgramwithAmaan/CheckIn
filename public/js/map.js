const map = new mapboxgl.Map({
    // TO MAKE THE MAP APPEAR YOU MUST
    // ADD YOUR ACCESS TOKEN FROM
    // https://account.mapbox.com
    accessToken: mapToken,
    container: 'map', // container ID
    center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 9 // starting zoom
});


const marker1 = new mapboxgl.Marker({color: 'black'})
.setLngLat(coordinates)
.setPopup(new mapboxgl.Popup({offset: 25})
.setHTML(`<h4>${lisitng.location}</h4><p>Exact Location provided after booking</p>`))
.addTo(map);

const marker2 = new mapboxgl.Marker({color: 'black'})
.setLngLat(coordinates)
.setPopup(new mapboxgl.Popup({offset: 25})
.setHTML(`<h4>${lisitng.location}</h4><p>Exact Location provided after booking</p>`))
.addTo(map);