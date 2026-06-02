// import React, { useState, useEffect, useMemo } from 'react';
// import {
//   Plus, Trash2, Edit, ChevronRight, BrainCircuit, Zap,
//   RefreshCw, Layers, AlertTriangle, CheckCircle, TestTube2,
//   Home, Tag as TagIcon, Package, FileText, Server, Download,
//   ZapIcon, Link as LinkIcon, Database, Wifi, WifiOff, BarChart3, ArrowLeftRight, Shield, Search
// } from 'lucide-react';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// // import DomainTestbedPage from '/src/pages/DomainTestbedPage';
// import DomainTestbedPage from '@/pages/DomainTestbedPage';
// import DomainScopeGen from '@/pages/DomainScopeGen';
// import EnhancedDomainTestbedPage from '@/pages/EnhancedDomainTestbedPage';
// import SessionStatusTrackerPage from './pages/SessionStatusTrackerPage';
// import { Activity } from 'lucide-react'; // Add to existing imports
// import ComponentDomainMappingPage from './pages/ComponentDomainMappingPage';
// import GenerateSequencePage from '@/pages/GenerateSequence';
// import JiraProcessorPage from '@/pages/JiraProcessorPage';
// import JiraAdminPage from '@/pages/JiraAdminPage';
// import UnifiedInterfaceSpecificationsTab from '@/components/UnifiedInterfaceSpecificationsTab';
// import EnhancedInterfaceSpecificationsTab from '@/components/enhanced/EnhancedInterfaceSpecificationsTab';
// import DomainComparisonTab from '@/components/DomainComparisonTab';
// import DomainHealthDashboard from '@/components/DomainHealthDashboard';
// import DomainDescriptionDisplay from '@/components/DomainDescriptionDisplay';
// import {
//   domainService,
//   featuresService,
//   tagsService,
//   unifiedInterfaceService,
//   Domain,
//   Feature,
//   Tag,
//   SYS2Requirement,
//   DomainType,
//   InterfaceSpecification,
//   InterfaceProcessingResponse,
//   VersionedInterfaceProcessingRequest,
//   EnhancedInterfaceProcessingResponse,
//   InterfaceVersion,
//   EmbeddingStatus
// } from '@/services';
// import './index.css';

// // Constants
// const REQ_TYPE_COLORS = {
//   'Functional': 'bg-green-500/50 text-green-200',
//   'Non-Functional': 'bg-yellow-500/50 text-yellow-200',
//   'Constraint': 'bg-red-500/50 text-red-200',
//   'Heading': 'bg-indigo-500/50 text-indigo-200',
//   'Information': 'bg-sky-500/50 text-sky-200',
//   'default': 'bg-gray-500/50 text-gray-200'
// };

// // Simple notification interface
// interface Notification {
//   id: number;
//   message: string;
//   type: 'success' | 'error' | 'info';
// }

// // Main App Component
// const App = () => {
//   const [page, setPage] = useState('home');
//   const [activeFeature, setActiveFeature] = useState<Feature | null>(null);

//   // Data states
//   const [domains, setDomains] = useState<Domain[]>([]);
//   const [domainTypes, setDomainTypes] = useState<string[]>([]);
//   const [domainTypesMetadata, setDomainTypesMetadata] = useState<Record<string, DomainType>>({});
//   const [features, setFeatures] = useState<Feature[]>([]);
//   const [tags, setTags] = useState<Tag[]>([]);
//   const [sys2Requirements, setSys2Requirements] = useState<SYS2Requirement[]>([]);

//   // Loading states
//   const [loadingDomains, setLoadingDomains] = useState(false);
//   const [loadingDomainTypes, setLoadingDomainTypes] = useState(false);
//   const [loadingFeatures, setLoadingFeatures] = useState(false);
//   const [loadingTags, setLoadingTags] = useState(false);

//   // Notification state
//   const [notification, setNotification] = useState<Notification | null>(null);

//   const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success', duration = 4000) => {
//     setNotification({ id: Date.now(), message, type });
//     setTimeout(() => setNotification(null), duration);
//   };
//   const queryClient = new QueryClient();
//   // Load data functions
//   const loadDomains = async () => {
//     setLoadingDomains(true);
//     try {
//       const domainsData = await domainService.getAllDomains();
//       setDomains(domainsData);
//     } catch (error) {
//       console.error('Failed to load domains:', error);
//       showNotification('Failed to load domains from server', 'error');
//     } finally {
//       setLoadingDomains(false);
//     }
//   };
//   const navigate = (newPage: string) => {
//     setPage(newPage);
//     setActiveFeature(null);
//   };

//   // Store navigate function in window object so any component can access it
//   useEffect(() => {
//     (window as any).appNavigate = navigate;
//     return () => {
//       delete (window as any).appNavigate;
//     };
//   }, []);
//   const loadFeatures = async () => {
//     setLoadingFeatures(true);
//     try {
//       const featuresData = await featuresService.getAllFeatures();
//       setFeatures(featuresData);
//     } catch (error) {
//       console.error('Failed to load features:', error);
//       showNotification('Failed to load features from server', 'error');
//     } finally {
//       setLoadingFeatures(false);
//     }
//   };

//   const loadTags = async () => {
//     setLoadingTags(true);
//     try {
//       const tagsData = await tagsService.getAllTags();
//       setTags(tagsData);
//     } catch (error) {
//       console.error('Failed to load tags:', error);
//       showNotification('Failed to load tags from server', 'error');
//     } finally {
//       setLoadingTags(false);
//     }
//   };

//   const loadDomainTypes = async () => {
//     setLoadingDomainTypes(true);
//     try {
//       const domainTypesData = await domainService.getDomainTypes();
//       const metadataData = await domainService.getDomainTypesMetadata();
//       setDomainTypes(domainTypesData);
//       setDomainTypesMetadata(metadataData);
//     } catch (error) {
//       console.error('Failed to load domain types:', error);
//       showNotification('Failed to load domain types from server', 'error');
//     } finally {
//       setLoadingDomainTypes(false);
//     }
//   };

//   const loadSys2Requirements = async (featureId: string) => {
//     try {
//       const requirements = await featuresService.getSYS2Requirements(featureId);
//       setSys2Requirements(requirements);
//     } catch (error) {
//       console.error('Failed to load SYS2 requirements:', error);
//       showNotification('Failed to load SYS2 requirements', 'error');
//     }
//   };

//   // Load initial data
//   useEffect(() => {
//     loadDomains();
//     loadDomainTypes();
//     loadFeatures();
//     loadTags();

//     // Handle URL hash-based routing for admin panel
//     const handleHashChange = () => {
//       const hash = window.location.hash.slice(1); // Remove the '#'
//       // More obscure URL pattern for admin access
//       if (hash === 'jira_sys_admin_portal' || hash === 'app-admin-jira') {
//         setPage('app-admin-jira');
//       }
//     };

//     // Check initial hash
//     handleHashChange();

//     // Listen for hash changes
//     window.addEventListener('hashchange', handleHashChange);

//     return () => window.removeEventListener('hashchange', handleHashChange);
//   }, []);


//   const renderPage = () => {
//     switch (page) {
//       case 'home':
//         return <HomePage navigate={navigate} domains={domains} domainTypes={domainTypes} />;
//       case 'domains':
//         return (
//           <DomainManagementPage
//             domains={domains}
//             setDomains={setDomains}
//             showNotification={showNotification}
//             loadingDomains={loadingDomains}
//             loadDomains={loadDomains}
//           />
//         );
//       case 'features':
//         return (
//           <FeaturesManagementPage
//             features={features}
//             setFeatures={setFeatures}
//             activeFeature={activeFeature}
//             setActiveFeature={setActiveFeature}
//             showNotification={showNotification}
//             loadingFeatures={loadingFeatures}
//             loadFeatures={loadFeatures}
//             domains={domains}
//             tags={tags}
//             sys2Requirements={sys2Requirements}
//             setSys2Requirements={setSys2Requirements}
//             loadSys2Requirements={loadSys2Requirements}
//           />
//         );
//       case 'tags':
//         return (
//           <TagsManagementPage
//             tags={tags}
//             setTags={setTags}
//             showNotification={showNotification}
//             loadingTags={loadingTags}
//             loadTags={loadTags}
//           />
//         );
//       case 'domain-testbed':
//         return <DomainTestbedPage />;
//       case 'domain-scope-gen':
//         return <DomainScopeGen />;
//       case 'enhanced-testbed':
//         return <EnhancedDomainTestbedPage />;
//       case 'sequence-generator':
//         return (
//           <QueryClientProvider client={queryClient}>
//             <GenerateSequencePage />
//           </QueryClientProvider>
//         )
//       case 'jira-processor':
//         return <JiraProcessorPage />;
//       case 'app-admin-jira':
//         return <JiraAdminPage />;
//       case 'status-tracker':
//         return <SessionStatusTrackerPage onBack={() => navigate('home')} />;
//       case 'component-domain-mapping':
//         return <ComponentDomainMappingPage />;

//       default:
//         return <HomePage navigate={navigate} domains={domains} domainTypes={domainTypes} />;
//     }
//   };

//   return (
//     <div className="bg-gray-900 text-gray-100 min-h-screen font-sans flex antialiased">
//       <Sidebar currentPage={page} navigate={navigate} />
//       <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gray-900/50">
//         {notification && (
//           <NotificationBanner
//             {...notification}
//             onClose={() => setNotification(null)}
//           />
//         )}
//         {renderPage()}
//       </main>
//     </div>
//   );
// };

// // Sidebar Component
// const Sidebar = ({ currentPage, navigate }: { currentPage: string; navigate: (page: string) => void }) => {
//   return (
//     <aside className="bg-gray-900 w-64 border-r border-gray-700 flex-col hidden md:flex">
//       <div className="p-4 border-b border-gray-700 flex items-center space-x-2 h-16">
//         <BrainCircuit className="text-cyan-400 h-8 w-8" />
//         <span className="text-xl font-bold">ReqGen v5</span>
//       </div>
//       <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
//         <NavItem
//           icon={Home}
//           label="Home"
//           isActive={currentPage === 'home'}
//           onClick={() => navigate('home')}
//         />
//         <div className="pt-4 mt-4 border-t border-gray-700 space-y-1">
//           <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Master Data</p>
//           <NavItem
//             icon={Layers}
//             label="Manage Domains"
//             isActive={currentPage === 'domains'}
//             onClick={() => navigate('domains')}
//           />
//           <NavItem
//             icon={Package}
//             label="Manage Features"
//             isActive={currentPage === 'features'}
//             onClick={() => navigate('features')}
//           />
//           <NavItem
//             icon={TagIcon}
//             label="Manage Tags"
//             isActive={currentPage === 'tags'}
//             onClick={() => navigate('tags')}
//           />
//           <NavItem
//             icon={TestTube2}
//             label="Domain Scope Generator"
//             isActive={currentPage === 'domain-scope-gen'}
//             onClick={() => navigate('domain-scope-gen')}
//           />
//           <NavItem
//             icon={BrainCircuit}
//             label="SWE.1 Generation"
//             isActive={currentPage === 'enhanced-testbed'}
//             onClick={() => navigate('enhanced-testbed')}
//           />
//           <NavItem
//             icon={Zap}
//             label="Generate Sequence"
//             isActive={currentPage === 'sequence-generator'}
//             onClick={() => navigate('sequence-generator')}
//           />
//           <NavItem
//             icon={FileText}
//             label="Jira Plugin"
//             isActive={currentPage === 'jira-processor'}
//             onClick={() => navigate('jira-processor')}
//           />
//         </div>
//       </nav>
//     </aside>
//   );
// };

// // Navigation Item Component
// const NavItem = ({
//   icon: Icon,
//   label,
//   isActive,
//   onClick
// }: {
//   icon?: React.ComponentType<any>;
//   label: string;
//   isActive: boolean;
//   onClick: () => void;
// }) => (
//   <button
//     onClick={onClick}
//     className={`w-full flex items-center p-2 rounded-lg text-sm transition-colors ${isActive
//       ? 'bg-cyan-500/20 text-cyan-400 font-semibold'
//       : 'hover:bg-gray-700/50 text-gray-300'
//       }`}
//   >
//     {Icon && <Icon className="h-4 w-4 mr-3 shrink-0" />}
//     <span className="truncate">{label}</span>
//   </button>
// );

// // Home Page Component
// const HomePage = ({ navigate, domains, domainTypes }: {
//   navigate: (page: string) => void;
//   domains: Domain[];
//   domainTypes: string[];
// }) => {
//   const [healthStatus, setHealthStatus] = useState<{
//     status: string;
//     ollama: { status: string; model?: string } | null;
//     database: { status: string } | null;
//   } | null>(null);
//   const [lastSession, setLastSession] = useState<{
//     session_id: string; session_name: string; status: string; epic_count: number; created_at: string | null;
//   } | null>(null);

//   useEffect(() => {
//     const fetchHealth = async () => {
//       try {
//         const res = await fetch('/api/v1/health');
//         const data = await res.json();
//         setHealthStatus({
//           status: data.status || 'unknown',
//           ollama: data.ollama || null,
//           database: data.database || null
//         });
//       } catch {
//         setHealthStatus({ status: 'offline', ollama: null, database: null });
//       }
//     };
//     const fetchLastSession = async () => {
//       try {
//         const res = await fetch('/api/v1/testbed/recent-sessions?limit=1');
//         const data = await res.json();
//         if (data.sessions && data.sessions.length > 0) {
//           setLastSession(data.sessions[0]);
//         }
//       } catch { /* ignore */ }
//     };
//     fetchHealth();
//     fetchLastSession();
//     const interval = setInterval(fetchHealth, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const ollamaOk = healthStatus?.ollama?.status === 'healthy';
//   const dbOk = healthStatus?.database?.status === 'healthy';

//   return (
//     <div className="animate-fade-in">
//       <div className="mb-8">
//         <h1 className="text-3xl md:text-4xl font-bold text-white">AI Powered Requirement Generation</h1>
//         <p className="text-lg text-gray-400 mt-1">Feature-Domain-Tag model for AOSP infotainment.</p>
//       </div>

//       {/* Analytics Dashboard */}
//       <div className="mb-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
//         {/* Domain Count */}
//         <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-xl p-4 hover:border-cyan-400/40 transition-all duration-300">
//           <div className="flex items-center gap-2 mb-2">
//             <Layers className="h-4 w-4 text-cyan-400" />
//             <span className="text-xs text-gray-400 uppercase tracking-wider">Domains</span>
//           </div>
//           <p className="text-2xl font-bold text-white">{domains.length}</p>
//           <p className="text-xs text-gray-500 mt-1">{domainTypes.length} types</p>
//         </div>

//         {/* Last Session */}
//         <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4 hover:border-purple-400/40 transition-all duration-300 cursor-pointer" onClick={() => lastSession && navigate('status-tracker')}>
//           <div className="flex items-center gap-2 mb-2">
//             <Activity className="h-4 w-4 text-purple-400" />
//             <span className="text-xs text-gray-400 uppercase tracking-wider">Last Session</span>
//           </div>
//           {lastSession ? (
//             <>
//               <p className="text-sm font-bold text-white truncate" title={lastSession.session_id}>{lastSession.session_id.substring(0, 8)}...</p>
//               <p className="text-xs text-gray-500 mt-1">
//                 {lastSession.status === 'completed' ? '✅' : lastSession.status === 'failed' ? '❌' : '⏳'} {lastSession.status}
//               </p>
//             </>
//           ) : (
//             <p className="text-sm text-gray-500">No sessions</p>
//           )}
//         </div>

//         {/* EPICs Count */}
//         <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-4 hover:border-amber-400/40 transition-all duration-300">
//           <div className="flex items-center gap-2 mb-2">
//             <Layers className="h-4 w-4 text-amber-400" />
//             <span className="text-xs text-gray-400 uppercase tracking-wider">EPICs</span>
//           </div>
//           <p className="text-2xl font-bold text-white">{lastSession?.epic_count ?? 0}</p>
//           <p className="text-xs text-gray-500 mt-1">in last session</p>
//         </div>

//         {/* Domain Types */}
//         <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-4 hover:border-emerald-400/40 transition-all duration-300">
//           <div className="flex items-center gap-2 mb-2">
//             <BarChart3 className="h-4 w-4 text-emerald-400" />
//             <span className="text-xs text-gray-400 uppercase tracking-wider">Types</span>
//           </div>
//           <p className="text-2xl font-bold text-white">{domainTypes.length}</p>
//         </div>

//         {/* Ollama Status */}
//         <div className={`bg-gradient-to-br ${ollamaOk ? 'from-green-500/10 to-green-600/5 border-green-500/20' : 'from-red-500/10 to-red-600/5 border-red-500/20'} border rounded-xl p-4 transition-all duration-300`}>
//           <div className="flex items-center gap-2 mb-2">
//             {ollamaOk ? <Wifi className="h-4 w-4 text-green-400" /> : <WifiOff className="h-4 w-4 text-red-400" />}
//             <span className="text-xs text-gray-400 uppercase tracking-wider">Ollama</span>
//           </div>
//           <p className={`text-sm font-bold ${ollamaOk ? 'text-green-400' : 'text-red-400'}`}>
//             {healthStatus ? (ollamaOk ? '🟢 Online' : '🔴 Offline') : '⏳ Checking...'}
//           </p>
//         </div>

