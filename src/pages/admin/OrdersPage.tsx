import React, { useState, useEffect, useCallback } from 'react';
import { styled } from 'styled-components';
// Icons are imported from the shared component
import AdminLayout from '../../layouts/AdminLayout';
import { useAdminOrders, useUpdateOrderStatus } from '../../features/admin/hooks/use-admin-query';
import { OrderStatus } from '../../features/orders/services/types';
import { FaIcons } from './components/Icons';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

// Styles
const PageContainer = styled.div`
  padding: 1rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
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

const StatusBadge = styled.div<{ $status: string }>`
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  
  ${({ $status }) => {
    switch ($status) {
      case 'pending':
        return `
          background-color: var(--warning-bg);
          color: var(--warning-color);
          border: 1px solid var(--warning-color);
        `;
      case 'processing':
        return `
          background-color: var(--info-bg);
          color: var(--info-color);
          border: 1px solid var(--info-color);
        `;
      case 'shipped':
        return `
          background-color: var(--success-bg);
          color: var(--success-color);
          border: 1px solid var(--success-color);
        `;
      case 'delivered':
        return `
          background-color: var(--success-bg);
          color: var(--success-color);
          border: 1px solid var(--success-color);
        `;
      case 'cancelled':
        return `
          background-color: var(--error-bg);
          color: var(--error-color);
          border: 1px solid var(--error-color);
        `;
      case 'refunded':
        return `
          background-color: var(--purple-bg);
          color: var(--purple-color);
          border: 1px solid var(--purple-color);
        `;
      default:
        return `
          background-color: var(--light-bg);
          color: var(--text-color);
          border: 1px solid var(--border-color);
        `;
    }
  }}
`;

const ActionButton = styled.button`
  background-color: transparent;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  margin-right: 0.5rem;
  padding: 0.3rem;
  border-radius: var(--border-radius);
  
  &:hover {
    background-color: var(--light-bg);
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  background-color: var(--light-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-color);

  &:hover {
    background-color: var(--border-color);
  }
`;

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  display: ${({ $isOpen }) => $isOpen ? 'block' : 'none'};
  z-index: 10;
`;

const DropdownItem = styled.button`
  width: 100%;
  text-align: left;
  background-color: transparent;
  border: none;
  padding: 0.8rem 1rem;
  cursor: pointer;
  color: var(--text-color);
  
  &:hover {
    background-color: var(--light-bg);
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
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
  background-color: ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--card-bg)'};
  color: ${({ $active }) => $active ? 'white' : 'var(--text-color)'};
  border: 1px solid ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: var(--border-radius);
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};
  
  &:hover {
    background-color: ${({ $active, $disabled }) => $active || $disabled ? '' : 'var(--border-color)'};
    border-color: ${({ $active, $disabled }) => $active || $disabled ? '' : 'var(--primary-color)'};
  }
  
  &:not(:last-child) {
    margin-right: 0.5rem;
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
  color: var(--text-color);
`;

const EmptyMessage = styled.h3`
  color: var(--text-color);
  margin: 1rem 0;
`;

const EmptyDescription = styled.p`
  color: var(--light-text);
  margin-bottom: 1.5rem;
`;

const RetryButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: var(--primary-color);
  border: none;
  border-radius: var(--border-radius);
  color: white;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    background-color: var(--primary-color-dark);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
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

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  
  &:hover {
    background-color: var(--light-bg);
  }
`;

const RadioInput = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const StatusLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
`;

const StatusDescription = styled.div`
  color: var(--light-text);
  font-size: 0.9rem;
  margin-top: 0.3rem;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
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
`;

const SaveButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: var(--error-color);
  border: none;
  border-radius: var(--border-radius);
  color: white;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    background-color: var(--error-color-dark);
  }
  
  &:disabled {
    background-color: var(--border-color);
    cursor: not-allowed;
  }
