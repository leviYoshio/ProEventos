import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Evento } from '@app/models/Evento';
import { EventoService } from '@app/services/evento.service';

@Component({
  selector: 'app-evento-lista',
  templateUrl: './evento-lista.component.html',
  styleUrls: ['./evento-lista.component.scss']
})
export class EventoListaComponent implements OnInit {

  public modalRef = {} as BsModalRef;
  public eventos: Evento[] = [];
  public eventosFiltrados: Evento[] = [];
  public eventoId = 0;

  public larguraImg = 150;
  public margemImg = 2;
  public exibirImg = true;
  private filtroListado  = '';

  public get filtroLista(): string{
    return this.filtroListado;
  }

  public set filtroLista(value: string){
    this.filtroListado = value;
    this.eventosFiltrados = this.filtroLista ? this.filtrarEventos(this.filtroLista) : this.eventos;
  }

  constructor(
    private eventoService: EventoService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private router: Router
    ) { }

  public ngOnInit(): void {
    this.spinner.show();
    this.carregarEventos();
  }

  public alterarImagem(): void{
    this.exibirImg = !this.exibirImg;
  }

  public carregarEventos(): void {
    this.eventoService.getEventos().subscribe({
      next: (eventos: Evento[]) => {
        this.eventos = eventos;
        this.eventosFiltrados = this.eventos;
      },
      error: error => {
        this.spinner.hide(),
        this.toastr.error('Erro ao carregar os eventos', 'Erro!');
      },
      complete: () => this.spinner.hide()
    }
    );
  }
  public filtrarEventos(filtrarPor: string): Evento[] {
    filtrarPor = filtrarPor.toLocaleLowerCase();
    return this.eventos.filter(
      evento => evento.tema.toLocaleLowerCase().indexOf(filtrarPor) !== -1 ||
      evento.local.toLocaleLowerCase().indexOf(filtrarPor) !== -1
    );
  }

  // Botão
  public openModal(event: any, template: TemplateRef<any>, eventoId: number): void{
    event.stopPropagation();
    this.eventoId = eventoId;
    this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
  }

  public confirm(): void {
    this.modalRef.hide();
    this.spinner.show();
    this.eventoService.deleteEvento(this.eventoId).subscribe({
      next: (result: any) => {
        if (result.message === 'Deletado'){
          this.toastr.success('O Evento foi deletado com sucesso', 'Deletado!');
          this.carregarEventos();
        }
      },
      error: (error: any) => {
        console.error(error);
        this.toastr.error(`Erro ao tentar deletar o evento ${this.eventoId}`, 'Erro!');
      },
      complete: () => { }
    }).add(() => { this.spinner.hide(); });


  }

  public decline(): void {
    this.modalRef.hide();
  }

  // Redirecionamento de rota
  public detalheEvento(id: number): void{
    this.router.navigate([`eventos/detalhe/${id}`]);
  }

}