//         {/* Database Status */}
//         <div className={`bg-gradient-to-br ${dbOk ? 'from-green-500/10 to-green-600/5 border-green-500/20' : 'from-red-500/10 to-red-600/5 border-red-500/20'} border rounded-xl p-4 transition-all duration-300`}>
//           <div className="flex items-center gap-2 mb-2">
//             <Database className={`h-4 w-4 ${dbOk ? 'text-green-400' : 'text-red-400'}`} />
//             <span className="text-xs text-gray-400 uppercase tracking-wider">Database</span>
//           </div>
//           <p className={`text-sm font-bold ${dbOk ? 'text-green-400' : 'text-red-400'}`}>
//             {healthStatus ? (dbOk ? '🟢 Online' : '🔴 Offline') : '⏳ Checking...'}
//           </p>
//         </div>
//       </div>

//       {/* Navigation Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         <HomeCard
//           icon={Layers}
//           title="Manage Domains"
//           description="Configure domain scopes with individual tables and enhanced metadata."
//           onClick={() => navigate('domains')}
//         />
//         <HomeCard
//           icon={Package}
//           title="Manage Features"
//           description="Organize SYS2 requirements by functional features and manage their lifecycle."
//           onClick={() => navigate('features')}
//         />
//         <HomeCard
//           icon={TagIcon}
//           title="Manage Tags"
//           description="Create and organize tags for categorizing requirements and improving searchability."
//           onClick={() => navigate('tags')}
//         />
//         <HomeCard
//           icon={TestTube2}
//           title="Domain Scope Generation"
//           description="Test the existing SWE.1 generation functionality with your domain files."
//           onClick={() => navigate('domain-scope-gen')}
//         />
//         <HomeCard
//           icon={BrainCircuit}
//           title="SWE.1 Generation"
//           description="EPIC 8: Multi-domain requirements generation with interface selection and hybrid RAG."
//           onClick={() => navigate('enhanced-testbed')}
//         />
//         <HomeCard
//           icon={Zap}
//           title="Enhanced Mermaid sequence Generator"
//           description="Generate Mermaid Sequence Diagram for each SWE1"
//           onClick={() => navigate('sequence-generator')}
//         />
//         <HomeCard
//           icon={Activity}
//           title="Session Status Tracker"
//           description="Track your SWE.1 generation progress using session ID."
//           onClick={() => navigate('status-tracker')}
//         />
//       </div>
//     </div>
//   );
// };

// // Home Card Component
// const HomeCard = ({
//   icon: Icon,
//   title,
//   description,
//   onClick
// }: {
//   icon: React.ComponentType<any>;
//   title: string;
//   description: string;
//   onClick: () => void;
// }) => (
//   <div
//     onClick={onClick}
//     className="bg-gray-800/70 border border-gray-700 rounded-xl shadow-lg backdrop-blur-sm hover:border-cyan-500 transition-colors duration-300 cursor-pointer group p-6"
//   >
//     <Icon className="h-10 w-10 text-cyan-400 mb-4" />
//     <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
//     <p className="text-gray-400 flex-grow">{description}</p>
//     <div className="mt-4 text-cyan-400 font-semibold flex items-center group-hover:translate-x-1 transition-transform">
//       Go to {title} <ChevronRight className="ml-1 h-4 w-4" />
//     </div>
//   </div>
// );

// // Enhanced Domain Management Page with Tabbed Interface (EPIC 6.5)
// const DomainManagementPage = ({
//   domains,
//   setDomains,
//   showNotification,
//   loadingDomains,
//   loadDomains
// }: any) => {
//   // Tab state
//   const [activeTab, setActiveTab] = useState<'types' | 'instances' | 'scope-builder' | 'component-mapping' | 'compare' | 'interfaces' | 'health'>('types');

//   // Domain Types state
//   const [domainTypes, setDomainTypes] = useState<string[]>([]);
//   const [domainTypesMetadata, setDomainTypesMetadata] = useState<Record<string, any>>({});
//   const [loadingDomainTypes, setLoadingDomainTypes] = useState(false);
//   const [isCreatingType, setIsCreatingType] = useState(false);
//   const [newDomainType, setNewDomainType] = useState({
//     domain_type: '',
//     description: '',
//     features: [] as string[],
//     metadata: {}
//   });
//   const [editingDomainType, setEditingDomainType] = useState<string | null>(null);

//   // Domain Instances state
//   const [isEditing, setIsEditing] = useState<string | null>(null);
//   const [editData, setEditData] = useState<any>({});
//   const [isCreating, setIsCreating] = useState(false);
//   const [selectedDomainType, setSelectedDomainType] = useState('');
//   const [newDomainData, setNewDomainData] = useState({
//     name: '',
//     description: '',
//     configurations: '',
//     special_input: ''
//   });

//   // Load domain types
//   const loadDomainTypes = async () => {
//     setLoadingDomainTypes(true);
//     try {
//       const types = await domainService.getDomainTypes();
//       const metadata = await domainService.getDomainTypesMetadata();
//       setDomainTypes(types);
//       setDomainTypesMetadata(metadata);
//     } catch (error) {
//       console.error('Failed to load domain types:', error);
//       showNotification('Failed to load domain types', 'error');
//     } finally {
//       setLoadingDomainTypes(false);
//     }
//   };

//   // Load domain types on component mount
//   useEffect(() => {
//     loadDomainTypes();
//   }, []);

//   // Domain Type Management Functions
//   const createDomainType = async () => {
//     if (!newDomainType.domain_type.trim()) {
//       showNotification('Please enter a domain type name', 'error');
//       return;
//     }

//     // Validate domain type name
//     const validation = domainService.validateDomainTypeName(newDomainType.domain_type);
//     if (!validation.valid) {
//       showNotification(validation.error || 'Invalid domain type name', 'error');
//       return;
//     }

//     try {
//       await domainService.createDomainType({
//         domain_type: newDomainType.domain_type.toLowerCase(),
//         description: newDomainType.description || `${newDomainType.domain_type} domain type`,
//         features: newDomainType.features,
//         metadata: newDomainType.metadata
//       });

//       await loadDomainTypes();
//       setIsCreatingType(false);
//       setNewDomainType({ domain_type: '', description: '', features: [], metadata: {} });
//       showNotification('Domain type created successfully!', 'success');
//     } catch (error) {
//       showNotification('Failed to create domain type', 'error');
//     }
//   };

//   const deleteDomainType = async (domainType: string) => {
//     if (!confirm(`Are you sure you want to delete the "${domainType}" domain type?\n\nThis will remove the domain type and may affect existing instances.\n\nThis action cannot be undone.`)) {
//       return;
//     }

//     try {
//       await domainService.deleteDomainType(domainType);
//       await loadDomainTypes();
//       showNotification(`${domainType} domain type deleted successfully!`, 'success');
//     } catch (error) {
//       showNotification('Failed to delete domain type', 'error');
//     }
//   };

//   // Domain Instance Management Functions
//   const existingDomainTypes = domains.map((d: Domain) => d.domain_type);
//   const availableDomainTypes = domainTypes.filter(type => type);

//   const startEdit = (domain: Domain) => {
//     setIsEditing(domain.id);
//     setEditData({
//       name: domain.name,
//       description: domain.description,
//       configurations: domain.configurations,
//       special_input: domain.special_input
//     });
//   };

//   const saveEdit = async (domainId: string) => {
//     try {
//       const response = await domainService.updateDomain(domainId, editData);
//       if (response) {
//         setDomains(domains.map((d: Domain) => d.id === domainId ? response : d));
//         setIsEditing(null);
//         showNotification('Domain updated successfully!', 'success');
//       }
//     } catch (error) {
//       showNotification('Failed to update domain', 'error');
//     }
//   };

//   const generateEmbedding = async (domainId: string) => {
//     try {
//       // Find the domain to check if it already has embeddings
//       const domain = domains.find(d => d.id === domainId);
//       let forceRegenerate = false;

//       if (domain?.embedding_exists) {
//         const shouldRegenerate = window.confirm(
//           'This domain already has embeddings. Do you want to regenerate them?\n\n' +
//           'This will replace the existing embeddings with new ones.'
//         );
//         if (!shouldRegenerate) return;
//         forceRegenerate = true;
//       }

//       await domainService.generateEmbedding(domainId, 'ollama', undefined, forceRegenerate);
//       loadDomains();
//       showNotification(
//         forceRegenerate ? 'Embedding regeneration started' : 'Embedding generation started',
//         'success'
//       );
//     } catch (error) {
//       showNotification('Failed to generate embedding', 'error');
//     }
//   };

//   const createDomain = async () => {
//     if (!selectedDomainType || !newDomainData.name.trim()) {
//       showNotification('Please select domain type and enter name', 'error');
//       return;
//     }

//     try {
//       const domainData = {
//         name: newDomainData.name.trim(),
//         description: newDomainData.description || `${selectedDomainType.charAt(0).toUpperCase() + selectedDomainType.slice(1)} domain management`,
//         configurations: newDomainData.configurations || 'NA',
//         special_input: newDomainData.special_input || 'NA'
//       };

//       const newDomain = await domainService.createOrUpdateDomain(selectedDomainType, domainData);
//       setDomains([...domains, newDomain]);
//       setIsCreating(false);
//       setSelectedDomainType('');
//       setNewDomainData({ name: '', description: '', configurations: '', special_input: '' });
//       showNotification(`${selectedDomainType} domain created successfully!`, 'success');
//     } catch (error: any) {
//       console.error('Domain creation error:', error);

//       // Handle validation errors from backend
//       if (error.response?.status === 422 && error.response?.data?.detail) {
//         const validationErrors = error.response.data.detail;
//         if (Array.isArray(validationErrors)) {
//           const errorMessages = validationErrors.map((err: any) => {
//             if (err.loc && err.msg) {
//               const field = err.loc[err.loc.length - 1];
//               return `${field}: ${err.msg}`;
//             }
//             return err.msg || 'Validation error';
//           });
//           showNotification(`Validation error: ${errorMessages.join(', ')}`, 'error');
//         } else {
//           showNotification('Invalid input data', 'error');
//         }
//       } else {
//         showNotification('Failed to create domain', 'error');
//       }
//     }
//   };

//   const deleteDomain = async (domainId: string, domainName: string) => {
//     if (!confirm(`Are you sure you want to delete the "${domainName}" domain?\n\nThis will delete all associated data.\n\nThis action cannot be undone.`)) {
//       return;
//     }

//     try {
//       await domainService.deleteDomain(domainId);
//       setDomains(domains.filter((d: Domain) => d.id !== domainId));
//       showNotification(`${domainName} domain deleted successfully!`, 'success');
//     } catch (error) {
//       showNotification('Failed to delete domain', 'error');
//     }
//   };

//   function updateDomain(id: string | null, arg1: { description: string; }) {
//     throw new Error('Function not implemented.');
//   }

//   return (
//     <div className="animate-fade-in">
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Unified Domain Management</h1>
//           <p className="text-lg text-gray-400">Manage domain types and domain instances in one unified interface.</p>
//         </div>
//       </div>

//       {/* Tabbed Interface */}
//       <div className="mb-6">
//         <div className="border-b border-gray-700">
//           <nav className="-mb-px flex space-x-8">
//             <button
//               onClick={() => setActiveTab('types')}
//               className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'types'
//                 ? 'border-cyan-400 text-cyan-400'
//                 : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
//                 }`}
//             >
//               <Server className="inline-block w-4 h-4 mr-2" />
//               Domain Types ({domainTypes.length})
//             </button>
//             <button
//               onClick={() => setActiveTab('instances')}
//               className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'instances'
//                 ? 'border-cyan-400 text-cyan-400'
//                 : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
//                 }`}
//             >
//               <Layers className="inline-block w-4 h-4 mr-2" />
//               Domain Instances ({domains.length})
//             </button>
//             <button
//               onClick={() => setActiveTab('component-mapping')}
//               className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'component-mapping'
//                 ? 'border-cyan-400 text-cyan-400'
//                 : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
//                 }`}
//             >
//               <LinkIcon className="inline-block w-4 h-4 mr-2" />
//               Component Mappings
//             </button>

//             {/* <button
//               onClick={() => setActiveTab('scope-builder')}
//               className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'scope-builder'
//                 ? 'border-cyan-400 text-cyan-400'
//                 : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
//                 }`}
//             >
//               <BrainCircuit className="inline-block w-4 h-4 mr-2" />
//               Scope Builder
//             </button> */}
//             <button
//               onClick={() => setActiveTab('interfaces')}
//               className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'interfaces'
//                 ? 'border-cyan-400 text-cyan-400'
//                 : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
//                 }`}


//             >
//               <FileText className="inline-block w-4 h-4 mr-2" />
//               Interface Specifications
//             </button>
//             <button
//               onClick={() => setActiveTab('compare')}
//               className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'compare'
//                 ? 'border-cyan-400 text-cyan-400'
//                 : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
//                 }`}
//             >
//               <ArrowLeftRight className="inline-block w-4 h-4 mr-2" />
//               Compare Domains
//             </button>
//             <button
//               onClick={() => setActiveTab('health')}
//               className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'health'
//                 ? 'border-cyan-400 text-cyan-400'
//                 : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
//                 }`}
//             >
//               <Shield className="inline-block w-4 h-4 mr-2" />
//               Health
//             </button>
//           </nav>
//         </div>
//       </div>
//       {activeTab === 'component-mapping' && (
//         <ComponentMappingTab
//           domainTypes={domainTypes}
//           showNotification={showNotification}
//         />
//       )}
//       {/* Domain Types Tab */}
//       {activeTab === 'types' && (
//         <div>
//           <div className="flex justify-between items-center mb-6">
//             <div>
//               <h2 className="text-xl font-semibold text-white">Domain Types Management</h2>
//               <p className="text-gray-400">Create and manage domain types for dynamic domain system.</p>
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={loadDomainTypes}
//                 disabled={loadingDomainTypes}
//                 className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
//               >
//                 <RefreshCw className={`h-4 w-4 ${loadingDomainTypes ? 'animate-spin' : ''}`} />
//                 Refresh
//               </button>
//               <button
//                 onClick={() => setIsCreatingType(true)}
//                 className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
//               >
//                 <Plus className="h-4 w-4" />
//                 Create Domain Type
//               </button>
//             </div>
//           </div>

//           {/* Create Domain Type Form */}
//           {isCreatingType && (
//             <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6 mb-6">
//               <h3 className="text-lg font-semibold text-white mb-4">Create New Domain Type</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Domain Type Name</label>
//                   <input
//                     type="text"
//                     value={newDomainType.domain_type}
//                     onChange={(e) => setNewDomainType({ ...newDomainType, domain_type: e.target.value })}
//                     className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
//                     placeholder="e.g., bluetooth, audio, hmi"
//                   />
//                   <p className="text-xs text-gray-500 mt-1">Must start with a letter, lowercase letters, numbers, and underscores only</p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
//                   <input
//                     type="text"
//                     value={newDomainType.description}
//                     onChange={(e) => setNewDomainType({ ...newDomainType, description: e.target.value })}
//                     className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
//                     placeholder="Brief description of the domain type"
//                   />
//                 </div>
//               </div>
//               <div className="flex gap-2 mt-4">
//                 <button
//                   onClick={createDomainType}
//                   className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
//                 >
//                   Create Domain Type
//                 </button>
//                 <button
//                   onClick={() => {
//                     setIsCreatingType(false);
//                     setNewDomainType({ domain_type: '', description: '', features: [], metadata: {} });
//                   }}
//                   className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Domain Types List */}
//           {loadingDomainTypes ? (
//             <div className="flex items-center justify-center py-12">
//               <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
//               <span className="ml-3 text-lg">Loading domain types...</span>
//             </div>
//           ) : (
//             <div className="grid gap-4">
//               {domainTypes.map((domainType) => {
//                 const metadata = domainTypesMetadata[domainType] || {};
//                 const instanceCount = domains.filter((d: Domain) => d.domain_type === domainType).length;

//                 return (
//                   <div key={domainType} className="bg-gray-800/70 border border-gray-700 rounded-xl p-6 hover:border-cyan-500 transition-colors">
//                     <div className="flex justify-between items-start">
//                       <div className="flex-1">
//                         <h3 className="text-xl font-bold text-cyan-400 mb-2">{domainType}</h3>
//                         <p className="text-gray-300 mb-2">{metadata.description || 'No description'}</p>
//                         <div className="flex items-center gap-4 text-sm text-gray-500">
//                           <span>Instances: <span className="text-cyan-400">{instanceCount}</span></span>
//                           <span>Features: <span className="text-cyan-400">{metadata.features?.length || 0}</span></span>
//                         </div>
//                       </div>
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => deleteDomainType(domainType)}
//                           className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
//                           title="Delete Domain Type"
//                           disabled={instanceCount > 0}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//               {domainTypes.length === 0 && (
//                 <div className="text-center py-12 text-gray-400">
//                   <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                   <p>No domain types found. Create your first domain type to get started.</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Domain Instances Tab */}
//       {activeTab === 'instances' && (
//         <div>
//           <div className="flex justify-between items-center mb-6">
//             <div>
//               <h2 className="text-xl font-semibold text-white">Domain Instances Management</h2>
//               <p className="text-gray-400">Create and manage domain instances from available domain types.</p>
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={loadDomains}
//                 disabled={loadingDomains}
//                 className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
//               >
//                 <RefreshCw className={`h-4 w-4 ${loadingDomains ? 'animate-spin' : ''}`} />
//                 Refresh
//               </button>
//               {availableDomainTypes.length > 0 && (
//                 <button
//                   onClick={() => setIsCreating(true)}
//                   className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
//                 >
//                   <Plus className="h-4 w-4" />
//                   Create Domain Instance
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Create Domain Instance Form */}
//           {isCreating && (
//             <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6 mb-6">
//               <h3 className="text-lg font-semibold text-white mb-4">Create New Domain Instance</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Domain Type</label>
//                   <select
//                     value={selectedDomainType}
//                     onChange={(e) => {
//                       setSelectedDomainType(e.target.value);
//                       setNewDomainData({ ...newDomainData, name: e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1) });
//                     }}
//                     className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
//                   >
//                     <option value="">Select domain type...</option>
//                     {availableDomainTypes.map(type => (
//                       <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Existing Instances List - Shows when domain type is selected */}
//                 {selectedDomainType && (() => {
//                   const instancesOfSelectedType = domains.filter((d: Domain) => d.domain_type === selectedDomainType);

