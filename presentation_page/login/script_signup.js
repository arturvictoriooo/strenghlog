import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

        const supabaseUrl = 'https://flhcpgqptkrekbatvlbd.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsaGNwZ3FwdGtyZWtiYXR2bGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTQyNzksImV4cCI6MjA0MjQ3MDI3OX0.yRKgJH66WZjl7p_tKmdAnnUUnJob9Nj3HvJCUVzEEGI'; // Use sua chave completa aqui
        const supabase = createClient(supabaseUrl, supabaseKey);

        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('signup-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const nome = document.getElementById('nome').value;  // Nome Completo
                const email = document.getElementById('email').value;
                const senha = document.getElementById('password').value;

                // Cadastrando o usuário na autenticação do Supabase com Nome Completo nos metadados
                const { user, session, error: authError } = await supabase.auth.signUp({
                    email,
                    password: senha,
                    options: {
                        data: {
                            full_name: nome,  // Salvar o nome completo nos metadados do usuário
                        },
                    },
                });

                if (authError) {
                    console.error('Erro ao cadastrar usuário:', authError.message);
                    alert('Erro ao cadastrar. Tente novamente.');
                    return;
                }

                const { data, error } = await supabase
                    .from('usuarios')
                    .insert([{ nome, email, senha }]);

                if (error) {
                    console.error('Erro ao cadastrar usuário:', error);
                    alert('Erro ao cadastrar. Tente novamente.');
                } else {
                    //alert('Usuário cadastrado com sucesso!');
                    // Redirecionar o usuário para a página de sucesso ou dashboard
                    window.location.href = 'login.html';  // Coloque a página para onde deseja redirecionar
                }
            });

        });