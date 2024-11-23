import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://flhcpgqptkrekbatvlbd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsaGNwZ3FwdGtyZWtiYXR2bGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTQyNzksImV4cCI6MjA0MjQ3MDI3OX0.yRKgJH66WZjl7p_tKmdAnnUUnJob9Nj3HvJCUVzEEGI'; // Coloque sua chave do Supabase aqui
const supabase = createClient(supabaseUrl, supabaseKey);

let isDescending = false; // Variável para controlar a direção da ordenação

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
                window.location.href = '/index.html';  // Altere o caminho conforme necessário
            }
        });
    } else {
        console.error('Botão de logout não encontrado!');
    }
});

window.onload = async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
        console.error('Nenhuma sessão ativa ou erro ao obter sessão:', sessionError?.message);
        return;
    }

    const user = sessionData.session.user;

    if (!user) {
        console.error('Usuário não encontrado.');
        return;
    }

    const user_id = user.id;

    // Buscar o nome do usuário diretamente no banco de dados
    const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('nome')
        .eq('user_id', user_id)
        .single();

    if (userError) {
        console.error('Erro ao carregar o nome do usuário:', userError.message);
        return;
    }

    const userNameElement = document.getElementById('user-name');

    if (userNameElement && userData) {
        userNameElement.textContent = userData.nome; // Atualiza o nome no elemento
    } else {
        console.error('Elemento do nome do usuário não encontrado ou dados ausentes.');
    }
};

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = String(date.getUTCFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
}

async function fetchTreinos(selectedDate, selectedMuscle) {
    let query = supabase.from('treinos').select('*');

    if (selectedDate) {
        const startDate = new Date(selectedDate);
        const endDate = new Date(selectedDate);
        endDate.setDate(endDate.getDate() + 1);

        query = query.gte('semana', startDate.toISOString()).lt('semana', endDate.toISOString());
    }

    if (selectedMuscle) {
        query = query.eq('grupamento_muscular', selectedMuscle);
    }

    // Ordena os treinos pela data, dependendo da direção da ordenação
    query = query.order('semana', { ascending: !isDescending });

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
                <td>${treino.peso}</td>  <!-- Adicionando o campo de Peso aqui -->
                <td>${treino.tecnica_avancada ? 'Sim' : 'Não'}</td>
                <td>${treino.observacoes}</td>
                <td><button class="delete-btn" data-id="${treino.id}">❌</button></td> <!-- Ícone de exclusão -->
            `;
            tableBody.appendChild(row);
        });
    } else {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="9">Nenhum treino encontrado.</td>';
        tableBody.appendChild(row);
    }

    // Adicionando o evento de exclusão
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
    const semana = new Date(semanaInput + 'T00:00:00');
    const grupamentoMuscular = document.getElementById('grupamentoMuscular').value;
    const exercicio = document.getElementById('exercicio').value;
    const series = parseInt(document.getElementById('series').value);
    const repeticoes = parseInt(document.getElementById('repeticoes').value);
    const tecnicaAvancada = document.getElementById('tecnicaAvancada').value;
    const observacoes = document.getElementById('observacoes').value;
    const peso = parseFloat(document.getElementById('peso').value);  // Peso único para todas as séries

    const { data, error } = await supabase
        .from('treinos')
        .insert([
            {
                semana: semana.toISOString().split('T')[0],
                grupamento_muscular: grupamentoMuscular,
                exercicio: exercicio,
                series: series,
                repeticoes: repeticoes,
                peso: peso,  // Salvando o peso
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
    const selectedMuscle = document.getElementById('filterMuscle').value;

    if (selectedDate || selectedMuscle) {
        await fetchTreinos(selectedDate, selectedMuscle);
    } else {
        fetchTreinos();
    }
});

// Evento de clique para limpar o filtro
document.getElementById('clearFilterBtn').addEventListener('click', () => {
    document.getElementById('filterDate').value = '';
    document.getElementById('filterMuscle').value = '';
    fetchTreinos(); // Recarrega todos os treinos
});

// Adicionando evento de clique para a ordenação da "Semana"
document.getElementById('semanaHeader').addEventListener('click', () => {
    isDescending = !isDescending; // Alterna a direção da ordenação
    fetchTreinos(); // Recarrega os treinos com a nova ordenação

    // Troca o ícone dependendo da direção da ordenação
    const sortIcon = document.getElementById('sortIcon');
    if (isDescending) {
        sortIcon.classList.remove('fa-sort');
        sortIcon.classList.add('fa-sort-up');  // Ícone de ordenação crescente
    } else {
        sortIcon.classList.remove('fa-sort-up');
        sortIcon.classList.add('fa-sort-down');  // Ícone de ordenação decrescente
    }
});

// Chama a função para buscar os treinos quando o script carrega
fetchTreinos();  