import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Evento } from '@app/models/Evento';
import { EventoService } from '@app/services/evento.service';
import { Lote } from '@app/models/Lote';
import { LoteService } from '@app/services/lote.service';


import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-evento-detalhe',
  templateUrl: './evento-detalhe.component.html',
  styleUrls: ['./evento-detalhe.component.scss']
})
export class EventoDetalheComponent implements OnInit {
  public modalRef: BsModalRef;
  public form!: FormGroup;
  public evento = {} as Evento;
  public estadoSalvar = 'post';
  public eventoId: number;
  public loteAtual = {id: 0, nome: '', indice: 0 };
  public imagemURL = 'assets/upload.png';
  public file: File;

  get f(): any{
    return this.form.controls;
  }

  get bsConfig(): any{
    return {
      adaptivePosition: true,
      dateInputFormat: 'DD/MM/YYYY hh:mm a',
      containerClass: 'theme-default',
      showWeekNumbers: false
    };
  }

  get modoEditar(): boolean{
    return this.estadoSalvar === 'put';
  }

  get lotes(): FormArray{
    return this.form.get('lotes') as FormArray;
  }

  constructor(private fb: FormBuilder, private localeService: BsLocaleService,
              private activatedRouter: ActivatedRoute, private eventoService: EventoService,
              private spinner: NgxSpinnerService, private toastr: ToastrService,
              private router: Router, private loteService: LoteService,
              private modalService: BsModalService) { }

  public carregarEvento(): void{
    this.eventoId = +this.activatedRouter.snapshot.paramMap.get('id');

    if (this.eventoId !== null && this.eventoId !== 0 ){
      this.spinner.show();

      this.estadoSalvar = 'put';

      this.eventoService.getEventoById(this.eventoId).subscribe({
        // observer
        next: (evento: Evento) => {
          this.evento = { ... evento }; // {... NOME} cria uma cópia e não uma referencia/associação
          this.form.patchValue(this.evento);
          if(this.evento.imagemURL !== ''){
            this.imagemURL = environment.apiURL + 'resources/images/' + this.evento.imagemURL;
          }
          this.evento.lotes.forEach( lote => {
            this.lotes.push(this.criarLote(lote));
          });
          // this.carregarLotes();
        },
        error: (error: any) => {
          this.toastr.error('Erro ao tentar carregar evento', 'Erro!');
          console.error(error);
        },
      }).add(() => this.spinner.hide());
    }
  }

  /*public carregarLotes(): void{
    this.loteService.getLotesByEventoId(this.eventoId).subscribe(
      (lotesRetorno: Lote[]) => {
        lotesRetorno.forEach( lote => {
          this.lotes.push(this.criarLote(lote));
        });
      },
      (error: any) => {
        this.toastr.error('Erro ao tentar carregar lotes', 'Erro!');
        console.error(error);
      }
    ).add(() => this.spinner.hide());
  }*/

  ngOnInit(): void {
    this.validation();
    this.carregarEvento();
  }

  public validation(): void {
    this.form = this.fb.group({
      tema: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      local: ['', Validators.required],
      dataEvento: ['', Validators.required],
      qtdPessoas: ['', [Validators.required, Validators.max(120000)]],
      telefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      imagemURL: [''],
      lotes: this.fb.array([])
      });
  }

  public adicionarLote(): void{
    this.lotes.push(this.criarLote({id: 0} as Lote));
  }

  public criarLote(lote: Lote): FormGroup{
    return this.fb.group({
      id: [lote.id],
      nome: [lote.nome, Validators.required],
      quantidade: [lote.quantidade, Validators.required],
      preco: [lote.preco, Validators.required],
      dataInicio: [lote.dataInicio],
      dataFim: [lote.dataFim]
    });
  }

  public retornaTituloLote(nome: string): string{
    return nome === null || nome === '' ? 'Nome do Lote' : nome;
  }

  public resetForm(): void {
    this.form.reset();
  }

  public cssValidator(campoForm: FormControl | AbstractControl): any{
    return {'is-invalid': campoForm.errors && campoForm.touched};
  }

  public salvarEvento(): void{
    this.spinner.show();
    if (this.form.valid){

      if (this.estadoSalvar === 'post'){
        this.evento = {... this.form.value}; // spread operator
      }else{
        this.evento = {id: this.evento.id, ... this.form.value}; // spread operator
      }

      this.eventoService[this.estadoSalvar](this.evento).subscribe({
        next: (eventoRetorno: Evento) => {
          this.toastr.success('O Evento foi salvo com sucesso', 'Sucesso!');
          this.spinner.hide();
          // this.estadoSalvar = 'put';
          this.router.navigate([`eventos/detalhe/${eventoRetorno.id}`]);
        },
        error: (error: any) => {
          console.error(error);
          this.spinner.hide();
          this.toastr.error(`Erro ao tentar salvar o evento`, 'Erro!');
        },
        complete: () => { this.spinner.hide(); }
      });
    }
  }

  public salvarLotes(): void{
    if (this.form.controls.lotes.valid){
      this.spinner.show();
      this.loteService.saveLote(this.eventoId, this.form.value.lotes).subscribe(
        () => {
          this.toastr.success('Lotes salvos com sucesso!', 'Sucesso!');
          // this.lotes.reset(); // ;
        },
        (error: any) => {
          this.toastr.error('Erro ao tentar salvar lotes', 'Erro!');
          console.error(error);
        }
        ).add(() => this.spinner.hide());
    }
  }

  public removerLote(template: TemplateRef<any>, indice: number): void{

    this.loteAtual.id = this.lotes.get(indice + '.id').value;
    this.loteAtual.nome = this.lotes.get(indice + '.nome').value;
    this.loteAtual.indice = indice;


    this.modalRef = this.modalService.show(template, {class: 'modal-sm'});

  }

  public confirmDeleteLote(): void{
    this.modalRef.hide();
    this.spinner.show();
    this.loteService.deleteLote(this.eventoId, this.loteAtual.id).subscribe(
      () => {
        this.toastr.success('Lote deletado com sucesso.', 'Sucesso!');
        this.lotes.removeAt(this.loteAtual.indice);
      },
      (error) => {
        this.toastr.error('Erro ao tentar deletar lote', 'Erro!');
        console.error(error);
      }
    ).add(() => this.spinner.hide() );
  }

  public declineDeleteLote(): void{
    this.modalRef.hide();
  }

  onFileChange(ev: any): void {
    const reader = new FileReader();

    reader.onload = (event: any) => this.imagemURL = event.target.result;

    this.file = ev.target.files;
    reader.readAsDataURL(this.file[0]);

    this.uploadImagem();
  }

  uploadImagem(): void {
    this.spinner.show();
    this.eventoService.postUpload(this.eventoId, this.file).subscribe(
      () => {
        this.carregarEvento();
        this.toastr.success('Imagem atualizada com Sucesso', 'Sucesso!');
      },
      (error: any) => {
        this.toastr.error('Erro ao fazer upload de imagem', 'Erro!');
        console.log(error);
      }
    ).add(() => this.spinner.hide());
  }

}
