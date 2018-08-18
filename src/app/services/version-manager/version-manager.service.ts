import { Injectable } from '@angular/core';

@Injectable( {
  providedIn: 'root',
} )
export class VersionManagerService {
  public version = '0.3.0-alpha.13';

  public constructor() { }
}
