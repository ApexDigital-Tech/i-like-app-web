/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Property {
  id: string;
  name: string;
  location: string;
  zip: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  type: 'Residential' | 'Commercial';
  subType: 'House' | 'Apartment' | 'Land' | 'Office' | 'Other';
  tags: string[];
  image?: string; // Keep for backward compatibility if needed, but we'll use images
  images: string[];
  valuationTrend: number;
  interestVelocity: number; // 0 to 1
  viewingRequests: number;
  description: string;
  roi?: number;
  amenities?: string[];
  yearBuilt?: number;
  parking?: number;
  // Custom Characteristics
  char1Label?: string;
  char1Value?: string;
  char2Label?: string;
  char2Value?: string;
  char3Label?: string;
  char3Value?: string;
  char4Label?: string;
  char4Value?: string;
  verifiedStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  ownerId?: string;
  organizationId: string; // Mandatory for multi-tenancy
  createdAt?: any;
}

export interface UserProfile {
  name: string;
  email: string;
  image: string;
  role: 'Seller' | 'Buyer' | 'Admin' | 'superadmin';
  phone?: string;
  bio?: string;
  organizationId?: string; // Optional only during initial registration
}

export type ViewState = 'MARKET' | 'PORTFOLIO' | 'ADMIN' | 'DETAILS' | 'CALENDAR' | 'SUPER_ADMIN';

export interface PropertyRequest {
  id: string;
  user: string;
  budget: number;
  requirements: string;
  type: 'Buy' | 'Rent';
  location: string;
  minBeds?: number;
  minSqft?: number;
  organizationId: string;
  createdAt?: any;
}

export interface Appointment {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  propertyName?: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  propertyId?: string;
  notes?: string;
  outcome?: string;
  organizationId: string;
  createdAt: any;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  organizationId: string;
  createdAt: any;
}

