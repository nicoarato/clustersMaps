import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from '../environments/environment.prod';

import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  map: mapboxgl.Map;
  markers: mapboxgl.Marker[] = [];
  file = '/assets/geojason.json';
  ngOnInit() {
    setTimeout(e =>
      this.cargarMapa(), 1000);
  }

  cargarMapa() {
    const hoy = new Date();
    const hora = hoy.getHours();
    let estilo;
    if (hora < 19 && hora > 7) {
      estilo = 'mapbox://styles/mapbox/streets-v11';
    } else {
      estilo = 'mapbox://styles/mapbox/navigation-night-v1';
    }
    mapboxgl.accessToken = environment.mapboxKey;
    this.map = new mapboxgl.Map({
      container: 'map',
      style: estilo,
      // style: 'mapbox://styles/mapbox/streets-v11',
      // style: 'mapbox://styles/mapbox/navigation-night-v1',
      // style: 'mapbox://styles/mapbox/light-v10',
      // style: 'mapbox://styles/mapbox/dark-v10',
      center: [-60.71562051773071, -31.635150549331115],
      zoom: 13,
      pitch: 0,
    });

    // Add zoom and rotation controls to the map.
    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }));




    // //-----------------CLusters-------------------------------
    this.map.on('load', () => {

      // Add a new source from our GeoJSON data and
      // set the 'cluster' option to true. GL-JS will
      // add the point_count property to your source data.
      this.map.addSource('farmacias', {
        type: 'geojson',
        data: '/assets/geojason.json',
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
      });

      this.map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'farmacias',
        filter: ['has', 'point_count'],
        paint: {
          // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
          // with three steps to implement three types of circles:
          //   * Blue, 20px circles when point count is less than 100
          //   * Yellow, 30px circles when point count is between 100 and 750
          //   * Pink, 40px circles when point count is greater than or equal to 750
          // 'circle-color': ['step', ['get', 'point_count'], '#a98fe7', 100, '#e4ab6b', 750, '#f28cb1'],
          'circle-color': ['step', ['get', 'point_count'], '#bb86fc', 50, '#cf6699', 750, '#cf6699'],
          'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
        }
      });

      this.map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'farmacias',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,

        }
      });

      this.map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'farmacias',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#03dac6',
          'circle-radius': 10,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#77dd77'
        }
      });

      // this.map.addLayer({
      //   'id': '3d-buildings',
      //   'source': 'composite',
      //   'source-layer': 'building',
      //   'filter': ['==', 'extrude', 'true'],
      //   'type': 'fill-extrusion',
      //   'minzoom': 15,
      //   'paint': {
      //     'fill-extrusion-color': '#aaa',

      //     // use an 'interpolate' expression to add a smooth transition effect to the
      //     // buildings as the user zooms in
      //     'fill-extrusion-height': [
      //       'interpolate',
      //       ['linear'],
      //       ['zoom'],
      //       15,
      //       0,
      //       15.05,
      //       ['get', 'height']
      //     ],
      //     'fill-extrusion-base': [
      //       'interpolate',
      //       ['linear'],
      //       ['zoom'],
      //       15,
      //       0,
      //       15.05,
      //       ['get', 'min_height']
      //     ],
      //     'fill-extrusion-opacity': 0.6
      //   }
      // });


      // inspect a cluster on click
      this.map.on('click', 'clusters', (e) => {
        var features = this.map.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        var clusterId = features[0].properties.cluster_id;

        this.map.getSource('farmacias').getClusterExpansionZoom(clusterId,
          (err, zoom) => {
            if (err) return;
            this.map.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom
            });
          }
        );
      });

      // When a click event occurs on a feature in
      // the unclustered-point layer, open a popup at
      // the location of the feature, with
      // description HTML from its properties.
      this.map.on('click', 'unclustered-point', (e) => {
        var coordinates = e.features[0].geometry.coordinates.slice();
        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }


        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(
            `<strong> ${e.features[0].properties.nombre}</strong> <br>
            ${e.features[0].properties.direccion}<br>
            ${e.features[0].properties.telefono}`
          ).addTo(this.map);
      });

      this.map.on('mouseenter', 'unclustered-point', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });
      this.map.on('mouseleave', 'unclustered-point', () => {
        this.map.getCanvas().style.cursor = '';
      });
      this.map.on('mouseenter', 'clusters', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });
      this.map.on('mouseleave', 'clusters', () => {
        this.map.getCanvas().style.cursor = '';
      });


    });

  }


}
