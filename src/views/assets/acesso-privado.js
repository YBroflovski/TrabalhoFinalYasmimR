// Fazer a requisição para obter a lista de livros
fetch('/mostrar-livros')
    .then(response => response.json())
    .then(data => {
        const tabela = document.getElementById('livros-lista');
        data.forEach(livro => {
            // Verifique se cada livro tem um id
            if (livro.id) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${livro.livro}</td>
                    <td>${livro.usuario}</td>
                    <td>
                        <form action="/delete-livro/${livro.id}" method="POST" style="display:inline;" onsubmit="return handleDelete(event, ${livro.id})">
                            <button type="submit">Excluir</button>
                        </form>
                    </td>
                `;
                tabela.appendChild(row);
            } else {
                console.error('Livro sem ID:', livro);
            }
        });
    })
    .catch(error => console.error('Erro ao carregar livros:', error));

// Função para deletar um livro
function handleDelete(event, livro) {
    event.preventDefault();
    fetch(`/delete-livro/${livro}`, {
        method: 'POST'
    })
    .then(response => {
        if (response.status === 403) {
           
        } else if (response.ok) {
            location.reload(); // Recarregar a página se a exclusão for bem-sucedida
        } else {
            alert('Erro ao tentar excluir o livro.');
        }
    })
    .catch(error => {
        console.error('Erro ao tentar excluir livro:', error);
        alert('Erro ao tentar excluir o livro.');
    });
}

// Função de busca dinâmica de livros
function filterBooks() {
    const input = document.querySelector('.search-input').value.toLowerCase();
    const rows = document.querySelectorAll('#livros-lista tr');
    rows.forEach(row => {
        const bookName = row.cells[0].textContent.toLowerCase();
        row.style.display = bookName.includes(input) ? '' : 'none';
    });
}
