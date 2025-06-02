import React, { useState, useRef } from 'react';
import { styled } from 'styled-components';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { FaIcons } from './components/Icons';
import { useCarouselSlides, useDeleteCarouselSlide, useReorderCarouselSlides } from '../../features/carousel/hooks/use-carousel-query';
import { CarouselSlide } from '../../features/carousel/types';
import { useLanguage } from '../../provider/LanguageProvider';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import CarouselSlideForm from './components/CarouselSlideForm';
import AdminLayout from '../../layouts/AdminLayout';

// Styled Components
const PageContainer = styled.div`
  padding: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--primary-dark);
  }
`;

const CarouselList = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const ListHeader = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 120px 120px 180px;
  padding: 1rem 1.5rem;
  background-color: var(--table-header-bg);
  font-weight: 600;
  border-bottom: 1px solid var(--border-color);
  
  @media (max-width: 992px) {
    display: none;
  }
`;

const ListBody = styled.div`
  min-height: 200px;
`;

const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  color: var(--text-muted);
  
  svg {
    margin-bottom: 1rem;
    opacity: 0.5;
  }
`;

const SlideItem = styled.div<{ $isDragging?: boolean }>`
  display: grid;
  grid-template-columns: 80px 1fr 120px 120px 180px;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background-color: ${props => props.$isDragging ? 'var(--hover-bg)' : 'transparent'};
  box-shadow: ${props => props.$isDragging ? '0 4px 8px rgba(0, 0, 0, 0.1)' : 'none'};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: var(--hover-bg);
  }
  
  @media (max-width: 992px) {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 0.5rem;
  }
`;

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  color: var(--text-muted);
  
  &:active {
    cursor: grabbing;
  }
  
  @media (max-width: 992px) {
    display: none;
  }
`;

const SlideImageContainer = styled.div`
  grid-column: 1;
  display: flex;
  align-items: center;
  
  @media (max-width: 992px) {
    margin-bottom: 0.5rem;
  }
`;

const SlideImage = styled.img`
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: var(--border-radius);
`;

const SlideDetails = styled.div`
  grid-column: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  @media (max-width: 992px) {
    margin-bottom: 0.5rem;
  }
`;

const SlideTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const SlideSubtitle = styled.div`
  font-size: 0.85rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
`;

const SlideStatus = styled.div<{ $active: boolean }>`
  grid-column: 3;
  display: flex;
  align-items: center;
  
  span {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem;
    background-color: ${props => props.$active ? 'rgba(25, 135, 84, 0.1)' : 'rgba(108, 117, 125, 0.1)'};
    color: ${props => props.$active ? 'var(--success-color)' : 'var(--text-muted)'};
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 500;
  }
  
  @media (max-width: 992px) {
    margin-bottom: 0.5rem;
  }
`;

const SlideOrder = styled.div`
  grid-column: 4;
  display: flex;
  align-items: center;
  font-weight: 500;
  
  @media (max-width: 992px) {
    margin-bottom: 0.5rem;
  }
`;

const SlideActions = styled.div`
  grid-column: 5;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const ActionIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: none;
  background-color: transparent;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  &.edit {
    color: var(--primary-color);
    
    &:hover {
      background-color: rgba(var(--primary-color-rgb), 0.1);
    }
  }
  
  &.delete {
    color: var(--danger-color);
    
    &:hover {
      background-color: rgba(var(--danger-color-rgb), 0.1);
    }
  }
`;

const LoadingState = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
`;

const ErrorState = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--danger-color);
`;

const ModalBackdrop = styled.div`
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

const ConfirmationModal = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  
  svg {
    color: var(--danger-color);
  }
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
`;

const ModalContent = styled.div`
  margin-bottom: 1.5rem;
  color: var(--text-muted);
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const CancelButton = styled.button`
  padding: 0.6rem 1.25rem;
  background-color: var(--button-secondary-bg);
  color: var(--button-secondary-text);
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--button-secondary-hover);
  }
`;

const DeleteButton = styled.button`
  padding: 0.6rem 1.25rem;
  background-color: var(--danger-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--danger-dark);
  }
`;

const FormModalContainer = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 0;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

