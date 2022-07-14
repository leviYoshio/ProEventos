import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaginatedResult, Pagination } from '@app/models/Pagination';
import { Palestrante } from '@app/models/Palestrante';
import { PalestranteService } from '@app/services/palestrante.service';
import { environment } from '@environments/environment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-palestrante-lista',
  templateUrl: './palestrante-lista.component.html',
  styleUrls: ['./palestrante-lista.component.scss']
})
export class PalestranteListaComponent implements OnInit {

  public pagination = {} as Pagination;

  public termoBuscaChanged: Subject<string> = new Subject<string>();

  public modalRef = {} as BsModalRef;
  public palestrantes: Palestrante[] = [];
  public palestranteId = 0;


  constructor(
        private palestranteService: PalestranteService,
        private modalService: BsModalService,
        private toastr: ToastrService,
        private spinner: NgxSpinnerService,
        private router: Router
  ) { }

  public ngOnInit(): void {
    this.pagination = {currentPage: 1, itemsPerPage: 3, totalItems: 1} as Pagination;

    this.carregarPalestrantes();
  }

  public filtrarPalestrantes(evt: any): void {
    if (this.termoBuscaChanged.observers.length === 0) {
      this.termoBuscaChanged
      .pipe(debounceTime(1000))
      .subscribe(
        (filtrarPor) => {
          this.spinner.show();
          this.palestranteService
          .getPalestrantes(
            this.pagination.currentPage,
            this.pagination.itemsPerPage,
            filtrarPor
            )
            .subscribe(
              (paginatedResult: PaginatedResult<Palestrante[]>) => {
                this.palestrantes = paginatedResult.result;
                this.pagination = paginatedResult.pagination;
              },
              (error: any) => {
                this.spinner.hide();
                this.toastr.error('Erro ao Carregar os Palestrantes', 'Erro!');
              }
              )
              .add(() => this.spinner.hide());
          });
        }
    this.termoBuscaChanged.next(evt.value);
  }

  public getImagemURL(imagemName: string): string{
    if (imagemName){
      return environment.apiURL + `resources/perfil/${imagemName}`;
    }else{
      return './assets/perfil.png';
    }
  }

  public carregarPalestrantes(): void {
    this.spinner.show();
    this.palestranteService
    .getPalestrantes(this.pagination.currentPage, this.pagination.itemsPerPage)
    .subscribe(
      (paginatedResult: PaginatedResult<Palestrante[]>) => {
        this.palestrantes = paginatedResult.result;
        this.pagination = paginatedResult.pagination;
      },
      (error: any) => {
        this.spinner.hide();
        this.toastr.error('Erro ao Carregar os Palestrantes', 'Erro!');
      }
      )
      .add(() => this.spinner.hide());
    }

}
