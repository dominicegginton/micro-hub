import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChartType } from 'angular-google-charts';
import { SerialService } from './sirial.service';
import { combineLatest, map, take } from 'rxjs';

/**
 * Micro Hub App Component.
 * Responsible for connecting to the Hub over serial and
 * displaying the data received from the Hub in the UI.
 */
@Component({
  selector: 'micro-hub-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SerialService],
})
export class AppComponent {
  /**
   * Click events from the Hub.
   */
  private readonly _clickEvents$ = this._serialHandler.events$.pipe(
    map((events) => events.filter((event) => event.n === 'C'))
  );

  /**
   * Temperature events from the Hub.
   * @private
   */
  private readonly _temperatureEvents$ = this._serialHandler.events$.pipe(
    map((events) => events.filter((event) => event.n === 'T'))
  );

  /**
   * Chart data from all temperature events for the Google Chart.
   */
  private readonly _chartData$ = this._temperatureEvents$.pipe(
    map((events) => events.map((event) => ['', event.d]))
  );

  /**
   * View model for the UI.
   */
  readonly vm$ = combineLatest([
    this._serialHandler.connected$,
    this._chartData$,
    this._clickEvents$,
  ]).pipe(
    map(([connected, chartData, clickEvents]) => ({
      connected,
      chartData,
      chartType: ChartType.Line,
      clickEvents,
    }))
  );

  constructor(private readonly _serialHandler: SerialService) {}

  /**
   * Connect to the Hub over serial.
   */

  connect(event: Event) {
    this._serialHandler
      .connect()
      .pipe(take(1))
      .subscribe((port) => console.log('Connected to', port));
  }

  /**
   * Disconnect from the Hub over serial.
   */
  disconnect(event: Event) {
    this._serialHandler
      .disconnect()
      .pipe(take(1))
      .subscribe((port) => console.log('Disconnected from', port));
  }
}
