export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
  notes?: string;
  source?: string;
  customFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: string;
  type: string;
  scheduledAt?: string;
  sentAt?: string;
  templateId?: string;
  userId: string;
  createdAt: string;
  template?: { id: string; name: string };
  user?: { id: string; firstName: string; lastName: string };
  messages?: CampaignMessage[];
  _count?: { messages: number };
}

export interface CampaignMessage {
  id: string;
  campaignId: string;
  customerId: string;
  status: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  error?: string;
  customer?: { id: string; name: string; phone: string };
  createdAt: string;
}

export interface Conversation {
  id: string;
  customerId: string;
  userId?: string;
  status: string;
  assignedTo?: string;
  lastMessageAt?: string;
  createdAt: string;
  customer: Customer;
  messages?: Message[];
  _count?: { messages: number };
}

export interface Message {
  id: string;
  conversationId: string;
  direction: 'inbound' | 'outbound';
  content: string;
  contentType: string;
  mediaUrl?: string;
  status: string;
  whatsappId?: string;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  language: string;
  body: string;
  header?: string;
  footer?: string;
  buttons: any[];
  status: string;
  whatsappId?: string;
  createdAt: string;
}

export interface KnowledgeBaseEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalConversations: number;
  activeConversations: number;
  todayMessages: number;
  totalCampaigns: number;
  recentConversations: Conversation[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}
