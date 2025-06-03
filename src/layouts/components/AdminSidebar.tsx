import { 
  FaChartBar, 
  FaBox, 
  FaLayerGroup, 
  FaShoppingCart, 
  FaUsers, 
  FaEye,
  FaComments,
  FaCog,
  FaTags,
  FaImages,
  FaBolt,
  FaMoneyBillWave,
  FaTruck,
  FaClipboardCheck
} from 'react-icons/fa';

const sidebarLinks = [
  { icon: FaChartBar, text: 'Tableau de bord', path: '/admin' },
  { icon: FaBox, text: 'Produits', path: '/admin/products' },
  { icon: FaLayerGroup, text: 'Catégories', path: '/admin/categories' },
  { 
    icon: FaShoppingCart, 
    text: 'Commandes', 
    path: '/admin/orders',
    subItems: [
      { text: 'Toutes les commandes', path: '/admin/orders' },
      { text: 'En attente', path: '/admin/orders?status=pending' },
      { text: 'En traitement', path: '/admin/orders?status=processing' },
      { text: 'Expédiées', path: '/admin/orders?status=shipped' },
    ]
  },
  { icon: FaUsers, text: 'Utilisateurs', path: '/admin/users' },
  { icon: FaComments, text: 'Avis', path: '/admin/reviews' },
  { icon: FaTags, text: 'Promotions', path: '/admin/promotions' },
  { icon: FaBolt, text: 'Ventes Flash', path: '/admin/flash-sales' },
  { icon: FaImages, text: 'Carrousel', path: '/admin/carousel' },
  { icon: FaTruck, text: 'Livraison', path: '/admin/shipping' },
  { icon: FaMoneyBillWave, text: 'Paiements', path: '/admin/payments' },
  { icon: FaClipboardCheck, text: 'Rapports', path: '/admin/reports' },
  { icon: FaCog, text: 'Paramètres', path: '/admin/settings' },
  { icon: FaEye, text: 'Voir le site', path: '/' },
];

export default sidebarLinks; 