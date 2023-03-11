import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  from,
  map,
  Observable,
  throwError,
} from 'rxjs';

/**
 * SerialService.
 *
 * Responsible for handling serial communication.
 * @see https://wicg.github.io/serial/
 */
@Injectable()
export class SerialService {
  /**
   * The connected serial port.
   */
  private _port?: SerialPort;

  /**
   * The stream of the connection status for the serial port.
   */
  private _isConnected$ = new BehaviorSubject<boolean>(false);

  /**
   * The text decoder stream for the connected serial ports readable stream.
   */
  private _textDecoderStream?: TextDecoderStream;

  /**
   * The promise that resolves when the readable stream is closed.
   */
  private _readableStreamClosed?: Promise<void>;

  /**
   * The reader for the readable stream of the connected serial port.
   */
  private _reader?: ReadableStreamDefaultReader;

  /**
   * The stream of data from the connected serial port.
   */
  private readonly data$ = new BehaviorSubject<string>('');

  /**
   * The stream of events from the connected serial port.
   */
  readonly events$ = this.data$.pipe(
    map(
      (data) =>
        data
          .split(' \r\n')
          .map((line) => {
            try {
              return JSON.parse(line) as { n: string; d: any };
            } catch (err) {
              return null;
            }
          })
          .filter((event) => !!event) as { n: string; d?: any }[]
    ),
    catchError(() => throwError(() => []))
  );

  /**
   * The stream of the connection status for the serial port.
   */
  readonly connected$ = this._isConnected$.asObservable();

  connect() {
    return from(
      new Promise(async (resolve, reject) => {
        try {
          const port = await navigator.serial.requestPort({
            filters: [{ usbVendorId: 0x0d28 }],
          });
          await port.open({ baudRate: 115200 });
          this._port = port;
          this._textDecoderStream = new TextDecoderStream();
          this._readableStreamClosed = this._port.readable!.pipeTo(
            this._textDecoderStream.writable
          );
          this._reader = this._textDecoderStream.readable!.getReader();
          resolve(this._port);
          this._isConnected$.next(true);
          while (true) {
            try {
              const { value, done } = await this._reader!.read();
              if (done) {
                this._reader!.releaseLock();
                break;
              }
              if (value) {
                this.data$.next(`${this.data$.value}${value}`);
              }
            } catch (err) {
              const errorMessage = `error reading data: ${err}`;
              console.error(errorMessage);
            }
          }
        } catch (err) {
          reject(err);
        }
      })
    );
  }

  disconnect() {
    return from(
      new Promise(async (resolve, reject) => {
        try {
          await this._reader?.cancel();
          await this._readableStreamClosed?.catch(() => {});
          await this._port?.close();
          resolve(this._port);
          this._isConnected$.next(false);
          this._port = undefined;
          this._textDecoderStream = undefined;
          this._readableStreamClosed = undefined;
          this._reader = undefined;
        } catch (err) {
          reject(err);
        }
      })
    );
  }
}
