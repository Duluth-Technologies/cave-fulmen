import { HttpClient } from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  constructor(private http: HttpClient) {}

  handleError(error: any): void {
    console.error('An error occurred:', error);
  }

  
}