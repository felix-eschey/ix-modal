import { Component, inject } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import {
  IxActiveModal,
  IxButton,
  IxModalContent,
  IxModalFooter,
  IxModalHeader,
  ModalService,
} from '@siemens/ix-angular/standalone'

@Component({
  imports: [IxModalHeader, IxModalContent, IxModalFooter, IxButton],
  template: `
    <ix-modal-header>Example modal</ix-modal-header>
    <ix-modal-content>Click Cancel to close me.</ix-modal-content>
    <ix-modal-footer>
      <ix-button variant="secondary" data-test-id="cancel" (click)="modal.dismiss('cancel')">Cancel</ix-button>
    </ix-modal-footer>
  `,
})
class ExampleModal {
  modal = inject(IxActiveModal)
}

@Component({
  selector: 'app-root',
  imports: [IxButton],
  template: `<ix-button data-test-id="open" (click)="open()">Open modal</ix-button>`,
})
class App {
  private modalService = inject(ModalService)

  open() {
    this.modalService.open({ content: ExampleModal })
  }
}

bootstrapApplication(App)