// Main Component
const CarouselPage: React.FC = () => {
  const { t } = useLanguage();
  const { data: slides = [], isLoading, isError, refetch } = useCarouselSlides();
  const deleteCarouselSlideMutation = useDeleteCarouselSlide();
  const reorderCarouselSlidesMutation = useReorderCarouselSlides();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<CarouselSlide | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Handler for slide deletion
  const handleDeleteClick = (slide: CarouselSlide) => {
    setSelectedSlide(slide);
    setShowDeleteModal(true);
  };
  
  // Handler to confirm slide deletion
  const confirmDelete = async () => {
    if (!selectedSlide) return;
    
    try {
      await deleteCarouselSlideMutation.mutateAsync(selectedSlide.id);
      toast.success(t('carousel_slide_deleted_success'));
      setShowDeleteModal(false);
      setSelectedSlide(null);
    } catch (error) {
      toast.error(t('carousel_slide_deleted_error'));
    }
  };
  
  // Handler for slide editing
  const handleEditClick = (slide: CarouselSlide) => {
    setSelectedSlide(slide);
    setIsCreating(false);
    setShowFormModal(true);
  };
  
  // Handler for adding a new slide
  const handleAddClick = () => {
    setSelectedSlide(null);
    setIsCreating(true);
    setShowFormModal(true);
  };
  
  // Handler for form submission success
  const handleFormSuccess = () => {
    setShowFormModal(false);
    refetch();
  };
  
  // Handler for drag and drop reordering
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(slides);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update local order
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));
    
    try {
      // Send the new order to the server
      await reorderCarouselSlidesMutation.mutateAsync(updatedItems.map(item => item.id));
      toast.success(t('carousel_slides_reordered_success'));
    } catch (error) {
      toast.error(t('carousel_slides_reordered_error'));
      // Refetch to restore original order
      refetch();
    }
  };
  
  if (isLoading) {
    return (
      <AdminLayout title="carousel_management">
        <PageContainer>
          <Header>
            <PageTitle>{t('carousel_management')}</PageTitle>
          </Header>
          <LoadingState>
            <FaIcons.FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={24} />
            <div style={{ marginTop: '1rem' }}>{t('loading_carousel_slides')}</div>
          </LoadingState>
        </PageContainer>
      </AdminLayout>
    );
  }
  
  if (isError) {
    return (
      <AdminLayout title="carousel_management">
        <PageContainer>
          <Header>
            <PageTitle>{t('carousel_management')}</PageTitle>
          </Header>
          <ErrorState>
            <FaIcons.FaExclamationCircle size={24} style={{ marginBottom: '1rem' }} />
            <div>{t('carousel_slides_load_error')}</div>
            <button 
              onClick={() => refetch()} 
              style={{ 
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer'
              }}
            >
              {t('try_again')}
            </button>
          </ErrorState>
        </PageContainer>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title="carousel_management">
      <PageContainer>
        <Header>
          <PageTitle>{t('carousel_management')}</PageTitle>
          <ActionButton onClick={handleAddClick}>
            <FaIcons.FaPlus size={16} />
            {t('add_carousel_slide')}
          </ActionButton>
        </Header>
        
        <CarouselList>
          <ListHeader>
            <div>{t('image')}</div>
            <div>{t('details')}</div>
            <div>{t('status')}</div>
            <div>{t('order')}</div>
            <div>{t('actions')}</div>
          </ListHeader>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="carousel-slides">
              {(provided) => (
                <ListBody
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {slides.length === 0 ? (
                    <EmptyState>
                      <FaIcons.FaImages size={48} />
                      <div>{t('no_carousel_slides')}</div>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                        {t('add_first_carousel_slide')}
                      </div>
                    </EmptyState>
                  ) : (
                    slides
                      .sort((a, b) => a.order - b.order)
                      .map((slide, index) => (
                        <Draggable 
                          key={slide.id.toString()} 
                          draggableId={slide.id.toString()} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <SlideItem
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              $isDragging={snapshot.isDragging}
                            >
                              <DragHandle {...provided.dragHandleProps}>
                                <FaIcons.FaBars />
                              </DragHandle>
                              
                              <SlideImageContainer>
                                <SlideImage src={slide.image} alt={slide.title} />
                              </SlideImageContainer>
                              
                              <SlideDetails>
                                <SlideTitle>{slide.title}</SlideTitle>
                                <SlideSubtitle>{slide.subtitle}</SlideSubtitle>
                              </SlideDetails>
                              
                              <SlideStatus $active={slide.active}>
                                <span>
                                  {slide.active ? (
                                    <>
                                      <FaIcons.FaCheckCircle size={14} />
                                      {t('active')}
                                    </>
                                  ) : (
                                    <>
                                      <FaIcons.FaTimesCircle size={14} />
                                      {t('inactive')}
                                    </>
                                  )}
                                </span>
                              </SlideStatus>
                              
                              <SlideOrder>
                                {slide.order}
                              </SlideOrder>
                              
                              <SlideActions>
                                <ActionIconButton 
                                  className="edit"
                                  onClick={() => handleEditClick(slide)}
                                  aria-label={t('edit_carousel_slide')}
                                >
                                  <FaIcons.FaEdit size={16} />
                                </ActionIconButton>
                                
                                <ActionIconButton 
                                  className="delete"
                                  onClick={() => handleDeleteClick(slide)}
                                  aria-label={t('delete_carousel_slide')}
                                >
                                  <FaIcons.FaTrashAlt size={16} />
                                </ActionIconButton>
                              </SlideActions>
                            </SlideItem>
                          )}
                        </Draggable>
                      ))
                  )}
                  {provided.placeholder}
                </ListBody>
              )}
            </Droppable>
          </DragDropContext>
        </CarouselList>
        
        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedSlide && (
          <ModalBackdrop>
            <ConfirmationModal>
              <ModalHeader>
                <FaIcons.FaExclamationTriangle size={24} />
                <ModalTitle>{t('confirm_delete')}</ModalTitle>
              </ModalHeader>
              <ModalContent>
                {t('confirm_delete_carousel_slide', { title: selectedSlide.title })}
              </ModalContent>
              <ModalActions>
                <CancelButton onClick={() => setShowDeleteModal(false)}>
                  {t('cancel')}
                </CancelButton>
                <DeleteButton onClick={confirmDelete}>
                  {t('delete')}
                </DeleteButton>
              </ModalActions>
            </ConfirmationModal>
          </ModalBackdrop>
        )}
        
        {/* Form Modal */}
        {showFormModal && (
          <ModalBackdrop>
            <FormModalContainer>
              <CarouselSlideForm
                slide={!isCreating ? selectedSlide : null}
                onSuccess={handleFormSuccess}
                onCancel={() => setShowFormModal(false)}
              />
            </FormModalContainer>
          </ModalBackdrop>
        )}
      </PageContainer>
    </AdminLayout>
  );
};

export default CarouselPage; 