//                   if (instancesOfSelectedType.length === 0) return null;

//                   return (
//                     <div className="md:col-span-2 bg-gray-900/50 border border-gray-600 rounded-lg p-4">
//                       <div className="flex items-center gap-2 mb-3">
//                         <Layers className="h-4 w-4 text-cyan-400" />
//                         <h4 className="text-sm font-semibold text-gray-300">
//                           Existing {selectedDomainType} instances ({instancesOfSelectedType.length})
//                         </h4>
//                       </div>
//                       <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
//                         {instancesOfSelectedType.map((domain: Domain) => (
//                           <span
//                             key={domain.id}
//                             className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded-md text-sm"
//                           >
//                             {domain.name}
//                           </span>
//                         ))}
//                       </div>
//                       <p className="text-xs text-gray-500 mt-2">
//                         💡 Choose a unique name to avoid confusion
//                       </p>
//                     </div>
//                   );
//                 })()}

//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">
//                     Name <span className="text-red-400">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={newDomainData.name}
//                     onChange={(e) => setNewDomainData({ ...newDomainData, name: e.target.value })}
//                     className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white ${newDomainData.name.trim() ? 'border-gray-600' : 'border-red-500'
//                       }`}
//                     placeholder="Domain instance name"
//                     required
//                   />
//                   {!newDomainData.name.trim() && (
//                     <p className="text-red-400 text-xs mt-1">Name is required</p>
//                   )}
//                 </div>
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
//                   <textarea
//                     value={newDomainData.description}
//                     onChange={(e) => setNewDomainData({ ...newDomainData, description: e.target.value })}
//                     className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white h-20"
//                     placeholder="Domain instance description"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Configurations</label>
//                   <input
//                     type="text"
//                     value={newDomainData.configurations}
//                     onChange={(e) => setNewDomainData({ ...newDomainData, configurations: e.target.value })}
//                     className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
//                     placeholder="JSON configuration (optional)"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Special Input</label>
//                   <input
//                     type="text"
//                     value={newDomainData.special_input}
//                     onChange={(e) => setNewDomainData({ ...newDomainData, special_input: e.target.value })}
//                     className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
//                     placeholder="Special input requirements (optional)"
//                   />
//                 </div>
//               </div>
//               <div className="flex gap-2 mt-4">
//                 <button
//                   onClick={createDomain}
//                   disabled={!selectedDomainType || !newDomainData.name.trim()}
//                   className={`px-4 py-2 rounded-lg text-white ${selectedDomainType && newDomainData.name.trim()
//                     ? 'bg-green-600 hover:bg-green-700'
//                     : 'bg-gray-600 cursor-not-allowed'
//                     }`}
//                 >
//                   Create Domain Instance
//                 </button>
//                 <button
//                   onClick={() => {
//                     setIsCreating(false);
//                     setSelectedDomainType('');
//                     setNewDomainData({ name: '', description: '', configurations: '', special_input: '' });
//                   }}
//                   className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Domain Instances List */}
//           {loadingDomains ? (
//             <div className="flex items-center justify-center py-12">
//               <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
//               <span className="ml-3 text-lg">Loading domains...</span>
//             </div>
//           ) : (
//             <div className="grid gap-6">
//               {domains.filter((domain: Domain) => domain.id !== null).map((domain: Domain) => (
//                 <div key={domain.id} className="bg-gray-800/70 border border-gray-700 rounded-xl p-6 hover:border-cyan-500 transition-colors">
//                   <div className="flex justify-between items-start mb-4">
//                     <div className="flex-1">
//                       {isEditing === domain.id ? (
//                         <div className="space-y-4">
//                           <input
//                             type="text"
//                             value={editData.name}
//                             onChange={(e) => setEditData({ ...editData, name: e.target.value })}
//                             className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
//                             placeholder="Domain name"
//                           />
//                           <DomainDescriptionDisplay
//                             description={editData.description}
//                             isEditing={true}
//                             onEdit={() => { }}
//                             onSave={(newDescription) => setEditData({ ...editData, description: newDescription })}
//                             onCancel={() => { }}
//                           />
//                           <input
//                             type="text"
//                             value={editData.configurations}
//                             onChange={(e) => setEditData({ ...editData, configurations: e.target.value })}
//                             className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
//                             placeholder="Configurations (JSON)"
//                           />
//                           <input
//                             type="text"
//                             value={editData.special_input}
//                             onChange={(e) => setEditData({ ...editData, special_input: e.target.value })}
//                             className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
//                             placeholder="Special input requirements"
//                           />
//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => saveEdit(domain.id)}
//                               className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
//                             >
//                               <CheckCircle className="h-4 w-4 inline mr-1" />
//                               Save
//                             </button>
//                             <button
//                               onClick={() => setIsEditing(null)}
//                               className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
//                             >
//                               Cancel
//                             </button>
//                           </div>
//                         </div>
//                       ) : (
//                         <>
//                           <h3 className="text-xl font-bold text-cyan-400 mb-2">{domain.name}</h3>
//                           <DomainDescriptionDisplay
//                             description={domain.description}
//                             isEditing={false}
//                             onEdit={() => startEdit(domain)}
//                             onSave={(newDescription) => {
//                               updateDomain(domain.id, { description: newDescription });
//                             }}
//                             onCancel={() => { }}
//                           />
//                           <div className="flex items-center gap-4 text-sm text-gray-500">
//                             <span>Type: <span className="text-cyan-400">{domain.domain_type}</span></span>
//                             <span>Table: <span className="text-cyan-400">{domain.table_name}</span></span>
//                             <span className={`px-2 py-1 rounded ${domain.embedding_exists ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
//                               {domain.embedding_exists ? 'Embeddings Ready' : 'No Embeddings'}
//                             </span>
//                           </div>
//                         </>
//                       )}
//                     </div>

//                     {isEditing !== domain.id && (
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => startEdit(domain)}
//                           className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
//                           title="Edit Domain"
//                         >
//                           <Edit className="h-4 w-4" />
//                         </button>
//                         <button
//                           onClick={() => generateEmbedding(domain.id)}
//                           className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg"
//                           title="Generate Embedding"
//                         >
//                           <BrainCircuit className="h-4 w-4" />
//                         </button>
//                         <button
//                           onClick={() => deleteDomain(domain.id, domain.name)}
//                           className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
//                           title="Delete Domain"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </button>
//                       </div>
//                     )}
//                   </div>

//                   {domain.supported_features && (
//                     <div className="mb-4">
//                       <p className="text-sm font-medium text-gray-300 mb-2">Supported Features ({domain.supported_features.length}):</p>
//                       <div className="flex flex-wrap gap-2">
//                         {domain.supported_features.map((feature, idx) => (
//                           <span key={idx} className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-xs">
//                             {feature}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {domain.configurations && domain.configurations !== 'NA' && (
//                     <div>
//                       <p className="text-sm font-medium text-gray-300 mb-2">Configuration:</p>
//                       <pre className="bg-gray-900/50 p-3 rounded text-xs text-gray-300 overflow-x-auto">
//                         {domain.configurations}
//                       </pre>
//                     </div>
//                   )}
//                 </div>
//               ))}
//               {domains.length === 0 && (
//                 <div className="text-center py-12 text-gray-400">
//                   <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                   <p>No domain instances found. Create your first domain instance to get started.</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Scope Builder Tab */}
//       {activeTab === 'scope-builder' && (
//         <ScopeBuilderTab
//           domains={domainTypes}
//           showNotification={showNotification}
//         />
//       )}

//       {/* Interface Specifications Tab */}
//       {activeTab === 'interfaces' && (
//         <EnhancedInterfaceSpecificationsTab
//           domains={domains}
//           showNotification={showNotification}
//         />
//       )}

//       {/* Domain Comparison Tab */}
//       {activeTab === 'compare' && (
//         <DomainComparisonTab domains={domains} />
//       )}

//       {/* Domain Health Dashboard */}
//       {activeTab === 'health' && (
//         <DomainHealthDashboard domains={domains} />
//       )}
//     </div>
//   );
// };

// // Scope Builder Tab Component
// const ScopeBuilderTab = ({ domains, showNotification }: {
//   domains: string[];
//   showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
// }) => {
//   const [selectedDomain, setSelectedDomain] = useState('');
//   const [rawScope, setRawScope] = useState('');
//   const [processing, setProcessing] = useState(false);
//   const [processedResult, setProcessedResult] = useState<any>(null);
//   const [showTemplate, setShowTemplate] = useState(false);

//   // AI prompt editing state
//   const [showAIPromptEditor, setShowAIPromptEditor] = useState(false);
//   const [aiPrompt, setAIPrompt] = useState(`You are an expert technical analyst specializing in automotive software architecture and domain scope analysis.

// Your task is to analyze and structure raw domain scope documents into a standardized format with clear sections and comprehensive coverage.

// For each domain scope document, create:
// 1. **Executive Summary**: High-level overview and purpose
// 2. **Domain Boundaries**: Clear definitions of what's included/excluded
// 3. **Stakeholder Requirements**: Key stakeholder needs and constraints
// 4. **Technical Architecture**: System components and interactions
// 5. **Interface Specifications**: External and internal interfaces
// 6. **Implementation Guidelines**: Development and deployment considerations

// Ensure the output is technically accurate, comprehensive, and follows automotive software development standards.`);

//   const handleProcessScope = async () => {
//     if (!selectedDomain.trim()) {
//       showNotification('Please select a domain', 'error');
//       return;
//     }

//     if (!rawScope.trim()) {
//       showNotification('Please enter scope document content', 'error');
//       return;
//     }

//     setProcessing(true);
//     setProcessedResult(null); // Clear previous results

//     try {
//       // Import the service dynamically to avoid import issues
//       const { scopeBuilderService } = await import('@/services');

//       // Use the new real-time progress method
//       const result = await scopeBuilderService.processScopeDocumentWithProgress(
//         {
//           raw_scope: rawScope,
//           domain_name: selectedDomain,
//           processing_options: {
//             custom_ai_prompt: aiPrompt.trim() || undefined
//           }
//         },
//         // Progress callback - updates UI in real-time
//         (progress) => {
//           setProcessedResult(progress);
//         }
//       );

//       setProcessedResult(result);

