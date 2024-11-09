function openTab(evt, tabName) {
    // Oculta todo o conteúdo das guias
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Remove a classe "active" de todos os botões
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Mostra o conteúdo da guia clicada e adiciona a classe "active" ao botão clicado
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Exibe a primeira aba por padrão
document.getElementById("registro").style.display = "block";
document.querySelector(".tab-link").classList.add("active");




// código de comunicação com o supabase

