import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the available languages
export type Language = 'fr' | 'ar';

// Define the context type
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'fr',
  setLanguage: () => {},
  t: (key: string) => key,
});

// French translations (default language)
const frTranslations: Record<string, string> = {
  // Navigation
  'home': 'Accueil',
  'products': 'Produits',
  'my_orders': 'Mes commandes',
  'login': 'Connexion',
  'register': 'Inscription',
  'profile': 'Profil',
  'admin': 'Admin',
  'logout': 'Déconnexion',
  'cart': 'Panier',
  'search_product': 'Rechercher un produit...',
  
  // Flash Sales
  'flash_sales': 'Ventes Flash',
  'ends_in': 'Termine dans',
  'view_more': 'Voir plus',
  'hours': 'heures',
  'minutes': 'minutes',
  'seconds': 'secondes',
  
  // Categories
  'categories': 'Catégories',
  'popular_categories': 'Catégories populaires',
  'main_categories': 'Catégories principales',
  'subcategories': 'Sous-catégories',
  'categories_load_error': 'Erreur lors du chargement des catégories',
  
  // Product related
  'new_products': 'Nouveaux produits',
  'popular_products': 'Produits populaires',
  'add_product': 'Ajouter un nouveau produit',
  'product_name': 'Nom du produit',
  'description': 'Description',
  'price': 'Prix (DT)',
  'discounted_price': 'Prix réduit (DT) (optionnel)',
  'stock': 'Stock',
  'category': 'Catégorie',
  'images': 'Images du produit',
  'add_image': 'Ajouter une image',
  'select_category': 'Sélectionnez une catégorie',
  
  // Buttons & Actions
  'see_all': 'Voir tout',
  'explore_products': 'Explorer nos produits',
  'add_to_cart': 'Ajouter au panier',
  'view_product': 'Voir le produit',
  'cancel': 'Annuler',
  'update': 'Mettre à jour',
  'create': 'Créer le produit',
  'in_progress': 'En cours...',
  
  // Welcome section
  'welcome_title': 'Bienvenue sur E-Shop',
  'welcome_subtitle': 'Découvrez notre sélection de produits de qualité à des prix imbattables',
  
  // NEW TRANSLATIONS
  // Homepage
  'free_shipping': 'Livraison gratuite',
  'free_shipping_desc': 'Livraison gratuite pour toutes les commandes de plus de 250 DT',
  'money_guarantee': 'Garantie de remboursement',
  'money_guarantee_desc': '10 jours de garantie satisfait ou remboursé',
  'support_247': 'Support 24/7',
  'support_247_desc': 'Service client disponible 24h/24, 7j/7',
  'secure_payment': 'Paiement sécurisé',
  'secure_payment_desc': 'Transactions sécurisées avec chiffrement SSL',
  'newsletter_title': 'Abonnez-vous à notre newsletter',
  'newsletter_subtitle': 'Recevez les dernières offres et les mises à jour de produits directement dans votre boîte de réception.',
  'email_placeholder': 'Votre adresse email',
  'subscribe': 'S\'abonner',
  'newsletter_thanks': 'Merci de vous être inscrit avec l\'email:',
  
  // Products page
  'all_our_products': 'Tous nos produits',
  'discover_products': 'Découvrez notre sélection de produits de qualité supérieure',
  'all_categories': 'Toutes les catégories',
  'sort_newest': 'Nouveautés',
  'sort_price_asc': 'Prix: croissant',
  'sort_price_desc': 'Prix: décroissant',
  'sort_name_asc': 'Nom: A-Z',
  'sort_name_desc': 'Nom: Z-A',
  'no_products_found': 'Aucun produit trouvé',
  'try_filters': 'Essayez de modifier vos filtres ou effectuez une nouvelle recherche',
  'loading': 'Chargement...',
  'loading_categories': 'Chargement des catégories...',
  'no_categories_found': 'Aucune catégorie trouvée',
  
  // Cart
  'shopping_cart': 'Panier d\'achat',
  'your_cart': 'Votre panier',
  'empty_cart': 'Votre panier est vide',
  'start_shopping': 'Commencer vos achats',
  'product': 'Produit',
  'quantity': 'Quantité',
  'total': 'Total',
  'subtotal': 'Sous-total',
  'remove': 'Supprimer',
  'checkout': 'Passer la commande',
  'continue_shopping': 'Continuer vos achats',
  'items': 'articles',
  'confirm_remove_item': 'Êtes-vous sûr de vouloir supprimer cet article du panier ?',
  'confirm_clear_cart': 'Êtes-vous sûr de vouloir vider votre panier ?',
  'login_to_view_cart': 'Vous devez être connecté pour voir votre panier.',
  'clear_cart': 'Vider le panier',
  'free': 'Gratuit',
  
  // Order
  'order_summary': 'Résumé de la commande',
  'shipping_address': 'Adresse de livraison',
  'payment_method': 'Méthode de paiement',
  'credit_card': 'Carte de crédit',
  'paypal': 'PayPal',
  'place_order': 'Passer la commande',
  'shipping': 'Livraison',
  'tax': 'Taxes',
  'order_total': 'Total',
  'discount': 'Remise',
  'my_orders_title': 'Mes commandes',
  'order_history': 'Historique des commandes',
  'order_number': 'Numéro de commande',
  'order_date': 'Date',
  'order_status': 'Statut',
  'order_details': 'Détails',
  'view_details': 'Voir les détails',
  
  // Statuses
  'status_pending': 'En attente',
  'status_processing': 'En traitement',
  'status_shipped': 'Expédié',
  'status_delivered': 'Livré',
  'status_cancelled': 'Annulé',
  
  // Profile
  'my_profile': 'Mon profil',
  'personal_info': 'Informations personnelles',
  'account_settings': 'Paramètres du compte',
  'name': 'Nom',
  'email': 'Email',
  'phone': 'Téléphone',
  'address': 'Adresse',
  'city': 'Ville',
  'postal_code': 'Code postal',
  'country': 'Pays',
  'save_changes': 'Enregistrer les modifications',
  'change_password': 'Changer le mot de passe',
  'current_password': 'Mot de passe actuel',
  'new_password': 'Nouveau mot de passe',
  'confirm_password': 'Confirmer le mot de passe',
  
  // Auth
  'login_title': 'Connexion à votre compte',
  'login_subtitle': 'Bienvenue à nouveau! Veuillez vous connecter pour accéder à votre compte.',
  'password': 'Mot de passe',
  'remember_me': 'Se souvenir de moi',
  'forgot_password': 'Mot de passe oublié?',
  'no_account': 'Vous n\'avez pas de compte?',
  'create_account': 'Créer un compte',
  'register_title': 'Créer un compte',
  'register_subtitle': 'Rejoignez-nous pour découvrir tous nos produits et services.',
  'have_account': 'Vous avez déjà un compte?',
  'terms': 'J\'accepte les termes et conditions',
  
  // Reviews
  'reviews': 'Avis',
  'add_review': 'Ajouter un avis',
  'your_rating': 'Votre note',
  'your_review': 'Votre avis',
  'submit_review': 'Soumettre l\'avis',
  'no_reviews': 'Aucun avis pour ce produit',
  'be_first': 'Soyez le premier à donner votre avis',
  
  // Product card
  'new': 'Nouveau',
  'sale': 'Promo',
  'in_stock': 'En stock',
  'out_of_stock': 'Rupture de stock',
  'add_to_wishlist': 'Ajouter aux favoris',
  
  // Product details
  'product_details': 'Détails du produit',
  'product_not_found': 'Produit non trouvé',
  'product_not_found_message': 'Le produit que vous recherchez n\'existe pas ou a été supprimé.',
  'back_to_products': 'Retour aux produits',
  'you_save': 'Vous économisez',
  'adding': 'Ajout en cours',
  'product_added_to_cart': 'Produit ajouté au panier avec succès!',
  'error_adding_to_cart': 'Erreur lors de l\'ajout au panier',
  'customer_reviews': 'Avis clients',
  'login_to_review': 'Vous devez être connecté pour laisser un avis',
  'login_required_for_review': 'Vous devez être connecté pour laisser un avis',
  'review_added_success': 'Votre avis a été ajouté avec succès',
  'error_adding_review': 'Erreur lors de l\'ajout de votre avis',
  
  // Reviews form
  'rating_very_dissatisfied': 'Très insatisfait',
  'rating_dissatisfied': 'Insatisfait',
  'rating_neutral': 'Neutre',
  'rating_satisfied': 'Satisfait',
  'rating_very_satisfied': 'Très satisfait',
  'select_rating': 'Sélectionnez une note',
  'rating_required': 'Veuillez attribuer une note',
  'title_required': 'Le titre est requis',
  'comment_required': 'Le commentaire est requis',
  'comment_too_short': 'Le commentaire doit contenir au moins 10 caractères',
  'review_title': 'Titre',
  'review_title_placeholder': 'Résumez votre expérience en quelques mots',
  'review_comment_placeholder': 'Partagez votre expérience avec ce produit',
  'submitting': 'Envoi en cours...',
  
  // Reviews list
  'loading_reviews': 'Chargement des avis...',
  'verified_purchase': 'Achat vérifié',
  'user': 'Utilisateur',
  'previous': 'Précédent',
  'next': 'Suivant',
  
  // Footer
  'about_us': 'À propos de nous',
  'about_us_text': 'E-Shop est votre destination shopping en ligne pour des produits de qualité à des prix compétitifs. Nous proposons une large gamme de produits pour tous vos besoins.',
  'useful_links': 'Liens utiles',
  'electronics': 'Électronique',
  'fashion': 'Mode',
  'home_garden': 'Maison & Jardin',
  'sports': 'Sports',
  'beauty_health': 'Beauté & Santé',
  'all_rights_reserved': 'Tous droits réservés.',
  'contact': 'Contact',
  
  // Order Details Page
  'order_details_title': 'Détails de la commande',
  'order_id': 'Numéro de commande',
  'order_created_date': 'Date de commande',
  'order_current_status': 'Statut de la commande',
  'customer_info': 'Informations client',
  'shipping_info': 'Informations de livraison',
  'ordered_products': 'Produits commandés',
  'product_quantity': 'Quantité',
  'shipping_fee': 'Frais de livraison',
  'payment_info': 'Informations de paiement',
  'transaction_id': 'ID de transaction',
  'cash_on_delivery': 'Paiement à la livraison',
  'paid': 'Payé',
  'pending_payment': 'En attente',
  'processing_status': 'En cours',
  'mark_as_processing': 'Passer à "En traitement"',
  'mark_as_shipped': 'Marquer comme "Expédiée"',
  'mark_as_delivered': 'Marquer comme "Livrée"',
  'cancel_order': 'Annuler la commande',
  'print_invoice': 'Imprimer la facture',
  'back_to_orders': 'Retour aux commandes',
  'invoice': 'Facture',
  'seller': 'Vendeur',
  'client': 'Client',
  'order_track': 'Suivi de commande',
  'order_passed': 'Commande passée',
  'processing_label': 'En traitement',
  'thank_you': 'Merci pour votre achat!',
  'contact_question': 'Pour toute question concernant cette facture, veuillez nous contacter à',
  'phone_label': 'Téléphone',
  'street_address': 'Rue',
  'postal_code_label': 'Code postal',
  'processing_date': 'Traité le',
  'tax_id': 'Matricule fiscal',
  
  // Missing translations for OrdersPage
  'no_orders_yet': 'Vous n\'avez pas encore de commandes',
  'start_shopping_to_see_orders': 'Commencez vos achats pour voir vos commandes ici',
  'error_loading_orders': 'Une erreur est survenue lors du chargement des commandes',
  'and_more_items': '+ {{count}} autres articles',
  'default_country': 'Tunisie',
  'not_provided': 'Non renseigné',
  'not_available': 'N/A',
  'error_loading_order': 'Erreur lors du chargement de la commande',
  'error_loading_order_message': 'Impossible de charger les détails de la commande. Veuillez réessayer plus tard.',
  
  // Additional missing translations
  'order_placed_successfully': 'Commande passée avec succès!',
  'order_confirmation_message': 'Votre commande a été passée avec succès et sera traitée dès que possible.',
  'confirm_cancel_order': 'Êtes-vous sûr de vouloir annuler cette commande?',

  // Checkout Page
  'finalize_your_order': 'Finaliser votre commande',
  'delivery_information': 'Informations de livraison',
  'delivery_address': 'Adresse de livraison',
  'complete_address': 'Adresse complète',
  'phone_for_delivery': 'Numéro de téléphone pour la livraison',
  'special_notes': 'Notes spéciales (optionnel)',
  'delivery_instructions': 'Instructions spéciales pour la livraison...',
  'payment_mode': 'Mode de paiement',
  'cash_on_delivery_title': 'Paiement à la livraison',
  'cash_on_delivery_desc': 'Payez en espèces au moment de la livraison. Vérifiez votre commande avant de payer.',
  'confirm_order': 'Confirmer la commande',
  'processing_in_progress': 'Traitement en cours...',

  // Categories translations
  'category_phones_tablets': 'Téléphone & Tablette',
  'category_tv_tech': 'TV & High Tech',
  'category_computers': 'Informatique',
  'category_home_kitchen': 'Maison, cuisine & bureau',
  'category_appliances': 'Électroménager',
  'category_clothing': 'Vêtements & Chaussures',
  'category_health_beauty': 'Beauté & Santé',
  'category_gaming': 'Jeux vidéos & Consoles',
  'category_diy': 'Bricolage',
  'category_sports': 'Sports & Loisirs',
  'category_baby': 'Bébé & Jouets',
  
  // Subcategories
  'subcategory_smartphones': 'Smartphones',
  'subcategory_tablets': 'Tablettes',
  'subcategory_phone_accessories': 'Accessoires téléphones',
  'subcategory_laptops': 'Ordinateurs portables',
  'subcategory_desktops': 'Ordinateurs de bureau',
  'subcategory_peripherals': 'Périphériques',
  'subcategory_storage': 'Stockage',

  // Carousel related
  'featured_products': 'Produits en vedette',
  'shop_by_category': 'Acheter par catégorie',
  'new_arrivals': 'Nouveautés',
  
  // Carousel slides
  'welcome_slide_title': 'Bienvenue dans notre boutique',
  'welcome_slide_subtitle': 'Découvrez des produits exceptionnels à prix imbattables',
  'new_arrivals_slide_title': 'Nouveaux arrivages',
  'new_arrivals_slide_subtitle': 'Découvrez nos derniers produits et collections',
  'special_offers_slide_title': 'Offres spéciales',
  'special_offers_slide_subtitle': 'Profitez de nos promotions limitées sur une sélection d\'articles',
  'shop_now': 'Acheter maintenant',
  'view_new_items': 'Voir les nouveautés',
  'view_offers': 'Voir les offres',
};

