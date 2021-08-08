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

  ngOnInit() {
    setTimeout(e =>
      this.cargarMapa(), 1000);
    // setTimeout(e => this.cargarMarkers(this.file), 1000);
  }


  cargarMapa() {
    mapboxgl.accessToken = environment.mapboxKey;
    this.map = new mapboxgl.Map({
      container: 'map',
      // style: 'mapbox://styles/mapbox/streets-v11',
      // style: 'mapbox://styles/mapbox/navigation-night-v1',
      // style: 'mapbox://styles/mapbox/light-v10',
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [-60.71562051773071, -31.635150549331115],
      zoom: 13,
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
          'circle-color': ['step', ['get', 'point_count'], '#ffbebc', 50, '#b0c2f2', 750, '#fcb7af'],
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
          'text-font': ['Montserrat Bold', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      });

      this.map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'farmacias',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#aff8db',
          'circle-radius': 10,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#77dd77'
        }
      });

      this.map.addLayer({
        'id': 'farmacias',
        'type': 'circle',
        'source': 'farmacias',
        'filter': [
          'all',
          ['!=', ['get', 'cluster'], true]
        ],
        'paint': {
          'circle-color': '#383a3e',
          'circle-radius': 5
        }
      });






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

      this.map.on('mouseenter', 'clusters', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });
      this.map.on('mouseleave', 'clusters', () => {
        this.map.getCanvas().style.cursor = '';
      });
    });

  }
}
