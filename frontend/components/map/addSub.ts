export const addPointToMap = (data: any, subLayer: any, leaflet: any) => {
    data.forEach((d: any) => {
      console.log(d.location.latlng, d.location.latlng);

      // SVG as Data URL with circle, white border, and background color
      const svgIcon = `
        <div style="
          width: 40px;
          height: 40px;
          background-color: #679E39;
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f0f0f0" width="20" height="20">
            <path fill-rule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clip-rule="evenodd" />
          </svg>
        </div>
      `;

      // Create custom icon using DivIcon to embed HTML
      const customIcon = leaflet.divIcon({
        className: 'custom-user-icon', // Custom class
        html: svgIcon, // Embed HTML directly
        iconSize: [40, 40], // Size of the icon
        iconAnchor: [20, 40], // Anchor point
        popupAnchor: [0, -40], // Popup anchor
      });

      // Create marker with custom HTML icon
      const marker = leaflet.marker(d.location.latlng, { icon: customIcon }).bindPopup(d.nickName);
      marker.addTo(subLayer.current);
    });
};
  

export const deletePointFromMap = (data: any, subLayer: any) => {
  data.forEach((d: any) => {
    subLayer.current.eachLayer((layer: any) => {
      if (layer.getPopup().getContent() === d.nickName) {
        subLayer.current.removeLayer(layer);
      }
    });
  });
};
