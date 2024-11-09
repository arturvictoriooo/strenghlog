import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

        const supabaseUrl = 'https://flhcpgqptkrekbatvlbd.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsaGNwZ3FwdGtyZWtiYXR2bGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTQyNzksImV4cCI6MjA0MjQ3MDI3OX0.yRKgJH66WZjl7p_tKmdAnnUUnJob9Nj3HvJCUVzEEGI'; // Coloque sua chave do Supabase aqui
        const supabase = createClient(supabaseUrl, supabaseKey);

        
        // Verifica se já existe uma sessão ativa
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            console.log('Sessão ativa:', session);
            // Redirecione para a página de treinos se a sessão estiver ativa
            window.location.href = '/index/index/index.html';
        }

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('senha').value;

            // Logar o usuário
            const { user, session, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                alert("Erro ao fazer login: " + error.message);
            } else {
                console.log('Usuário logado:', user);
                console.log('Sessão:', session);
                window.location.href = 'login.html'; // Redireciona para a página de treinos
            }
        });