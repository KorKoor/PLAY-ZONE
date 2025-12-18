// src/components/guides/GuideCard.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GuideCard from './GuideCard';

// Mock de datos para la guía
const mockGuide = {
    _id: '123',
    title: 'Mi Guía de Prueba',
    game: 'Mi Juego',
    authorId: {
        _id: 'author1',
        alias: 'Autor',
        avatarUrl: '/default-avatar.png'
    },
    createdAt: new Date().toISOString(),
    description: 'Esta es una descripción de prueba para la guía.',
    usefulCount: 10,
    commentsCount: 5,
    isUseful: false
};

// Mock de usuario actual
const mockCurrentUser = {
    id: 'user1',
    role: 'user'
};

const renderWithRouter = (ui, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
        return render(ui, { wrapper: MemoryRouter });
};

describe('GuideCard', () => {
    test('debe renderizar la información de la guía correctamente', () => {
        renderWithRouter(
            <GuideCard
                guide={mockGuide}
                currentUser={mockCurrentUser}
                onToggleUseful={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
                isUsefulToggleDisabled={false}
            />
        );

        // Verificar que el título, juego y descripción estén presentes
        expect(screen.getByText('Mi Guía de Prueba')).toBeInTheDocument();
        expect(screen.getByText('Juego: Mi Juego')).toBeInTheDocument();
        expect(screen.getByText(/Esta es una descripción de prueba/)).toBeInTheDocument();
        
        // Verificar que los contadores de "útil" y comentarios se muestren
        expect(screen.getByText(/10 Útil/)).toBeInTheDocument();
        expect(screen.getByText(/5 Comentarios/)).toBeInTheDocument();
        
        // Verificar información del autor
        expect(screen.getByText('Autor')).toBeInTheDocument();
    });

    test('no debe renderizar nada si la guía es nula', () => {
        const { container } = renderWithRouter(
            <GuideCard
                guide={null}
                currentUser={mockCurrentUser}
                onToggleUseful={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
                isUsefulToggleDisabled={false}
            />
        );

        // El contenedor debe estar vacío porque el componente devuelve null
        expect(container.firstChild).toBeNull();
    });

    test('debe mostrar los botones de editar y eliminar si el usuario es el autor', () => {
        const authorUser = { id: 'author1', role: 'user' };
        renderWithRouter(
            <GuideCard
                guide={mockGuide}
                currentUser={authorUser}
                onToggleUseful={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
                isUsefulToggleDisabled={false}
            />
        );

        expect(screen.getByTitle('Editar')).toBeInTheDocument();
        expect(screen.getByTitle('Eliminar')).toBeInTheDocument();
    });

    test('debe mostrar el botón de eliminar si el usuario es administrador', () => {
        const adminUser = { id: 'admin1', role: 'admin' };
        renderWithRouter(
            <GuideCard
                guide={mockGuide}
                currentUser={adminUser}
                onToggleUseful={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
                isUsefulToggleDisabled={false}
            />
        );

        // El admin no es autor, así que no ve "Editar"
        expect(screen.queryByTitle('Editar')).not.toBeInTheDocument();
        // Pero sí ve "Eliminar"
        expect(screen.getByTitle('Eliminar')).toBeInTheDocument();
    });

    test('no debe mostrar los botones de editar y eliminar si el usuario no es ni autor ni admin', () => {
        renderWithRouter(
            <GuideCard
                guide={mockGuide}
                currentUser={mockCurrentUser}
                onToggleUseful={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
                isUsefulToggleDisabled={false}
            />
        );

        expect(screen.queryByTitle('Editar')).not.toBeInTheDocument();
        expect(screen.queryByTitle('Eliminar')).not.toBeInTheDocument();
    });
});