//       if (result.success) {
//         showNotification(
//           `Scope processing completed successfully for ${selectedDomain}!`,
//           'success'
//         );
//       } else {
//         showNotification(
//           `Scope processing failed: ${result.errors.join(', ')}`,
//           'error'
//         );
//       }
//     } catch (error) {
//       console.error('Scope processing error:', error);
//       showNotification(
//         `Failed to process scope: ${error instanceof Error ? error.message : 'Unknown error'}`,
//         'error'
//       );
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleDownload = async () => {
//     if (!processedResult?.template_content) {
//       showNotification('No template content to download', 'error');
//       return;
//     }

//     try {
//       const { scopeBuilderService } = await import('@/services');
//       await scopeBuilderService.downloadScopeTemplate(
//         selectedDomain,
//         processedResult.template_content
//       );
//       showNotification('Template downloaded successfully!', 'success');
//     } catch (error) {
//       console.error('Download error:', error);
//       showNotification('Failed to download template', 'error');
//     }
//   };

//   const clearForm = () => {
//     setSelectedDomain('');
//     setRawScope('');
//     setProcessedResult(null);
//     setShowTemplate(false);
//     setShowAIPromptEditor(false);
//     // Reset AI prompt to default
//     setAIPrompt(`You are an expert technical analyst specializing in automotive software architecture and domain scope analysis.

// Your task is to analyze and structure raw domain scope documents into a standardized format with clear sections and comprehensive coverage.

// For each domain scope document, create:
// 1. **Executive Summary**: High-level overview and purpose
// 2. **Domain Boundaries**: Clear definitions of what's included/excluded
// 3. **Stakeholder Requirements**: Key stakeholder needs and constraints
// 4. **Technical Architecture**: System components and interactions
// 5. **Interface Specifications**: External and internal interfaces
// 6. **Implementation Guidelines**: Development and deployment considerations

// Ensure the output is technically accurate, comprehensive, and follows automotive software development standards.`);
//   };

//   return (
//     // <div>
//     //   <div className="flex justify-between items-center mb-6">
//     //     <div>
//     //       <h2 className="text-xl font-semibold text-white">AI-Powered Scope Builder</h2>
//     //       <p className="text-gray-400">Convert raw scope documents into standardized domain scope templates using AI processing.</p>
//     //     </div>
//     //     <div className="flex gap-2">
//     //       <button
//     //         onClick={clearForm}
//     //         className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
//     //       >
//     //         <RefreshCw className="h-4 w-4" />
//     //         Clear
//     //       </button>
//     //       {processedResult?.template_content && (
//     //         <button
//     //           onClick={handleDownload}
//     //           className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
//     //         >
//     //           <Download className="h-4 w-4" />
//     //           Download Generated Scope
//     //         </button>
//     //       )}
//     //     </div>
//     //   </div>

//     //   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//     //     {/* Input Section */}
//     //     <div className="space-y-6">
//     //       <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6">
//     //         <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
//     //           <BrainCircuit className="h-5 w-5 mr-2" />
//     //           Scope Document Input
//     //         </h3>

//     //         <div className="space-y-4">
//     //           <div>
//     //             <label className="block text-sm font-medium text-gray-300 mb-2">
//     //               Target Domain
//     //             </label>
//     //             <select
//     //               value={selectedDomain}
//     //               onChange={(e) => setSelectedDomain(e.target.value)}
//     //               className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
//     //               disabled={processing}
//     //             >
//     //               <option value="">Select domain...</option>
//     //               {domains.map(domain => (
//     //                 <option key={domain} value={domain}>{domain}</option>
//     //               ))}
//     //             </select>
//     //           </div>

//     //           <div>
//     //             <label className="block text-sm font-medium text-gray-300 mb-2">
//     //               Raw Scope Document
//     //             </label>
//     //             <div className="border border-gray-600 rounded-lg">
//     //               <button
//     //                 onClick={() => setShowAIPromptEditor(!showAIPromptEditor)}
//     //                 className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-between text-left transition-colors"
//     //                 disabled={processing}
//     //               >
//     //                 <div className="flex items-center gap-2">
//     //                   <BrainCircuit className="w-5 h-5 text-purple-400" />
//     //                   <span className="font-medium text-gray-300">AI Scope Processing Prompt</span>
//     //                   <span className="text-xs text-gray-500">(Click to customize)</span>
//     //                 </div>
//     //                 <span className="text-gray-400">
//     //                   {showAIPromptEditor ? '▼' : '▶'}
//     //                 </span>
//     //               </button>

//     //               {showAIPromptEditor && (
//     //                 <div className="p-4 border-t border-gray-600">
//     //                   <div className="space-y-3">
//     //                     <div className="flex items-center gap-2 text-sm text-gray-400">
//     //                       <span>🎯 Main AI Model:</span>
//     //                       <code className="px-2 py-1 bg-gray-800 rounded text-yellow-400">codellama:34b</code>
//     //                     </div>
//     //                     <label className="block text-sm font-medium text-gray-300">
//     //                       Custom AI Prompt for Scope Document Processing:
//     //                     </label>
//     //                     <textarea
//     //                       value={aiPrompt}
//     //                       onChange={(e) => setAIPrompt(e.target.value)}
//     //                       placeholder="Enter your custom AI prompt for scope document analysis and structuring..."
//     //                       rows={8}
//     //                       className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-vertical placeholder-gray-400 font-mono text-sm"
//     //                       disabled={processing}
//     //                     />
//     //                     <div className="flex items-center gap-2 text-xs text-gray-500">
//     //                       <span>💡 Tip: The prompt will be used to analyze and structure your raw scope document</span>
//     //                     </div>
//     //                   </div>
//     //                 </div>
//     //               )}
//     //             </div>

//     //             <button
//     //               onClick={handleProcessScope}
//     //               disabled={processing || !selectedDomain || !rawScope.trim()}
//     //               className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors font-medium"
//     //             >
//     //               {processing ? (
//     //                 <>
//     //                   <RefreshCw className="h-4 w-4 animate-spin" />
//     //                   Processing with AI...
//     //                 </>
//     //               ) : (
//     //                 <>
//     //                   <BrainCircuit className="h-4 w-4" />
//     //                   Process Scope Document
//     //                 </>
//     //               )}
//     //             </button>
//     //           </div>
//     //         </div>
//     //       </div>

//     //       {/* Results Section */}
//     //       <div className="space-y-6">
//     //         {processedResult ? (
//     //           <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6">
//     //             <div className="flex items-center justify-between mb-4">
//     //               <h3 className="text-lg font-semibold text-white flex items-center">
//     //                 <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
//     //                 Processing Results
//     //               </h3>
//     //               <button
//     //                 onClick={() => setShowTemplate(!showTemplate)}
//     //                 className="text-cyan-400 hover:text-cyan-300 text-sm"
//     //               >
//     //                 {showTemplate ? 'Hide' : 'Show'} Template
//     //               </button>
//     //             </div>

//     //             <div className="space-y-4">
//     //               {/* Progress Bar */}
//     //               <div className="mb-4">
//     //                 <div className="flex items-center justify-between mb-2">
//     //                   <p className="text-sm text-gray-400">Overall Progress</p>
//     //                   <span className="text-sm text-cyan-400 font-medium">
//     //                     {processedResult.progress_percentage || 0}%
//     //                   </span>
//     //                 </div>
//     //                 <div className="w-full bg-gray-700 rounded-full h-2">
//     //                   <div
//     //                     className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
//     //                     style={{ width: `${processedResult.progress_percentage || 0}%` }}
//     //                   ></div>
//     //                 </div>
//     //               </div>

//     //               {/* Current Stage */}
//     //               {processedResult.current_stage && processedResult.current_stage !== 'completed' && (
//     //                 <div className="mb-4">
//     //                   <p className="text-sm text-gray-400 mb-1">Current Stage</p>
//     //                   <div className="flex items-center space-x-2">
//     //                     <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
//     //                     <span className="text-sm text-white capitalize">
//     //                       {processedResult.current_stage.replace('_', ' ')}
//     //                     </span>
//     //                   </div>
//     //                   {processedResult.current_stage_description && (
//     //                     <p className="text-xs text-gray-500 ml-6 mt-1">
//     //                       {processedResult.current_stage_description}
//     //                     </p>
//     //                   )}
//     //                 </div>
//     //               )}

//     //               <div className="grid grid-cols-2 gap-4 mb-4">
//     //                 <div>
//     //                   <p className="text-sm text-gray-400">Status</p>
//     //                   <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${processedResult.success || processedResult.status === 'completed'
//     //                     ? 'bg-green-500/50 text-green-200'
//     //                     : processedResult.status === 'processing'
//     //                       ? 'bg-blue-500/50 text-blue-200'
//     //                       : 'bg-red-500/50 text-red-200'
//     //                     }`}>
//     //                     {processedResult.status}
//     //                   </span>
//     //                 </div>
//     //                 <div>
//     //                   <p className="text-sm text-gray-400">Stages Completed</p>
//     //                   <p className="text-sm text-white">{processedResult.stages_completed?.length || 0}/5</p>
//     //                 </div>
//     //               </div>

//     //               {/* Detailed Stage Progress */}
//     //               <div>
//     //                 <p className="text-sm text-gray-400 mb-3">Processing Stages</p>
//     //                 <div className="space-y-2">
//     //                   {processedResult.stage_progress ?
//     //                     Object.entries(processedResult.stage_progress).map(([stageKey, stageData]: [string, any]) => (
//     //                       <div key={stageKey} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
//     //                         <div className="flex items-center space-x-2">
//     //                           {stageData.status === 'completed' ? (
//     //                             <CheckCircle className="h-4 w-4 text-green-400" />
//     //                           ) : stageData.status === 'in_progress' ? (
//     //                             <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
//     //                           ) : stageData.status === 'failed' ? (
//     //                             <AlertTriangle className="h-4 w-4 text-red-400" />
//     //                           ) : (
//     //                             <div className="h-4 w-4 rounded-full border border-gray-500"></div>
//     //                           )}
//     //                           <span className="text-sm text-white capitalize">
//     //                             {stageKey.replace('_', ' ')}
//     //                           </span>
//     //                         </div>
//     //                         <div className="flex items-center space-x-2">
//     //                           <span className={`px-2 py-1 rounded text-xs ${stageData.status === 'completed' ? 'bg-green-500/50 text-green-200' :
//     //                             stageData.status === 'in_progress' ? 'bg-blue-500/50 text-blue-200' :
//     //                               stageData.status === 'failed' ? 'bg-red-500/50 text-red-200' :
//     //                                 stageData.status === 'completed_with_warnings' ? 'bg-yellow-500/50 text-yellow-200' :
//     //                                   'bg-gray-500/50 text-gray-400'
//     //                             }`}>
//     //                             {stageData.status.replace('_', ' ')}
//     //                           </span>
//     //                         </div>
//     //                       </div>
//     //                     )) :
//     //                     // Fallback for old format
//     //                     ['analysis', 'boundary_definition', 'template_mapping', 'template_generation', 'validation'].map(stage => (
//     //                       <div key={stage} className="flex items-center space-x-2">
//     //                         {processedResult.stages_completed?.includes(stage) ? (
//     //                           <CheckCircle className="h-4 w-4 text-green-400" />
//     //                         ) : (
//     //                           <div className="h-4 w-4 rounded-full border border-gray-500"></div>
//     //                         )}
//     //                         <span className={`text-sm ${processedResult.stages_completed?.includes(stage) ? 'text-green-200' : 'text-gray-400'
//     //                           }`}>
//     //                           {stage.replace('_', ' ')}
//     //                         </span>
//     //                       </div>
//     //                     ))
//     //                   }
//     //                 </div>
//     //               </div>

//     //               {processedResult.validation_results && (
//     //                 <div>
//     //                   <p className="text-sm text-gray-400 mb-2">Quality Assessment</p>
//     //                   <div className="bg-gray-700/50 rounded p-3">
//     //                     <div className="flex items-center justify-between mb-2">
//     //                       <span className="text-sm text-gray-300">Overall Quality</span>
//     //                       <span className={`text-sm font-medium ${processedResult.validation_results.overall_quality === 'Excellent' ? 'text-green-400' :
//     //                         processedResult.validation_results.overall_quality === 'Good' ? 'text-blue-400' :
//     //                           processedResult.validation_results.overall_quality === 'Needs Improvement' ? 'text-yellow-400' :
//     //                             'text-red-400'
//     //                         }`}>
//     //                         {processedResult.validation_results.overall_quality}
//     //                       </span>
//     //                     </div>
//     //                     {processedResult.validation_results.quality_score && (
//     //                       <div className="flex items-center justify-between">
//     //                         <span className="text-sm text-gray-300">Score</span>
//     //                         <span className="text-sm text-white">
//     //                           {processedResult.validation_results.quality_score}/10
//     //                         </span>
//     //                       </div>
//     //                     )}
//     //                   </div>
//     //                 </div>
//     //               )}

//     //               {showTemplate && processedResult.template_content && (
//     //                 <div>
//     //                   <p className="text-sm text-gray-400 mb-2">Generated Template</p>
//     //                   <div className="bg-gray-900 border border-gray-600 rounded p-4 max-h-64 overflow-y-auto">
//     //                     <pre className="text-xs text-gray-300 whitespace-pre-wrap">
//     //                       {processedResult.template_content}
//     //                     </pre>
//     //                   </div>
//     //                 </div>
//     //               )}

//     //               {processedResult.errors.length > 0 && (
//     //                 <div>
//     //                   <p className="text-sm text-gray-400 mb-2">Errors/Warnings</p>
//     //                   <div className="space-y-1">
//     //                     {processedResult.errors.map((error: string, index: number) => (
//     //                       <p key={index} className="text-xs text-red-400 bg-red-900/20 rounded p-2">
//     //                         {error}
//     //                       </p>
//     //                     ))}
//     //                   </div>
//     //                 </div>
//     //               )}
//     //             </div>
//     //           </div>
//     //         ) : (
//     //           <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6">
//     //             <div className="text-center py-12 text-gray-400">
//     //               <BrainCircuit className="h-12 w-12 mx-auto mb-4 opacity-50" />
//     //               <p className="mb-2">AI Processing Results</p>
//     //               <p className="text-sm">Enter scope document and click process to see results here</p>
//     //             </div>
//     //           </div>
//     //         )}
//     //       </div>
//     //     </div>
//     //   </div>
//     // </div>
//     <div></div>
//   );
// };

// const FeaturesManagementPage = ({
//   features,
//   activeFeature,
//   setActiveFeature,
//   showNotification,
//   loadingFeatures,
//   sys2Requirements,
//   loadSys2Requirements
// }: any) => (
//   <div className="animate-fade-in">
//     {!activeFeature ? (
//       <div>
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Manage Features</h1>
//             <p className="text-lg text-gray-400">Organize SYS2 requirements by functional features and manage their lifecycle.</p>
//           </div>
//           <button
//             onClick={() => {
//               const featureName = prompt('Enter feature name:');
//               const description = prompt('Enter feature description:');
//               if (featureName) {
//                 featuresService.createFeature({ feature_name: featureName, description })
//                   .then(() => {
//                     showNotification('Feature created successfully!', 'success');
//                     // Reload features
//                   })
//                   .catch(() => showNotification('Failed to create feature', 'error'));
//               }
//             }}
//             className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
//           >
//             <Plus className="h-4 w-4" />
//             Create New Feature
//           </button>
//         </div>
//         {loadingFeatures ? (
//           <div className="flex items-center justify-center py-12">
//             <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
//             <span className="ml-3 text-lg">Loading features...</span>
//           </div>
//         ) : (
//           <div className="grid gap-4">
//             {features.map((feature: Feature) => (
//               <div
//                 key={feature.id}
//                 className="bg-gray-800/70 border border-gray-700 rounded-xl p-6 cursor-pointer hover:border-cyan-500 transition-colors group"
//                 onClick={() => {
//                   setActiveFeature(feature);
//                   loadSys2Requirements(feature.id);
//                 }}
//               >
//                 <div className="flex justify-between items-start">
//                   <div className="flex-1">
//                     <h3 className="text-xl font-bold text-cyan-400 mb-2 group-hover:text-cyan-300 transition-colors">
//                       {feature.feature_name}
//                     </h3>
//                     <p className="text-gray-300 mb-2">{feature.description}</p>
//                     <p className="text-sm text-gray-500">
//                       Created: {new Date(feature.created_at).toLocaleDateString()}
//                     </p>
//                   </div>
//                   <div className="text-right ml-6">
//                     <p className="text-sm text-gray-400">SYS2 Requirements</p>
//                     <p className="text-3xl font-bold text-cyan-400">{feature.sys2_requirements_count}</p>
//                     <p className="text-xs text-gray-500">Click to manage</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     ) : (
//       <div>
//         <div className="flex items-center mb-8">
//           <button
//             onClick={() => setActiveFeature(null)}
//             className="mr-4 text-cyan-400 hover:text-cyan-300 transition-colors"
//           >
//             ← Back to Features
//           </button>
//           <div>
//             <h1 className="text-3xl md:text-4xl font-bold text-white">{activeFeature.feature_name}</h1>
//             <p className="text-lg text-gray-400">{activeFeature.description}</p>
//           </div>
//         </div>

//         <div className="mb-6">
//           <h2 className="text-xl font-semibold text-white mb-4">SYS2 Requirements ({sys2Requirements.length})</h2>
//         </div>

//         <div className="space-y-4">
//           {sys2Requirements.map((req: SYS2Requirement) => (
//             <div key={req.id} className="bg-gray-800/70 border border-gray-700 rounded-xl p-6">
//               <div className="flex justify-between items-start mb-4">
//                 <div>
//                   <h3 className="text-lg font-semibold text-white mb-1">{req.sys_id || 'No SYS ID'}</h3>
//                   <div className="flex items-center gap-2">
//                     <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${REQ_TYPE_COLORS[req.requirement_type] || REQ_TYPE_COLORS.default
//                       }`}>
//                       {req.requirement_type}
//                     </span>
//                     {req.sys2_jira_id && (
//                       <span className="px-2 py-1 bg-gray-600/50 text-gray-300 rounded text-xs">
//                         {req.sys2_jira_id}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className={`px-2 py-1 rounded text-xs font-medium ${req.priority === 'High' ? 'bg-red-500/20 text-red-300' :
//                     req.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
//                       'bg-green-500/20 text-green-300'
//                     }`}>
//                     {req.priority} Priority
//                   </span>
//                   <span className={`px-2 py-1 rounded text-xs ${req.status === 'Active' ? 'bg-green-500/20 text-green-300' :
//                     req.status === 'Draft' ? 'bg-blue-500/20 text-blue-300' :
//                       'bg-gray-500/20 text-gray-300'
//                     }`}>
//                     {req.status}
//                   </span>
//                 </div>
//               </div>

//               <p className="text-gray-300 mb-4 leading-relaxed">{req.requirement_text}</p>

//               <div className="flex flex-wrap gap-4">
//                 {req.domains.length > 0 && (
//                   <div className="flex flex-wrap gap-2 items-center">
//                     <span className="text-sm text-gray-400 font-medium">Domains:</span>
//                     {req.domains.map((domain, idx) => (
//                       <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
//                         {domain}
//                       </span>
//                     ))}
//                   </div>
//                 )}

//                 {req.tags.length > 0 && (
//                   <div className="flex flex-wrap gap-2 items-center">
//                     <span className="text-sm text-gray-400 font-medium">Tags:</span>
//                     {req.tags.map((tag, idx) => (
//                       <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
//                         {tag}
//                       </span>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}

//           {sys2Requirements.length === 0 && (
//             <div className="text-center py-12">
//               <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg font-semibold text-gray-300 mb-2">No SYS2 Requirements</h3>
//               <p className="text-gray-400">This feature doesn't have any SYS2 requirements yet.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     )}
//   </div>
// );

// const TagsManagementPage = ({ tags, setTags, showNotification, loadingTags, loadTags }: any) => {
//   const [isCreating, setIsCreating] = useState(false);
//   const [newTag, setNewTag] = useState({ tag: '', description: '' });
//   const [editingTag, setEditingTag] = useState<string | null>(null);
//   const [editData, setEditData] = useState<any>({});

//   const createTag = async () => {
//     if (!newTag.tag.trim()) return;

//     try {
//       const response = await tagsService.createTag(newTag);
//       if (response) {
//         setTags([...tags, response]);
//         setNewTag({ tag: '', description: '' });
//         setIsCreating(false);
//         showNotification('Tag created successfully!', 'success');
//       }
//     } catch (error) {
//       showNotification('Failed to create tag', 'error');
//     }
//   };

//   const startEdit = (tag: Tag) => {
//     setEditingTag(tag.id);
//     setEditData({ tag: tag.tag, description: tag.description });
//   };

//   const saveEdit = async (tagId: string) => {
//     try {
//       const response = await tagsService.updateTag(tagId, editData);
//       if (response) {
//         setTags(tags.map((t: Tag) => t.id === tagId ? response : t));
//         setEditingTag(null);
//         showNotification('Tag updated successfully!', 'success');
//       }
//     } catch (error) {
//       showNotification('Failed to update tag', 'error');
//     }
//   };

//   const deleteTag = async (tagId: string) => {
//     if (!confirm('Are you sure you want to delete this tag?')) return;

//     try {
//       await tagsService.deleteTag(tagId);
//       setTags(tags.filter((t: Tag) => t.id !== tagId));
//       showNotification('Tag deleted successfully!', 'success');
//     } catch (error) {
//       showNotification('Failed to delete tag', 'error');
//     }
//   };

//   return (
//     <div className="animate-fade-in">
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Manage Tags</h1>
//           <p className="text-lg text-gray-400">Create and organize tags for categorizing requirements and improving searchability.</p>
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={loadTags}
//             disabled={loadingTags}
//             className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
//           >
//             <RefreshCw className={`h-4 w-4 ${loadingTags ? 'animate-spin' : ''}`} />
//             Refresh
//           </button>
//           <button
//             onClick={() => setIsCreating(true)}
//             className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
//           >
//             <Plus className="h-4 w-4" />
//             Create New Tag
//           </button>
//         </div>
//       </div>

//       {isCreating && (
//         <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6 mb-6">
//           <h3 className="text-lg font-semibold text-white mb-4">Create New Tag</h3>
//           <div className="space-y-4">
//             <input
//               type="text"
//               value={newTag.tag}
//               onChange={(e) => setNewTag({ ...newTag, tag: e.target.value })}
//               className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
//               placeholder="Tag name (e.g., Performance, Security)"
//             />
//             <textarea
//               value={newTag.description}
//               onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
//               className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white h-20"
//               placeholder="Tag description"
//             />
//             <div className="flex gap-2">
//               <button
//                 onClick={createTag}
//                 className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
//               >
//                 Create Tag
//               </button>
//               <button
//                 onClick={() => {
//                   setIsCreating(false);
//                   setNewTag({ tag: '', description: '' });
//                 }}
//                 className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       {loadingTags ? (
//         <div className="flex items-center justify-center py-12">
//           <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
//           <span className="ml-3 text-lg">Loading tags...</span>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {tags.map((tag: Tag) => (
//             <div key={tag.id} className="bg-gray-800/70 border border-gray-700 rounded-xl p-6 hover:border-cyan-500 transition-colors">
//               <div className="flex items-center justify-between mb-3">
//                 {editingTag === tag.id ? (
//                   <div className="flex-1 space-y-2">
//                     <input
//                       type="text"
//                       value={editData.tag}
//                       onChange={(e) => setEditData({ ...editData, tag: e.target.value })}
//                       className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
//                     />
//                     <textarea
//                       value={editData.description}
//                       onChange={(e) => setEditData({ ...editData, description: e.target.value })}
//                       className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs h-16"
//                     />
//                     <div className="flex gap-1">
//                       <button
//                         onClick={() => saveEdit(tag.id)}
//                         className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
//                       >
//                         <CheckCircle className="h-3 w-3" />
//                       </button>
//                       <button
//                         onClick={() => setEditingTag(null)}
//                         className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs"
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <>
//                     <div className="flex-1">
//                       <div className="flex items-center mb-2">
//                         <TagIcon className="h-5 w-5 text-cyan-400 mr-2" />
//                         <h3 className="text-lg font-bold text-white">{tag.tag}</h3>
//                       </div>
//                       <p className="text-gray-300 text-sm mb-2">{tag.description}</p>
//                       <p className="text-xs text-gray-500">
//                         Created: {new Date(tag.created_at).toLocaleDateString()}
//                       </p>
//                     </div>
//                     <div className="flex flex-col gap-1">
//                       <button
//                         onClick={() => startEdit(tag)}
//                         className="text-blue-400 hover:text-blue-300 p-1"
//                         title="Edit Tag"
//                       >
//                         <Edit className="h-4 w-4" />
//                       </button>
//                       <button
//                         onClick={() => deleteTag(tag.id)}
//                         className="text-red-400 hover:text-red-300 p-1"
//                         title="Delete Tag"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </button>
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // Notification Banner Component
// const NotificationBanner = ({
//   message,
//   type,
//   onClose
// }: {
//   message: string;
//   type: 'success' | 'error' | 'info';
//   onClose: () => void;
// }) => {
//   const isSuccess = type === 'success';
//   const isInfo = type === 'info';
//   const bgColor = isSuccess ? 'bg-green-500/20 border-green-500' : isInfo ? 'bg-blue-500/20 border-blue-500' : 'bg-red-500/20 border-red-500';
//   const textColor = isSuccess ? 'text-green-300' : isInfo ? 'text-blue-300' : 'text-red-300';
//   const Icon = isSuccess ? CheckCircle : isInfo ? AlertTriangle : AlertTriangle;

//   return (
//     <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-lg border flex items-center shadow-lg animate-fade-in ${bgColor} ${textColor}`}>
//       <Icon className="h-5 w-5 mr-3" />
//       <p>{message}</p>
//       <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white/10">
//         <ChevronRight className="h-5 w-5 rotate-45" />
//       </button>
//     </div>
//   );
// };
// const ComponentMappingTab = ({ domainTypes, showNotification }: {
//   domainTypes: string[];
//   showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
// }) => {
//   const [availableDomains, setAvailableDomains] = useState<{ id: string, domain_type: string, description?: string }[]>([]);
//   const [mappings, setMappings] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [isCreating, setIsCreating] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);

//   // Form state
//   const [componentSearch, setComponentSearch] = useState('');
//   const [showComponentDropdown, setShowComponentDropdown] = useState(false);
//   const [selectedComponent, setSelectedComponent] = useState('');
//   const [selectedDomain, setSelectedDomain] = useState('');
//   const [customComponent, setCustomComponent] = useState('');

//   // Edit state
//   const [editComponent, setEditComponent] = useState('');
//   const [editDomain, setEditDomain] = useState('');
//   useEffect(() => {
//     loadMappings();
//     loadAvailableDomains();
//   }, []);
//   const loadAvailableDomains = async () => {
//     try {
//       const response = await fetch('/api/v1/component-domains/available-domains');
//       if (!response.ok) throw new Error('Failed to load domain types');
//       const domains = await response.json();
//       setAvailableDomains(domains);
//       console.log('Loaded domains:', domains); // Debug log
//     } catch (err: any) {
//       console.error('Domain load error:', err);
//       showNotification(err.message, 'error');
//     }
//   };
//   const PREDEFINED_COMPONENTS = [
//     'SW_CDC_HMI_CONNECTIVITY', 'SW_CDC_HMI_HOME', 'SW_CDC_HMI_MEDIA',
//     'SW_CDC_AUDIO_AUDIO', 'SW_CDC_IVI_BT', 'SW_CDC_RUI_CPSTACK',
//     'SW_CDC_DEL_EU', 'SW_CDC_HMI_VEHICLE', 'SW_CDC_ALLGO_PM',
//     'SW_DI_APP_METERS', 'SW_CDC_RUI_MRM', 'SW_CDC_HMI_COREUX',
//     'SW_CDC_VHAL_DIAGNOSTICS', 'SW_CDC_INTEGRATION_TEST', 'SW_IVI_FV',
//     'SW_DI_SW', 'SW_CDC_AUDIO_TUNER', 'SW_CDC_AOSP_FRAMEWORK',
//     'Systems', 'SW_CDC_IVI_FO', 'SW_CDC_IVI_WIFI', 'SW_DI_APP_DISPLAY',
//     'SW_CDC_AOSP_NATIVE', 'SW_CDC_INTEGRATION', 'SW_CDC_RUI_DCM',
//     'SW_CDC_RUI_AAPSTACK', 'SW_CDC_DEL_NA', 'SW_CDC_MEDIA_MEDIA',
//     'SW_CDC_BSP_PLATFORM', 'SW_CDC_BSP_SUBSYSTEM', 'SW_DI_AUT_BSW',
//     'SW_CDC_DEL_AP', 'SW_DI_INF_CYBERSECURITY', 'SW_CDC_APPSTORE',
//     'SW_CDC_AUDIO_VR', 'SW_CDC_IVI_ARCH', 'SW_CDC_RUI_TEST',
//     'SW_DI_HMI_DESIGNSTUDIO', 'SW_DI_INF_SW_UPDATE', 'CDC_IVI_FO',
//     'SW_DI_ARCH', 'SW_DI_INF_MW', 'SW_DI_IT_INTEGRATION',
//     'ME_Design', 'HW', 'HW_Arch', 'HW_CE', 'HW_ECAD', 'HW_EDS', 'HW_TP/TF'
//   ];

//   const filteredComponents = PREDEFINED_COMPONENTS.filter(comp =>
//     comp.toLowerCase().includes(componentSearch.toLowerCase())
//   );

//   useEffect(() => {
//     loadMappings();
//     loadAvailableDomains();
//   }, []); // Empty dependency array = runs once


//   const loadMappings = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch('/api/v1/component-domains');
//       if (!response.ok) throw new Error('Failed to load mappings');
//       let data = await response.json();

//       // CLIENT-SIDE DEDUPLICATION (temporary fix)
//       data = [...new Map(data.map(item => [item.component_name + '-' + item.domain_name, item])).values()];

//       setMappings(data);
//     } catch (err: any) {
//       showNotification(err.message, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };
//   const handleCreateMapping = async () => {
//     const componentName = customComponent.trim() || selectedComponent;

//     if (!componentName || !selectedDomain) {
//       showNotification('Please select both component and domain', 'error');
//       return;
//     }

//     try {
//       const response = await fetch('/api/v1/component-domains', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           component_name: componentName,
//           domain_name: selectedDomain
//         })
//       });

//       if (!response.ok) {
//         const errData = await response.json();
//         throw new Error(errData.detail || 'Failed to create mapping');
//       }

//       showNotification('Mapping created successfully!', 'success');
//       resetForm(); // Reset form
//       await loadMappings(); // Reload fresh data (clears duplicates)
//     } catch (err: any) {
//       showNotification(err.message, 'error');
//     }
//   };


//   const handleUpdateMapping = async (id: string) => {
//     if (!editDomain) {
//       showNotification('Please select a domain', 'error');
//       return;
//     }

//     try {
//       const response = await fetch(`/api/v1/component-domains/${id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           domain_name: editDomain
//         })
//       });

//       if (!response.ok) throw new Error('Failed to update mapping');

//       showNotification('Mapping updated successfully!', 'success');
//       setEditingId(null);
//       await loadMappings();
//     } catch (err: any) {
//       showNotification(err.message, 'error');
//     }
//   };

//   const handleDeleteMapping = async (id: string, componentName: string, domainName: string) => {
//     if (!confirm(`Delete mapping "${componentName}" → "${domainName}"?`)) {
//       return;
//     }

//     try {
//       const response = await fetch(`/api/v1/component-domains/${id}`, {
//         method: 'DELETE'
//       });

//       if (!response.ok) throw new Error('Failed to delete mapping');

//       showNotification('Mapping deleted successfully!', 'success');
//       await loadMappings();
//     } catch (err: any) {
//       showNotification(err.message, 'error');
//     }
//   };

//   const startEdit = (mapping: any) => {
//     setEditingId(mapping.id);
//     setEditComponent(mapping.component_name);
//     setEditDomain(mapping.domain_name);
//   };

//   const resetForm = () => {
//     setIsCreating(false);
//     setEditingId(null);
//     setSelectedComponent('');
//     setSelectedDomain('');
//     setCustomComponent('');
//     setComponentSearch('');
//     setShowComponentDropdown(false);
//   };


//   return (
//     <div>
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h2 className="text-xl font-semibold text-white">Component-Domain Mapping</h2>
//           <p className="text-gray-400">Map software components to domain types</p>
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={loadMappings}
//             disabled={loading}
//             className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
//           >
//             <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
//             Refresh
//           </button>
//           <button
//             onClick={() => setIsCreating(true)}
//             className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
//           >
//             <Plus className="h-4 w-4" />
//             Create Mapping
//           </button>
//         </div>
//       </div>

//       {/* Create Form */}
//       {isCreating && (
//         <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6 mb-6">
//           <h3 className="text-lg font-semibold text-white mb-4">Create New Mapping</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Component Selection - UNCHANGED */}
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-300">Component Name</label>
//               <div className="relative">
//                 <input
//                   placeholder="Search or enter component name..."
//                   value={componentSearch || customComponent}
//                   onChange={(e) => {
//                     setComponentSearch(e.target.value);
//                     setCustomComponent(e.target.value);
//                     setShowComponentDropdown(true);
//                   }}
//                   onFocus={() => setShowComponentDropdown(true)}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
//                 />
//                 {showComponentDropdown && filteredComponents.length > 0 && (
//                   <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
//                     {filteredComponents.map((comp) => (
//                       <button
//                         key={comp}
//                         onClick={() => {
//                           setSelectedComponent(comp);
//                           setCustomComponent('');
//                           setComponentSearch(comp);
//                           setShowComponentDropdown(false);
//                         }}
//                         className="w-full text-left px-4 py-2 hover:bg-gray-600 text-white text-sm"
//                       >
//                         {comp}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//               {customComponent && !PREDEFINED_COMPONENTS.includes(customComponent) && (
//                 <p className="text-xs text-yellow-400">Custom component: Will be added</p>
//               )}
//             </div>

//             {/* Domain Selection - FIXED */}
//             {/* <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-300">Domain Type</label>
//               <select
//                 value={selectedDomain}
//                 onChange={(e) => setSelectedDomain(e.target.value)}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
//               >
//                 <option value="">Select domain type...</option>
//                 {availableDomains.map((domain) => (
//                   <option key={domain.id} value={domain.domain_type}>
//                     {domain.domain_type} {domain.description && `- ${domain.description}`}
//                   </option>
//                 ))}
//               </select>
//             </div> */}
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
//                 Domain Type
//                 {availableDomains.length === 0 && (
//                   <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/50 animate-pulse">
//                     Loading...
//                   </span>
//                 )}
//               </label>

//               <div className="relative">
//                 <select
//                   value={selectedDomain}
//                   onChange={(e) => setSelectedDomain(e.target.value)}
//                   className="w-full appearance-none bg-gradient-to-r from-gray-700/90 to-gray-800/90 
//                   border border-gray-600 hover:border-cyan-500/60 focus:border-cyan-400/80 
//                   rounded-xl px-4 py-3 text-gray-100 text-sm font-medium 
//                   focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:ring-offset-1 
//                   focus:ring-offset-gray-900/80 transition-all duration-200 shadow-lg
//                   hover:shadow-xl hover:shadow-cyan-500/15 cursor-pointer h-12"
//                 >
//                   <option value="" className="bg-gray-800 text-gray-400">🔍 Select domain type...</option>

//                   {availableDomains.length === 0 ? (
//                     <option disabled className="bg-gray-800 text-gray-500">No domains available</option>
//                   ) : (
//                     availableDomains.map((domain) => (
//                       <option
//                         key={domain.id}
//                         value={domain.domain_type}
//                         className="bg-gray-800/95 text-gray-100 hover:bg-gray-700"
//                       >
//                         {domain.domain_type.toUpperCase()}
//                       </option>
//                     ))
//                   )}
//                 </select>

//                 {/* Custom Dropdown Arrow */}
//                 <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//                   <svg
//                     className="w-5 h-5 text-gray-400 hover:text-cyan-300 transition-colors duration-200"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </div>
//               </div>

//               {/* Selected Preview */}
//               {selectedDomain && (
//                 <div className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-cyan-900/30 to-cyan-900/10 
//                     border border-cyan-500/40 rounded-xl backdrop-blur-sm shadow-inner">
//                   <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
//                   <span className="text-xs text-cyan-300 font-medium truncate flex-1">
//                     Selected: {selectedDomain}
//                   </span>
//                   <button
//                     onClick={() => setSelectedDomain('')}
//                     className="p-1 hover:bg-cyan-500/20 rounded-lg transition-all hover:scale-110"
//                     title="Clear selection"
//                   >
//                     <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>
//               )}

//               {availableDomains.length > 0 && (
//                 <p className="text-xs text-gray-500">
//                   {availableDomains.length} domain{availableDomains.length !== 1 ? 's' : ''} available
//                 </p>
//               )}
//             </div>




//           </div>

//           <div className="flex gap-2 pt-4">
//             <button
//               onClick={handleCreateMapping}
//               disabled={(!selectedComponent && !customComponent.trim()) || !selectedDomain}
//               className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg"
//             >
//               Save Mapping
//             </button>
//             <button
//               onClick={() => {
//                 setIsCreating(false);
//                 setSelectedComponent('');
//                 setSelectedDomain('');
//                 setCustomComponent('');
//                 setComponentSearch('');
//               }}
//               className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//       {/* Mappings List */}
//       {/* FIXED Mappings List - NO DUPLICATES */}
//       {/* FIXED Mappings List - NO DUPLICATES */}
//       <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6">
//         <h3 className="text-lg font-semibold text-white mb-4">
//           Current Mappings ({mappings.length})
//         </h3>

//         {loading ? (
//           <div className="flex items-center justify-center py-12">
//             <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
//             <span className="ml-3 text-lg text-gray-300">Loading...</span>
//           </div>
//         ) : mappings.length === 0 ? (
//           <div className="text-center py-12 text-gray-400">
//             <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
//             <p>No mappings found. Create your first mapping to get started.</p>
//           </div>
//         ) : (
//           <div className="space-y-3 max-h-96 overflow-y-auto">
//             {/* 👇 THIS DEDUPLICATES YOUR DATA */}
//             {Array.from(
//               new Map(
//                 mappings.map((mapping) => [`${mapping.component_name}-${mapping.domain_name}`, mapping])
//               ).values()
//             ).map((mapping) => (
//               <div
//                 key={`${mapping.id}-${mapping.component_name}`}  // Unique key
//                 className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-600/70 border border-gray-600/50 transition-all group"
//               >
//                 <div className="flex items-center gap-4 flex-1 min-w-0">
//                   <LinkIcon className="h-5 w-5 text-cyan-400 flex-shrink-0" />
//                   <div className="min-w-0 flex-1">
//                     <p className="font-semibold text-white truncate text-sm">{mapping.component_name}</p>
//                     <div className="flex items-center gap-2 mt-1">
//                       <span className="text-xs text-gray-400 font-mono">→</span>
//                       <span className="px-3 py-1 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 
//                                text-cyan-300 border border-cyan-500/50 rounded-full text-xs 
//                                backdrop-blur-sm font-mono font-medium shadow-lg">
//                         {mapping.domain_name.toUpperCase()}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all ml-4 flex-shrink-0">
//                   <button
//                     onClick={() => startEdit(mapping)}
//                     className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
//                     title="Edit"
//                   >
//                     <Edit className="h-4 w-4" />
//                   </button>
//                   <button
//                     onClick={() => handleDeleteMapping(mapping.id, mapping.component_name, mapping.domain_name)}
//                     className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
//                     title="Delete"
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>


//     </div>
//   );
// };
// export default App;

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus, Trash2, Edit, ChevronRight, BrainCircuit, Zap,
  RefreshCw, Layers, AlertTriangle, CheckCircle, TestTube2,
  Home, Tag as TagIcon, Package, FileText, Server, Download,
  ZapIcon, Link as LinkIcon, Database, Wifi, WifiOff, BarChart3, ArrowLeftRight, Shield, Search,
  Eye, ChevronLeft, X
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import headerBanner from './assets/swe1_header_banner.png';
// import DomainTestbedPage from '/src/pages/DomainTestbedPage';
import DomainTestbedPage from '@/pages/DomainTestbedPage';
import DomainScopeGen from '@/pages/DomainScopeGen';
import EnhancedDomainTestbedPage from '@/pages/EnhancedDomainTestbedPage';
import SessionStatusTrackerPage from './pages/SessionStatusTrackerPage';
import { Activity } from 'lucide-react'; // Add to existing imports
import ComponentDomainMappingPage from './pages/ComponentDomainMappingPage';
import GenerateSequencePage from '@/pages/GenerateSequence';
import JiraProcessorPage from '@/pages/JiraProcessorPage';
import JiraAdminPage from '@/pages/JiraAdminPage';
import UnifiedInterfaceSpecificationsTab from '@/components/UnifiedInterfaceSpecificationsTab';
import EnhancedInterfaceSpecificationsTab from '@/components/enhanced/EnhancedInterfaceSpecificationsTab';
import DomainComparisonTab from '@/components/DomainComparisonTab';
import DomainHealthDashboard from '@/components/DomainHealthDashboard';
import DomainDescriptionDisplay from '@/components/DomainDescriptionDisplay';
import {
  domainService,
  featuresService,
  tagsService,
  unifiedInterfaceService,
  Domain,
  Feature,
  Tag,
  SYS2Requirement,
  DomainType,
  InterfaceSpecification,
  InterfaceProcessingResponse,
  VersionedInterfaceProcessingRequest,
  EnhancedInterfaceProcessingResponse,
  InterfaceVersion,
  EmbeddingStatus
} from '@/services';
import './index.css';


// ─── Constants ────────────────────────────────────────────────────────────────
const REQTYPE_COLORS: Record<string, string> = {
  Functional:     'bg-green-500/10 text-green-200',
  'Non-Functional':'bg-yellow-500/10 text-yellow-200',
  Constraint:     'bg-red-500/10 text-red-200',
  Heading:        'bg-indigo-500/10 text-indigo-200',
  Information:    'bg-sky-500/10 text-sky-200',
  default:        'bg-gray-500/10 text-gray-200',
};

// ─── Notification ─────────────────────────────────────────────────────────────
interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = React.useState(0);
  const prevRef = React.useRef(0);

  React.useEffect(() => {
    const start = prevRef.current;
    const end = value;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * ease));
      if (progress < 1) requestAnimationFrame(tick);
      else prevRef.current = end;
    };
    requestAnimationFrame(tick);
  }, [value, duration]);

  return <>{display}</>;
}

