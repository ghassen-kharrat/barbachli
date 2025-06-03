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
import { useLanguage } from '../../provider/LanguageProvider';

// Styles
const PageContainer = styled.div`
  padding: 1.5rem;
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
  font-size: 1.8rem;
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
  padding: 0.6rem 1.2rem;
  border-radius: var(--border-radius);
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.$active ? 'var(--primary-color)' : 'var(--card-bg)'};
  color: ${props => props.$active ? 'white' : 'var(--text-color)'};
  
  &:hover {
    background-color: ${props => props.$active ? 'var(--primary-dark)' : 'var(--hover-bg)'};
  }
`;

const DateFilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const DateInput = styled.input`
  padding: 0.6rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--card-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const DateFilterLabel = styled.span`
  font-weight: 500;
  color: var(--text-color);
  margin-right: 0.5rem;
`;

const DateFilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
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
  background-color: var(--table-header-bg);
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }
  
  &:hover {
    background-color: var(--hover-bg);
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  vertical-align: middle;
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 500;
  
  ${({ $status }) => {
    switch ($status) {
      case 'pending':
        return `
          background-color: #fff8e1;
          color: #f9a825;
        `;
      case 'processing':
        return `
          background-color: #e3f2fd;
          color: #1976d2;
        `;
      case 'shipped':
        return `
          background-color: #e0f2f1;
          color: #00897b;
        `;
      case 'delivered':
        return `
          background-color: #e8f5e9;
          color: #43a047;
        `;
      case 'cancelled':
        return `
          background-color: #ffebee;
          color: #e53935;
        `;
      case 'refunded':
        return `
          background-color: #f3e5f5;
          color: #8e24aa;
        `;
      default:
        return `
          background-color: #f5f5f5;
          color: #757575;
        `;
    }
  }}
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--border-radius);
  border: none;
  background-color: var(--light-bg);
  color: var(--primary-color);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 0.5rem;
  
  &:hover {
    background-color: var(--primary-light);
  }
  
  &:last-child {
    margin-right: 0;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const PaginationButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--border-radius);
  border: none;
  background-color: ${props => props.$active ? 'var(--primary-color)' : 'var(--card-bg)'};
  color: ${props => props.$active ? 'white' : 'var(--text-color)'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.$active ? 'var(--primary-dark)' : 'var(--hover-bg)'};
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    
    &:hover {
      background-color: ${props => props.$active ? 'var(--primary-color)' : 'var(--card-bg)'};
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  color: var(--light-text);
  margin-bottom: 1rem;
`;

const EmptyStateText = styled.p`
  color: var(--light-text);
  text-align: center;
`;

const ErrorState = styled.div`
  padding: 2rem;
  background-color: #ffebee;
  border-radius: var(--border-radius);
  color: #c62828;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
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
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 500px;
  box-shadow: var(--box-shadow);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: var(--text-color);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--light-text);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  line-height: 0.5;
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
`;

const CancelButton = styled.button`
  padding: 0.6rem 1.2rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--card-bg);
  color: var(--text-color);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--hover-bg);
  }
`;

const SaveButton = styled.button`
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: var(--border-radius);
  background-color: var(--primary-color);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--primary-dark);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RadioOption = styled.label`
  display: flex;
  gap: 1rem;
  cursor: pointer;
  padding: 0.8rem;
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--hover-bg);
  }
`;

const RadioInput = styled.input`
  margin-top: 0.25rem;
`;

const StatusLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const StatusDescription = styled.div`
  font-size: 0.9rem;
  color: var(--light-text);
  margin-left: 1.5rem;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: var(--border-radius);
  background-color: var(--accent-color);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #0062cc;
  }
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const FilterBarLeft = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const FilterBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        icon: <FaIcons.FaRegClock />,
        text: 'En attente',
        description: "La commande a été créée mais n'a pas encore été traitée"
      };
    case 'processing':
      return {
        icon: <FaIcons.FaSync />,
        text: 'En traitement',
        description: "La commande est en cours de préparation"
      };
    case 'shipped':
      return {
        icon: <FaIcons.FaTruck />,
        text: 'Expédiée',
        description: "La commande a été expédiée et est en cours de livraison"
      };
    case 'delivered':
      return {
        icon: <FaIcons.FaCheckCircle />,
        text: 'Livrée',
        description: "La commande a été livrée au client"
      };
    case 'cancelled':
      return {
        icon: <FaIcons.FaBan />,
        text: 'Annulée',
        description: "La commande a été annulée"
      };
    case 'refunded':
      return {
        icon: <FaIcons.FaMoneyBillWave />,
        text: 'Remboursée',
        description: "La commande a été remboursée au client"
      };
    default:
      return {
        icon: <FaIcons.FaQuestion />,
        text: 'Inconnu',
        description: "Statut inconnu"
      };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 2
  }).format(amount);
};

