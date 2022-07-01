import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Evento } from '@app/models/Evento';
import { EventoService } from '@app/services/evento.service';

import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-evento-detalhe',
  templateUrl: './evento-detalhe.component.html',
  styleUrls: ['./evento-detalhe.component.scss']
})
export class EventoDetalheComponent implements OnInit {
  public form!: FormGroup;
  public evento = {} as Evento;
  public estadoSalvar = 'post';

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

  constructor(private fb: FormBuilder, private localeService: BsLocaleService,
              private router: ActivatedRoute, private eventoService: EventoService,
              private spinner: NgxSpinnerService, private toastr: ToastrService) { }

  public carregarEvento(): void{
    const eventoIdParam = this.router.snapshot.paramMap.get('id');

    if (eventoIdParam !== null){
      this.spinner.show();

      this.estadoSalvar = 'put';

      this.eventoService.getEventoById(+eventoIdParam).subscribe({
        // observer
        next: (evento: Evento) => {
          this.evento = { ... evento }; // {... NOME} cria uma cópia e não uma referencia/associação
          this.form.patchValue(this.evento);
        },
        error: (error: any) => {
          this.spinner.hide();
          this.toastr.error('Erro ao tentar carregar evento', 'Erro!');
          console.error(error);
        },
        complete: () => { this.spinner.hide(); }
      });
    }
  }

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
      imagemURL: ['', Validators.required],
    });
  }

  public resetForm(): void {
    this.form.reset();
  }

  public cssValidator(campoForm: FormControl): any{
    return {'is-invalid': campoForm.errors && campoForm.touched};
  }

  public salvarAlteracao(): void{
    this.spinner.show();
    if (this.form.valid){

      if (this.estadoSalvar === 'post'){
        this.evento = {... this.form.value}; // spread operator
      }else{
        this.evento = {id: this.evento.id, ... this.form.value}; // spread operator
      }

      this.eventoService[this.estadoSalvar](this.evento).subscribe({
        next: () => {
          this.toastr.success('O Evento foi salvo com sucesso', 'Sucesso!');
          this.spinner.hide();
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
}
