import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  useAdminUsers, 
  useUpdateUserStatus, 
  useDeleteUser,
  useCreateUser 
} from '../../features/admin/hooks/use-admin-query';
import { 
  FiEdit, 
  FiTrash2, 
  FiSearch, 
  FiPlus, 
  FiMoreVertical, 
  FiToggleLeft, 
  FiToggleRight 
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import UserForm from './components/UserForm';
import { FaIcons, FileIcons } from './components/Icons';

// Styles
const PageContainer = styled.div`
  padding: 1rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const PageTitle = styled.h1`
  color: var(--text-color);
  margin: 0;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 1rem;
  background-color: var(--card-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--light-text);
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--border-color)'};
  background-color: ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--card-bg)'};
  color: ${({ $active }) => $active ? 'white' : 'var(--text-color)'};
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: ${({ $active }) => $active ? 'bold' : 'normal'};
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-color);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
`;

const TableHead = styled.thead`
  background-color: var(--light-bg);
`;

const TableHeadCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: bold;
  color: var(--text-color);
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  color: var(--text-color);
`;

const UserStatus = styled.div<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: bold;
  font-size: 0.9rem;
  
  ${({ $active }) => $active
    ? `
      background-color: var(--success-bg);
      color: var(--success-color);
      border: 1px solid var(--success-color);
    `
    : `
      background-color: var(--error-bg);
      color: var(--error-color);
      border: 1px solid var(--error-color);
    `}
`;

// Enhance ActionButton for better visibility in dark mode
const ActionButton = styled.button`
  background-color: var(--light-bg);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  cursor: pointer;
  margin-right: 0.8rem;
  padding: 0.5rem;
  border-radius: var(--border-radius);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  min-width: 36px;
  min-height: 36px;
  font-size: 1.1rem;
  
  &:hover {
    background-color: var(--primary-color);
    color: white;
    transform: translateY(-2px);
  }
  
  &:last-child {
    margin-right: 0;
  }
  
  &.danger {
    color: var(--error-color);
    
    &:hover {
      background-color: var(--error-color);
      color: white;
    }
  }
  
  /* Enhance for dark mode */
  [data-theme="dark"] & {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: var(--border-color);
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

// Add a dropdown menu to replace the popup
const ActionMenu = styled.div`
  position: relative;
  display: inline-block;
`;

// Enhance the action menu dropdown visibility
const ActionMenuDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  min-width: 170px;
  z-index: 10;
  overflow: hidden;
  margin-top: 4px;
  
  /* Enhance for dark mode */
  [data-theme="dark"] & {
    background-color: #2a2a2a; /* Slightly lighter than card-bg */
    border: 1px solid #444;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }
`;

// Enhance action menu items for better visibility
const ActionMenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 12px 15px;
  border: none;
  background: none;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  
  &:hover {
    background-color: var(--light-bg);
  }
  
  &:first-child {
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
  }
  
  &:last-child {
    border-bottom-left-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
  }
  
  &.danger {
    color: var(--error-color);
    
    &:hover {
      background-color: var(--error-bg);
    }
  }

  /* Enhance for dark mode */
  [data-theme="dark"] & {
    color: white;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    &.danger {
      color: #ff4f4f; /* Brighter red for better contrast */
      
      &:hover {
        background-color: rgba(255, 79, 79, 0.2);
      }
    }
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 1.5rem;
  gap: 0.5rem;
`;

const PaginationButton = styled.button<{ $active?: boolean; $disabled?: boolean }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--border-color)'};
  background-color: ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--card-bg)'};
  color: ${({ $active }) => $active ? 'white' : 'var(--text-color)'};
  border-radius: var(--border-radius);
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};
  
  &:hover:not(:disabled) {
    border-color: var(--primary-color);
  }
`;

const PaginationEllipsis = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--light-text);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  color: var(--light-text);
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const ModalContent = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  box-shadow: var(--box-shadow);
  overflow: auto;
  max-height: 90vh;
  
  /* Add border in dark mode for better visibility */
  [data-theme="dark"] & {
    border: 1px solid var(--border-color);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
  }
`;

