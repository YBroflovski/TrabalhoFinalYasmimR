// Fazer a requisição para obter a lista de livros
fetch('/mostrar-livros-publico')
    .then(response => response.json())
    .then(data => {
        const tabela = document.getElementById('livros-lista');
        data.forEach(livro => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${livro.livro}</td>
                <td>${livro.usuario}</td>
            `;
            tabela.appendChild(row);
        });
    })
    .catch(error => console.error('Erro ao carregar livros:', error));
