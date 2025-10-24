"use client";

import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { Fill, Stroke, Style } from "ol/style";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { fromLonLat } from "ol/proj";
import "ol/ol.css";
import { Spinner } from "@/components/ui/spinner";
import DataSheet from "./DataSheet";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { transformExtent } from "ol/proj";

type FilterValue = {
	type: string;
	bbox: string;
	datetime: string;
	toggleChanges: () => {};
};

export default function MapSection({
	type,
	bbox,
	datetime,
	toggleChanges,
}: FilterValue) {
	const mapRef = useRef<HTMLDivElement | null>(null);
	const mapInstanceRef = useRef<Map | null>(null);
	const vectorSourceRef = useRef<VectorSource<Feature<Geometry>> | null>(null);
	const [showData, setShowData] = useState<boolean>(false);
	const [featuresIsFetching, setFeatureIsFetching] = useState<boolean>(true);
	const [featureId, setFeatureId] = useState<any>("");
	let map: Map;

	function initMap() {
		const baseLayer = new TileLayer({
			source: new OSM(),
		});

		map = new Map({
			target: mapRef.current!,
			layers: [baseLayer],
			view: new View({
				center: fromLonLat([12.0, 45.0]),
				zoom: 6,
			}),
		});

		mapInstanceRef.current = map;
	}

	async function getFeatures() {
		const params = new URLSearchParams({
			type,
			bbox,
			datetime,
		});
		const res = await fetch(
			`http://localhost:3000/features?${params.toString()}`,
			{ method: "GET" }
		);
		const geojson = await res.json();

		const geojsonData = {
			type: "FeatureCollection",
			features: geojson,
		};

		vectorSourceRef.current = new VectorSource({
			features: new GeoJSON().readFeatures(geojsonData, {
				featureProjection: "EPSG:3857",
			}),
		});

		const vectorLayer = new VectorLayer({
			source: vectorSourceRef.current,
			style: new Style({
				stroke: new Stroke({
					color: "#00aaff",
					width: 2,
				}),
				fill: new Fill({
					color: "rgba(0, 170, 255, 0.1)",
				}),
			}),
		});

		map.addLayer(vectorLayer);
		setFeatureIsFetching(false);

		map.on("singleclick", (evt) => {
			const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
			if (feature) {
				setShowData(true);
				const id = feature?.getId();
				setFeatureId(id);
			}
		});

		map.on("pointermove", function (evt) {
			const pixel = map.getEventPixel(evt.originalEvent);
			const hit = map.hasFeatureAtPixel(pixel);

			(map.getTargetElement() as HTMLElement).style.cursor = hit
				? "pointer"
				: "";
			(map.getTargetElement() as HTMLElement).style.fill = hit ? "red" : "";
		});
	}

	const toggleDataSheet = () => {
		if (showData) {
			setShowData(false);
			setTimeout(() => {
				setFeatureId("");
			}, 500);
		} else setShowData(true);
	};

	useEffect(() => {
		initMap();
		if (map) {
			getFeatures();
		}

		return () => map?.setTarget(undefined);
	}, []);

	const addNewVectors = async () => {
		setFeatureIsFetching(true);
		if (!vectorSourceRef.current || !mapInstanceRef.current) return;

		vectorSourceRef.current.clear();
		const params = new URLSearchParams({
			type,
			bbox,
			datetime,
		});
		const res = await fetch(
			`http://localhost:3000/features?${params.toString()}`,
			{ method: "GET" }
		);
		const geojson = await res.json();

		const geojsonData = {
			type: "FeatureCollection",
			features: geojson,
		};

		const features = new GeoJSON().readFeatures(geojsonData, {
			featureProjection: "EPSG:3857",
		});

		vectorSourceRef.current.addFeatures(features);

		setFeatureIsFetching(false);

		const bboxArray = bbox.split(",").map(Number);
		const extent = transformExtent(bboxArray, "EPSG:4326", "EPSG:3857");

		mapInstanceRef.current.getView().fit(extent, {
			padding: [50, 50, 50, 50],
			duration: 1000,
			maxZoom: 6,
		});
	};

	useEffect(() => {
		if (toggleChanges()) {
			addNewVectors();
		}
	}, [toggleChanges]);

	return (
		<>
			<div
				ref={mapRef}
				className="w-full h-screen border border-gray-100 overflow-hidden"
			/>
			{featuresIsFetching && (
				<div className="absolute top-5 left-0 right-0 mx-auto w-52 bg-white rounded-full p-2 shadow-sm z-50">
					<div className="flex gap-2 items-center">
						<Spinner className="size-8 text-sky-500 " />
						<span className="text-gray-500">Fetching features...</span>
					</div>
				</div>
			)}
			{featureId && (
				<DataSheet
					type={type}
					showData={showData}
					toggleDataSheet={toggleDataSheet}
					featureId={featureId}
				/>
			)}
		</>
	);
}
