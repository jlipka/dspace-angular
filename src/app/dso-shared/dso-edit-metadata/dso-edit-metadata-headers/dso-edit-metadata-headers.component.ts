import {
  Component,
  Input,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'ds-dso-edit-metadata-headers',
  styleUrls: ['./dso-edit-metadata-headers.component.scss', '../dso-edit-metadata-shared/dso-edit-metadata-cells.scss'],
  templateUrl: './dso-edit-metadata-headers.component.html',
  standalone: true,
  imports: [
    TranslateModule,
  ],
})
/**
 * Component displaying the header table row for DSO edit metadata page
 */
export class DsoEditMetadataHeadersComponent {
  /**
   * Type of DSO we're displaying values for
   * Determines i18n messages
   */
  @Input() dsoType: string;
}