const LargeModalContent = styled(ModalContent)`
  max-width: 700px;
  
  /* Add extra styling for form elements in dark mode */
  [data-theme="dark"] & {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
    
    /* Ensure form inputs are visible */
    input, select, button {
      font-size: 1rem;
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  color: var(--text-color);
  margin: 0;
`;

const CloseButton = styled.button`
  background-color: transparent;
  border: none;
  font-size: 1.5rem;
  color: var(--light-text);
  cursor: pointer;
  
  &:hover {
    color: var(--text-color);
  }
`;

const ModalBody = styled.div`
  margin-bottom: 1.5rem;
`;

const ModalText = styled.p`
  color: var(--text-color);
  margin-bottom: 1rem;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const ButtonsContainer = styled(ModalFooter)`
  margin-top: 1.5rem;
`;

const CancelButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-color);
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    background-color: var(--light-bg);
  }
  
  /* Improve visibility in dark mode */
  [data-theme="dark"] & {
    border: 2px solid var(--border-color);
    color: var(--light-text);
  }
`;

const DeleteButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: var(--error-color);
  border: none;
  border-radius: var(--border-radius);
  color: white;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    background-color: #b71c1c;
  }
  
  &:disabled {
    background-color: var(--border-color);
    cursor: not-allowed;
  }
`;

const StatusButton = styled.button<{ $isActive: boolean }>`
  padding: 0.8rem 1.5rem;
  background-color: ${({ $isActive }) => $isActive ? 'var(--success-color)' : 'var(--accent-color)'};
  border: none;
  border-radius: var(--border-radius);
  color: white;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    background-color: ${({ $isActive }) => $isActive ? '#4CAF50' : '#4e9eff'};
  }
  
  &:disabled {
    background-color: var(--border-color);
    cursor: not-allowed;
  }
  
  /* Brighter colors and box shadow in dark mode for better visibility */
  [data-theme="dark"] & {
    background-color: ${({ $isActive }) => $isActive ? '#4CAF50' : '#4e9eff'};
    box-shadow: 0 0 10px ${({ $isActive }) => $isActive ? 'rgba(76, 175, 80, 0.5)' : 'rgba(78, 158, 255, 0.5)'};
  }
`;

// Add a new styled component for the create user button
const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background-color: var(--primary-color);
  border: none;
  border-radius: var(--border-radius);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--accent-color);
  }
`;

// Add a type definition for User
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "admin";
  isActive: boolean;
  createdAt: string;
}

// Type de modal
enum ModalType {
  NONE,
  DELETE,
  STATUS,
  CREATE_USER
}

const UsersPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [modalType, setModalType] = useState<ModalType>(ModalType.NONE);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Use the hooks
  const { 
    data: usersData, 
    isLoading, 
    refetch 
  } = useAdminUsers({
    page: currentPage,
    limit: 10,
    isActive: filterActive,
    search: searchTerm.trim() || undefined
  });
  
  const updateStatusMutation = useUpdateUserStatus();
  const deleteMutation = useDeleteUser();
  const createUserMutation = useCreateUser();
  
  const handleFilter = (filter: boolean | undefined) => {
    setFilterActive(filter);
    setCurrentPage(1);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    // The search will be triggered by the useEffect in the useAdminUsers hook
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleOpenDeleteModal = (user: User) => {
    setSelectedUser(user);
    setModalType(ModalType.DELETE);
  };
  
  const handleOpenStatusModal = (user: User) => {
    setSelectedUser(user);
    setModalType(ModalType.STATUS);
  };
  
  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    setModalType(ModalType.CREATE_USER);
  };
  
  const closeModal = () => {
    setModalType(ModalType.NONE);
    setSelectedUser(null);
  };
  
  const confirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      await deleteMutation.mutateAsync(selectedUser.id);
      toast.success('Utilisateur supprimé avec succès');
      closeModal();
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'utilisateur');
      console.error('Error deleting user:', error);
    }
  };
  
  const confirmStatusChange = async () => {
    if (!selectedUser) return;
    
    try {
      const newStatus = !selectedUser.isActive;
      await updateStatusMutation.mutateAsync({ 
        userId: selectedUser.id, 
        data: { isActive: newStatus } 
      });
      toast.success(`Utilisateur ${newStatus ? 'activé' : 'désactivé'} avec succès`);
      closeModal();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut de l\'utilisateur');
      console.error('Error updating user status:', error);
    }
  };
  
  const handleCreateUser = async (formData: any) => {
    try {
      await createUserMutation.mutateAsync(formData);
      toast.success('Utilisateur créé avec succès');
      closeModal();
    } catch (error) {
      toast.error('Erreur lors de la création de l\'utilisateur');
      console.error('Error creating user:', error);
    }
  };
  
  // Générer les boutons de pagination
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    
    // Ajouter le bouton précédent
    buttons.push(
      <PaginationButton 
        key="prev" 
        $disabled={currentPage === 1}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        &lt;
      </PaginationButton>
    );
    
    // Calculer les boutons à afficher
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(usersData?.totalPages || 1, startPage + maxVisibleButtons - 1);
    
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    
    // Ajouter le premier bouton si nécessaire
    if (startPage > 1) {
      buttons.push(
        <PaginationButton 
          key={1} 
          onClick={() => setCurrentPage(1)}
        >
          1
        </PaginationButton>
      );
      
      if (startPage > 2) {
        buttons.push(<PaginationEllipsis key="ellipsis1">...</PaginationEllipsis>);
      }
    }
    
    // Ajouter les boutons de pagination
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <PaginationButton 
          key={i} 
          $active={i === currentPage}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </PaginationButton>
      );
    }
    
    // Ajouter le dernier bouton si nécessaire
    if (endPage < usersData?.totalPages || 1) {
      if (endPage < usersData?.totalPages || 1 - 1) {
        buttons.push(<PaginationEllipsis key="ellipsis2">...</PaginationEllipsis>);
      }
      
      buttons.push(
        <PaginationButton 
          key={usersData?.totalPages || 1} 
          onClick={() => setCurrentPage(usersData?.totalPages || 1)}
        >
          {usersData?.totalPages || 1}
        </PaginationButton>
      );
    }
    
    // Ajouter le bouton suivant
    buttons.push(
      <PaginationButton 
        key="next" 
        $disabled={!!(currentPage === usersData?.totalPages)}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        &gt;
      </PaginationButton>
    );
    
    return buttons;
  };
  
  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Update the Action button behavior to show a dropdown
  const UserActionButton = ({ user }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    
    const handleToggleDropdown = (e) => {
      e.stopPropagation();
      setShowDropdown(prev => !prev);
    };
    
    const handleSelectAction = (action, e) => {
      e.stopPropagation();
      setShowDropdown(false);
      
      if (action === 'status') {
        handleOpenStatusModal(user);
      } else if (action === 'delete') {
        handleOpenDeleteModal(user);
      }
    };
    
    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = () => {
        setShowDropdown(false);
      };
      
      if (showDropdown) {
        document.addEventListener('click', handleClickOutside);
      }
      
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }, [showDropdown]);
    
    return (
      <ActionMenu>
        <ActionButton onClick={handleToggleDropdown}>
          <FileIcons.FiMoreVertical />
        </ActionButton>
        
        {showDropdown && (
          <ActionMenuDropdown>
            <ActionMenuItem onClick={(e) => handleSelectAction('status', e)}>
              <FileIcons.FiToggleRight />
              {user.isActive ? 'Désactiver' : 'Activer'}
            </ActionMenuItem>
            {user.role !== 'admin' && (
              <ActionMenuItem className="danger" onClick={(e) => handleSelectAction('delete', e)}>
                <FileIcons.FiTrash2 />
                Supprimer
              </ActionMenuItem>
            )}
          </ActionMenuDropdown>
        )}
      </ActionMenu>
    );
  };
  
  if (isLoading) {
    return (
      <AdminLayout title="Gestion des utilisateurs">
        <div>Chargement des utilisateurs...</div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title="Gestion des utilisateurs">
      <PageContainer>
        <PageHeader>
          <PageTitle>Gestion des utilisateurs</PageTitle>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <SearchContainer>
              <form onSubmit={handleSearch}>
                <SearchInput
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <SearchIcon>
                  <FileIcons.FiSearch />
                </SearchIcon>
              </form>
            </SearchContainer>
            
            <CreateButton onClick={handleOpenCreateModal}>
              <FileIcons.FiPlus />
              Nouvel utilisateur
            </CreateButton>
          </div>
        </PageHeader>
        
        <FiltersRow>
          <FilterButton
            $active={filterActive === undefined}
            onClick={() => handleFilter(undefined)}
          >
            Tous
          </FilterButton>
          <FilterButton
            $active={filterActive === true}
            onClick={() => handleFilter(true)}
          >
            Actifs
          </FilterButton>
          <FilterButton
            $active={filterActive === false}
            onClick={() => handleFilter(false)}
          >
            Inactifs
          </FilterButton>
        </FiltersRow>
        
        {isLoading ? (
          <div>Chargement des utilisateurs...</div>
        ) : usersData && usersData.data && usersData.data.length > 0 ? (
          <>
            <Table>
              <TableHead>
                <tr>
                  <TableHeadCell>ID</TableHeadCell>
                  <TableHeadCell>Nom</TableHeadCell>
                  <TableHeadCell>Email</TableHeadCell>
                  <TableHeadCell>Rôle</TableHeadCell>
                  <TableHeadCell>Statut</TableHeadCell>
                  <TableHeadCell>Date d'inscription</TableHeadCell>
                  <TableHeadCell>Actions</TableHeadCell>
                </tr>
              </TableHead>
              <TableBody>
                {usersData.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</TableCell>
                    <TableCell>
                      <UserStatus $active={user.isActive}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </UserStatus>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <UserActionButton user={user} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {usersData.totalPages > 1 && (
              <Pagination>{renderPaginationButtons()}</Pagination>
            )}
          </>
        ) : (
          <EmptyState>
            <p>Aucun utilisateur trouvé avec les filtres actuels.</p>
          </EmptyState>
        )}
        
        {/* Delete Confirmation Modal */}
        {modalType === ModalType.DELETE && selectedUser && (
          <Modal>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Confirmer la suppression</ModalTitle>
                <CloseButton onClick={closeModal}>&times;</CloseButton>
              </ModalHeader>
              <p>
                Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{selectedUser.firstName} {selectedUser.lastName}</strong> ?
                Cette action est irréversible.
              </p>
              <ButtonsContainer>
                <CancelButton onClick={closeModal}>Annuler</CancelButton>
                <DeleteButton 
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
                </DeleteButton>
              </ButtonsContainer>
            </ModalContent>
          </Modal>
        )}
        
        {/* Status Change Modal */}
        {modalType === ModalType.STATUS && selectedUser && (
          <Modal>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Confirmer le changement</ModalTitle>
                <CloseButton onClick={closeModal}>&times;</CloseButton>
              </ModalHeader>
              <p>
                Êtes-vous sûr de vouloir {selectedUser.isActive ? 'désactiver' : 'activer'} l'utilisateur <strong>{selectedUser.firstName} {selectedUser.lastName}</strong> ?
              </p>
              <ButtonsContainer>
                <CancelButton onClick={closeModal}>Annuler</CancelButton>
                <StatusButton 
                  $isActive={!selectedUser.isActive}
                  onClick={confirmStatusChange}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending 
                    ? 'En cours...' 
                    : selectedUser.isActive 
                      ? 'Désactiver' 
                      : 'Activer'
                  }
                </StatusButton>
              </ButtonsContainer>
            </ModalContent>
          </Modal>
        )}
        
        {/* Create User Modal */}
        {modalType === ModalType.CREATE_USER && (
          <Modal>
            <LargeModalContent>
              <ModalHeader>
                <ModalTitle>Nouvel utilisateur</ModalTitle>
                <CloseButton onClick={closeModal}>&times;</CloseButton>
              </ModalHeader>
              <UserForm 
                onSubmit={handleCreateUser}
                isLoading={createUserMutation.isPending}
                onCancel={closeModal}
              />
            </LargeModalContent>
          </Modal>
        )}
      </PageContainer>
    </AdminLayout>
  );
};

export default UsersPage; 