// Arabic translations
const arTranslations: Record<string, string> = {
  // Navigation
  'home': 'الرئيسية',
  'products': 'المنتجات',
  'my_orders': 'طلباتي',
  'login': 'تسجيل الدخول',
  'register': 'إنشاء حساب',
  'profile': 'الملف الشخصي',
  'admin': 'المسؤول',
  'logout': 'تسجيل الخروج',
  'cart': 'سلة التسوق',
  'search_product': 'البحث عن منتج...',
  
  // Flash Sales
  'flash_sales': 'المبيعات السريعة',
  'ends_in': 'ينتهي في',
  'view_more': 'إظهار المزيد',
  'hours': 'ساعات',
  'minutes': 'دقائق',
  'seconds': 'ثواني',
  
  // Categories
  'categories': 'الفئات',
  'popular_categories': 'الفئات الشائعة',
  'main_categories': 'الفئات الرئيسية',
  'subcategories': 'الفئات الفرعية',
  'categories_load_error': 'خطأ أثناء تحميل الفئات',
  
  // Product related
  'new_products': 'منتجات جديدة',
  'popular_products': 'المنتجات الشائعة',
  'add_product': 'إضافة منتج جديد',
  'product_name': 'اسم المنتج',
  'description': 'الوصف',
  'price': 'السعر (DT)',
  'discounted_price': 'السعر المخفض (DT) (اختياري)',
  'stock': 'المخزون',
  'category': 'الفئة',
  'images': 'صور المنتج',
  'add_image': 'إضافة صورة',
  'select_category': 'اختر فئة',
  
  // Buttons & Actions
  'see_all': 'عرض الكل',
  'explore_products': 'استكشاف منتجاتنا',
  'add_to_cart': 'إضافة إلى السلة',
  'view_product': 'عرض المنتج',
  'cancel': 'إلغاء',
  'update': 'تحديث',
  'create': 'إنشاء المنتج',
  'in_progress': 'جاري التنفيذ...',
  
  // Welcome section
  'welcome_title': 'مرحبًا بك في المتجر الإلكتروني',
  'welcome_subtitle': 'اكتشف مجموعتنا من المنتجات عالية الجودة بأسعار لا تقبل المنافسة',
  
  // NEW TRANSLATIONS
  // Homepage
  'free_shipping': 'شحن مجاني',
  'free_shipping_desc': 'شحن مجاني لجميع الطلبات التي تزيد عن 250 دينار',
  'money_guarantee': 'ضمان استرداد الأموال',
  'money_guarantee_desc': 'ضمان استرداد الأموال لمدة 10 أيام',
  'support_247': 'دعم على مدار الساعة',
  'support_247_desc': 'خدمة العملاء متوفرة على مدار 24 ساعة طوال أيام الأسبوع',
  'secure_payment': 'دفع آمن',
  'secure_payment_desc': 'معاملات آمنة مع تشفير SSL',
  'newsletter_title': 'اشترك في نشرتنا الإخبارية',
  'newsletter_subtitle': 'احصل على أحدث العروض وتحديثات المنتجات مباشرة في صندوق البريد الخاص بك.',
  'email_placeholder': 'عنوان بريدك الإلكتروني',
  'subscribe': 'اشترك',
  'newsletter_thanks': 'شكرًا لاشتراكك بالبريد الإلكتروني:',
  
  // Products page
  'all_our_products': 'جميع منتجاتنا',
  'discover_products': 'اكتشف مجموعتنا من المنتجات عالية الجودة',
  'all_categories': 'جميع الفئات',
  'sort_newest': 'الأحدث',
  'sort_price_asc': 'السعر: من الأقل إلى الأعلى',
  'sort_price_desc': 'السعر: من الأعلى إلى الأقل',
  'sort_name_asc': 'الاسم: أ-ي',
  'sort_name_desc': 'الاسم: ي-أ',
  'no_products_found': 'لم يتم العثور على منتجات',
  'try_filters': 'حاول تعديل المرشحات أو إجراء بحث جديد',
  'loading': 'جاري التحميل...',
  'loading_categories': 'جاري تحميل الفئات...',
  'no_categories_found': 'لم يتم العثور على فئات',
  
  // Cart
  'shopping_cart': 'سلة التسوق',
  'your_cart': 'سلة التسوق الخاصة بك',
  'empty_cart': 'سلة التسوق فارغة',
  'start_shopping': 'ابدأ التسوق',
  'product': 'المنتج',
  'quantity': 'الكمية',
  'total': 'المجموع',
  'subtotal': 'المجموع الفرعي',
  'remove': 'إزالة',
  'checkout': 'إتمام الشراء',
  'continue_shopping': 'مواصلة التسوق',
  'items': 'عناصر',
  'confirm_remove_item': 'هل أنت متأكد من رغبتك في إزالة هذا العنصر من سلة التسوق؟',
  'confirm_clear_cart': 'هل أنت متأكد من رغبتك في إفراغ سلة التسوق؟',
  'login_to_view_cart': 'يجب عليك تسجيل الدخول لعرض سلة التسوق الخاصة بك.',
  'clear_cart': 'إفراغ سلة التسوق',
  'free': 'مجاني',
  
  // Order
  'order_summary': 'ملخص الطلب',
  'shipping_address': 'عنوان الشحن',
  'payment_method': 'طريقة الدفع',
  'credit_card': 'بطاقة ائتمان',
  'paypal': 'باي بال',
  'place_order': 'تقديم الطلب',
  'shipping': 'الشحن',
  'tax': 'الضريبة',
  'order_total': 'إجمالي الطلب',
  'discount': 'الخصم',
  'my_orders_title': 'طلباتي',
  'order_history': 'سجل الطلبات',
  'order_number': 'رقم الطلب',
  'order_date': 'التاريخ',
  'order_status': 'الحالة',
  'order_details': 'تفاصيل الطلب',
  'view_details': 'عرض التفاصيل',
  
  // Statuses
  'status_pending': 'قيد الانتظار',
  'status_processing': 'قيد المعالجة',
  'status_shipped': 'تم الشحن',
  'status_delivered': 'تم التوصيل',
  'status_cancelled': 'تم الإلغاء',
  
  // Profile
  'my_profile': 'ملفي الشخصي',
  'personal_info': 'المعلومات الشخصية',
  'account_settings': 'إعدادات الحساب',
  'name': 'الاسم',
  'email': 'البريد الإلكتروني',
  'phone': 'الهاتف',
  'address': 'العنوان',
  'city': 'المدينة',
  'postal_code': 'الرمز البريدي',
  'country': 'البلد',
  'save_changes': 'حفظ التغييرات',
  'change_password': 'تغيير كلمة المرور',
  'current_password': 'كلمة المرور الحالية',
  'new_password': 'كلمة المرور الجديدة',
  'confirm_password': 'تأكيد كلمة المرور',
  
  // Auth
  'login_title': 'تسجيل الدخول إلى حسابك',
  'login_subtitle': 'مرحبًا بعودتك! يرجى تسجيل الدخول للوصول إلى حسابك.',
  'password': 'كلمة المرور',
  'remember_me': 'تذكرني',
  'forgot_password': 'نسيت كلمة المرور؟',
  'no_account': 'ليس لديك حساب؟',
  'create_account': 'إنشاء حساب',
  'register_title': 'إنشاء حساب',
  'register_subtitle': 'انضم إلينا لاكتشاف جميع منتجاتنا وخدماتنا.',
  'have_account': 'هل لديك حساب بالفعل؟',
  'terms': 'أوافق على الشروط والأحكام',
  
  // Reviews
  'reviews': 'تقييمات',
  'add_review': 'إضافة تقييم',
  'your_rating': 'تقييمك',
  'your_review': 'مراجعتك',
  'submit_review': 'إرسال التقييم',
  'no_reviews': 'لا توجد تقييمات لهذا المنتج',
  'be_first': 'كن أول من يقدم تقييمًا',
  
  // Product card
  'new': 'جديد',
  'sale': 'عرض',
  'in_stock': 'متوفر',
  'out_of_stock': 'غير متوفر',
  'add_to_wishlist': 'أضف إلى المفضلة',
  
  // Product details
  'product_details': 'تفاصيل المنتج',
  'product_not_found': 'المنتج غير موجود',
  'product_not_found_message': 'المنتج الذي تبحث عنه غير موجود أو تم حذفه.',
  'back_to_products': 'العودة إلى المنتجات',
  'you_save': 'توفير',
  'adding': 'جاري الإضافة',
  'product_added_to_cart': 'تمت إضافة المنتج إلى سلة التسوق بنجاح!',
  'error_adding_to_cart': 'خطأ في إضافة المنتج إلى سلة التسوق',
  'customer_reviews': 'آراء العملاء',
  'login_to_review': 'يجب عليك تسجيل الدخول لترك تقييم',
  'login_required_for_review': 'يجب عليك تسجيل الدخول لترك تقييم',
  'review_added_success': 'تمت إضافة تقييمك بنجاح',
  'error_adding_review': 'خطأ في إضافة تقييمك',
  
  // Reviews form
  'rating_very_dissatisfied': 'غير راضٍ تمامًا',
  'rating_dissatisfied': 'غير راضٍ',
  'rating_neutral': 'محايد',
  'rating_satisfied': 'راضٍ',
  'rating_very_satisfied': 'راضٍ جدًا',
  'select_rating': 'اختر تقييمًا',
  'rating_required': 'يرجى تقديم تقييم',
  'title_required': 'العنوان مطلوب',
  'comment_required': 'التعليق مطلوب',
  'comment_too_short': 'يجب أن يحتوي التعليق على 10 أحرف على الأقل',
  'review_title': 'العنوان',
  'review_title_placeholder': 'لخص تجربتك في بضع كلمات',
  'review_comment_placeholder': 'شارك تجربتك مع هذا المنتج',
  'submitting': 'جاري الإرسال...',
  
  // Reviews list
  'loading_reviews': 'جاري تحميل التقييمات...',
  'verified_purchase': 'شراء مؤكد',
  'user': 'مستخدم',
  'previous': 'السابق',
  'next': 'التالي',
  
  // Footer
  'about_us': 'نبذة عنا',
  'about_us_text': 'المتجر الإلكتروني هو وجهتك للتسوق عبر الإنترنت للحصول على منتجات عالية الجودة بأسعار تنافسية. نحن نقدم مجموعة واسعة من المنتجات لتلبية جميع احتياجاتك.',
  'useful_links': 'روابط مفيدة',
  'electronics': 'الإلكترونيات',
  'fashion': 'الموضة',
  'home_garden': 'المنزل والحديقة',
  'sports': 'الرياضة',
  'beauty_health': 'الجمال والصحة',
  'all_rights_reserved': 'جميع الحقوق محفوظة.',
  'contact': 'اتصل بنا',
  
  // Order Details Page
  'order_details_title': 'تفاصيل الطلب',
  'order_id': 'رقم الطلب',
  'order_created_date': 'تاريخ الطلب',
  'order_current_status': 'حالة الطلب',
  'customer_info': 'معلومات العميل',
  'shipping_info': 'معلومات الشحن',
  'ordered_products': 'المنتجات المطلوبة',
  'product_quantity': 'الكمية',
  'shipping_fee': 'رسوم الشحن',
  'payment_info': 'معلومات الدفع',
  'transaction_id': 'رقم المعاملة',
  'cash_on_delivery': 'الدفع عند الاستلام',
  'paid': 'مدفوع',
  'pending_payment': 'قيد الانتظار',
  'processing_status': 'قيد المعالجة',
  'mark_as_processing': 'تحديث إلى "قيد المعالجة"',
  'mark_as_shipped': 'تحديث إلى "تم الشحن"',
  'mark_as_delivered': 'تحديث إلى "تم التوصيل"',
  'cancel_order': 'إلغاء الطلب',
  'print_invoice': 'طباعة الفاتورة',
  'back_to_orders': 'العودة إلى الطلبات',
  'invoice': 'فاتورة',
  'seller': 'البائع',
  'client': 'العميل',
  'order_track': 'تتبع الطلب',
  'order_passed': 'تم إرسال الطلب',
  'processing_label': 'قيد المعالجة',
  'thank_you': 'شكراً لشرائك!',
  'contact_question': 'لأي استفسار بخصوص هذه الفاتورة، يرجى التواصل معنا على',
  'phone_label': 'الهاتف',
  'street_address': 'الشارع',
  'postal_code_label': 'الرمز البريدي',
  'processing_date': 'تاريخ المعالجة',
  'tax_id': 'الرقم الضريبي',
  
  // Missing translations for OrdersPage
  'no_orders_yet': 'ليس لديك طلبات بعد',
  'start_shopping_to_see_orders': 'ابدأ التسوق لرؤية طلباتك هنا',
  'error_loading_orders': 'حدث خطأ أثناء تحميل الطلبات',
  'and_more_items': '+ {{count}} عناصر أخرى',
  'default_country': 'تونس',
  'not_provided': 'غير متوفر',
  'not_available': 'غير متاح',
  'error_loading_order': 'خطأ في تحميل تفاصيل الطلب',
  'error_loading_order_message': 'تعذر تحميل تفاصيل الطلب. يرجى المحاولة مرة أخرى لاحقاً.',
  
  // Additional missing translations
  'order_placed_successfully': 'تم تقديم الطلب بنجاح!',
  'order_confirmation_message': 'تم تقديم طلبك بنجاح وسيتم معالجته في أقرب وقت ممكن.',
  'confirm_cancel_order': 'هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟',

  // Checkout Page
  'finalize_your_order': 'إتمام طلبك',
  'delivery_information': 'معلومات التوصيل',
  'delivery_address': 'عنوان التوصيل',
  'complete_address': 'العنوان الكامل',
  'phone_for_delivery': 'رقم الهاتف للتوصيل',
  'special_notes': 'ملاحظات خاصة (اختياري)',
  'delivery_instructions': 'تعليمات خاصة للتوصيل...',
  'payment_mode': 'طريقة الدفع',
  'cash_on_delivery_title': 'الدفع عند الاستلام',
  'cash_on_delivery_desc': 'ادفع نقداً عند استلام الطلب. تحقق من طلبك قبل الدفع.',
  'confirm_order': 'تأكيد الطلب',
  'processing_in_progress': 'جاري المعالجة...',

  // Categories (Adding translations for categories shown in the sidebar)
  'category_phones_tablets': 'الهواتف والأجهزة اللوحية',
  'category_tv_tech': 'تلفزيون وتكنولوجيا',
  'category_computers': 'معدات كمبيوتر',
  'category_home_kitchen': 'المنزل والمطبخ والمكتب',
  'category_appliances': 'الأجهزة المنزلية',
  'category_clothing': 'الملابس والأحذية',
  'category_health_beauty': 'الجمال والصحة',
  'category_gaming': 'ألعاب الفيديو ومنصات الألعاب',
  'category_diy': 'أدوات يدوية وإصلاحات',
  'category_sports': 'الرياضة والترفيه',
  'category_baby': 'منتجات الأطفال والألعاب',
  
  // Subcategories
  'subcategory_smartphones': 'الهواتف الذكية',
  'subcategory_tablets': 'أجهزة لوحية',
  'subcategory_phone_accessories': 'ملحقات الهواتف',
  'subcategory_laptops': 'أجهزة الكمبيوتر المحمولة',
  'subcategory_desktops': 'أجهزة الكمبيوتر المكتبية',
  'subcategory_peripherals': 'الأجهزة الطرفية',
  'subcategory_storage': 'وحدات التخزين',

  // Carousel related
  'featured_products': 'منتجات مميزة',
  'shop_by_category': 'تسوق حسب الفئة',
  'new_arrivals': 'وصل حديثاً',
  
  // Carousel slides
  'welcome_slide_title': 'مرحباً بكم في متجرنا',
  'welcome_slide_subtitle': 'اكتشف منتجات استثنائية بأسعار لا تقبل المنافسة',
  'new_arrivals_slide_title': 'وصل حديثاً',
  'new_arrivals_slide_subtitle': 'اكتشف أحدث منتجاتنا ومجموعاتنا',
  'special_offers_slide_title': 'عروض خاصة',
  'special_offers_slide_subtitle': 'استفد من عروضنا المحدودة على مجموعة مختارة من المنتجات',
  'shop_now': 'تسوق الآن',
  'view_new_items': 'عرض المنتجات الجديدة',
  'view_offers': 'عرض العروض',
};

// Main translations object
const translations: Record<Language, Record<string, string>> = {
  fr: frTranslations,
  ar: arTranslations,
};

// Props for the provider
interface LanguageProviderProps {
  children: ReactNode;
}

// Provider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Get initial language from localStorage or default to French
  const savedLanguage = localStorage.getItem('language') as Language;
  const [language, setLanguage] = useState<Language>(savedLanguage || 'fr');
  
  // Function to change language
  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    
    // Set direction for the document based on language
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Add a class to the body for RTL-specific styling
    if (lang === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  };
  
  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };
  
  // Set initial direction on mount
  React.useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    if (language === 'ar') {
      document.body.classList.add('rtl');
    }
    
    return () => {
      document.body.classList.remove('rtl');
    };
  }, []);
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use the language context
export const useLanguage = () => useContext(LanguageContext); 