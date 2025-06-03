import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import { FaIcons } from './components/Icons';
import AdminLayout from '../../layouts/AdminLayout';
import { toast } from 'react-toastify';
import axiosClient from '../../apis/axios-client';
import { useCategories } from '../../features/products/hooks/use-categories-query';
import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

// Styles
const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  color: var(--primary-color);
  margin: 0;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--accent-color);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: var(--border-radius);
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition);
  cursor: pointer;
  
  &:hover {
    background-color: var(--primary-color);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  margin-bottom: 2rem;
`;

const THead = styled.thead`
  background-color: var(--light-bg);
`;

const Th = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--primary-color);
  border-bottom: 1px solid var(--border-color);
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: top;
`;

const Tr = styled.tr`
  &:hover {
    background-color: var(--light-bg);
  }
  
  &:last-child td {
    border-bottom: none;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--border-radius);
  border: none;
  cursor: pointer;
  transition: var(--transition);
  margin-right: 0.5rem;
  
  &:last-child {
    margin-right: 0;
  }
`;

const EditButton = styled(ActionButton)`
  background-color: var(--info-color);
  color: white;
  
  &:hover {
    background-color: #0077b6;
  }
`;

const DeleteButton = styled(ActionButton)`
  background-color: var(--error-color);
  color: white;
  
  &:hover {
    background-color: #c81e1e;
  }
`;

const ProductCount = styled.span`
  display: inline-block;
  background-color: var(--accent-color);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  color: var(--light-text);
  margin-bottom: 1rem;
`;

const EmptyStateMessage = styled.p`
  color: var(--light-text);
  margin-bottom: 1.5rem;
`;

const CategoriesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: categoriesResponse, isLoading, refetch } = useCategories();
  const categories = categoriesResponse?.data || [];
  
  const handleEditCategory = (id: number) => {
    navigate(`/admin/categories/edit/${id}`);
  };

  const handleAddCategory = () => {
    navigate('/admin/categories/add');
  };
  
  const handleDeleteCategory = async (id: number, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${name}" ?`)) {
      try {
        const response = await axiosClient.delete(`/categories/${id}`);
        toast.success('Catégorie supprimée avec succès');
        refetch();
      } catch (error) {
        console.error('Error deleting category:', error);
        
        const axiosError = error as AxiosError<{message: string}>;
        if (axiosError.response && axiosError.response.data && 'message' in axiosError.response.data) {
          toast.error(axiosError.response.data.message);
        } else {
          toast.error('Erreur lors de la suppression de la catégorie');
        }
      }
    }
  };
  
  return (
    <AdminLayout title="Gestion des Catégories">
      <PageHeader>
        <PageTitle>Gestion des Catégories</PageTitle>
        <AddButton onClick={handleAddCategory}>
          <FaIcons.FaPlus />
          Ajouter une catégorie
        </AddButton>
      </PageHeader>
      
      {isLoading ? (
        <div>Chargement...</div>
      ) : categories.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>
            <FaIcons.FaLayerGroup />
          </EmptyStateIcon>
          <EmptyStateMessage>Aucune catégorie trouvée</EmptyStateMessage>
          <AddButton onClick={handleAddCategory}>
            <FaIcons.FaPlus />
            Ajouter une catégorie
          </AddButton>
        </EmptyState>
      ) : (
        <Table>
          <THead>
            <Tr>
              <Th style={{ width: '50px' }}>ID</Th>
              <Th>Nom</Th>
              <Th>Slug</Th>
              <Th>Description</Th>
              <Th>Produits</Th>
              <Th style={{ width: '120px' }}>Actions</Th>
            </Tr>
          </THead>
          <tbody>
            {categories.map((category) => (
              <Tr key={category.id}>
                <Td>{category.id}</Td>
                <Td>{category.name}</Td>
                <Td>{category.slug}</Td>
                <Td>{category.description || '-'}</Td>
                <Td>
                  <ProductCount>{category.productCount || 0}</ProductCount>
                </Td>
                <Td>
                  <EditButton 
                    onClick={() => handleEditCategory(category.id)}
                    title="Modifier"
                  >
                    <FaIcons.FaEdit />
                  </EditButton>
                  <DeleteButton 
                    onClick={() => handleDeleteCategory(category.id, category.name)}
                    title="Supprimer"
                  >
                    <FaIcons.FaTrash />
                  </DeleteButton>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </AdminLayout>
  );
};

export default CategoriesPage; 