// ─── Status Dot ───────────────────────────────────────────────────────────────
function StatusDot({ ok, checking }: { ok: boolean; checking: boolean }) {
  if (checking)
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-pulse" />
        Checking
      </span>
    );
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${ok ? 'text-emerald-400' : 'text-red-400'}`}>
      <span
        className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-400'}`}
        style={{ boxShadow: ok ? '0 0 6px rgba(52,211,153,0.6)' : '0 0 6px rgba(248,113,113,0.6)' }}
      />
      {ok ? 'Online' : 'Offline'}
    </span>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({
  label, value, sub, icon: Icon, onClick, accent = false,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  accent?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`group relative bg-gray-800/40 border rounded-xl p-4 transition-all duration-200 flex-1 min-w-[140px]
        ${onClick ? 'cursor-pointer hover:border-gray-500/80 hover:bg-gray-800/60 hover:-translate-y-0.5 hover:shadow-lg' : ''}
        ${accent ? 'border-cyan-500/30' : 'border-gray-700/50'}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${accent ? 'text-cyan-400' : 'text-gray-500'}`} />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-1" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      {sub && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="truncate">{sub}</span>
        </div>
      )}
    </div>
  );
}

// ─── Nav Card ─────────────────────────────────────────────────────────────────
function NavCard({
  icon: Icon, title, description, badge, onClick, accent = false, compact = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
  onClick: () => void;
  accent?: boolean;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group text-left relative bg-gray-800/50 border rounded-xl flex flex-col h-full
        ${compact ? 'p-4' : 'p-5'}
        transition-all duration-200
        hover:-translate-y-1 hover:shadow-lg hover:shadow-black/30
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40
        ${accent
          ? 'border-cyan-500/30 hover:border-cyan-400/50 hover:bg-gray-800/70'
          : 'border-gray-700/50 hover:border-gray-500/60 hover:bg-gray-800/70'
        }`}
    >
      <div className={`flex items-start justify-between w-full ${compact ? 'mb-3' : 'mb-4'}`}>
        <div
          className={`flex-shrink-0 rounded-lg flex items-center justify-center transition-colors duration-200
            ${compact ? 'w-9 h-9' : 'w-11 h-11'}
            ${accent ? 'bg-cyan-500/10 group-hover:bg-cyan-500/20' : 'bg-gray-700/50 group-hover:bg-gray-700/80'}`}
        >
          <Icon className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} ${accent ? 'text-cyan-400' : 'text-gray-400'}`} />
        </div>
        {badge && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
            {badge}
          </span>
        )}
      </div>
      
      <h3 className={`font-bold text-white ${compact ? 'text-base mb-1' : 'text-[1.1rem] mb-2'}`}>{title}</h3>
      <p className={`text-gray-400 leading-relaxed flex-1 ${compact ? 'text-xs mb-3' : 'text-sm mb-4'}`}>{description}</p>
      
      <div className={`flex items-center font-semibold mt-auto transition-colors duration-200
        ${compact ? 'text-xs' : 'text-sm'}
        ${accent ? 'text-cyan-400 group-hover:text-cyan-300' : 'text-cyan-500 group-hover:text-cyan-400'}`}>
        Go to {title}
        <ChevronRight className={`ml-1 transition-transform duration-200 group-hover:translate-x-1 ${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
      </div>
    </button>
  );
}

// ─── Disabled Nav Card ────────────────────────────────────────────────────────
function DisabledNavCard({
  icon: Icon, title, description, onDisabledClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onDisabledClick: () => void;
}) {
  return (
    <div
      onClick={onDisabledClick}
      title="Currently not in use — access via the Navigation Sidebar"
      style={{ cursor: 'not-allowed' }}
      className="relative bg-gray-800/30 border border-gray-700/30 rounded-xl p-5 flex flex-col h-full opacity-60 select-none transition-colors hover:bg-gray-800/40 hover:border-gray-700/50"
    >
      <div className="flex items-start justify-between mb-4 w-full">
        <div className="flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center bg-gray-700/30">
          <Icon className="h-5 w-5 text-gray-500" />
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400 border border-gray-600/30">
          Disabled
        </span>
      </div>
      
      <h3 className="text-[1.1rem] font-bold text-gray-400 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{description}</p>
      
      <div className="flex items-center text-sm font-semibold text-gray-600 mt-auto">
        Access via sidebar navigation
      </div>
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3 px-0.5 mt-2">
      {children}
    </h2>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────
const HomePage = ({
  navigate,
  domains,
  domainTypes,
}: {
  navigate: (page: string) => void;
  domains: Domain[];
  domainTypes: string[];
}) => {
  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    ollama: { status: string; model?: string } | null;
    database: { status: string } | null;
  } | null>(null);

  const [lastSession, setLastSession] = useState<{
    session_id: string;
    session_name: string;
    status: string;
    epic_count: number;
    created_at: string;
  } | null>(null);

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch('/api/v1/health');
        const data = await res.json();
        setHealthStatus({
          status: data.status ?? 'unknown',
          ollama: data.ollama ?? null,
          database: data.database ?? null,
        });
      } catch {
        setHealthStatus({ status: 'offline', ollama: null, database: null });
      } finally {
        setChecking(false);
      }
    };

    const fetchLastSession = async () => {
      try {
        const res = await fetch('/api/v1/testbed/recent-sessions?limit=1');
        const data = await res.json();
        if (data.sessions?.length > 0) setLastSession(data.sessions[0]);
      } catch { /* ignore */ }
    };

    fetchHealth();
    fetchLastSession();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const ollamaOk = healthStatus?.ollama?.status === 'healthy';
  const dbOk = healthStatus?.database?.status === 'healthy';
  const embeddingReady = domains.filter(d => d.embedding_exists).length;

  const [disabledToast, setDisabledToast] = useState<string | null>(null);

  const showDisabledNotification = (feature: string) => {
    setDisabledToast(`"${feature}" is currently not in use. To access it, use the Navigation Sidebar.`);
    setTimeout(() => setDisabledToast(null), 3500);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '100%' }}>

      {/* Disabled Feature Toast */}
      {disabledToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border shadow-2xl max-w-sm"
          style={{ background: 'rgba(30,30,50,0.97)', borderColor: 'rgba(251,191,36,0.4)', color: '#fbbf24', backdropFilter: 'blur(12px)' }}>
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm leading-relaxed">{disabledToast}</span>
        </div>
      )}

      {/* ── Header Banner ── */}
      <div className="relative mb-5 rounded-xl overflow-hidden" style={{ height: '140px' }}>
        <img
          src={headerBanner}
          alt="SWE.1 ReqGen AI Tool"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center' }}
        />
        {/* Overlay gradient + text */}
        <div className="absolute inset-0 flex flex-col justify-end p-8"
          style={{ background: 'linear-gradient(to right, rgba(10,15,30,0.92) 30%, rgba(10,15,30,0.5) 70%, transparent 100%)' }}>
          <h1 className="text-3xl font-bold text-white leading-tight" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
            ReqGen
            <span className="ml-2 text-sm font-semibold align-middle uppercase tracking-widest" style={{ color: '#22d3ee' }}>v5</span>
          </h1>
          <p className="mt-1.5 text-base" style={{ color: 'rgba(200,220,255,0.75)', textShadow: '0 1px 8px rgba(0,0,0,0.7)' }}>
            AI-Powered Requirement Generation · Feature-Domain-Tag model for AOSP infotainment
          </p>
        </div>
        {/* Status pills in top-right corner of banner */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ background: 'rgba(10,20,40,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', color: checking ? '#9ca3af' : ollamaOk ? '#34d399' : '#f87171' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: checking ? '#6b7280' : ollamaOk ? '#34d399' : '#f87171', boxShadow: !checking && ollamaOk ? '0 0 6px #34d399' : undefined }} />
            Ollama
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ background: 'rgba(10,20,40,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', color: checking ? '#9ca3af' : dbOk ? '#34d399' : '#f87171' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: checking ? '#6b7280' : dbOk ? '#34d399' : '#f87171', boxShadow: !checking && dbOk ? '0 0 6px #34d399' : undefined }} />
            Database
          </span>
        </div>
      </div>

      {/* ── Metrics Row (Commented Out) ── */}
      {/* 
      <div className="flex flex-wrap gap-4 mb-10">
        <MetricCard label="Domains" value={<AnimatedCounter value={domains.length} />} sub={`${domainTypes.length} types`} icon={Layers} onClick={() => navigate('domains')} />
        <MetricCard label="Last Session" value={lastSession ? <span className="text-xl">{lastSession.session_id.substring(0, 8)}…</span> : '-'} sub={lastSession ? lastSession.status : 'No session'} icon={Activity} onClick={lastSession ? () => navigate('status-tracker') : undefined} accent />
        <MetricCard label="EPICs" value={<AnimatedCounter value={lastSession?.epic_count ?? 0} />} sub="in last session" icon={BrainCircuit} onClick={lastSession ? () => navigate('status-tracker') : undefined} />
        <MetricCard label="Types" value={<AnimatedCounter value={domainTypes.length} />} icon={BarChart3} onClick={() => navigate('domains')} />
        <MetricCard label="Ollama" value={<StatusDot ok={ollamaOk} checking={checking} />} icon={BrainCircuit} />
        <MetricCard label="Database" value={<StatusDot ok={dbOk} checking={checking} />} icon={Database} />
      </div>
      */}

      {/* ── Utilities Row (Moved to Top) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <NavCard compact icon={Activity} title="Session Tracker" description="Track your SWE.1 generation progress using session ID tracking." onClick={() => navigate('status-tracker')} />
        <NavCard compact icon={LinkIcon} title="Component Mapping" description="Map software components to domain types with a searchable registry." onClick={() => navigate('component-domain-mapping')} />
        <NavCard compact icon={ArrowLeftRight} title="Instance Comparison" description="Compare domain configurations and interface specs side by side." onClick={() => navigate('compare-domains')} />
      </div>

      {/* ── Unified Grid Layout ── */}
      
      {/* Master Data */}
      <SectionLabel>Master Data</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
        <NavCard
          icon={Layers}
          title="Manage Domains"
          description="Configure domain scopes with individual tables and enhanced metadata."
          onClick={() => navigate('domains')}
          accent
        />
        <DisabledNavCard
          icon={Package}
          title="Manage Features"
          description="Organize SYS2 requirements by functional features and manage their lifecycle."
          onDisabledClick={() => showDisabledNotification('Manage Features')}
        />
        <DisabledNavCard
          icon={TagIcon}
          title="Manage Tags"
          description="Create and organize tags for categorizing requirements and improving searchability."
          onDisabledClick={() => showDisabledNotification('Manage Tags')}
        />
      </div>

      {/* Generation Tools */}
      <SectionLabel>Tools</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
        <NavCard icon={TestTube2} title="Domain Scope Gen" description="Test the existing SWE.1 generation functionality with your domain files." onClick={() => navigate('domain-scope-gen')} />
        <NavCard icon={BrainCircuit} title="SWE.1 Generation" description="EPIC 8: Multi-domain requirements generation with interface selection and hybrid RAG." onClick={() => navigate('enhanced-testbed')} accent />
        <NavCard icon={Zap} title="Sequence Generator" description="Generate Mermaid Sequence Diagram for each SWE1 requirement automatically." onClick={() => navigate('sequence-generator')} />
        <NavCard icon={FileText} title="Jira Plugin" description="Process and sync requirements directly to Jira issues with custom field mapping." onClick={() => navigate('jira-processor')} />
      </div>

    </div>
  );
};

// ─── Notification Banner ──────────────────────────────────────────────────────
const NotificationBanner = ({
  message, type, onClose,
}: {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}) => {
  const colors = {
    success: 'bg-green-800 border-green-600 text-green-100',
    error:   'bg-red-800   border-red-600   text-red-100',
    info:    'bg-blue-800  border-blue-600  text-blue-100',
  };
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-4 rounded-lg border shadow-lg max-w-md ${colors[type]}`}>
      {type === 'success' && <CheckCircle className="h-5 w-5 flex-shrink-0" />}
      {type === 'error'   && <AlertTriangle className="h-5 w-5 flex-shrink-0" />}
      <span className="text-base">{message}</span>
      <button onClick={onClose} className="ml-2 text-current opacity-70 hover:opacity-100">✕</button>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
