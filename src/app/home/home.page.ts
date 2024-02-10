import { Component } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private _stashedCoordinates: string = '';

  public _ng_latitude: number = 0;
  public _ng_longitude: number = 0;
  public _ng_logsWritten: number = 0;
  public _ng_running: boolean = false;
  public _ng_errorMessage: string = '';
  public _ng_writing: string = '';

  constructor(private _geolocation: Geolocation) {}

  private _logCoordinates(data: string) {
    this._ng_writing = 'Writing coordinates into file...';
    Filesystem.appendFile({
      path: `coordinates.txt`,
      data: '========================\n' + data,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    })
      .catch((error: Error) => {
        this._ng_errorMessage = error.message;
      })
      .finally(() => {
        this._ng_writing = 'Writing coordinates into file: DONE';
      });
  }

  private _pollCoordinates() {
    this._geolocation
      .getCurrentPosition()
      .then((resp: Geoposition) => {
        this._stashedCoordinates += `${resp.coords.latitude}, ${resp.coords.longitude}\n`;
        this._ng_latitude = resp.coords.latitude;
        this._ng_longitude = resp.coords.longitude;
        this._ng_logsWritten++;
        if (this._ng_running) {
          this._pollCoordinates();
        }
      })
      .catch((error) => {
        this._ng_errorMessage = error.message;
        this._ng_latitude = undefined;
        this._ng_longitude = undefined;
      });
  }

  public _ng_clickStart() {
    this._ng_running = true;
    this._pollCoordinates();
  }

  public _ng_clickStop() {
    this._ng_running = false;
    this._logCoordinates(this._stashedCoordinates);
  }
}
