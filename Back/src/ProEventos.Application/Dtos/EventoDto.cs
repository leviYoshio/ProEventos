using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ProEventos.Application.Dtos
{
    public class EventoDto
    {
        public int Id { get; set; }
        public string Local { get; set; }
        public string DataEvento { get; set; }
        [Required(ErrorMessage = "O campo {0} é obrigatório."),
        //MinLength(3, ErrorMessage = "O campo {0} deve ter no mínimo 4 caracteres."),
        //MaxLength(50, ErrorMessage = "O campo {0} deve ter no máximo 50 caracteres.")]
        StringLength(50,MinimumLength = 3, ErrorMessage = "O campo {0} tem um intervalo permitido de 3 a 50 caracteres")]

        public string Tema { get; set; }
        [Required(ErrorMessage="O campo {0} é obrigatório."),
        Display(Name = "Quantidade de pessoas"),
        Range(1,120000, ErrorMessage = "O campo {0} deve ser no máximo 120000")]
        public int QtdPessoas { get; set; }
        [RegularExpression(@".*\.(gif|jpe?g|bmp|png)$", ErrorMessage = "Não é uma imagem válida. (gif, jpg, jpeg, bmp ou png)")]
        public string ImagemURL { get; set; }
        [Required(ErrorMessage="O campo {0} é obrigatório."),
        Phone(ErrorMessage = "O campo {0} está com número inválido")]
        public string Telefone { get; set; }
        [Display(Name = "e-mail"),
        Required(ErrorMessage = "O campo {0} é obrigatório."),
        EmailAddress(ErrorMessage = "O {0} precisa ter um formato válido.")]
        public string Email { get; set; }
        public int UserId { get; set; }
        public UserDto UserDto { get; set; }
        public IEnumerable<LoteDto> Lotes { get; set; }
        public IEnumerable<RedeSocialDto> RedesSociais { get; set; }
        public IEnumerable<PalestranteDto> Palestrantes { get; set; }
    }
}