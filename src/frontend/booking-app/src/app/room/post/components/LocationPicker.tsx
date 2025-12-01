'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);

function LocationPicker({ onLocationSelect, initialPosition, cityCode, districtCode, wardCode }: any) {
    const [position, setPosition] = useState(initialPosition);
    const [isClient, setIsClient] = useState(false);
    const [map, setMap] = useState<any>(null);

    useEffect(() => {
        setIsClient(true);
        if (typeof window !== 'undefined') {
            const L = require('leaflet');
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });
        }
    }, []);

    useEffect(() => {
        if (!map) return;
        const findLoc = (code: string, type: 'city' | 'district' | 'ward') => {
            return null;
        };
    }, [cityCode, districtCode, wardCode, map]);

    const MapEvents = () => {
        const { useMapEvents } = require('react-leaflet');
        useMapEvents({
            click(e: any) {
                const newPos = [e.latlng.lat, e.latlng.lng];
                setPosition(newPos);
                onLocationSelect(e.latlng.lat, e.latlng.lng);
            },
        });
        return null;
    };

    if (!isClient) return <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />;

    return (
        <MapContainer center={position} zoom={13} style={{ height: '350px', width: '100%', borderRadius: '1rem', zIndex: 0 }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapEvents />
            <Marker position={position} />
        </MapContainer>
    );
}

export default LocationPicker;
