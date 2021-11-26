import { AfterViewInit, Input } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { GoogleMap, MapCircle } from '@angular/google-maps';
import { Observable } from 'rxjs';
import { GeoFeatureCollection } from './models/geojson.model';
import { Ci_vettore } from "./models/ci_vett.model";





@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  @Input() pagina: string;
  title = 'server mappe';
  //stringa: string = '';
  //Variabile che conterrà i nostri oggetti GeoJson
  geoJsonObject: GeoFeatureCollection;
  //Observable per richiedere al server python i dati sul DB
  obsGeoData: Observable<GeoFeatureCollection>;
  // Centriamo la mappa
  center: google.maps.LatLngLiteral = { lat: 45.506738, lng: 9.190766 };
  zoom = 8;
  obsCiVett: Observable<Ci_vettore[]>; //Crea un observable per ricevere i vettori energetici
  markerList: google.maps.MarkerOptions[];
  stringa: string;

  constructor(public http: HttpClient) {
    //Facciamo iniettare il modulo HttpClient dal framework Angular (ricordati di importare la libreria)
  }
  ngAfterViewInit(): void {
    throw new Error('Method not implemented.');
  }

  //Metodo che scarica i dati nella variabile geoJsonObject
  prepareData = (data: GeoFeatureCollection) => {
    this.geoJsonObject = data;
    console.log(this.geoJsonObject);
  };

  //Una volta che la pagina web è caricata, viene lanciato il metodo ngOnInit scarico i    dati
  //dal server
  ngOnInit() {
    this.circleOptions = {
      fillColor: 'red',
      clickable: true,
      editable: true,
      radius: 200,
      visible: false,
    };
  }

  prepareCiVettData = (data: Ci_vettore[]) => {
    console.log(data); //Verifica di ricevere i vettori energetici
    this.markerList = []; //NB: markers va dichiarata tra le proprietà markers : Marker[]
    for (const iterator of data) {
      //Per ogni oggetto del vettore creo un Marker
      let m: google.maps.MarkerOptions = {
        position: new google.maps.LatLng(iterator.WGS84_X, iterator.WGS84_Y),
        icon: this.findImage(iterator.CI_VETTORE),
      };
      //Marker(iterator.WGS84_X,iterator.WGS84_Y,iterator.CI_VETTORE);
      this.markerList.push(m);
    }
    this.center = this.LatLngMedia(data);
  };

  LatLngMedia(data: Ci_vettore[]): google.maps.LatLngLiteral {
    var x = 0;
    var media_latitudine = 0;
    var media_longitudine = 0;
    for (var i of data) {
      //console.log(i.WGS84_X,i.WGS84_Y);
      media_latitudine += Number(i.WGS84_X);
      media_longitudine += Number(i.WGS84_Y);
      x += 1;
    }
    //media_latitudine = media_latitudine / x
    console.log(media_latitudine / x);
    console.log(media_longitudine / x);
    return { lat: media_latitudine / x, lng: media_longitudine / x };

    //TODO : IMPLEMENTA IL METODO CHE CALCOLA LATITUDINE E LONGITUDINE MEDIA
    //NOTA: IL CAMPO WGS84_X contiene la latitudine
  }
  center_circle: google.maps.LatLngLiteral;
  circleOptions: google.maps.CircleOptions;
  //Aggiungi il gestore del metodo mapClicked
  @ViewChild(MapCircle) circleRef: MapCircle;
  mapClicked($event: google.maps.MapMouseEvent) {
    console.log($event);
    let coords = $event.latLng; //Queste sono le coordinate cliccate
    this.center = { lat: coords.lat(), lng: coords.lng() };
    this.center_circle = { lat: coords.lat(), lng: coords.lng() };
    this.circleOptions = {
      fillColor: 'red',
      clickable: true,
      editable: true,
      radius: 100000,
      visible: true,
    };
  }
  circleRightClicked($event: google.maps.MapMouseEvent) {
    console.log((this.circleRef.getRadius() * 0.00001) / 1.1132);
    console.log(this.circleRef.getCenter());
    this.circleRef.circle?.setVisible(false);
  }

  cerca_pagina(pagina) {
    //ricordiamo che se dobbiamo passare un  nuovo url allora dovremmo cambiarlo quando premiamo il bottone
    let uri = 'http://127.0.0.1:5000//ci_vettore/' + pagina;
    this.obsCiVett = this.http.get<Ci_vettore[]>(uri);
    this.obsCiVett.subscribe(this.prepareCiVettData);
  }
  findImage(label: string): google.maps.Icon {
    if (label.includes('Gas')) {
      return {
        url: './assets/img/gas.png',
        scaledSize: new google.maps.Size(32, 32),
      };
    }
    if (label.includes('elettrica')) {
      return {
        url: './assets/img/electricity.png',
        scaledSize: new google.maps.Size(32, 32),
      };
    }
    if (label.includes('GPL')) {
      return {
        url: './assets/img/gpl.png',
        scaledSize: new google.maps.Size(32, 32),
      };
    }
    if (label.includes('Biomasse solide')) {
      return {
        url: './assets/img/solid-biomas.png',
        scaledSize: new google.maps.Size(32, 32),
      };
    }
    //Se non viene riconosciuta nessuna etichetta ritorna l'icona undefined
    return {
      url: './assets/img/undefined.ico',
      scaledSize: new google.maps.Size(32, 32),
    };
  }
}