export const TRANSLATIONS = {
  en: {
    welcome: "Welcome to",
    market: "Marketplace",
    portfolio: "My Portfolio",
    admin: "Command Center",
    network: "Network",
    add_property: "Add Property",
    add_request: "Add Request",
    search_placeholder: "Enter Location, Agent, Office, ID...",
    login: "Login",
    logout: "Logout",
    settings: "Settings",
    language: "Language",
    config: "Configuration",
    save: "Save Changes",
    whatsapp: "WhatsApp Support",
    price: "Price",
    location: "Location",
    type: "Type",
    description: "Description",
    name: "Name",
    beds: "Beds",
    baths: "Baths",
    sqft: "SqFt",
    budget: "Budget",
    looking_for: "What are you looking for?",
    amenities: "Amenities",
    year_built: "Year Built",
    parking: "Parking",
    residential: "Residential",
    commercial: "Commercial",
    buy: "Buy",
    rent: "Rent",
    post_request: "Post Request",
    return: "Return to Terminal",
    verified: "Verified Asset",
    virtual_node: "Virtual Node",
    valuation: "Current Valuation",
    summary: "Executive Summary",
    inquiry: "Initiate Inquiry",
    entity: "Entity Name",
    contact_node: "Contact Node",
    transmit: "Transmit Dossier",
    wa_bridge: "Direct WhatsApp Bridge",
    projections: "Yield Projections // Metropolitan",
    telemetry: "Live Telemetry",
    status: "System Status",
    nominal: "NOMINAL",
    market_interface: "Global Market Interface",
    market_desc: "Fractionalized asset protocols and high-velocity opportunities across the primary metropolitan core.",
    filters: "Filters",
    active_ai: "AI Optimized",
    no_requests: "No active requests. Be the first to post.",
    property_requests: "Property Requests",
    calendar: "Executive Agenda",
    schedule_appointment: "Schedule Meeting",
    notifications: "Notifications",
    mark_all_read: "Mark all as read",
    no_notifications: "Inbox zero. You are up to date.",
    meeting_outcome: "Meeting Outcome",
    reschedule: "Reschedule",
    confirm_meeting: "Confirm Meeting",
    complete_meeting: "Mark as Completed",
    agenda_view: "Agenda View",
    list_view: "List View",
    week: "Week",
    month: "Month",
    image_url: "Image URL",
    market_cap: "Market Cap",
    asset_flow: "Asset Flow",
    active_users: "Active Users",
    user_role: "User Role",
    seller: "Seller",
    buyer: "Buyer",
    admin_role: "Administrator",
    superadmin_role: "SuperAdmin",
    bio: "Biography",
    phone: "Phone Number",
    profile_details: "Profile Details",
    houses: "Houses",
    apartments: "Apartments",
    land: "Land",
    offices: "Offices",
    other: "Other",
    all_types: "All Types",
    search: "Search",
    verification_status: "Verification Status",
    unverified: "Unverified",
    pending: "Verification Pending",
    rejected: "Rejected",
    verify_asset: "Verify Asset",
    reject_asset: "Reject Asset",
    request_verification: "Request Verification",
    asset_verified_success: "Asset verified successfully.",
    asset_rejected_success: "Asset verification rejected."
  },
  es: {
    welcome: "Bienvenido a",
    market: "Mercado",
    portfolio: "Mi Carpeta",
    admin: "Centro de Mando",
    network: "Red",
    add_property: "Agregar Inmueble",
    add_request: "Solicitar Inmueble",
    search_placeholder: "Ingresa Ubicación, Asesor, Oficina, ID...",
    login: "Iniciar Sesión",
    logout: "Cerrar Sesión",
    settings: "Ajustes",
    language: "Idioma",
    config: "Configuración",
    save: "Guardar Cambios",
    whatsapp: "Soporte WhatsApp",
    price: "Precio",
    location: "Ubicación",
    type: "Tipo",
    description: "Descripción",
    name: "Nombre",
    beds: "Habitaciones",
    baths: "Baños",
    sqft: "Mts²",
    budget: "Presupuesto",
    looking_for: "¿Qué estás buscando?",
    amenities: "Servicios/Amenidades",
    year_built: "Año de Construcción",
    parking: "Estacionamiento",
    residential: "Residencial",
    commercial: "Comercial",
    buy: "Comprar",
    rent: "Alquilar",
    post_request: "Publicar Solicitud",
    return: "Volver a la Terminal",
    verified: "Activo Verificado",
    virtual_node: "Nodo Virtual",
    valuation: "Valoración Actual",
    summary: "Resumen Ejecutivo",
    inquiry: "Iniciar Consulta",
    entity: "Nombre de Entidad",
    contact_node: "Punto de Contacto",
    transmit: "Transmitir Dossier",
    wa_bridge: "Puente Directo WhatsApp",
    projections: "Proyecciones de Rendimiento // Metropolitano",
    telemetry: "Telemetría en Vivo",
    status: "Estado del Sistema",
    nominal: "NOMINAL",
    market_interface: "Interfaz de Mercado Global",
    market_desc: "Protocolos de activos fraccionados y oportunidades de alta velocidad en el núcleo metropolitano.",
    filters: "Filtros",
    active_ai: "Optimizada por IA",
    no_requests: "No hay solicitudes activas. Sé el primero en publicar.",
    property_requests: "Solicitudes de Inmuebles",
    calendar: "Citas y Reuniones",
    schedule_appointment: "Agendar Cita",
    notifications: "Notificaciones",
    mark_all_read: "Marcar todas como leídas",
    no_notifications: "Bandeja de entrada vacía. Estás al día.",
    meeting_outcome: "Resultado de la Reunión",
    reschedule: "Reprogramar",
    confirm_meeting: "Confirmar Cita",
    complete_meeting: "Marcar como Completada",
    agenda_view: "Vista Agenda",
    list_view: "Vista Lista",
    executive_agenda: "Agenda Ejecutiva",
    week: "Semana",
    month: "Mes",
    image_url: "URL de la Imagen",
    system_status: "Estado del Sistema",
    market_cap: "Capitalización",
    asset_flow: "Flujo de Activos",
    active_users: "Usuarios Activos",
    user_role: "Rol de Usuario",
    seller: "Vendedor",
    buyer: "Comprador",
    admin_role: "Administrador",
    superadmin_role: "SuperAdministrador",
    bio: "Biografía",
    phone: "Número de Teléfono",
    profile_details: "Detalles del Perfil",
    houses: "Casas",
    apartments: "Departamentos",
    land: "Terrenos",
    offices: "Oficinas",
    other: "Otros",
    all_types: "Todos los Tipos",
    search: "Buscar",
    verification_status: "Estado de Verificación",
    unverified: "No Verificado",
    pending: "Verificación Pendiente",
    rejected: "Rechazado",
    verify_asset: "Verificar Activo",
    reject_asset: "Rechazar Activo",
    request_verification: "Solicitar Verificación",
    asset_verified_success: "Activo verificado con éxito.",
    asset_rejected_success: "Verificación de activo rechazada."
  },
  pt: {
    welcome: "Bem-vindo ao",
    market: "Mercado",
    portfolio: "Meu Portfólio",
    admin: "Centro de Comando",
    network: "Rede",
    add_property: "Adicionar Imóvel",
    add_request: "Solicitar Imóvel",
    search_placeholder: "Insira Localização, Agente, Escritório, ID...",
    login: "Entrar",
    logout: "Sair",
    settings: "Configurações",
    language: "Idioma",
    config: "Configuração",
    save: "Salvar Alterações",
    whatsapp: "Suporte WhatsApp",
    price: "Preço",
    location: "Localização",
    type: "Tipo",
    description: "Descrição",
    name: "Nome",
    beds: "Quartos",
    baths: "Banheiros",
    sqft: "Mts²",
    budget: "Orçamento",
    looking_for: "O que você está procurando?",
    amenities: "Serviços/Amenidades",
    year_built: "Ano de Construção",
    parking: "Estacionamento",
    residential: "Residencial",
    commercial: "Comercial",
    buy: "Comprar",
    rent: "Alugar",
    post_request: "Publicar Solicitação",
    return: "Voltar ao Terminal",
    verified: "Ativo Verificado",
    virtual_node: "Nó Virtual",
    valuation: "Valorização Atual",
    summary: "Resumo Executivo",
    inquiry: "Iniciar Consulta",
    entity: "Nome da Entidade",
    contact_node: "Ponto de Contato",
    transmit: "Transmitir Dossier",
    wa_bridge: "Ponte Direta WhatsApp",
    projections: "Projeções de Rendimento // Metropolitano",
    telemetry: "Telemetria ao Vivo",
    status: "Estado do Sistema",
    nominal: "NOMINAL",
    market_interface: "Interface de Mercado Global",
    market_desc: "Protocolos de ativos fraccionados e oportunidades de alta velocidade no núcleo metropolitano.",
    filters: "Filtros",
    active_ai: "Otimizada por IA",
    no_requests: "Nenhuma solicitação ativa. Seja o primeiro a postar.",
    property_requests: "Solicitações de Imóveis",
    calendar: "Agendamentos",
    schedule_appointment: "Agendar Reunião",
    notifications: "Notificações",
    mark_all_read: "Marcar todas como lidas",
    no_notifications: "Caixa de entrada vazia. Você está em dia.",
    image_url: "URL da Imagem",
    system_status: "Status do Sistema",
    market_cap: "Capitalização",
    asset_flow: "Fluxo de Ativos",
    active_users: "Usuários Ativos",
    user_role: "Cargo do Usuário",
    seller: "Vendedor",
    buyer: "Comprador",
    admin_role: "Administrador",
    superadmin_role: "SuperAdministrador",
    bio: "Biografia",
    phone: "Número de Telefone",
    profile_details: "Detalhes do Perfil",
    houses: "Casas",
    apartments: "Apartamentos",
    land: "Terrenos",
    offices: "Escritórios",
    other: "Outros",
    all_types: "Todos os Tipos",
    search: "Pesquisar",
    verification_status: "Estado de Verificação",
    unverified: "Não Verificado",
    pending: "Verificação Pendente",
    rejected: "Rejeitado",
    verify_asset: "Verificar Ativo",
    reject_asset: "Rejeitar Ativo",
    request_verification: "Solicitar Verificação",
    asset_verified_success: "Ativo verificado com sucesso.",
    asset_rejected_success: "Verificação de ativo rejeitada."
  }
};

