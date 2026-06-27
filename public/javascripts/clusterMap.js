maptilersdk.config.apiKey = maptilerApiKey;

const map = new maptilersdk.Map({
	container: "map",
	style: maptilersdk.MapStyle.BRIGHT,
	center: [-103.59179687498357, 40.66995747013945],
	zoom: 3,
});

map.on("load", function () {
	map.addSource("campgrounds", {
		type: "geojson",
		data: campgrounds,
		cluster: true,
		clusterMaxZoom: 12,
		clusterRadius: 35,
	});

	map.addLayer({
		id: "clusters",
		type: "circle",
		source: "campgrounds",
		filter: ["has", "point_count"],
		paint: {
			"circle-color": [
				"step",
				["get", "point_count"],
				"#00BCD4",
				10,
				"#2196F3",
				50,
				"#3F51B5",
			],
			"circle-radius": [
				"step",
				["get", "point_count"],
				16,
				10,
				24,
				50,
				32,
			],
		},
	});

	map.addLayer({
		id: "cluster-count",
		type: "symbol",
		source: "campgrounds",
		filter: ["has", "point_count"],
		layout: {
			"text-field": "{point_count_abbreviated}",
			"text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
			"text-size": 13,
		},
	});

	map.addLayer({
		id: "unclustered-point",
		type: "circle",
		source: "campgrounds",
		filter: ["!", ["has", "point_count"]],
		paint: {
			"circle-color": "#e74c3c",
			"circle-radius": 6,
			"circle-stroke-width": 1,
			"circle-stroke-color": "#fff",
		},
	});

	// inspect a cluster on click
	map.on("click", "clusters", async (e) => {
		const features = map.queryRenderedFeatures(e.point, {
			layers: ["clusters"],
		});
		const clusterId = features[0].properties.cluster_id;
		const zoom = await map
			.getSource("campgrounds")
			.getClusterExpansionZoom(clusterId);
		map.easeTo({
			center: features[0].geometry.coordinates,
			zoom,
		});
	});

	map.on("click", "unclustered-point", function (e) {
		const { popUpMarkup } = e.features[0].properties;
		const coordinates = e.features[0].geometry.coordinates.slice();

		while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
		}

		new maptilersdk.Popup()
			.setLngLat(coordinates)
			.setHTML(popUpMarkup)
			.addTo(map);
	});

	map.on("mouseenter", "clusters", () => {
		map.getCanvas().style.cursor = "pointer";
	});
	map.on("mouseleave", "clusters", () => {
		map.getCanvas().style.cursor = "";
	});
});