const OrdersPage = () => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{ id: number; status: OrderStatus } | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
  
  // Use the real API data
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
        toast.success(t('order_status_updated_success'));
        refetch();
      },
      onError: () => {
        toast.error(t('order_status_updated_error'));
      }
    });
  };
  
  // Function to navigate to order details
  const handleViewOrderDetails = (orderId: number) => {
    navigate(`/admin/orders/${orderId}`);
  };
  
  // Function to handle exporting orders
  const handleExportOrders = () => {
    // Here you would implement the logic to export orders
    // For example, generating a CSV file
    toast.info(t('export_orders_not_implemented'));
  };
  
  // Function to render pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    
    // Previous button
    buttons.push(
      <PaginationButton
        key="prev"
        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        title={t('previous_page')}
      >
        <FaIcons.FaChevronLeft />
      </PaginationButton>
    );
    
    // Page buttons
    const maxButtons = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
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
    
    // Next button
    buttons.push(
      <PaginationButton
        key="next"
        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
        title={t('next_page')}
      >
        <FaIcons.FaChevronRight />
      </PaginationButton>
    );
    
    return buttons;
  };
  
  // Handle date filtering
  const handleDateFilter = () => {
    // Reset to page 1 when date filter changes
    setCurrentPage(1);
    // Here you would add logic to filter by date
    // This would typically be sent to the API
    refetch();
  };
  
  return (
    <AdminLayout title={t('orders_management')}>
      <PageContainer>
        <PageHeader>
          <PageTitle>{t('orders_management')}</PageTitle>
          
          <SearchContainer>
            <SearchIcon>
              <FaIcons.FaSearch />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder={t('search_order_placeholder')}
              value={searchInputValue}
              onChange={(e) => {
                setSearchInputValue(e.target.value);
              }}
            />
          </SearchContainer>
        </PageHeader>
        
        <FilterBar>
          <FilterBarLeft>
            <FilterButton 
              $active={statusFilter === 'all'}
              onClick={() => handleStatusFilterChange('all')}
            >
              {t('all')}
            </FilterButton>
            <FilterButton 
              $active={statusFilter === 'pending'}
              onClick={() => handleStatusFilterChange('pending')}
            >
              {t('pending')}
            </FilterButton>
            <FilterButton 
              $active={statusFilter === 'processing'}
              onClick={() => handleStatusFilterChange('processing')}
            >
              {t('processing')}
            </FilterButton>
            <FilterButton 
              $active={statusFilter === 'shipped'}
              onClick={() => handleStatusFilterChange('shipped')}
            >
              {t('shipped')}
            </FilterButton>
            <FilterButton 
              $active={statusFilter === 'delivered'}
              onClick={() => handleStatusFilterChange('delivered')}
            >
              {t('delivered')}
            </FilterButton>
            <FilterButton 
              $active={statusFilter === 'cancelled'}
              onClick={() => handleStatusFilterChange('cancelled')}
            >
              {t('cancelled')}
            </FilterButton>
          </FilterBarLeft>
          
          <FilterBarRight>
            <ExportButton onClick={handleExportOrders}>
              <FaIcons.FaFileExcel />
              {t('export')}
            </ExportButton>
          </FilterBarRight>
        </FilterBar>
        
        <DateFilterContainer>
          <DateFilterGroup>
            <DateFilterLabel>{t('from')}</DateFilterLabel>
            <DateInput 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </DateFilterGroup>
          
          <DateFilterGroup>
            <DateFilterLabel>{t('to')}</DateFilterLabel>
            <DateInput 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </DateFilterGroup>
          
          <FilterButton 
            $active={false}
            onClick={handleDateFilter}
          >
            {t('filter')}
          </FilterButton>
        </DateFilterContainer>
        
        {isError && (
          <ErrorState>
            <FaIcons.FaExclamationTriangle />
            <div>
              <h4>{t('error_loading_orders')}</h4>
              <p>{t('try_refreshing')}</p>
            </div>
          </ErrorState>
        )}
        
        {isLoading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>
              <FaIcons.FaShoppingCart />
            </EmptyStateIcon>
            <EmptyStateText>{t('no_orders_found')}</EmptyStateText>
          </EmptyState>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>{t('order_reference')}</TableHeader>
                  <TableHeader>{t('customer')}</TableHeader>
                  <TableHeader>{t('date')}</TableHeader>
                  <TableHeader>{t('status')}</TableHeader>
                  <TableHeader>{t('total')}</TableHeader>
                  <TableHeader>{t('actions')}</TableHeader>
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
                          title={t('view_details')}
                          onClick={() => handleViewOrderDetails(order.id)}
                        >
                          <FaIcons.FaEye />
                        </ActionButton>
                        <ActionButton
                          title={t('change_status')}
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
                <ModalTitle>{t('change_order_status')}</ModalTitle>
                <CloseButton onClick={handleCloseModal}>×</CloseButton>
              </ModalHeader>
              
              <ModalBody>
                <RadioGroup>
                  {(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] as OrderStatus[]).map(status => {
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
                  {t('cancel')}
                </CancelButton>
                <SaveButton 
                  onClick={handleStatusChange}
                  disabled={isUpdatingStatus || newStatus === selectedOrder.status}
                >
                  {isUpdatingStatus ? t('updating') : t('save')}
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