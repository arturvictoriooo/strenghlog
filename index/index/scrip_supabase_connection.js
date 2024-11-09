import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

        const supabaseUrl = 'https://flhcpgqptkrekbatvlbd.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsaGNwZ3FwdGtyZWtiYXR2bGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTQyNzksImV4cCI6MjA0MjQ3MDI3OX0.yRKgJH66WZjl7p_tKmdAnnUUnJob9Nj3HvJCUVzEEGI'; // Coloque sua chave do Supabase aqui
        const supabase = createClient(supabaseUrl, supabaseKey);

        document.addEventListener('DOMContentLoaded', () => {
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async () => {
                    const { error: logoutError } = await supabase.auth.signOut();
                    if (logoutError) {
                        console.error('Erro ao fazer logout:', logoutError.message);
                        alert('Erro ao fazer logout. Tente novamente.');
                    } else {
                        console.log('Logout realizado com sucesso!');
                        //alert('Logout realizado com sucesso!');
                        window.location.href = '/index.html';  // Altere o caminho conforme necessário
                    }
                });
            } else {
                console.error('Botão de logout não encontrado!');
            }
        });

        window.onload = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const userName = session.user.user_metadata.full_name;
                const userNameElement = document.getElementById('user-name');
                if (userNameElement && userName) {
                    userNameElement.textContent = userName;
                } else {
                    console.error('Nome do usuário não encontrado ou sessão inválida.');
                }
            } else {
                console.error('Nenhuma sessão ativa.');
            }
        };

        function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = String(date.getUTCFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
        }

        async function fetchTreinos(selectedDate) {
            let query = supabase.from('treinos').select('*');

            if (selectedDate) {
                const startDate = new Date(selectedDate);
                const endDate = new Date(selectedDate);
                endDate.setDate(endDate.getDate() + 1);

                query = query.gte('semana', startDate.toISOString()).lt('semana', endDate.toISOString());
            }

            const { data, error } = await query;

            if (error) {
                console.error('Erro ao buscar os dados:', error);
                return;
            }

            populateTable(data);
        }

        function populateTable(treinos) {
            const tableBody = document.querySelector('#treinosTable tbody');
            tableBody.innerHTML = '';

            if (treinos.length > 0) {
                treinos.forEach(treino => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${formatDate(treino.semana)}</td>
                        <td>${treino.grupamento_muscular}</td>
                        <td>${treino.exercicio}</td>
                        <td>${treino.series}</td>
                        <td>${treino.repeticoes}</td>
                        <td>${treino.tecnica_avancada ? 'Sim' : 'Não'}</td>
                        <td>${treino.observacoes}</td>
                        <td><button class="delete-btn" data-id="${treino.id}">❌</button></td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="8">Nenhum treino encontrado.</td>';
                tableBody.appendChild(row);
            }

            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const treinoId = event.target.getAttribute('data-id');
                    await deleteTreino(treinoId);
                    fetchTreinos();
                });
            });
        }

        async function deleteTreino(id) {
            const { data, error } = await supabase
                .from('treinos')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Erro ao remover treino:', error);
            }
        }

        document.getElementById('treinoForm').addEventListener('submit', async (event) => {
            event.preventDefault();

            const semanaInput = document.getElementById('semana').value;
            // Corrigir para que não haja ajuste de fuso horário ao salvar a data
            const semana = new Date(semanaInput + 'T00:00:00'); // T00:00:00 fixa a hora no início do dia sem ajuste de fuso horário
            const grupamentoMuscular = document.getElementById('grupamentoMuscular').value;
            const exercicio = document.getElementById('exercicio').value;
            const series = parseInt(document.getElementById('series').value);
            const repeticoes = parseInt(document.getElementById('repeticoes').value);
            const tecnicaAvancada = document.getElementById('tecnicaAvancada').value;
            const observacoes = document.getElementById('observacoes').value;

            const { data, error } = await supabase
                .from('treinos')
                .insert([
                    {
                        semana: semana.toISOString().split('T')[0], // Salvar data sem fuso horário
                        grupamento_muscular: grupamentoMuscular,
                        exercicio: exercicio,
                        series: series,
                        repeticoes: repeticoes,
                        tecnica_avancada: tecnicaAvancada,
                        observacoes: observacoes
                    }
                ]);

            if (error) {
                console.error('Erro ao adicionar treino:', error);
            } else {
                fetchTreinos();
                document.getElementById('treinoForm').reset();
            }
        });

        document.getElementById('filterBtn').addEventListener('click', async () => {
            const selectedDate = document.getElementById('filterDate').value;
            if (selectedDate) {
                await fetchTreinos(selectedDate);
            } else {
                fetchTreinos();
            }
        });

        // Evento de clique para limpar o filtro
        document.getElementById('clearFilterBtn').addEventListener('click', () => {
            document.getElementById('filterDate').value = ''; // Limpa o campo de data
            fetchTreinos(); // Recarrega todos os treinos
        });

        // Chama a função para buscar os treinos quando o script carrega
        fetchTreinos();