const queryClient = new QueryClient();

const App = () => {
  const [page, setPage] = useState('home');
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null);

  // Data states
  const [domains,           setDomains]           = useState<Domain[]>([]);
  const [domainTypes,       setDomainTypes]       = useState<string[]>([]);
  const [domainTypesMetadata, setDomainTypesMetadata] = useState<Record<string, DomainType>>({});
  const [features,          setFeatures]          = useState<Feature[]>([]);
  const [tags,              setTags]              = useState<Tag[]>([]);
  const [sys2Requirements,  setSys2Requirements]  = useState<SYS2Requirement[]>([]);

  // Loading states
  const [loadingDomains,     setLoadingDomains]     = useState(false);
  const [loadingDomainTypes, setLoadingDomainTypes] = useState(false);
  const [loadingFeatures,    setLoadingFeatures]    = useState(false);
  const [loadingTags,        setLoadingTags]        = useState(false);

  // Notification state
  const [notification, setNotification] = useState<Notification | null>(null);
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success', duration = 4000) => {
    setNotification({ id: Date.now(), message, type });
    setTimeout(() => setNotification(null), duration);
  };

  const navigate = (newPage: string) => {
    setPage(newPage);
    setActiveFeature(null);
  };

  // Store navigate in window so any component can access it
  useEffect(() => {
    (window as any).appNavigate = navigate;
    return () => { delete (window as any).appNavigate; };
  });

  // Data loaders
  const loadDomains = async () => {
    setLoadingDomains(true);
    try {
      const data = await domainService.getAllDomains();
      setDomains(data);
    } catch (error) {
      console.error('Failed to load domains', error);
      showNotification('Failed to load domains from server', 'error');
    } finally {
      setLoadingDomains(false);
    }
  };

  const loadFeatures = async () => {
    setLoadingFeatures(true);
    try {
      const data = await featuresService.getAllFeatures();
      setFeatures(data);
    } catch (error) {
      console.error('Failed to load features', error);
      showNotification('Failed to load features from server', 'error');
    } finally {
      setLoadingFeatures(false);
    }
  };

  const loadTags = async () => {
    setLoadingTags(true);
    try {
      const data = await tagsService.getAllTags();
      setTags(data);
    } catch (error) {
      console.error('Failed to load tags', error);
      showNotification('Failed to load tags from server', 'error');
    } finally {
      setLoadingTags(false);
    }
  };

  const loadDomainTypes = async () => {
    setLoadingDomainTypes(true);
    try {
      const types    = await domainService.getDomainTypes();
      const metadata = await domainService.getDomainTypesMetadata();
      setDomainTypes(types);
      setDomainTypesMetadata(metadata);
    } catch (error) {
      console.error('Failed to load domain types', error);
      showNotification('Failed to load domain types from server', 'error');
    } finally {
      setLoadingDomainTypes(false);
    }
  };

  const loadSys2Requirements = async (featureId: string) => {
    try {
      const data = await featuresService.getSYS2Requirements(featureId);
      setSys2Requirements(data);
    } catch (error) {
      console.error('Failed to load SYS2 requirements', error);
      showNotification('Failed to load SYS2 requirements', 'error');
    }
  };

  // Load initial data
  useEffect(() => {
    loadDomains();
    loadDomainTypes();
    loadFeatures();
    loadTags();
  }, []);

  // Handle URL hash-based routing for admin panel
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'jirasysadminportal' || hash === 'app-admin-jira') {
        setPage('app-admin-jira');
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage navigate={navigate} domains={domains} domainTypes={domainTypes} />;
      case 'domains':
        return (
          <DomainManagementPage
            key="domains"
            initialTab="types"
            domains={domains}
            setDomains={setDomains}
            showNotification={showNotification}
            loadingDomains={loadingDomains}
            loadDomains={loadDomains}
          />
        );
      case 'compare-domains':
        return (
          <DomainManagementPage
            key="compare-domains"
            initialTab="compare"
            domains={domains}
            setDomains={setDomains}
            showNotification={showNotification}
            loadingDomains={loadingDomains}
            loadDomains={loadDomains}
          />
        );
      case 'features':
        return (
          <FeaturesManagementPage
            features={features}
            setFeatures={setFeatures}
            activeFeature={activeFeature}
            setActiveFeature={setActiveFeature}
            showNotification={showNotification}
            loadingFeatures={loadingFeatures}
            loadFeatures={loadFeatures}
            domains={domains}
            tags={tags}
            sys2Requirements={sys2Requirements}
            setSys2Requirements={setSys2Requirements}
            loadSys2Requirements={loadSys2Requirements}
          />
        );
      case 'tags':
        return (
          <TagsManagementPage
            tags={tags}
            setTags={setTags}
            showNotification={showNotification}
            loadingTags={loadingTags}
            loadTags={loadTags}
          />
        );
      case 'domain-testbed':
        return <DomainTestbedPage />;
      case 'domain-scope-gen':
        return <DomainScopeGen />;
      case 'enhanced-testbed':
        return <EnhancedDomainTestbedPage />;
      case 'sequence-generator':
        return (
          <QueryClientProvider client={queryClient}>
            <GenerateSequencePage />
          </QueryClientProvider>
        );
      case 'jira-processor':
        return <JiraProcessorPage />;
      case 'app-admin-jira':
        return <JiraAdminPage />;
      case 'status-tracker':
        return <SessionStatusTrackerPage />;
      case 'component-domain-mapping':
        return <ComponentDomainMappingPage />;
      default:
        return <HomePage navigate={navigate} domains={domains} domainTypes={domainTypes} />;
    }
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen font-sans flex antialiased">
      <Sidebar currentPage={page} navigate={navigate} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gray-900/50">
        {notification && (
          <NotificationBanner
            {...notification}
            onClose={() => setNotification(null)}
          />
        )}
        {renderPage()}
      </main>
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({
  currentPage,
  navigate,
}: {
  currentPage: string;
  navigate: (page: string) => void;
}) => (
  <aside className="bg-gray-900 w-64 border-r border-gray-700 flex-col hidden md:flex">
    <div className="p-4 border-b border-gray-700 flex items-center space-x-2 h-16">
      <BrainCircuit className="text-cyan-400 h-8 w-8" />
      <span className="text-xl font-bold">ReqGen v5</span>
    </div>
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      <NavItem icon={Home} label="Home" isActive={currentPage === 'home'} onClick={() => navigate('home')} />
      <div className="pt-4 mt-4 border-t border-gray-700 space-y-1">
        <p className="px-2 py-1 text-sm font-semibold text-gray-500 uppercase">Master Data</p>
        <NavItem icon={Layers}  label="Manage Domains"  isActive={currentPage === 'domains'}  onClick={() => navigate('domains')} />
        <NavItem icon={Package} label="Manage Features" isActive={currentPage === 'features'} onClick={() => navigate('features')} />
        <NavItem icon={TagIcon} label="Manage Tags"     isActive={currentPage === 'tags'}     onClick={() => navigate('tags')} />
      </div>
      <div className="pt-4 mt-4 border-t border-gray-700 space-y-1">
        <p className="px-2 py-1 text-sm font-semibold text-gray-500 uppercase">Tools</p>
        <NavItem icon={TestTube2}   label="Domain Scope Generator" isActive={currentPage === 'domain-scope-gen'}  onClick={() => navigate('domain-scope-gen')} />
        <NavItem icon={BrainCircuit} label="SWE.1 Generation"      isActive={currentPage === 'enhanced-testbed'} onClick={() => navigate('enhanced-testbed')} />
        <NavItem icon={Zap}         label="Generate Sequence"      isActive={currentPage === 'sequence-generator'} onClick={() => navigate('sequence-generator')} />
        <NavItem icon={FileText}    label="Jira Plugin"            isActive={currentPage === 'jira-processor'}   onClick={() => navigate('jira-processor')} />
      </div>
      <div className="pt-4 mt-4 border-t border-gray-700 space-y-1">
        <p className="px-2 py-1 text-sm font-semibold text-gray-500 uppercase">Utilities</p>
        <NavItem icon={Activity}      label="Session Tracker"    isActive={currentPage === 'status-tracker'}            onClick={() => navigate('status-tracker')} />
        <NavItem icon={LinkIcon}      label="Component Mapping"  isActive={currentPage === 'component-domain-mapping'}  onClick={() => navigate('component-domain-mapping')} />
        <NavItem icon={ArrowLeftRight} label="Instance Comparison" isActive={currentPage === 'compare-domains'}                  onClick={() => navigate('compare-domains')} />
      </div>
    </nav>
  </aside>
);

