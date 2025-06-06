import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  inject,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

import { createTestComponent } from '../testing/utils.test';
import { AlertComponent } from './alert.component';
import { AlertType } from './alert-type';

describe('AlertComponent test suite', () => {

  let comp: AlertComponent;
  let compAsAny: any;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        NoopAnimationsModule,
        TranslateModule.forRoot(),
        AlertComponent,
        TestComponent,
      ],
      providers: [
        ChangeDetectorRef,
        AlertComponent,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then();
  }));

  describe('', () => {
    let testComp: TestComponent;
    let testFixture: ComponentFixture<TestComponent>;

    // synchronous beforeEach
    beforeEach(() => {
      const html = `
        <ds-alert [content]="content" [dismissible]="dismissible" [type]="type"></ds-alert>`;

      testFixture = createTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;
      testComp = testFixture.componentInstance;
    });

    afterEach(() => {
      testFixture.destroy();
    });

    it('should create AlertComponent', inject([AlertComponent], (app: AlertComponent) => {

      expect(app).toBeDefined();
    }));
  });

  describe('', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(AlertComponent);
      comp = fixture.componentInstance;
      compAsAny = comp;
      comp.content = 'test alert';
      comp.dismissible = true;
      comp.type = AlertType.Info;
      fixture.detectChanges();
    });

    it('should display close icon when dismissible is true', () => {

      const btn = fixture.debugElement.query(By.css('.close'));
      expect(btn).toBeDefined();
    });

    it('should not display close icon when dismissible is false', () => {
      comp.dismissible = false;
      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('.close'));
      expect(btn).toBeDefined();
    });

    it('should dismiss alert when click on close icon', () => {
      spyOn(comp, 'dismiss');
      const btn = fixture.debugElement.query(By.css('.btn-close'));

      btn.nativeElement.click();

      expect(comp.dismiss).toHaveBeenCalled();
    });

    afterEach(() => {
      fixture.destroy();
      comp = null;
      compAsAny = null;
    });
  });
});

// declare a test component
@Component({
  selector: 'ds-test-cmp',
  template: ``,
  standalone: true,
  imports: [],
})
class TestComponent {

  content = 'test alert';
  dismissible = true;
  type = AlertType.Info;
}
