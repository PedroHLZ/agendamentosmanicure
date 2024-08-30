$(document).ready(function () {
  let currentStep = 1;
  carregarHorarios();

  // Função para carregar horários e agendamentos do servidor
  function carregarHorarios() {
      $.get('http://localhost:3000/api/horarios', function (data) {
          const { horarios, agendamentos } = data;
          const horarioSelect = $('#horario');
          horarioSelect.empty();
          
          // Preencher horários no select
          horarios.forEach(horario => {
              horarioSelect.append(`<option value="${horario}">${horario}</option>`);
          });

          // Limpar listas antes de preenchê-las
          const agendamentosList = $('#agendamentos-list');
          const hojeList = $('#hoje-list');
          agendamentosList.empty();
          hojeList.empty();

          const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
          const hoje = new Date();
          hoje.setHours(-3, 0, 0, 0); // Definir hora do dia para 00:00 no fuso horário local

          function saoDatasIguais(data1, data2) {
              return data1.getFullYear() === data2.getFullYear() &&
                  data1.getMonth() === data2.getMonth() &&
                  data1.getDate() === data2.getDate();
          }

          // Adiciona todos os agendamentos na lista geral
          agendamentos.forEach(agendamento => {
              let dataAgendamento;
              const dataString = agendamento.data;

              // Verificar se o formato da data é dd/MM/yyyy ou yyyy-MM-dd
              if (/\d{2}\/\d{2}\/\d{4}/.test(dataString)) {
                  const partesData = dataString.split('/');
                  const dataFormatada = `${partesData[2]}-${partesData[1]}-${partesData[0]}`;
                  dataAgendamento = new Date(dataFormatada);
              } else if (/^\d{4}-\d{2}-\d{2}$/.test(dataString)) {
                  dataAgendamento = new Date(dataString);
              } else {
                  console.error("Formato de data desconhecido:", dataString);
                  return;
              }

              dataAgendamento.setHours(0, 0, 0, 0); // Definir hora do dia para 00:00 no fuso horário local

              if (!isNaN(dataAgendamento.getTime())) {
                  const diaSemana = diasSemana[dataAgendamento.getDay() + 1];
                  const agendamentoHtml = criarHtmlAgendamento(agendamento, diaSemana);

                  agendamentosList.append(agendamentoHtml);

                  // Verifica se o agendamento é para hoje e adiciona à lista de hoje
                  if (saoDatasIguais(dataAgendamento, hoje)) {
                      hojeList.append(agendamentoHtml);
                  }
              } else {
                  console.error("Data inválida:", agendamento.data);
                  agendamentosList.append(`
                    <div class="card mb-2">
                      <div class="comments">
                        <div class="comment-react">
                          <span>Data inválida</span>
                        </div>
                      </div>
                    </div>
                  `);
              }
          });
      });
  }

  function criarHtmlAgendamento(agendamento, diaSemana) {
    return `
        <div class="card mb-2 position-relative">
            <div class="comments">
                <div class="comment-react">
                    <span>${diaSemana}</span>
                </div>
                <div class="comment-container">
                    <div class="user">
                        <div class="user-pic">
                            <svg fill="none" viewBox="0 0 24 24" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linejoin="round" fill="#707277" stroke-linecap="round" stroke-width="2" stroke="#707277" d="M6.57757 15.4816C5.1628 16.324 1.45336 18.0441 3.71266 20.1966C4.81631 21.248 6.04549 22 7.59087 22H16.4091C17.9545 22 19.1837 21.248 20.2873 20.1966C22.5466 18.0441 18.8372 16.324 17.4224 15.4816C14.1048 13.5061 9.89519 13.5061 6.57757 15.4816Z"></path>
                                <path stroke-width="2" fill="#707277" stroke="#707277" d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z"></path>
                            </svg>
                        </div>
                        <div class="user-info">
                            <span>${agendamento.nome}</span>
                            <p>${agendamento.data} às ${agendamento.horario}</p>
                        </div>
                    </div>
                    <p class="comment-content">${agendamento.servico}.</p>
                    <div class="cancel-btn-container">
                        <button class="btn btn-danger btn-sm cancelar-btn" data-horario="${agendamento.horario}" data-data="${agendamento.data}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}


  $('#agendar-form').on('submit', function (event) {
      event.preventDefault();

      const horario = $('#horario').val();
      const data = $('#data').val();
      const nome = $('#nome').val();
      const servico = $('#servico').val();

      $.ajax({
          url: 'http://localhost:3000/api/agendar',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({ horario, data, nome, servico }),
          success: function (response) {
              $('#notification').text(response.message).removeClass('hide').addClass('show');
              setTimeout(function () {
                  $('#notification').removeClass('show').addClass('hide');
              }, 3000);
              $('#agendarModal').modal('hide');
              carregarHorarios();
          },
          error: function (jqXHR) {
              $('#notification').text(jqXHR.responseJSON.message).removeClass('hide').addClass('show');
              setTimeout(function () {
                  $('#notification').removeClass('show').addClass('hide');
              }, 3000);
          }
      });
  });

  function showStep(step) {
      $('.step').removeClass('active').addClass('d-none');
      $(`.step-${step}`).addClass('active').removeClass('d-none');
      if (step === 1) {
          $('.prev-step').addClass('d-none');
      } else {
          $('.prev-step').removeClass('d-none');
      }
      if (step === 4) {
          $('.next-step').addClass('d-none');
          $('.submit-btn').removeClass('d-none');
      } else {
          $('.next-step').removeClass('d-none');
          $('.submit-btn').addClass('d-none');
      }
  }
  showStep(currentStep);

  $('.next-step').on('click', function () {
      if (currentStep < 4) {
          currentStep++;
          showStep(currentStep);
      }
  });

  $('.prev-step').on('click', function () {
      if (currentStep > 1) {
          currentStep--;
          showStep(currentStep);
      }
  });

  $('#agendamentos-list, #hoje-list').on('click', '.cancelar-btn', function () {
      const horario = $(this).data('horario');
      const data = $(this).data('data');
      cancelarAgendamento(horario, data);
  });

  function cancelarAgendamento(horario, data) {
      $.ajax({
          url: `http://localhost:3000/api/cancelar?horario=${encodeURIComponent(horario)}&data=${encodeURIComponent(data)}`,
          method: 'DELETE',
          success: function (response) {
              $('#notification').text(response.message).removeClass('hide').addClass('show');
              setTimeout(function () {
                  $('#notification').removeClass('show').addClass('hide');
              }, 3000);
              carregarHorarios();
          },
          error: function (jqXHR) {
              $('#notification').text(jqXHR.responseJSON.message).removeClass('hide').addClass('show');
              setTimeout(function () {
                  $('#notification').removeClass('show').addClass('hide');
              }, 3000);
          }
      });
  }
});