// ─── Nav Item ─────────────────────────────────────────────────────────────────
const NavItem = ({
  icon: Icon, label, isActive, onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center p-2.5 rounded-lg text-base transition-colors
      ${isActive
        ? 'bg-cyan-500/20 text-cyan-400 font-semibold'
        : 'hover:bg-gray-700/50 text-gray-300'
      }`}
  >
    <Icon className="h-5 w-5 mr-3 shrink-0" />
    <span className="truncate">{label}</span>
  </button>
);

// ─── Domain Management Page ───────────────────────────────────────────────────
const DomainManagementPage = ({ domains, setDomains, showNotification, loadingDomains, loadDomains, initialTab = 'types' }: any) => {
  const [activeTab, setActiveTab] = useState<'types' | 'scope-builder' | 'component-mapping' | 'compare' | 'interfaces' | 'health'>(initialTab);
  const [domainTypes, setDomainTypes] = useState<string[]>([]);
  const [domainTypesMetadata, setDomainTypesMetadata] = useState<Record<string, any>>({});
  const [loadingDomainTypes, setLoadingDomainTypes] = useState(false);
  const [isCreatingType, setIsCreatingType] = useState(false);
  const [newDomainType, setNewDomainType] = useState({ domaintype: '', description: '', features: '' as any, metadata: '' as any });
  const [editingDomainType, setEditingDomainType] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [selectedDomainType, setSelectedDomainType] = useState('');
  const [newDomainData, setNewDomainData] = useState({ name: '', description: '', configurations: '', specialinput: '' });
  const [searchQuery, setSearchQuery] = useState('');

  // Unified popup state: 'instances' | 'create' | 'view' | 'edit' | null
  const [modalMode, setModalMode] = useState<'instances' | 'create' | 'view' | 'edit' | null>(null);
  const [modalDomain, setModalDomain] = useState<Domain | null>(null);
  const [modalDomainType, setModalDomainType] = useState<string>('');

  const loadDomainTypes = async () => {
    setLoadingDomainTypes(true);
    try {
      const types    = await domainService.getDomainTypes();
      const metadata = await domainService.getDomainTypesMetadata();
      setDomainTypes(types);
      setDomainTypesMetadata(metadata);
    } catch (error) {
      showNotification('Failed to load domain types', 'error');
    } finally {
      setLoadingDomainTypes(false);
    }
  };

  useEffect(() => { loadDomainTypes(); }, []);

  const createDomainType = async () => {
    if (!newDomainType.domaintype.trim()) { showNotification('Please enter a domain type name', 'error'); return; }
    const validation = domainService.validateDomainTypeName(newDomainType.domaintype);
    if (!validation.valid) { showNotification(validation.error || 'Invalid domain type name', 'error'); return; }
    try {
      await domainService.createDomainType({
        domain_type: newDomainType.domaintype.toLowerCase(),
        description: newDomainType.description || `${newDomainType.domaintype} domain type`,
        features: [], 
        metadata: {},
      });
      await loadDomainTypes();
      setIsCreatingType(false);
      setNewDomainType({ domaintype: '', description: '', features: '', metadata: '' });
      showNotification('Domain type created successfully!', 'success');
    } catch (error) {
      showNotification('Failed to create domain type', 'error');
    }
  };

  const deleteDomainType = async (domainType: string, instanceCount: number) => {
    const message = instanceCount > 0 
      ? `WARNING: The "${domainType}" domain type has ${instanceCount} active instance(s). Deleting it will also permanently delete all its instances! Are you sure you want to proceed?`
      : `Are you sure you want to delete the "${domainType}" domain type?\n\nThis action cannot be undone.`;

    if (!confirm(message)) {
      return;
    }

    try {
      await domainService.deleteDomainType(domainType);
      if (modalDomainType === domainType) closeModal();
      await loadDomainTypes();
      await loadDomains();
      showNotification(`${domainType} domain type deleted successfully!`, 'success');
    } catch (error) {
      showNotification('Failed to delete domain type', 'error');
    }
  };

  const availableDomainTypes = domainTypes.filter((type: string) => type);

  const startEdit = (domain: Domain) => {
    setIsEditing(domain.id);
    setEditData({ name: domain.name, description: domain.description, configurations: domain.configurations, specialinput: domain.special_input });
  };

  const saveEdit = async (domainId: string) => {
    try {
      const response = await domainService.updateDomain(domainId, editData);
      if (response) {
        setDomains(domains.map((d: Domain) => d.id === domainId ? response : d));
        setIsEditing(null);
        showNotification('Domain updated successfully!', 'success');
      }
    } catch (error) {
      showNotification('Failed to update domain', 'error');
    }
  };

  const generateEmbedding = async (domainId: string) => {
    try {
      const domain = domains.find((d: Domain) => d.id === domainId);
      let forceRegenerate = false;
      if (domain?.embedding_exists) {
        const shouldRegenerate = window.confirm('This domain already has embeddings. Do you want to regenerate them?');
        if (!shouldRegenerate) return;
        forceRegenerate = true;
      }
      await domainService.generateEmbedding(domainId, 'ollama', undefined, forceRegenerate);
      loadDomains();
      showNotification(forceRegenerate ? 'Embedding regeneration started' : 'Embedding generation started', 'success');
    } catch (error) {
      showNotification('Failed to generate embedding', 'error');
    }
  };

  const createDomain = async () => {
    if (!selectedDomainType || !newDomainData.name.trim()) { showNotification('Please select domain type and enter name', 'error'); return; }
    try {
      const domainData = {
        name: newDomainData.name.trim(),
        description: newDomainData.description || `${selectedDomainType.charAt(0).toUpperCase() + selectedDomainType.slice(1)} domain management`,
        configurations: newDomainData.configurations || 'NA',
        specialinput: newDomainData.specialinput || 'NA',
      };
      const newDomain = await domainService.createOrUpdateDomain(selectedDomainType, domainData);
      setDomains([...domains, newDomain]);
      setNewDomainData({ name: '', description: '', configurations: '', specialinput: '' });
      showNotification(`${selectedDomainType} domain instance created successfully!`, 'success');
    } catch (error: any) {
      if (error.response?.status === 422 && error.response?.data?.detail) {
        const errs = error.response.data.detail;
        if (Array.isArray(errs)) {
          showNotification('Validation error: ' + errs.map((e: any) => e.msg).join(', '), 'error');
        } else {
          showNotification('Invalid input data', 'error');
        }
      } else {
        showNotification('Failed to create domain', 'error');
      }
    }
  };

  const deleteDomain = async (domainId: string, domainName: string) => {
    if (!confirm(`Are you sure you want to delete the "${domainName}" domain?`)) return;
    try {
      await domainService.deleteDomain(domainId);
      setDomains(domains.filter((d: Domain) => d.id !== domainId));
      showNotification(`${domainName} domain deleted successfully!`, 'success');
    } catch (error) {
      showNotification('Failed to delete domain', 'error');
    }
  };

  // ── Popup navigation helpers ──
  const openDomainTypePopup = (domainType: string) => {
    setModalDomainType(domainType);
    setSelectedDomainType(domainType);
    setModalMode('instances');
    setModalDomain(null);
    setIsEditing(null);
  };

  const openCreateModal = (domainType: string) => {
    setModalDomainType(domainType);
    setSelectedDomainType(domainType);
    setNewDomainData({ name: '', description: '', configurations: '', specialinput: '' });
    setModalMode('create');
    setModalDomain(null);
  };

  const openViewModal = (domain: Domain) => {
    setModalDomain(domain);
    setModalMode('view');
  };

  const openEditModal = (domain: Domain) => {
    setModalDomain(domain);
    startEdit(domain);
    setModalMode('edit');
  };

  const goBackToInstances = () => {
    setModalMode('instances');
    setModalDomain(null);
    setIsEditing(null);
  };

  const closeModal = () => {
    setModalMode(null);
    setModalDomain(null);
    setModalDomainType('');
    setIsEditing(null);
  };

  const tabs = [
    { id: 'types',            label: 'Domain Types',    icon: Server },
    { id: 'component-mapping',label: 'Component Mappings', icon: LinkIcon },
    // { id: 'scope-builder',    label: 'Scope Builder',   icon: BrainCircuit },
    { id: 'interfaces',       label: 'Interface Specifications', icon: FileText },
    { id: 'compare',          label: 'Compare Domain', icon: ArrowLeftRight },
    { id: 'health',           label: 'Health',          icon: Shield },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Unified Domain Management</h1>
          <p className="text-lg text-gray-400">Manage domain types and domain instances in one unified interface.</p>
        </div>
        <div className="w-full md:w-72">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search domains & types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/80 border border-gray-700 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-white transition-colors outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-3 px-1 border-b-2 font-medium text-base whitespace-nowrap transition-colors
                  ${activeTab === id
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
                  }`}
              >
                <Icon className="inline-block w-5 h-5 mr-2" />
                {label} {id === 'types' && domainTypes.length > 0 && `(${domainTypes.length})`}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === 'component-mapping' && <ComponentDomainMappingPage />}

      {/* Domain Types Tab with Flip Cards */}
      {activeTab === 'types' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Domain Types Management</h2>
              <p className="text-gray-400">Click a card to view and manage its instances.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { loadDomainTypes(); loadDomains(); }} disabled={loadingDomainTypes} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${loadingDomainTypes ? 'animate-spin' : ''}`} /> Refresh
              </button>
              <button onClick={() => setIsCreatingType(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                <Plus className="h-4 w-4" /> Create Domain Type
              </button>
            </div>
          </div>

          {isCreatingType && (
            <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Create New Domain Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Domain Type Name</label>
                  <input type="text" value={newDomainType.domaintype} onChange={e => setNewDomainType({ ...newDomainType, domaintype: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" placeholder="e.g., bluetooth, audio, hmi" />
                  <p className="text-xs text-gray-500 mt-1">Must start with a letter, lowercase letters, numbers, and underscores only</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <input type="text" value={newDomainType.description} onChange={e => setNewDomainType({ ...newDomainType, description: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" placeholder="Brief description of the domain type" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={createDomainType} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">Create Domain Type</button>
                <button onClick={() => { setIsCreatingType(false); setNewDomainType({ domaintype: '', description: '', features: '', metadata: '' }); }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">Cancel</button>
              </div>
            </div>
          )}

          {loadingDomainTypes ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
              <span className="ml-3 text-lg">Loading domain types...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {domainTypes.filter(type => type.toLowerCase().includes(searchQuery.toLowerCase())).map(domainType => {
                const metadata = domainTypesMetadata[domainType];
                const instances = domains.filter((d: Domain) => d.domain_type === domainType && d.id !== null);
                const instanceCount = instances.length;

                return (
                  <div
                    key={domainType}
                    onClick={() => openDomainTypePopup(domainType)}
                    className="group relative flex flex-col bg-gray-800/40 border border-gray-700/50 rounded-2xl p-5 cursor-pointer hover:bg-gray-800/80 hover:border-cyan-500/40 transition-[background,border-color,box-shadow] duration-300 hover:shadow-xl hover:shadow-cyan-900/10"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all duration-300">
                        <Server className="w-5 h-5" />
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteDomainType(domainType, instanceCount); }} 
                        className="relative z-10 p-2 rounded-lg transition-colors text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        title={instanceCount > 0 ? `Delete Domain Type and its ${instanceCount} instances` : "Delete Domain Type"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-100 mb-1.5 group-hover:text-cyan-400 transition-colors capitalize">
                        {domainType}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                        {metadata?.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-700/50">
                      <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gray-900/60 border border-gray-700/50">
                        <Layers className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-xs text-gray-400">Instances:</span>
                        <span className="text-xs font-semibold text-cyan-400">{instanceCount}</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gray-900/60 border border-gray-700/50">
                        <Zap className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-xs text-gray-400">Features:</span>
                        <span className="text-xs font-semibold text-cyan-400">{metadata?.features?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {domainTypes.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No domain types found. Create your first domain type to get started.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════ UNIFIED POPUP ══════════ */}
      {modalMode && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={closeModal}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative w-full max-w-4xl max-h-[85vh] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-slide-up flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Modal Header ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/60 bg-gradient-to-r from-cyan-500/5 via-transparent to-transparent shrink-0">
              <div className="flex items-center gap-3">
                {/* Back button for drill-down views */}
                {(modalMode === 'view' || modalMode === 'edit' || modalMode === 'create') && (
                  <button
                    onClick={goBackToInstances}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                    title="Back to instances"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  modalMode === 'instances' ? 'bg-cyan-500/15 text-cyan-400' :
                  modalMode === 'create' ? 'bg-green-500/15 text-green-400' :
                  modalMode === 'edit' ? 'bg-blue-500/15 text-blue-400' :
                  'bg-cyan-500/15 text-cyan-400'
                }`}>
                  {modalMode === 'instances' ? <Layers className="w-5 h-5" /> :
                   modalMode === 'create' ? <Plus className="w-5 h-5" /> :
                   modalMode === 'edit' ? <Edit className="w-5 h-5" /> :
                   <Eye className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {modalMode === 'instances' ? <span className="capitalize">{modalDomainType}</span> :
                     modalMode === 'create' ? 'Create New Instance' :
                     modalMode === 'edit' ? 'Edit Instance' :
                     'Instance Details'}
                  </h2>
                  {/* Breadcrumb */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="text-cyan-400/70 capitalize cursor-pointer hover:text-cyan-400" onClick={goBackToInstances}>{modalDomainType}</span>
                    {modalMode !== 'instances' && (
                      <>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-gray-400">
                          {modalMode === 'create' ? 'New Instance' :
                           modalMode === 'view' ? modalDomain?.name :
                           `Editing: ${modalDomain?.name}`}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Instance list header actions */}
                {modalMode === 'instances' && (
                  <button
                    onClick={() => openCreateModal(modalDomainType)}
                    className="flex items-center gap-1.5 bg-green-600/80 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" /> Add Instance
                  </button>
                )}
                {/* View mode header actions */}
                {modalMode === 'view' && modalDomain && (
                  <>
                    <button onClick={() => openEditModal(modalDomain)} className="flex items-center gap-1.5 bg-blue-600/80 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium">
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => { generateEmbedding(modalDomain.id!); closeModal(); }} className="flex items-center gap-1.5 bg-purple-600/80 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium">
                      <BrainCircuit className="w-4 h-4" /> Embed
                    </button>
                  </>
                )}
                <button onClick={closeModal} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/60 transition-colors ml-1" title="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ── Modal Body ── */}
            <div className="flex-1 overflow-y-auto thin-scrollbar px-6 py-5">

              {/* ── INSTANCES LIST (Level 1) ── */}
              {modalMode === 'instances' && (() => {
                const instances = domains.filter((d: Domain) => d.domain_type === modalDomainType && d.id !== null);
                return instances.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <Layers className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-base mb-1">No instances yet</p>
                    <p className="text-sm text-gray-600">Click "Add Instance" to create the first one.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {instances.map((domain: Domain) => (
                      <div
                        key={domain.id}
                        onClick={() => openViewModal(domain)}
                        className="group relative flex flex-col bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 cursor-pointer hover:bg-gray-800/80 hover:border-cyan-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-900/5"
                      >
                        {/* Instance card header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-semibold text-gray-100 group-hover:text-cyan-400 transition-colors">{domain.name}</h4>
                            <span
                              className={`shrink-0 w-2.5 h-2.5 rounded-full ${domain.embedding_exists ? 'bg-green-400' : 'bg-yellow-400'}`}
                              title={domain.embedding_exists ? 'Embeddings Ready' : 'No Embeddings'}
                            />
                          </div>
                          {/* Action icons */}
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); openViewModal(domain); }} className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors" title="View">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); openEditModal(domain); }} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors" title="Edit">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); generateEmbedding(domain.id!); }} className="p-1.5 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors" title="Generate Embedding">
                              <BrainCircuit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); deleteDomain(domain.id!, domain.name); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {/* Description */}
                        <p className="text-sm text-gray-400 line-clamp-2 mb-3 leading-relaxed">{domain.description || 'No description'}</p>
                        {/* Bottom bar */}
                        <div className="flex items-center gap-3 mt-auto pt-3 border-t border-gray-700/40 text-xs text-gray-500">
                          <span>Table: <span className="text-cyan-400/80">{domain.table_name}</span></span>
                          <span className={`px-2 py-0.5 rounded-full ${domain.embedding_exists ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                            {domain.embedding_exists ? '✓ Embedded' : '○ Not Embedded'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* ── CREATE MODE (Level 2) ── */}
              {modalMode === 'create' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Instance Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={newDomainData.name}
                      onChange={e => setNewDomainData({ ...newDomainData, name: e.target.value })}
                      className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors ${newDomainData.name.trim() ? 'border-gray-700' : 'border-red-500/60'}`}
                      placeholder="Enter a name for this instance"
                      autoFocus
                    />
                    {!newDomainData.name.trim() && <p className="text-red-400 text-xs mt-1.5">Name is required</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      value={newDomainData.description}
                      onChange={e => setNewDomainData({ ...newDomainData, description: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white h-28 resize-none focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder="Describe what this instance manages..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Configurations</label>
                      <input
                        type="text"
                        value={newDomainData.configurations}
                        onChange={e => setNewDomainData({ ...newDomainData, configurations: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        placeholder="JSON configuration (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Special Input</label>
                      <input
                        type="text"
                        value={newDomainData.specialinput}
                        onChange={e => setNewDomainData({ ...newDomainData, specialinput: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        placeholder="Special input requirements (optional)"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── VIEW MODE (Level 2) ── */}
              {modalMode === 'view' && modalDomain && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-cyan-400">{modalDomain.name}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${modalDomain.embedding_exists ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                      {modalDomain.embedding_exists ? '✓ Embeddings Ready' : '○ No Embeddings'}
                    </span>
                  </div>

                  <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">{modalDomain.description || 'No description provided.'}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Domain Type</p>
                      <p className="text-sm font-medium text-cyan-400 capitalize">{modalDomain.domain_type}</p>
                    </div>
                    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Table Name</p>
                      <p className="text-sm font-medium text-cyan-400">{modalDomain.table_name}</p>
                    </div>
                    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Embedding Status</p>
                      <p className={`text-sm font-medium ${modalDomain.embedding_exists ? 'text-green-400' : 'text-yellow-400'}`}>
                        {modalDomain.embedding_exists ? 'Ready' : 'Not Generated'}
                      </p>
                    </div>
                  </div>

                  {modalDomain.supported_features && modalDomain.supported_features.length > 0 && (
                    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Supported Features ({modalDomain.supported_features.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {modalDomain.supported_features.map((f: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-cyan-500/15 text-cyan-300 rounded-lg text-xs">{f}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {modalDomain.configurations && modalDomain.configurations !== 'NA' && (
                    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Configuration</h4>
                      <pre className="bg-gray-900/60 p-3 rounded-lg text-xs text-gray-300 overflow-x-auto">{modalDomain.configurations}</pre>
                    </div>
                  )}
                </div>
              )}

              {/* ── EDIT MODE (Level 2) ── */}
              {modalMode === 'edit' && modalDomain && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Instance Name</label>
                    <input
                      type="text"
                      value={editData.name || ''}
                      onChange={e => setEditData({ ...editData, name: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder="Domain name"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      value={editData.description || ''}
                      onChange={e => setEditData({ ...editData, description: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white h-32 resize-none focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder="Describe what this instance manages..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Configurations</label>
                      <input
                        type="text"
                        value={editData.configurations || ''}
                        onChange={e => setEditData({ ...editData, configurations: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        placeholder="JSON configuration"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Special Input</label>
                      <input
                        type="text"
                        value={editData.specialinput || ''}
                        onChange={e => setEditData({ ...editData, specialinput: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        placeholder="Special input requirements"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-3 flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Type: <span className="text-cyan-400">{modalDomain.domain_type}</span></span>
                      <span className="text-gray-700">•</span>
                      <span>Table: <span className="text-cyan-400">{modalDomain.table_name}</span></span>
                      <span className="text-gray-700">•</span>
                      <span className={modalDomain.embedding_exists ? 'text-green-400' : 'text-yellow-400'}>
                        {modalDomain.embedding_exists ? '✓ Embeddings' : '○ No Embeddings'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Modal Footer (only for create/edit) ── */}
            {(modalMode === 'create' || modalMode === 'edit') && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-700/60 bg-gray-900/80 shrink-0">
                <button onClick={goBackToInstances} className="px-4 py-2.5 rounded-xl text-sm text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors">
                  Cancel
                </button>
                {modalMode === 'create' && (
                  <button
                    onClick={async () => { await createDomain(); goBackToInstances(); }}
                    disabled={!newDomainData.name.trim()}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white transition-colors ${newDomainData.name.trim() ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed'}`}
                  >
                    <Plus className="w-4 h-4" /> Create Instance
                  </button>
                )}
                {modalMode === 'edit' && modalDomain && (
                  <button
                    onClick={async () => { await saveEdit(modalDomain.id!); goBackToInstances(); }}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl transition-colors text-sm"
                  >
                    <CheckCircle className="w-4 h-4" /> Save Changes
                  </button>
                )}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {activeTab === 'scope-builder' && <ScopeBuilderTab domains={domainTypes} showNotification={showNotification} />}
      {activeTab === 'interfaces' && <EnhancedInterfaceSpecificationsTab domains={domains} showNotification={showNotification} />}
      {activeTab === 'compare' && <DomainComparisonTab domains={domains} />}
      {activeTab === 'health' && <DomainHealthDashboard domains={domains} />}
    </div>
  );
};
// ─── Scope Builder Tab ────────────────────────────────────────────────────────
const ScopeBuilderTab = ({ domains, showNotification }: { domains: string[]; showNotification: any }) => {
  const [selectedDomain, setSelectedDomain] = useState('');
  const [rawScope, setRawScope] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processedResult, setProcessedResult] = useState<any>(null);

  const defaultPrompt = `You are an expert technical analyst specializing in automotive software architecture and domain scope analysis. Your task is to analyze and structure raw domain scope documents into a standardized format with clear sections and comprehensive coverage. For each domain scope document, create: 1. Executive Summary 2. Domain Boundaries 3. Stakeholder Requirements 4. Technical Architecture 5. Interface Specifications 6. Implementation Guidelines. Ensure the output is technically accurate, comprehensive, and follows automotive software development standards.`;
  const [aiPrompt, setAIPrompt] = useState(defaultPrompt);
  const [showAIPromptEditor, setShowAIPromptEditor] = useState(false);

  const handleProcessScope = async () => {
    if (!selectedDomain.trim()) { showNotification('Please select a domain', 'error'); return; }
    if (!rawScope.trim())       { showNotification('Please enter scope document content', 'error'); return; }
    setProcessing(true);
    setProcessedResult(null);
    try {
      const { scopeBuilderService } = await import('./services');
      const result = await (scopeBuilderService as any).processScopeDocumentWithProgress({
        rawscope: rawScope,
        domainname: selectedDomain,
        processingoptions: { customaiprompt: aiPrompt.trim() || undefined },
      }, (progress: any) => setProcessedResult(progress));
      setProcessedResult(result);
      if (result.success) showNotification(`Scope processing completed successfully for ${selectedDomain}!`, 'success');
      else showNotification(`Scope processing failed: ${result.errors?.join(', ')}`, 'error');
    } catch (error) {
      showNotification(`Failed to process scope: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const clearForm = () => {
    setSelectedDomain(''); setRawScope(''); setProcessedResult(null);
    setShowAIPromptEditor(false); setAIPrompt(defaultPrompt);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">AI-Powered Scope Builder</h2>
          <p className="text-gray-400">Convert raw scope documents into standardized domain scope templates using AI processing.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={clearForm} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
            <RefreshCw className="h-4 w-4" /> Clear
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <BrainCircuit className="h-5 w-5 mr-2" /> Scope Document Input
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Domain</label>
                <select value={selectedDomain} onChange={e => setSelectedDomain(e.target.value)} disabled={processing}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                  <option value="">Select domain...</option>
                  {domains.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Raw Scope Document</label>
                <textarea value={rawScope} onChange={e => setRawScope(e.target.value)} disabled={processing}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white h-40 font-mono text-sm"
                  placeholder="Paste your raw scope document here..." />
              </div>
              <button onClick={handleProcessScope} disabled={processing || !selectedDomain || !rawScope.trim()}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors
                  ${processing || !selectedDomain || !rawScope.trim() ? 'bg-gray-600 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700 text-white'}`}>
                {processing ? <><RefreshCw className="h-4 w-4 animate-spin" /> Processing...</> : <><Zap className="h-4 w-4" /> Process Scope</>}
              </button>
            </div>
          </div>
        </div>
        <div>
          {processedResult ? (
            <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">AI Processing Results</h3>
              <pre className="bg-gray-900/50 p-4 rounded text-xs text-gray-300 overflow-auto max-h-96">{JSON.stringify(processedResult, null, 2)}</pre>
            </div>
          ) : (
            <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6 flex items-center justify-center h-full text-gray-500">
              Enter scope document and click process to see results here
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Features Management Page ─────────────────────────────────────────────────
const FeaturesManagementPage = ({
  features, setFeatures, activeFeature, setActiveFeature,
  showNotification, loadingFeatures, loadFeatures, domains, tags,
  sys2Requirements, setSys2Requirements, loadSys2Requirements,
}: any) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFeature, setNewFeature] = useState({ name: '', description: '', domain_id: '' });

  const createFeature = async () => {
    if (!newFeature.name.trim()) { showNotification('Please enter a feature name', 'error'); return; }
    try {
      const feature = await featuresService.createFeature({ feature_name: newFeature.name, description: newFeature.description });
      setFeatures([...features, feature]);
      setIsCreating(false);
      setNewFeature({ name: '', description: '', domain_id: '' });
      showNotification('Feature created successfully!', 'success');
    } catch (error) {
      showNotification('Failed to create feature', 'error');
    }
  };

  const deleteFeature = async (featureId: string, featureName: string) => {
    if (!confirm(`Are you sure you want to delete "${featureName}"?`)) return;
    try {
      await featuresService.deleteFeature(featureId);
      setFeatures(features.filter((f: Feature) => f.id !== featureId));
      if (activeFeature?.id === featureId) setActiveFeature(null);
      showNotification(`${featureName} deleted successfully!`, 'success');
    } catch (error) {
      showNotification('Failed to delete feature', 'error');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Features Management</h1>
          <p className="text-lg text-gray-400">Organize SYS2 requirements by functional features and manage their lifecycle.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadFeatures} disabled={loadingFeatures} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loadingFeatures ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
            <Plus className="h-4 w-4" /> Create Feature
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Feature</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Feature Name</label>
              <input type="text" value={newFeature.name} onChange={e => setNewFeature({ ...newFeature, name: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" placeholder="Feature name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <input type="text" value={newFeature.description} onChange={e => setNewFeature({ ...newFeature, description: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" placeholder="Feature description" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={createFeature} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">Create Feature</button>
            <button onClick={() => setIsCreating(false)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      {loadingFeatures ? (
        <div className="flex items-center justify-center py-12"><RefreshCw className="h-8 w-8 animate-spin text-cyan-400" /><span className="ml-3">Loading features...</span></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature: Feature) => (
            <div key={feature.id}
              className="bg-gray-800/70 border border-gray-700 rounded-xl p-6 hover:border-cyan-500 transition-colors cursor-pointer group"
              onClick={() => { setActiveFeature(feature); loadSys2Requirements(feature.id); }}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-white">{feature.feature_name}</h3>
                <button onClick={e => { e.stopPropagation(); deleteFeature(feature.id, feature.feature_name); }}
                  className="bg-red-600 hover:bg-red-700 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-3">{feature.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Created: {new Date(feature.created_at).toLocaleDateString()}</span>
                <span className="text-cyan-400">SYS2: {(feature as any).sys2_requirements_count ?? 0}</span>
              </div>
              <div className="mt-3 text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">Click to manage →</div>
            </div>
          ))}
        </div>
      )}

      {activeFeature && (
        <div className="mt-8 bg-gray-800/70 border border-gray-700 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">{activeFeature.feature_name} — SYS2 Requirements</h2>
            <button onClick={() => setActiveFeature(null)} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <p className="text-gray-400 mb-4">{activeFeature.description}</p>
          <div className="space-y-3">
            {sys2Requirements.length > 0 ? sys2Requirements.map((req: SYS2Requirement) => (
              <div key={req.id} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <p className="text-gray-300 text-sm">{req.requirement_text}</p>
              </div>
            )) : <p className="text-gray-500">This feature doesn't have any SYS2 requirements yet.</p>}
          </div>
        </div>
      )}

      {features.length === 0 && !loadingFeatures && (
        <div className="text-center py-12 text-gray-400">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No features found. Create your first feature to get started.</p>
        </div>
      )}
    </div>
  );
};

// ─── Tags Management Page ─────────────────────────────────────────────────────
const TagsManagementPage = ({ tags, setTags, showNotification, loadingTags, loadTags }: any) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTag, setNewTag] = useState({ name: '', description: '' });

  const createTag = async () => {
    if (!newTag.name.trim()) { showNotification('Please enter a tag name', 'error'); return; }
    try {
      const tag = await tagsService.createTag({ tag: newTag.name, description: newTag.description });
      setTags([...tags, tag]);
      setIsCreating(false);
      setNewTag({ name: '', description: '' });
      showNotification('Tag created successfully!', 'success');
    } catch (error) {
      showNotification('Failed to create tag', 'error');
    }
  };

  const deleteTag = async (tagId: string, tagName: string) => {
    if (!confirm(`Are you sure you want to delete "${tagName}"?`)) return;
    try {
      await tagsService.deleteTag(tagId);
      setTags(tags.filter((t: Tag) => t.id !== tagId));
      showNotification(`${tagName} deleted successfully!`, 'success');
    } catch (error) {
      showNotification('Failed to delete tag', 'error');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Tags Management</h1>
          <p className="text-lg text-gray-400">Create and organize tags for categorizing requirements and improving searchability.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadTags} disabled={loadingTags} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loadingTags ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
            <Plus className="h-4 w-4" /> Create Tag
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Tag</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tag Name</label>
              <input type="text" value={newTag.name} onChange={e => setNewTag({ ...newTag, name: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" placeholder="Tag name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <input type="text" value={newTag.description} onChange={e => setNewTag({ ...newTag, description: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" placeholder="Tag description" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={createTag} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">Create Tag</button>
            <button onClick={() => setIsCreating(false)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      {loadingTags ? (
        <div className="flex items-center justify-center py-12"><RefreshCw className="h-8 w-8 animate-spin text-cyan-400" /><span className="ml-3">Loading tags...</span></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tags.map((tag: Tag) => (
            <div key={tag.id} className="bg-gray-800/70 border border-gray-700 rounded-xl p-6 hover:border-cyan-500 transition-colors group">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-white">#{tag.tag}</h3>
                <button onClick={() => deleteTag(tag.id, tag.tag)} className="bg-red-600 hover:bg-red-700 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-3">{tag.description}</p>
              <p className="text-xs text-gray-500">Created: {new Date(tag.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {tags.length === 0 && !loadingTags && (
        <div className="text-center py-12 text-gray-400">
          <TagIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No tags found. Create your first tag to get started.</p>
        </div>
      )}
    </div>
  );
};

export default App;
