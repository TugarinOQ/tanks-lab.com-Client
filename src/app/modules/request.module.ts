import {  Headers, Response } from '@angular/http';

function get (http, { url, err__cb, success__cb }) {

  const token = localStorage.getItem('token');

  const customHeaders = new Headers();
  customHeaders.set('Content-Type', 'application/json');
  customHeaders.set('x-access-token', token);

  http.get(url, { headers: customHeaders })
    .map((res: Response) => res.json())
    .subscribe((res) => {

      if (res.error) {

        err__cb(res);

        return;
      }

      success__cb(res);
    });
}

function post(http, { url, body, err__cb, success__cb }) {

  const token = localStorage.getItem('token');

  const customHeaders = new Headers();
  customHeaders.set('Content-Type', 'application/json');
  customHeaders.set('x-access-token', token);

  http.post(url, body, { headers: customHeaders })
    .map((res: Response) => res.json())
    .subscribe((res) => {

      if (res.error) {

        err__cb(res);

        return;
      }

      success__cb(res);
    });
}

export const req = { get, post };
