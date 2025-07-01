async function getCoordinatesFromLocation(locationText) {
  try {
    const response = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(locationText)}.json?key=${window.mapToken}`
    );
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    } else {
      console.warn("No coordinates found for:", locationText);
      return null;
    }
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
}

(async () => {
  // Get location from page text
  const locationText = document.querySelector('.card-text:nth-of-type(4)')?.textContent.trim();
  if (!locationText) return;

  const coords = await getCoordinatesFromLocation(locationText);
  if (!coords) return;

  const map = new maplibregl.Map({
    container: 'map',
    style: `https://api.maptiler.com/maps/streets/style.json?key=${window.mapToken}`,
    center: [coords.lng, coords.lat],
    zoom: 9,
  });

  new maplibregl.Marker({color:"red"})
    .setLngLat([coords.lng, coords.lat])
    .addTo(map);

  map.addControl(new maplibregl.NavigationControl(), 'top-right');
})();
