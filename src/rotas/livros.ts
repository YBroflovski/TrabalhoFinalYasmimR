import { Router, Request, Response } from 'express';
import path from 'path';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const livrosRoutes = Router();
const dbPromise = open({ filename: 'src/database.db', driver: sqlite3.Database });

// Middleware para verificar se o usuário está logado
const requireLogin = (req: Request, res: Response, next: any) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Rota para a página de inserção de livros
livrosRoutes.get('/inserir-livros', requireLogin, (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../views', 'inserir-livros.html'));
});

// Rota para inserir um livro no banco de dados
livrosRoutes.post('/inserir-livros', requireLogin, async (req: Request, res: Response) => {
    const { livro } = req.body;
    const userId = req.session.userId;
    try {
        const db = await dbPromise;
        await db.run('INSERT INTO livros (nome, user_id) VALUES (?, ?)', [livro, userId]);
        res.redirect('/acesso-privado'); // Redirecionar após inserir o livro
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao inserir o livro');
    }
});

// Rota para exibir livros
livrosRoutes.get('/mostrar-livros', requireLogin, async (req: Request, res: Response) => {
    try {
        const db = await dbPromise;
        const livros = await db.all(`
            SELECT livros.id, livros.nome AS livro, users.name AS usuario
            FROM livros
            JOIN users ON livros.user_id = users.id
        `);
        res.json(livros);
    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        res.status(500).send('Erro ao buscar livros');
    }
});

// Rota para excluir um livro
livrosRoutes.post('/delete-livro/:id', requireLogin, async (req: Request, res: Response) => {
    const livroId = req.params.id;
    try {
        const db = await dbPromise;
        const livro = await db.get('SELECT user_id FROM livros WHERE id = ?', [livroId]);
        if (!livro) {
            return res.status(404).send('Livro não encontrado');
        }
        if (req.session.userId !== livro.user_id) {
            return res.status(403).send('Acesso negado');
        }
        await db.run('DELETE FROM livros WHERE id = ?', [livroId]);
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao tentar excluir o livro:', error);
        res.status(500).send('Erro ao tentar excluir o livro');
    }
});

// Rota pública para exibir livros sem login
livrosRoutes.get('/mostrar-livros-publico', async (req: Request, res: Response) => {
    try {
        const db = await dbPromise;
        const livros = await db.all(`
            SELECT livros.nome AS livro, users.name AS usuario
            FROM livros
            JOIN users ON livros.user_id = users.id
        `);
        res.json(livros);
    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        res.status(500).send('Erro ao buscar livros');
    }
});

export default livrosRoutes;
