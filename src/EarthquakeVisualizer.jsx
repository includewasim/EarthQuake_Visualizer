import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { Loader2, Clock, MapPin } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';

const EarthquakeVisualizer = () => {
    const [earthquakes, setEarthquakes] = useState([]);
    const [historicalEarthquakes, setHistoricalEarthquakes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ total: 0, averageMagnitude: 0 });
    const [magnitudeFilter, setMagnitudeFilter] = useState([0, 10]);
    const [selectedEarthquake, setSelectedEarthquake] = useState(null);
    const mapRef = useRef(null);

    useEffect(() => {
        fetchEarthquakeData();
        fetchHistoricalEarthquakeData();
        const interval = setInterval(fetchEarthquakeData, 300000);
        return () => clearInterval(interval);
    }, []);

    const fetchEarthquakeData = async () => {
        try {
            const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
            if (!response.ok) throw new Error('Failed to fetch earthquake data');
            const data = await response.json();

            const processedData = data.features.map(eq => ({
                id: eq.id,
                magnitude: eq.properties.mag,
                place: eq.properties.place,
                time: new Date(eq.properties.time),
                timeString: new Date(eq.properties.time).toLocaleString(),
                coordinates: eq.geometry.coordinates,
                depth: eq.geometry.coordinates[2],
                lat: eq.geometry.coordinates[1],
                lng: eq.geometry.coordinates[0]
            })).sort((a, b) => b.time - a.time);

            setEarthquakes(processedData);

            // If there are earthquakes, center on the most recent one
            if (processedData.length > 0) {
                if (mapRef.current) {
                    mapRef.current.flyTo([processedData[0].lat, processedData[0].lng], 5, {
                        duration: 1.5,
                        easeLinearity: 0.5
                    });
                }
            }

            const total = processedData.length;
            const avgMag = processedData.reduce((acc, eq) => acc + eq.magnitude, 0) / total;
            setStats({
                total,
                averageMagnitude: avgMag.toFixed(2)
            });

            setLoading(false);
            setError(null);
        } catch (err) {
            setError('Failed to load earthquake data. Please try again later.');
            setLoading(false);
        }
    };

    const fetchHistoricalEarthquakeData = async () => {
        try {
            const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson');
            if (!response.ok) throw new Error('Failed to fetch historical earthquake data');
            const data = await response.json();

            const processedData = data.features.map(eq => ({
                id: eq.id,
                magnitude: eq.properties.mag,
                place: eq.properties.place,
                time: new Date(eq.properties.time),
                timeString: new Date(eq.properties.time).toLocaleString(),
                coordinates: eq.geometry.coordinates,
                depth: eq.geometry.coordinates[2],
                lat: eq.geometry.coordinates[1],
                lng: eq.geometry.coordinates[0]
            })).sort((a, b) => b.time - a.time);

            setHistoricalEarthquakes(processedData);
        } catch (err) {
            console.error('Failed to load historical earthquake data:', err);
        }
    };

    const getMarkerStyle = (magnitude) => {
        const size = Math.max(magnitude * 5, 8);
        const color = magnitude >= 6 ? '#dc2626' :
            magnitude >= 4 ? '#ea580c' :
                magnitude >= 2 ? '#ca8a04' : '#059669';

        return {
            radius: size,
            fillColor: color,
            color: 'white',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.8
        };
    };

    const getTimeAgo = (date) => {
        const minutes = Math.floor((new Date() - date) / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const handleEarthquakeSelect = (eq) => {
        setSelectedEarthquake(eq);
        if (mapRef.current) {
            mapRef.current.flyTo([eq.lat, eq.lng], 7, {
                duration: 1.5,
                easeLinearity: 0.5
            });
        }
    };

    const filteredEarthquakes = earthquakes.filter(eq =>
        eq.magnitude >= magnitudeFilter[0] && eq.magnitude <= magnitudeFilter[1]
    );

    const filteredHistoricalEarthquakes = historicalEarthquakes.filter(eq =>
        eq.magnitude >= magnitudeFilter[0] && eq.magnitude <= magnitudeFilter[1]
    );

    const magnitudeDistribution = filteredEarthquakes.reduce((acc, eq) => {
        const magBin = Math.floor(eq.magnitude);
        acc[magBin] = (acc[magBin] || 0) + 1;
        return acc;
    }, {});

    const historicalMagnitudeDistribution = filteredHistoricalEarthquakes.reduce((acc, eq) => {
        const magBin = Math.floor(eq.magnitude);
        acc[magBin] = (acc[magBin] || 0) + 1;
        return acc;
    }, {});

    const chartData = Object.entries(magnitudeDistribution).map(([mag, count]) => ({
        magnitude: `${mag}-${Number(mag) + 1}`,
        count
    }));

    const historicalChartData = Object.entries(historicalMagnitudeDistribution).map(([mag, count]) => ({
        magnitude: `${mag}-${Number(mag) + 1}`,
        count
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive" className="m-4">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="p-4 max-w-7xl mx-auto space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Global Earthquake Activity Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold">{stats.total}</div>
                                <div className="text-sm text-gray-500">Total Earthquakes (24h)</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold">{stats.averageMagnitude}</div>
                                <div className="text-sm text-gray-500">Average Magnitude</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mb-4">
                        <CardContent className="p-4">
                            <div className="mb-2">Magnitude Filter</div>
                            <Slider
                                defaultValue={[0, 10]}
                                max={10}
                                step={0.1}
                                value={magnitudeFilter}
                                onValueChange={setMagnitudeFilter}
                                className="mb-2"
                            />
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>{magnitudeFilter[0].toFixed(1)}</span>
                                <span>{magnitudeFilter[1].toFixed(1)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="h-96 relative border-2 border-blue-500 rounded-lg overflow-hidden">
                            <MapContainer
                                ref={mapRef}
                                center={[0, 0]}
                                zoom={2}
                                className="h-full w-full"
                                style={{ background: '#f0f0f0' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                {filteredEarthquakes.map(eq => (
                                    <CircleMarker
                                        key={eq.id}
                                        center={[eq.lat, eq.lng]}
                                        {...getMarkerStyle(eq.magnitude)}
                                        eventHandlers={{
                                            click: () => handleEarthquakeSelect(eq)
                                        }}
                                    >
                                        <Popup>
                                            <div className="p-2">
                                                <h3 className="font-bold">{eq.place}</h3>
                                                <p>Magnitude: {eq.magnitude.toFixed(1)}</p>
                                                <p>Depth: {eq.depth.toFixed(1)} km</p>
                                                <p>Time: {eq.timeString}</p>
                                            </div>
                                        </Popup>
                                    </CircleMarker>
                                ))}
                                {filteredHistoricalEarthquakes.map(eq => (
                                    <CircleMarker
                                        key={eq.id}
                                        center={[eq.lat, eq.lng]}
                                        {...getMarkerStyle(eq.magnitude)}
                                        eventHandlers={{
                                            click: () => handleEarthquakeSelect(eq)
                                        }}
                                        color="red"
                                    >
                                        <Popup>
                                            <div className="p-2">
                                                <h3 className="font-bold">{eq.place}</h3>
                                                <p>Magnitude: {eq.magnitude.toFixed(1)}</p>
                                                <p>Depth: {eq.depth.toFixed(1)} km</p>
                                                <p>Time: {eq.timeString}</p>
                                            </div>
                                        </Popup>
                                    </CircleMarker>
                                ))}
                            </MapContainer>
                        </div>

                        <div className="h-96 overflow-y-auto border-2 border-blue-500 rounded-lg">
                            <div className="p-4">
                                <h3 className="font-bold mb-4">Recent Earthquakes</h3>
                                <div className="space-y-2">
                                    {filteredEarthquakes.map(eq => (
                                        <div
                                            key={eq.id}
                                            className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedEarthquake?.id === eq.id
                                                ? 'bg-blue-200 hover:bg-blue-300'
                                                : 'hover:bg-blue-100'
                                                }`}
                                            onClick={() => handleEarthquakeSelect(eq)}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`font-bold ${eq.magnitude >= 6 ? 'text-red-600' :
                                                    eq.magnitude >= 4 ? 'text-orange-600' :
                                                        eq.magnitude >= 2 ? 'text-yellow-600' : 'text-emerald-600'
                                                    }`}>
                                                    M{eq.magnitude.toFixed(1)}
                                                </span>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    {getTimeAgo(eq.time)}
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <MapPin className="w-4 h-4 mr-1 mt-1 flex-shrink-0 text-gray-500" />
                                                <span className="text-sm">{eq.place}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="magnitude" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={historicalChartData}>
                                    <XAxis dataKey="magnitude" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#6b7280" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default EarthquakeVisualizer;