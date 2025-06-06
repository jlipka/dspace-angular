import {
  Component,
  OnInit,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import {
  NgbActiveModal,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import {
  Observable,
  of,
} from 'rxjs';
import {
  map,
  switchMap,
} from 'rxjs/operators';

import { DSONameService } from '../../../../core/breadcrumbs/dso-name.service';
import { AuthorizationDataService } from '../../../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../../../core/data/feature-authorization/feature-id';
import {
  METADATA_EXPORT_SCRIPT_NAME,
  ScriptDataService,
} from '../../../../core/data/processes/script-data.service';
import { RemoteData } from '../../../../core/data/remote-data';
import { Collection } from '../../../../core/shared/collection.model';
import { Community } from '../../../../core/shared/community.model';
import { DSpaceObject } from '../../../../core/shared/dspace-object.model';
import { DSpaceObjectType } from '../../../../core/shared/dspace-object-type.model';
import { getFirstCompletedRemoteData } from '../../../../core/shared/operators';
import { getProcessDetailRoute } from '../../../../process-page/process-page-routing.paths';
import { Process } from '../../../../process-page/processes/process.model';
import { ProcessParameter } from '../../../../process-page/processes/process-parameter.model';
import { ConfirmationModalComponent } from '../../../confirmation-modal/confirmation-modal.component';
import { isNotEmpty } from '../../../empty.util';
import { NotificationsService } from '../../../notifications/notifications.service';
import { createSuccessfulRemoteDataObject } from '../../../remote-data.utils';
import { DSOSelectorComponent } from '../../dso-selector/dso-selector.component';
import {
  DSOSelectorModalWrapperComponent,
  SelectorActionType,
} from '../dso-selector-modal-wrapper.component';

/**
 * Component to wrap a list of existing dso's inside a modal
 * Used to choose a dso from to export metadata of
 */
@Component({
  selector: 'ds-export-metadata-selector',
  templateUrl: '../dso-selector-modal-wrapper.component.html',
  standalone: true,
  imports: [
    DSOSelectorComponent,
    TranslateModule,
  ],
})
export class ExportMetadataSelectorComponent extends DSOSelectorModalWrapperComponent implements OnInit {
  objectType = DSpaceObjectType.DSPACEOBJECT;
  selectorTypes = [DSpaceObjectType.COLLECTION, DSpaceObjectType.COMMUNITY];
  action = SelectorActionType.EXPORT_METADATA;

  constructor(protected activeModal: NgbActiveModal, protected route: ActivatedRoute, private router: Router,
              protected notificationsService: NotificationsService, protected translationService: TranslateService,
              protected scriptDataService: ScriptDataService,
              protected authorizationDataService: AuthorizationDataService,
              protected dsoNameService: DSONameService,
              private modalService: NgbModal) {
    super(activeModal, route);
  }

  /**
   * If the dso is a collection or community: start export-metadata script & navigate to process if successful
   * Otherwise show error message
   */
  navigate(dso: DSpaceObject): Observable<boolean> {
    if (dso instanceof Collection || dso instanceof Community) {
      const modalRef = this.modalService.open(ConfirmationModalComponent);
      modalRef.componentInstance.name = this.dsoNameService.getName(dso);
      modalRef.componentInstance.headerLabel = 'confirmation-modal.export-metadata.header';
      modalRef.componentInstance.infoLabel = 'confirmation-modal.export-metadata.info';
      modalRef.componentInstance.cancelLabel = 'confirmation-modal.export-metadata.cancel';
      modalRef.componentInstance.confirmLabel = 'confirmation-modal.export-metadata.confirm';
      modalRef.componentInstance.confirmIcon = 'fas fa-file-export';
      const resp$ =  modalRef.componentInstance.response.pipe(switchMap((confirm: boolean) => {
        if (confirm) {
          const startScriptSucceeded$ = this.startScriptNotifyAndRedirect(dso);
          return startScriptSucceeded$.pipe(
            switchMap((r: boolean) => {
              return of(r);
            }),
          );
        } else {
          const modalRefExport = this.modalService.open(ExportMetadataSelectorComponent);
          modalRefExport.componentInstance.dsoRD = createSuccessfulRemoteDataObject(dso);
        }
      }));
      resp$.subscribe();
      return resp$;
    } else {
      return of(false);
    }
  }

  /**
   * Start export-metadata script of dso & navigate to process if successful
   * Otherwise show error message
   * @param dso    Dso to export
   */
  private startScriptNotifyAndRedirect(dso: DSpaceObject): Observable<boolean> {
    const parameterValues: ProcessParameter[] = [
      Object.assign(new ProcessParameter(), { name: '-i', value: dso.uuid }),
    ];
    return this.authorizationDataService.isAuthorized(FeatureID.AdministratorOf).pipe(
      switchMap((isAdmin) => {
        if (isAdmin) {
          parameterValues.push(Object.assign(new ProcessParameter(), { name: '-a' }));
        }
        return this.scriptDataService.invoke(METADATA_EXPORT_SCRIPT_NAME, parameterValues, []);
      }),
      getFirstCompletedRemoteData(),
      map((rd: RemoteData<Process>) => {
        if (rd.hasSucceeded) {
          const title = this.translationService.get('process.new.notification.success.title');
          const content = this.translationService.get('process.new.notification.success.content');
          this.notificationsService.success(title, content);
          if (isNotEmpty(rd.payload)) {
            this.router.navigateByUrl(getProcessDetailRoute(rd.payload.processId));
          }
          return true;
        } else {
          const title = this.translationService.get('process.new.notification.error.title');
          const content = this.translationService.get('process.new.notification.error.content');
          this.notificationsService.error(title, content);
          return false;
        }
      }));
  }
}
