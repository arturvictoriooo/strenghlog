import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://flhcpgqptkrekbatvlbd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsaGNwZ3FwdGtyZWtiYXR2bGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTQyNzksImV4cCI6MjA0MjQ3MDI3OX0.yRKgJH66WZjl7p_tKmdAnnUUnJob9Nj3HvJCUVzEEGI'; // Coloque sua chave do Supabase aqui
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');

    const emailInput = document.getElementById('email');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // Obter usuário autenticado
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
        alert('Você precisa estar autenticado para acessar esta página.');
        console.error('Erro ao obter sessão:', sessionError?.message || 'Nenhuma sessão ativa.');
        return;
    }

    const user = sessionData.session.user;

    if (!user) {
        alert('Usuário não encontrado. Faça login novamente.');
        return;
    }

    const user_id = user.id; // Obtém o UUID do usuário autenticado

    // Carregar dados do usuário
    async function loadUserData() {
        const { data, error } = await supabase
            .from('usuarios')
            .select('nome, email, senha')
            .eq('user_id', user_id)
            .single();

        if (error) {
            console.error('Erro ao carregar dados do usuário:', error.message);
            return;
        }

        emailInput.value = data.email;
        usernameInput.value = data.nome;
        passwordInput.value = data.senha;
    }

    await loadUserData();

    // Função para ativar os campos de edição
    editBtn.addEventListener('click', () => {
        emailInput.readOnly = false;
        usernameInput.readOnly = false;
        passwordInput.readOnly = false;

        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
    });

    // Função para salvar alterações no Supabase
    saveBtn.addEventListener('click', async () => {
        const updatedData = {
            email: emailInput.value,
            nome: usernameInput.value,
            senha: passwordInput.value
        };

        const { error } = await supabase
            .from('usuarios')
            .update(updatedData)
            .eq('user_id', user_id);

        if (error) {
            console.error('Erro ao salvar alterações:', error.message);
            alert('Erro ao salvar alterações.');
            return;
        }

        alert('Alterações salvas com sucesso!');

        // Voltar os campos para modo somente leitura
        emailInput.readOnly = true;
        usernameInput.readOnly = true;
        passwordInput.readOnly = true;

        editBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
    });
});