`;

// Fonction pour formater la date
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
};

// Fonction pour formater le montant
const formatCurrency = (amount: number) => {
  try {
    // Using TND (Tunisian Dinar) instead of EUR
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' })
      .format(amount)
      .replace('TND', 'DT');
  } catch (e) {
    return `${amount.toFixed(3)} DT`;
  }
};

// Fonction pour obtenir les informations d'état de la commande
const getStatusInfo = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        text: 'En attente',
        icon: <FaIcons.FaRegClock />,
        description: 'La commande a été reçue mais n\'a pas encore été traitée.'
      };
    case 'processing':
      return {
        text: 'En traitement',
        icon: <FaIcons.FaBoxOpen />,
        description: 'La commande est en cours de préparation.'
      };
    case 'shipped':
      return {
        text: 'Expédiée',
        icon: <FaIcons.FaTruck />,
        description: 'La commande a été expédiée et est en cours de livraison.'
      };
    case 'delivered':
      return {
        text: 'Livrée',
        icon: <FaIcons.FaCheckCircle />,
        description: 'La commande a été livrée et reçue par le client.'
      };
    case 'cancelled':
      return {
        text: 'Annulée',
        icon: <FaIcons.FaTimes />,
        description: 'La commande a été annulée.'
      };
    case 'refunded':
      return {
        text: 'Remboursée',
        icon: <FaIcons.FaArrowLeft />,
        description: 'La commande a été remboursée au client.'
      };
    default:
      return {
        text: 'Statut inconnu',
        icon: <FaIcons.FaExclamationCircle />,
        description: 'Statut non reconnu.'
      };
  }
};

// Interface pour les props du composant dropdown
interface StatusDropdownProps {
  orderId: number;
  currentStatus: string;
  onStatusChange: (orderId: number, newStatus: string) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ orderId, currentStatus, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleStatusChange = (newStatus: string) => {
    if (newStatus !== currentStatus) {
      onStatusChange(orderId, newStatus);
    }
    setIsOpen(false);
  };
  
  const currentStatusInfo = getStatusInfo(currentStatus);
  
  return (
    <DropdownContainer>
      <DropdownButton onClick={() => setIsOpen(!isOpen)}>
        <FaIcons.FaEdit /> Changer le statut
      </DropdownButton>
      
      <DropdownMenu $isOpen={isOpen}>
        <DropdownItem onClick={() => handleStatusChange('pending')}>
          En attente
        </DropdownItem>
        <DropdownItem onClick={() => handleStatusChange('processing')}>
          En traitement
        </DropdownItem>
        <DropdownItem onClick={() => handleStatusChange('shipped')}>
          Expédiée
        </DropdownItem>
        <DropdownItem onClick={() => handleStatusChange('delivered')}>
          Livrée
        </DropdownItem>
        <DropdownItem onClick={() => handleStatusChange('cancelled')}>
          Annulée
        </DropdownItem>
        <DropdownItem onClick={() => handleStatusChange('refunded')}>
          Remboursée
        </DropdownItem>
      </DropdownMenu>
    </DropdownContainer>
  );
};

const OrdersPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{ id: number; status: OrderStatus } | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);
  const navigate = useNavigate();
  
  // Debounce search query to prevent unnecessary API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      setSearchQuery(searchInputValue);
      // Reset to page 1 when search changes
      setCurrentPage(1);
    }, 500);
    
    return () => clearTimeout(timerId);
  }, [searchInputValue]);
  
  // Update status filter and reset to page 1
  const handleStatusFilterChange = useCallback((status: OrderStatus | 'all') => {
    setStatusFilter(status);
    setCurrentPage(1);
  }, []);
  
  // Use the real API data instead of mock data
  const { 
    data: ordersResponse,
    isLoading,
    isError,
    refetch
  } = useAdminOrders({
    page: currentPage,
    limit: 10,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchQuery || undefined
  });
  
  // Extract orders and pagination data from response
  const orders = ordersResponse?.data || [];
  const totalPages = ordersResponse?.totalPages || 1;
  
  // Log response for debugging
  console.log('Orders response:', ordersResponse);
  
  // Function to handle updating order status
  const { mutate: updateOrderStatus, isPending: isUpdatingStatus } = useUpdateOrderStatus();
  
  // Open status change modal
  const handleOpenStatusModal = (order: { id: number; status: OrderStatus }) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusModalOpen(true);
  };
  
  // Close status modal
  const handleCloseModal = () => {
    setIsStatusModalOpen(false);
    setSelectedOrder(null);
    setNewStatus(null);
  };
  
  // Update order status
  const handleStatusChange = () => {
    if (!selectedOrder || !newStatus) return;
    
    // Use the real API to update the status
    updateOrderStatus({ 
      orderId: selectedOrder.id, 
      status: newStatus 
    }, {
      onSuccess: () => {
        handleCloseModal();
        toast.success(`Statut de la commande mis à jour avec succès.`);
      },
      onError: () => {
        toast.error(`Erreur lors de la mise à jour du statut. Veuillez réessayer.`);
      }
    });
  };
  
  // Function to navigate to order details
  const handleViewOrderDetails = (orderId: number) => {
    navigate(`/admin/orders/${orderId}`);
  };
  
  // Générer les boutons de pagination
  const renderPaginationButtons = () => {
    // If there are no pages, don't render pagination
    if (!totalPages || totalPages <= 1) {
      return null;
    }
    
    const buttons = [];
    
    // Ajouter le bouton précédent
    buttons.push(
      <PaginationButton 
        key="prev" 
        $disabled={currentPage === 1}
        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
      >
        &lt;
      </PaginationButton>
    );
    
    // Ajouter les boutons de pagination
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
      buttons.push(
        <PaginationButton 
          key={i} 
          $active={i === currentPage}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </PaginationButton>
      );
      } else if (
        (i === currentPage - 2 && currentPage > 3) || 
        (i === currentPage + 2 && currentPage < totalPages - 2)
      ) {
      buttons.push(
        <PaginationButton 
            key={`ellipsis-${i}`} 
            $disabled
        >
            ...
        </PaginationButton>
      );
      }
    }
    
    // Ajouter le bouton suivant
    buttons.push(
      <PaginationButton 
        key="next" 
        $disabled={currentPage === totalPages}
        onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
      >
        &gt;
      </PaginationButton>
    );
    
    return buttons;
  };
  
  if (isError) {
    return (
      <AdminLayout title="Gestion des commandes">
        <PageContainer>
          <PageHeader>
            <PageTitle>Gestion des commandes</PageTitle>
          </PageHeader>
          
          <EmptyState>
            <FaIcons.FaExclamationTriangle size={48} color="#d32f2f" />
            <EmptyMessage>Erreur lors du chargement des commandes</EmptyMessage>
            <EmptyDescription>
              Une erreur est survenue lors de la récupération des données. Veuillez réessayer.
            </EmptyDescription>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '0.8rem 1.5rem',
                backgroundColor: 'var(--primary-color)',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              <FaIcons.FaArrowRight /> Réessayer
            </button>
          </EmptyState>
        </PageContainer>
      </AdminLayout>
    );
  }
  
  if (isLoading) {
    return (
      <AdminLayout title="Gestion des commandes">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title="Gestion des commandes">
      <PageContainer>
        <PageHeader>
          <PageTitle>Gestion des commandes</PageTitle>
          
          <SearchContainer>
            <SearchIcon>
              <FaIcons.FaSearch />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Rechercher une commande..."
              value={searchInputValue}
              onChange={(e) => {
                setSearchInputValue(e.target.value);
              }}
            />
          </SearchContainer>
        </PageHeader>
        
        <FiltersRow>
          <FilterButton 
            $active={statusFilter === 'all'}
            onClick={() => handleStatusFilterChange('all')}
          >
            Toutes
          </FilterButton>
          <FilterButton 
            $active={statusFilter === 'pending'}
            onClick={() => handleStatusFilterChange('pending')}
          >
            En attente
          </FilterButton>
          <FilterButton 
            $active={statusFilter === 'processing'}
            onClick={() => handleStatusFilterChange('processing')}
          >
            En traitement
          </FilterButton>
          <FilterButton 
            $active={statusFilter === 'shipped'}
            onClick={() => handleStatusFilterChange('shipped')}
          >
            Expédiées
          </FilterButton>
          <FilterButton 
            $active={statusFilter === 'delivered'}
            onClick={() => handleStatusFilterChange('delivered')}
          >
            Livrées
          </FilterButton>
          <FilterButton 
            $active={statusFilter === 'cancelled'}
            onClick={() => handleStatusFilterChange('cancelled')}
          >
            Annulées
          </FilterButton>
        </FiltersRow>
        
        {isError ? (
          <EmptyState>
            <FaIcons.FaExclamationTriangle size={48} color="#d32f2f" />
            <EmptyMessage>Erreur lors du chargement des commandes</EmptyMessage>
            <EmptyDescription>
              Une erreur est survenue lors de la récupération des données.
            </EmptyDescription>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '0.8rem 1.5rem',
                backgroundColor: 'var(--primary-color)',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              <FaIcons.FaArrowRight /> Réessayer
            </button>
          </EmptyState>
        ) : orders.length === 0 ? (
          <EmptyState>
            <FaIcons.FaShoppingBag size={48} color="#999" />
            <EmptyMessage>Aucune commande trouvée</EmptyMessage>
            <EmptyDescription>
              {searchQuery || statusFilter !== 'all' ? 
                'Essayez de modifier vos filtres de recherche.' : 
                'Les nouvelles commandes apparaîtront ici.'}
            </EmptyDescription>
          </EmptyState>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Référence</TableHeadCell>
                  <TableHeadCell>Client</TableHeadCell>
                  <TableHeadCell>Date</TableHeadCell>
                  <TableHeadCell>Statut</TableHeadCell>
                  <TableHeadCell>Montant</TableHeadCell>
                  <TableHeadCell>Actions</TableHeadCell>
                </TableRow>
              </TableHead>
              
              <TableBody>
                {orders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell>{order.reference}</TableCell>
                      <TableCell>
                        {order.customer?.firstName} {order.customer?.lastName}
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <StatusBadge $status={order.status}>
                          {statusInfo.icon} {statusInfo.text}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                      <TableCell>
                        <ActionButton 
                          title="Voir les détails"
                          onClick={() => handleViewOrderDetails(order.id)}
                        >
                          <FaIcons.FaEye />
                        </ActionButton>
                        <ActionButton
                          onClick={() => handleOpenStatusModal({
                            id: order.id,
                            status: order.status as OrderStatus
                          })}
                        >
                          <FaIcons.FaEdit />
                        </ActionButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            <Pagination>
              {renderPaginationButtons()}
            </Pagination>
          </>
        )}
        
        {/* Status Change Modal */}
        {isStatusModalOpen && selectedOrder && (
          <Modal>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Changer le statut de la commande</ModalTitle>
                <CloseButton onClick={handleCloseModal}>×</CloseButton>
              </ModalHeader>
              
              <ModalBody>
                <RadioGroup>
                  {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map(status => {
                    const info = getStatusInfo(status);
                    
                    return (
                      <RadioOption key={status}>
                        <RadioInput
                          type="radio"
                          name="status"
                          checked={newStatus === status}
                          onChange={() => setNewStatus(status)}
                        />
                        <div>
                          <StatusLabel>
                            {info.icon} {info.text}
                          </StatusLabel>
                          <StatusDescription>{info.description}</StatusDescription>
                        </div>
                      </RadioOption>
                    );
                  })}
                </RadioGroup>
              </ModalBody>
              
              <ModalFooter>
                <CancelButton onClick={handleCloseModal}>
                  Annuler
                </CancelButton>
                <SaveButton 
                  onClick={handleStatusChange}
                  disabled={isUpdatingStatus || newStatus === selectedOrder.status}
                >
                  {isUpdatingStatus ? 'Mise à jour...' : 'Enregistrer'}
                </SaveButton>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </PageContainer>
    </AdminLayout>
  );
};

export default OrdersPage; 