export const PROPERTIES: Property[] = [
  {
    id: '1',
    name: 'The Crescent Opus',
    location: 'Beverly Hills',
    zip: '90210',
    price: 14500000,
    beds: 8,
    baths: 12,
    sqft: 18500,
    type: 'Residential',
    subType: 'House',
    tags: ['HIGH ROI', 'LUXURY'],
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop'],
    valuationTrend: 2.1,
    interestVelocity: 0.85,
    viewingRequests: 24,
    description: 'A masterpiece of contemporary architecture, featuring panoramic views and world-class amenities.',
    roi: 12.5,
    organizationId: 'default-org',
    char1Label: 'Tipo', char1Value: 'Residencial',
    char2Label: 'Año', char2Value: '2023',
    char3Label: 'Certificado', char3Value: 'LEED Gold',
    char4Label: 'ROI Est.', char4Value: '12.5%'
  },
  {
    id: '2',
    name: 'Skyline Apex',
    location: 'West Hollywood',
    zip: '90069',
    price: 6200000,
    beds: 3,
    baths: 4,
    sqft: 4200,
    type: 'Residential',
    subType: 'Apartment',
    tags: ['URBAN CORE', 'TECH HUB'],
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop'],
    valuationTrend: 5.4,
    interestVelocity: 0.92,
    viewingRequests: 41,
    description: 'Ultra-modern penthouse offering the ultimate urban lifestyle with floor-to-ceiling glass.',
    roi: 8.2,
    organizationId: 'default-org',
    char1Label: 'Tipo', char1Value: 'Apartamento',
    char2Label: 'Piso', char2Value: 'PH',
    char3Label: 'Vista', char3Value: 'Cityscape',
    char4Label: 'ROI Est.', char4Value: '8.2%'
  },
  {
    id: '3',
    name: 'Apex Tower Pentagon',
    location: 'Financial District',
    zip: '10004',
    price: 45000,
    beds: 0,
    baths: 4,
    sqft: 8500,
    type: 'Commercial',
    subType: 'Office',
    tags: ['LEED PLATINUM', 'CLASS AAA'],
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop'],
    valuationTrend: 1.8,
    interestVelocity: 0.75,
    viewingRequests: 12,
    description: 'Prestigious office space at the peak of the Financial District, designed for visionary enterprises.',
    roi: 15.0,
    organizationId: 'default-org',
    char1Label: 'Tipo', char1Value: 'Comercial',
    char2Label: 'Clase', char2Value: 'Triple A',
    char3Label: 'Cert.', char3Value: 'LEED Plat',
    char4Label: 'ROI Est.', char4Value: '15.0%'
  }
];
