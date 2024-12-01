'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const Map = () => {
    useEffect(() => {
        // Fix for default icon issue with Leaflet and Webpack
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        });
    }, []);

    const center: [number, number] = [25.0330, 121.5654];

    return (
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                url={`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
                id="mapbox/streets-v11"
                tileSize={512}
                zoomOffset={-1}
            />

            <Marker position={[25.0330, 121.5654]}>
            <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
            </Marker>
        </MapContainer>
    );
};

export default Map;