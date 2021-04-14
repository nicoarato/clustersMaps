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
export class AppComponent implements OnInit{
  map: mapboxgl.Map;
  markers: mapboxgl.Marker[] = [];

  ngOnInit(){
    setTimeout(e => 
    this.cargarMapa(), 1000);
    setTimeout(e => 
      this.cargarMarkers(this.file), 1000);
  }


  cargarMapa() {
    mapboxgl.accessToken = environment.mapboxKey;
    this.map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    // style: 'mapbox://styles/mapbox/light-v10',
    center: [-60.71562051773071,-31.635150549331115],
    zoom: 13
    });
     
    this.map.addControl( new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
      })
    );
    // Add zoom and rotation controls to the map.
    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }));

    // //-----------------CLusters-------------------------------
    // this.map.on('load', ()=> {
    //   // Add a new source from our GeoJSON data and
    //   // set the 'cluster' option to true. GL-JS will
    //   // add the point_count property to your source data.
    //   this.map.addSource('farmacias', {
    //   type: 'geojson',
    //   // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
    //   // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
    //   // data: 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson',
    //   data: '/assets/geojason.json',
    //   cluster: true,
    //   clusterMaxZoom: 14, // Max zoom to cluster points on
    //   clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    //   });
       
    //   this.map.addLayer({
    //   id: 'clusters',
    //   type: 'circle',
    //   source: 'farmacias',
    //   filter: ['has', 'point_count'],
    //   paint: {
    //   // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
    //   // with three steps to implement three types of circles:
    //   //   * Blue, 20px circles when point count is less than 100
    //   //   * Yellow, 30px circles when point count is between 100 and 750
    //   //   * Pink, 40px circles when point count is greater than or equal to 750
    //     'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100,'#f1f075',750,'#f28cb1'],
    //     'circle-radius': ['step',['get', 'point_count'], 20,100,30,750,40]
    //          }
    //   });
       
    //   this.map.addLayer({
    //       id: 'cluster-count',
    //       type: 'symbol',
    //       source: 'farmacias',
    //       filter: ['has', 'point_count'],
    //       layout: {
    //       'text-field': '{point_count_abbreviated}',
    //       'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    //       'text-size': 12
    //   }
    //   });
       
    //   this.map.addLayer({
    //       id: 'unclustered-point',
    //       type: 'circle',
    //       source: 'farmacias',
    //       filter: ['!', ['has', 'point_count']],
    //       paint: {
    //       'circle-color': '#42d77d',
    //       'circle-radius': 10,
    //       'circle-stroke-width': 1,
    //       'circle-stroke-color': '#fff'
    //   }
    //   });
       
    //   // inspect a cluster on click
    //   this.map.on('click', 'clusters',  (e) => {
    //     var features = this.map.queryRenderedFeatures(e.point, {
    //     layers: ['clusters']
    //     });
    //     var clusterId = features[0].properties.cluster_id;
      
    //     this.map.getSource('farmacias').getClusterExpansionZoom(clusterId,
    //        (err, zoom) => {
    //       if (err) return;
    //       this.map.easeTo({
    //           center: features[0].geometry.coordinates,
    //           zoom: zoom
    //           });
    //       }
    //     );
    //   });
       
    //   // When a click event occurs on a feature in
    //   // the unclustered-point layer, open a popup at
    //   // the location of the feature, with
    //   // description HTML from its properties.
    //   this.map.on('click', 'unclustered-point',  (e) => {
    //     var coordinates = e.features[0].geometry.coordinates.slice();
    //     // var mag = e.features[0].properties.mag;
    //     // var tsunami;
        
    //     // if (e.features[0].properties.tsunami === 1) {
    //     // tsunami = 'yes';
    //     // } else {
    //     // tsunami = 'no';
    //     // }
       
    //   // Ensure that if the map is zoomed out such that
    //   // multiple copies of the feature are visible, the
    //   // popup appears over the copy being pointed to.
    //     while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    //     coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    //     }
       
    //     new mapboxgl.Popup()
    //     .setLngLat(coordinates)
    //     .setHTML(
    //         e.features[0].properties.nombre + '<br>' + e.features[0].properties.telefono
    //       ).addTo(this.map);
    //     });
       
    //   this.map.on('mouseenter', 'clusters', () => {
    //       this.map.getCanvas().style.cursor = 'pointer';
    //   });
    //   this.map.on('mouseleave', 'clusters', () => {
    //       this.map.getCanvas().style.cursor = '';
    //   }); 
    // });
    // //------------------------------------------------


  }

  // geoJSON
  file = '../assets/geojason.json';
  
  // MARCADORES
  async cargarMarkers(file: string) {
    const puntosAll = await this.cargarPuntos(file);
    puntosAll.forEach( element => {
      this.cargarMarker(element)
     
    });
  }


    cargarMarker(punto) {
      const lonlat= punto.geometry.coordinates;
      const col = ( punto.geometry.coordinates[0] === -60.704706609249115) ? 'red' : '#a2d77d';
      const marker = new mapboxgl.Marker({
        color: col,
      })
      .setLngLat(lonlat)
      .setPopup(new mapboxgl.Popup({ closeOnClick: false })
                .setLngLat(lonlat)
                .setHTML(`<p><strong>${punto.properties.nombre}</strong>
                          <br>${punto.properties.telefono} - ${punto.properties.direccion}</p>`))
      .addTo(this.map);
      // carga array de marcadores.
      // this.markers.push(marker);

    }

    async cargarPuntos(file: string){
      let puntos = await fetch(file)
      .then( res => res.json())
      .then( res => res.features)
      .catch( err => console.log);

      return puntos;

    }

  
}
