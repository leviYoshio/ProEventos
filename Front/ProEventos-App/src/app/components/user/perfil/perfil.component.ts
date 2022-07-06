import { Component, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ValidatorField } from '@app/helpers/ValidatorField';
import { UserUpdate } from '@app/models/identity/UserUpdate';
import { AccountService } from '@app/services/account.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})

export class PerfilComponent implements OnInit {
  public userUpdate = {} as UserUpdate;
  public form!: FormGroup;

  constructor(private fb: FormBuilder,
              public accountService: AccountService,
              private router: Router,
              private toaster: ToastrService,
              private spinner: NgxSpinnerService) { }

  ngOnInit(): void{
    this.validation();
    this.carregarUsuario();
  }

  private carregarUsuario(): void {
    this.spinner.show();
    this.accountService.getUser().subscribe(
      (userRetorno: UserUpdate) => {
        this.userUpdate = userRetorno;
        this.form.patchValue(this.userUpdate);
        this.toaster.success('Usuário carregado.', 'Sucesso!');
      },
      (error) => {
        console.error(error);
        this.toaster.error('Usuário não carregado', 'Erro!');
        this.router.navigate(['/dashboard']);
      }
    ).add(this.spinner.hide());
  }

  public validation(): void{
    const formOptions: AbstractControlOptions = {
      validators: ValidatorField.MustMatch('password', 'confirmePassword')
    };

    this.form = this.fb.group({
      userName: [''],
      titulo: ['NaoInformado', Validators.required],
      primeiroNome: ['', Validators.required],
      ultimoNome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      descricao: ['', Validators.required],
      funcao: ['NaoInformado', Validators.required],
      password: ['', [Validators.nullValidator, Validators.minLength(4)]],
      confirmePassword: ['', Validators.nullValidator]
    }, formOptions);
  }

  public get f(): any{
    return this.form.controls;
  }

  public onSubmit(): void{
    this.atualizarUsuario();
  }

  public atualizarUsuario(): void{
    this.userUpdate = {... this.form.value};
    this.spinner.show();
    this.accountService.updateUser(this.userUpdate).subscribe(
      () => {
        this.toaster.success('Usuário atualizado.', 'Sucesso!');
      },
      (error) => {
        console.error(error);
        this.toaster.error('Usuário não atualizado', 'Erro!');
      }
    ).add(this.spinner.hide());
  }
  public resetForm(event: any): void{
    event.preventDefault();
    this.form.reset();
  }

}
