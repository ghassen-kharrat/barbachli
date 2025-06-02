import React from 'react';
import { styled, keyframes } from 'styled-components';

// Animation
const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

const SkeletonBase = styled.div<{ width?: string }>`
  background: var(--skeleton-bg);
  background-image: linear-gradient(
    to right,
    var(--skeleton-bg) 0%,
    var(--skeleton-highlight) 20%,
    var(--skeleton-bg) 40%,
    var(--skeleton-bg) 100%
  );
  background-repeat: no-repeat;
  background-size: 800px 100%;
  border-radius: var(--border-radius);
  display: inline-block;
  line-height: 1;
  width: 100%;
  animation: ${shimmer} 1.5s infinite linear;
`;

// Product Card Skeleton
const ProductCardContainer = styled.div`
  border-radius: var(--border-radius);
  overflow: hidden;
  background-color: var(--card-bg);
  box-shadow: var(--box-shadow);
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ProductImageSkeleton = styled(SkeletonBase)`
  height: 220px;
  width: 100%;
`;

const ProductInfoSkeleton = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 0.8rem;
`;

const ProductTitleSkeleton = styled(SkeletonBase)`
  height: 1.2rem;
  width: 80%;
  margin-bottom: 0.4rem;
`;

const ProductCategorySkeleton = styled(SkeletonBase)`
  height: 0.9rem;
  width: 40%;
`;

const ProductPriceSkeleton = styled(SkeletonBase)`
  height: 1.2rem;
  width: 30%;
`;

const ProductRatingSkeleton = styled(SkeletonBase)`
  height: 1rem;
  width: 50%;
`;

const ButtonSkeleton = styled(SkeletonBase)`
  height: 2.5rem;
  width: 100%;
`;

// Product Detail Skeleton
const ProductDetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const ProductGallerySkeleton = styled.div`
  width: 100%;
  
  @media (min-width: 768px) {
    width: 40%;
  }
`;

const MainImageSkeleton = styled(SkeletonBase)`
  height: 350px;
  width: 100%;
  margin-bottom: 1rem;
`;

const ThumbnailsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ThumbnailSkeleton = styled(SkeletonBase)`
  height: 70px;
  width: 70px;
`;

const ProductDetailInfoSkeleton = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ProductDetailTitleSkeleton = styled(SkeletonBase)`
  height: 2rem;
  width: 90%;
`;

const ProductDetailPriceSkeleton = styled(SkeletonBase)`
  height: 1.8rem;
  width: 30%;
`;

const ProductDetailDescriptionSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const DescriptionLineSkeleton = styled(SkeletonBase)<{ width?: string }>`
  height: 1rem;
`;

// Table Skeleton
const TableSkeleton = styled.div`
  width: 100%;
  border-radius: var(--border-radius);
  overflow: hidden;
  background-color: var(--card-bg);
  box-shadow: var(--box-shadow);
`;

const TableHeaderSkeleton = styled.div`
  background-color: var(--light-bg);
  padding: 1rem;
  display: flex;
  gap: 1rem;
`;

const TableCellSkeleton = styled(SkeletonBase)<{ width?: string }>`
  height: 1.2rem;
`;

const TableRowSkeleton = styled.div`
  padding: 1rem;
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
`;

// Actual Components
export const ProductCardSkeleton = () => (
  <ProductCardContainer>
    <ProductImageSkeleton />
    <ProductInfoSkeleton>
      <ProductCategorySkeleton />
      <ProductTitleSkeleton />
      <ProductRatingSkeleton />
      <ProductPriceSkeleton />
      <ButtonSkeleton />
    </ProductInfoSkeleton>
  </ProductCardContainer>
);

export const ProductDetailSkeleton = () => (
  <ProductDetailContainer>
    <ProductGallerySkeleton>
      <MainImageSkeleton />
      <ThumbnailsContainer>
        <ThumbnailSkeleton />
        <ThumbnailSkeleton />
        <ThumbnailSkeleton />
      </ThumbnailsContainer>
    </ProductGallerySkeleton>
    
    <ProductDetailInfoSkeleton>
      <ProductDetailTitleSkeleton />
      <ProductDetailPriceSkeleton />
      
      <ProductDetailDescriptionSkeleton>
        <DescriptionLineSkeleton />
        <DescriptionLineSkeleton width="95%" />
        <DescriptionLineSkeleton width="90%" />
        <DescriptionLineSkeleton width="98%" />
      </ProductDetailDescriptionSkeleton>
      
      <ButtonSkeleton />
    </ProductDetailInfoSkeleton>
  </ProductDetailContainer>
);

export const ProductsGridSkeleton = ({ count = 6 }) => (
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
    gap: '2rem'
  }}>
    {Array(count).fill(0).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

export const TableRowsSkeleton = ({ rows = 5, columns = 4 }) => (
  <TableSkeleton>
    <TableHeaderSkeleton>
      {Array(columns).fill(0).map((_, index) => (
        <TableCellSkeleton key={`header-${index}`} width={`${100 / columns}%`} />
      ))}
    </TableHeaderSkeleton>
    
    {Array(rows).fill(0).map((_, rowIndex) => (
      <TableRowSkeleton key={`row-${rowIndex}`}>
        {Array(columns).fill(0).map((_, colIndex) => (
          <TableCellSkeleton key={`cell-${rowIndex}-${colIndex}`} width={`${100 / columns}%`} />
        ))}
      </TableRowSkeleton>
    ))}
  </TableSkeleton>
); 